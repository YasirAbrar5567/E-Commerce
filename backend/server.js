console.log("--- RUNNING LATEST SERVER.JS CODE ---");

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = 10;
const JWT_SECRET = 'your_jwt_secret'; // For production, use a strong secret from environment variables

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// JWT Verification Middleware
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ error: 'A token is required for authentication.' });
    }

    try {
        const tokenValue = token.split(' ')[1];
        const decoded = jwt.verify(tokenValue, JWT_SECRET);
        req.user = decoded;
    } catch (err) {
        return res.status(401).json({ error: 'Invalid Token.' });
    }
    return next();
};


// PUBLIC ENDPOINTS

app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    const query = 'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)';

    db.query(query, [name, email, message], (err, result) => {
        if (err) {
            console.error('Error saving to database:', err);
            return res.status(500).json({ error: 'Error saving to database' });
        }
        res.status(200).json({ message: 'Message saved successfully' });
    });
});

app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Please provide username, email, and password.' });
    }

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ error: 'Error registering user.' });
        }

        const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(query, [username, email, hash], (err, result) => {
            if (err) {
                console.error('Error saving user to database:', err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: 'Username or email already exists.' });
                }
                return res.status(500).json({ error: 'Error registering user.' });
            }
            res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
        });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password.' });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, users) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: 'Error logging in.' });
        }

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const user = users[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).json({ error: 'Error logging in.' });
            }

            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials.' });
            }

            const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ message: 'Logged in successfully', token: token });
        });
    });
});

// PROTECTED ENDPOINTS

app.get('/api/profile', verifyToken, (req, res) => {
    const userId = req.user.id;
    const query = 'SELECT id, username, email, created_at FROM users WHERE id = ?';

    db.query(query, [userId], (err, users) => {
        if (err) {
            console.error('Error fetching profile:', err);
            return res.status(500).json({ error: 'Error fetching user profile.' });
        }

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const userProfile = users[0];
        res.status(200).json(userProfile);
    });
});

app.post('/api/orders', verifyToken, (req, res) => {
    const { items, totalAmount } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0 || !totalAmount) {
        return res.status(400).json({ error: 'Invalid order data.' });
    }

    db.beginTransaction(err => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).json({ error: 'Error processing order.' });
        }

        const orderQuery = 'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)';
        db.query(orderQuery, [userId, totalAmount], (err, result) => {
            if (err) {
                console.error('Error creating order:', err);
                return db.rollback(() => {
                    res.status(500).json({ error: 'Error creating order.' });
                });
            }

            const orderId = result.insertId;
            const orderItemsQuery = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?';
            const orderItemsValues = items.map(item => [orderId, item.productId, item.quantity, item.price]);

            db.query(orderItemsQuery, [orderItemsValues], (err, result) => {
                if (err) {
                    console.error('Error creating order items:', err);
                    return db.rollback(() => {
                        res.status(500).json({ error: 'Error creating order items.' });
                    });
                }

                db.commit(err => {
                    if (err) {
                        console.error('Error committing transaction:', err);
                        return db.rollback(() => {
                            res.status(500).json({ error: 'Error finalizing order.' });
                        });
                    }
                    res.status(200).json({ message: 'Order placed successfully', orderId: orderId });
                });
            });
        });
    });
});

// Get user's cart
app.get('/api/cart', verifyToken, (req, res) => {
    const userId = req.user.id;

    const getCartIdQuery = 'SELECT id FROM carts WHERE user_id = ?';
    db.query(getCartIdQuery, [userId], (err, carts) => {
        if (err) {
            console.error('Error fetching cart:', err);
            return res.status(500).json({ error: 'Error fetching cart.' });
        }

        if (carts.length === 0) {
            return res.status(200).json([]); // No cart, return empty array
        }

        const cartId = carts[0].id;
        const getCartItemsQuery = `
            SELECT p.id, p.name, p.price, p.image_url as imageUrl, ci.quantity 
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = ?
        `;
        db.query(getCartItemsQuery, [cartId], (err, items) => {
            if (err) {
                console.error('Error fetching cart items:', err);
                return res.status(500).json({ error: 'Error fetching cart items.' });
            }
            res.status(200).json(items);
        });
    });
});

// Add item to cart
app.post('/api/cart/add', verifyToken, (req, res) => {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
        return res.status(400).json({ error: 'productId and quantity are required.' });
    }

    // Find or create a cart for the user
    const findOrCreateCart = () => {
        return new Promise((resolve, reject) => {
            const getCartQuery = 'SELECT id FROM carts WHERE user_id = ?';
            db.query(getCartQuery, [userId], (err, carts) => {
                if (err) return reject(err);
                if (carts.length > 0) {
                    return resolve(carts[0].id);
                } else {
                    const createCartQuery = 'INSERT INTO carts (user_id) VALUES (?)';
                    db.query(createCartQuery, [userId], (err, result) => {
                        if (err) return reject(err);
                        resolve(result.insertId);
                    });
                }
            });
        });
    };

    findOrCreateCart().then(cartId => {
        const checkItemQuery = 'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?';
        db.query(checkItemQuery, [cartId, productId], (err, items) => {
            if (err) {
                console.error('Error checking cart item:', err);
                return res.status(500).json({ error: 'Error adding item to cart.' });
            }

            if (items.length > 0) {
                // Update quantity
                const updateQuery = 'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?';
                db.query(updateQuery, [quantity, items[0].id], (err, result) => {
                    if (err) {
                        console.error('Error updating cart item:', err);
                        return res.status(500).json({ error: 'Error adding item to cart.' });
                    }
                    res.status(200).json({ message: 'Item quantity updated.' });
                });
            } else {
                // Insert new item
                const insertQuery = 'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)';
                db.query(insertQuery, [cartId, productId, quantity], (err, result) => {
                    if (err) {
                        console.error('Error inserting cart item:', err);
                        return res.status(500).json({ error: 'Error adding item to cart.' });
                    }
                    res.status(201).json({ message: 'Item added to cart.' });
                });
            }
        });
    }).catch(err => {
        console.error('Error finding or creating cart:', err);
        res.status(500).json({ error: 'Error processing cart.' });
    });
});

// Remove item from cart
app.delete('/api/cart/remove/:productId', verifyToken, (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;

    const getCartIdQuery = 'SELECT id FROM carts WHERE user_id = ?';
    db.query(getCartIdQuery, [userId], (err, carts) => {
        if (err || carts.length === 0) {
            return res.status(500).json({ error: 'Cart not found.' });
        }
        const cartId = carts[0].id;
        const deleteQuery = 'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?';
        db.query(deleteQuery, [cartId, productId], (err, result) => {
            if (err) {
                console.error('Error removing item from cart:', err);
                return res.status(500).json({ error: 'Error removing item from cart.' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Item not found in cart.' });
            }
            res.status(200).json({ message: 'Item removed from cart.' });
        });
    });
});

// Update item quantity in cart
app.put('/api/cart/update/:productId', verifyToken, (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
        return res.status(400).json({ error: 'A valid quantity is required.' });
    }
    
    const getCartIdQuery = 'SELECT id FROM carts WHERE user_id = ?';
    db.query(getCartIdQuery, [userId], (err, carts) => {
        if (err || carts.length === 0) {
            return res.status(500).json({ error: 'Cart not found.' });
        }
        const cartId = carts[0].id;
        const updateQuery = 'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?';
        db.query(updateQuery, [quantity, cartId, productId], (err, result) => {
            if (err) {
                console.error('Error updating item quantity:', err);
                return res.status(500).json({ error: 'Error updating item quantity.' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Item not found in cart.' });
            }
            res.status(200).json({ message: 'Item quantity updated.' });
        });
    });
});


// WISHLIST ENDPOINTS

// Get user's wishlist
app.get('/api/wishlist', verifyToken, (req, res) => {
    const userId = req.user.id;

    const getWishlistIdQuery = 'SELECT id FROM wishlists WHERE user_id = ?';
    db.query(getWishlistIdQuery, [userId], (err, wishlists) => {
        if (err) {
            console.error('Error fetching wishlist:', err);
            return res.status(500).json({ error: 'Error fetching wishlist.' });
        }

        if (wishlists.length === 0) {
            return res.status(200).json([]); // No wishlist, return empty array
        }

        const wishlistId = wishlists[0].id;
        const getWishlistItemsQuery = `
            SELECT p.id, p.name, p.price, p.image_url as imageUrl, p.rating, p.reviews
            FROM wishlist_items wi
            JOIN products p ON wi.product_id = p.id
            WHERE wi.wishlist_id = ?
        `;
        db.query(getWishlistItemsQuery, [wishlistId], (err, items) => {
            if (err) {
                console.error('Error fetching wishlist items:', err);
                return res.status(500).json({ error: 'Error fetching wishlist items.' });
            }
            res.status(200).json(items);
        });
    });
});

// Add item to wishlist
app.post('/api/wishlist/add', verifyToken, (req, res) => {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
        return res.status(400).json({ error: 'productId is required.' });
    }

    // Find or create a wishlist for the user
    const findOrCreateWishlist = () => {
        return new Promise((resolve, reject) => {
            const getWishlistQuery = 'SELECT id FROM wishlists WHERE user_id = ?';
            db.query(getWishlistQuery, [userId], (err, wishlists) => {
                if (err) return reject(err);
                if (wishlists.length > 0) {
                    return resolve(wishlists[0].id);
                } else {
                    const createWishlistQuery = 'INSERT INTO wishlists (user_id) VALUES (?)';
                    db.query(createWishlistQuery, [userId], (err, result) => {
                        if (err) return reject(err);
                        resolve(result.insertId);
                    });
                }
            });
        });
    };

    findOrCreateWishlist().then(wishlistId => {
        // Check if item already in wishlist
        const checkItemQuery = 'SELECT * FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?';
        db.query(checkItemQuery, [wishlistId, productId], (err, items) => {
            if (err) {
                console.error('Error checking wishlist item:', err);
                return res.status(500).json({ error: 'Error adding item to wishlist.' });
            }

            if (items.length > 0) {
                return res.status(409).json({ message: 'Item already in wishlist.' });
            } else {
                // Insert new item
                const insertQuery = 'INSERT INTO wishlist_items (wishlist_id, product_id) VALUES (?, ?)';
                db.query(insertQuery, [wishlistId, productId], (err, result) => {
                    if (err) {
                        console.error('Error inserting wishlist item:', err);
                        return res.status(500).json({ error: 'Error adding item to wishlist.' });
                    }
                    res.status(201).json({ message: 'Item added to wishlist.' });
                });
            }
        });
    }).catch(err => {
        console.error('Error finding or creating wishlist:', err);
        res.status(500).json({ error: 'Error processing wishlist.' });
    });
});

// Remove item from wishlist
app.delete('/api/wishlist/remove/:productId', verifyToken, (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;

    const getWishlistIdQuery = 'SELECT id FROM wishlists WHERE user_id = ?';
    db.query(getWishlistIdQuery, [userId], (err, wishlists) => {
        if (err || wishlists.length === 0) {
            return res.status(500).json({ error: 'Wishlist not found.' });
        }
        const wishlistId = wishlists[0].id;
        const deleteQuery = 'DELETE FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?';
        db.query(deleteQuery, [wishlistId, productId], (err, result) => {
            if (err) {
                console.error('Error removing item from wishlist:', err);
                return res.status(500).json({ error: 'Error removing item from wishlist.' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Item not found in wishlist.' });
            }
            res.status(200).json({ message: 'Item removed from wishlist.' });
        });
    });
});

// Generic Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    res.status(err.statusCode || 500).json({
        error: err.message || 'An unexpected error occurred.'
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
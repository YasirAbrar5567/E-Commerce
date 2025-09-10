const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Products table (for reference)
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    original_price REAL,
    image_url TEXT,
    category TEXT,
    rating REAL DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    description TEXT,
    features TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Wishlist table
  db.run(`CREATE TABLE IF NOT EXISTS wishlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(user_id, product_id)
  )`);

  // Cart table
  db.run(`CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(user_id, product_id)
  )`);
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Failed to create user' });
        }

        res.status(201).json({ message: 'User created successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
          { id: user.id, username: user.username, email: user.email },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Profile Route
app.get('/api/profile', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, username, email, created_at FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    }
  );
});

// Wishlist Routes
app.get('/api/wishlist', authenticateToken, (req, res) => {
  const query = `
    SELECT p.* FROM products p
    INNER JOIN wishlist w ON p.id = w.product_id
    WHERE w.user_id = ?
  `;
  
  db.all(query, [req.user.id], (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Transform database results to match frontend format
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price,
      imageUrl: product.image_url,
      category: product.category,
      rating: product.rating,
      reviews: product.reviews,
      description: product.description,
      features: product.features ? JSON.parse(product.features) : []
    }));
    
    res.json(formattedProducts);
  });
});

app.post('/api/wishlist/add', authenticateToken, (req, res) => {
  const { productId } = req.body;
  
  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  db.run(
    'INSERT OR IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)',
    [req.user.id, productId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Product added to wishlist' });
    }
  );
});

app.delete('/api/wishlist/remove/:productId', authenticateToken, (req, res) => {
  const { productId } = req.params;

  db.run(
    'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
    [req.user.id, productId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Product removed from wishlist' });
    }
  );
});

// Cart Routes
app.get('/api/cart', authenticateToken, (req, res) => {
  const query = `
    SELECT p.*, c.quantity FROM products p
    INNER JOIN cart c ON p.id = c.product_id
    WHERE c.user_id = ?
  `;
  
  db.all(query, [req.user.id], (err, items) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Transform database results to match frontend format
    const formattedItems = items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.original_price,
      imageUrl: item.image_url,
      category: item.category,
      rating: item.rating,
      reviews: item.reviews,
      description: item.description,
      features: item.features ? JSON.parse(item.features) : [],
      quantity: item.quantity
    }));
    
    res.json(formattedItems);
  });
});

app.post('/api/cart/add', authenticateToken, (req, res) => {
  const { productId, quantity = 1 } = req.body;
  
  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  db.run(
    'INSERT OR REPLACE INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
    [req.user.id, productId, quantity],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Product added to cart' });
    }
  );
});

app.put('/api/cart/update/:productId', authenticateToken, (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Valid quantity is required' });
  }

  db.run(
    'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
    [quantity, req.user.id, productId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Cart updated' });
    }
  );
});

app.delete('/api/cart/remove/:productId', authenticateToken, (req, res) => {
  const { productId } = req.params;

  db.run(
    'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
    [req.user.id, productId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Product removed from cart' });
    }
  );
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('API endpoints available:');
  console.log('- POST /api/register');
  console.log('- POST /api/login');
  console.log('- GET /api/profile');
  console.log('- GET /api/wishlist');
  console.log('- POST /api/wishlist/add');
  console.log('- DELETE /api/wishlist/remove/:productId');
  console.log('- GET /api/cart');
  console.log('- POST /api/cart/add');
  console.log('- PUT /api/cart/update/:productId');
  console.log('- DELETE /api/cart/remove/:productId');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
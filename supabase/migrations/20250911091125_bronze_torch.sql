@@ .. @@
 -- Table for cart items
 CREATE TABLE IF NOT EXISTS cart_items (
     id INT AUTO_INCREMENT PRIMARY KEY,
     cart_id INT NOT NULL,
     product_id INT NOT NULL,
     quantity INT NOT NULL,
-    price DECIMAL(10, 2) NOT NULL, -- Added price for consistency, though not explicitly inserted in server.js
+    price DECIMAL(10, 2) NOT NULL,
+    size VARCHAR(50) DEFAULT NULL,
+    color VARCHAR(50) DEFAULT NULL,
+    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
+    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
     FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
-    UNIQUE (cart_id, product_id) -- Ensure one product per cart
+    UNIQUE (cart_id, product_id, size, color) -- Allow same product with different size/color
 );
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Sample products data matching the frontend mock data
const products = [
  {
    name: "iPhone 15 Pro Max",
    price: 159900,
    original_price: 179900,
    image_url: "https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Mobiles & Tablets",
    rating: 4.5,
    reviews: 1234,
    description: "The iPhone 15 Pro Max features the powerful A17 Pro chip, advanced camera system, and titanium design.",
    features: JSON.stringify(["A17 Pro chip", "48MP Main camera", "Titanium design", "Action Button"])
  },
  {
    name: "Samsung Galaxy Book3",
    price: 89990,
    original_price: 99990,
    image_url: "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400",
    category: "Electronics",
    rating: 4.3,
    reviews: 856,
    description: "Powerful laptop with Intel 13th gen processor and stunning AMOLED display.",
    features: JSON.stringify(["Intel 13th Gen", "16GB RAM", "512GB SSD", "AMOLED Display"])
  },
  {
    name: "Nike Air Max 270",
    price: 12995,
    original_price: 15995,
    image_url: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Fashion",
    rating: 4.2,
    reviews: 2341,
    description: "Comfortable and stylish running shoes with Air Max technology.",
    features: JSON.stringify(["Air Max sole", "Breathable mesh", "Lightweight design", "Durable outsole"])
  },
  {
    name: "Bosch Washing Machine",
    price: 45990,
    original_price: 52990,
    image_url: "https://images.pexels.com/photos/4239119/pexels-photo-4239119.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Home & Furniture",
    rating: 4.4,
    reviews: 567,
    description: "Fully automatic front loading washing machine with advanced features.",
    features: JSON.stringify(["8kg capacity", "Energy efficient", "15 wash programs", "Anti-vibration"])
  },
  {
    name: "Sony WH-1000XM5",
    price: 29990,
    original_price: 34990,
    image_url: "https://images.pexels.com/photos/3394658/pexels-photo-3394658.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Electronics",
    rating: 4.6,
    reviews: 1876,
    description: "Industry-leading noise canceling headphones with exceptional sound quality.",
    features: JSON.stringify(["Active Noise Canceling", "30hr battery", "Quick charge", "Touch controls"])
  }
];

// Insert products into database
db.serialize(() => {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO products 
    (id, name, price, original_price, image_url, category, rating, reviews, description, features) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  products.forEach((product, index) => {
    stmt.run(
      index + 1, // id
      product.name,
      product.price,
      product.original_price,
      product.image_url,
      product.category,
      product.rating,
      product.reviews,
      product.description,
      product.features
    );
  });

  stmt.finalize();
  console.log('Sample products inserted successfully!');
});

db.close();
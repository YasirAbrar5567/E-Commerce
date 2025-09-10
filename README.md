# FlipMart - E-commerce Frontend Prototype

A modern e-commerce application built with React, TypeScript, and Tailwind CSS, featuring a complete backend API with authentication.

## Features

- 🛍️ Product browsing and search
- 🔐 User authentication (register/login)
- ❤️ Wishlist functionality
- 🛒 Shopping cart
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

#### Option 1: Run both frontend and backend together (Recommended)
```bash
npm run dev:full
```

#### Option 2: Run separately
Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `GET /api/profile` - Get user profile (requires auth)

### Wishlist
- `GET /api/wishlist` - Get user's wishlist (requires auth)
- `POST /api/wishlist/add` - Add product to wishlist (requires auth)
- `DELETE /api/wishlist/remove/:productId` - Remove from wishlist (requires auth)

### Cart
- `GET /api/cart` - Get user's cart (requires auth)
- `POST /api/cart/add` - Add product to cart (requires auth)
- `PUT /api/cart/update/:productId` - Update cart quantity (requires auth)
- `DELETE /api/cart/remove/:productId` - Remove from cart (requires auth)

## Database

The application uses SQLite for data storage. The database file (`database.sqlite`) is created automatically when you first run the server.

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, React Router
- **Backend**: Node.js, Express, SQLite
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Build Tool**: Vite

## Project Structure

```
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── contexts/      # React context providers
│   ├── api/          # API service functions
│   └── ...
├── server/
│   ├── server.js     # Express server
│   └── seed-products.js # Database seeding script
└── ...
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is for educational purposes.
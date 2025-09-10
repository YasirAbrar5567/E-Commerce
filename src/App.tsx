import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Header from './components/Header';
import CategoryNavBar from './components/CategoryNavBar';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import LoginModal from './components/LoginModal';
import Profile from './pages/Profile'; // Import the new Profile component

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Header />
        <CategoryNavBar />
        <main className="pt-4 pb-8">
          <Routes>
            <Route path="/" element={<ProductListing />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} /> {/* Add the new route */}
          </Routes>
        </main>
        <LoginModal />
      </Router>
    </AppProvider>
  );
};

export default App;

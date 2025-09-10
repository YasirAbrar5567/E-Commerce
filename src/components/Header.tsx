import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, LogOut, Menu } from 'lucide-react'; // Added LogOut icon
import { useApp } from '../contexts/AppContext';

const Header: React.FC = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value });
  };

  const handleLoginClick = () => { // Renamed to avoid confusion with logout
    dispatch({ type: 'TOGGLE_LOGIN_MODAL' });
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('token'); // Clear the token from local storage
    navigate('/'); // Redirect to home page after logout
  };

  const wishlistCount = state.wishlist.length;

  return (
    <>
      <header className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-orange-500 p-1 rounded">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">FlipMart</span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full pl-10 pr-4 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={state.searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {state.user ? (
                <> 
                  <Link
                    to="/profile"
                    className="flex items-center space-x-1 hover:text-orange-200 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span>Hi, {state.user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 hover:text-orange-200 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="flex items-center space-x-1 hover:text-orange-200 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>Login</span>
                </button>
              )}

              {state.user && (
                <Link
                  to="/wishlist"
                  className="flex items-center space-x-1 hover:text-orange-200 transition-colors relative"
                >
                  <Heart className="h-5 w-5" />
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              <Link
                to="/cart"
                className="flex items-center space-x-1 hover:text-orange-200 transition-colors relative"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Cart</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full pl-10 pr-4 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={state.searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-blue-700 border-t border-blue-500">
            <div className="px-4 py-2 space-y-2">
              {state.user ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 w-full text-left py-2 hover:text-orange-200 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>Hi, {state.user.name}</span>
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="flex items-center space-x-2 w-full text-left py-2 hover:text-orange-200 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { handleLoginClick(); setIsMobileMenuOpen(false); }}
                  className="flex items-center space-x-2 w-full text-left py-2 hover:text-orange-200 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>Login</span>
                </button>
              )}

              {state.user && (
                <Link
                  to="/wishlist"
                  className="flex items-center space-x-2 py-2 hover:text-orange-200 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Heart className="h-5 w-5" />
                  <span>Wishlist ({wishlistCount})</span>
                </Link>
              )}

              <Link
                to="/cart"
                className="flex items-center space-x-2 py-2 hover:text-orange-200 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Cart</span>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
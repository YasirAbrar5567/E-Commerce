import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Loader } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { getCart, removeFromCart, updateCartQuantity } from '../api/cart';
import { CartItem } from '../contexts/AppContext';

const Cart: React.FC = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCartItems = useCallback(async () => {
    if (!state.user) return;
    try {
      setLoading(true);
      const items = await getCart();
      setCartItems(items);
      setError(null);
    } catch (err) {
      setError('Failed to fetch cart items.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [state.user]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const handleUpdateQuantity = async (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(id);
    } else {
      try {
        await updateCartQuantity(id, newQuantity);
        fetchCartItems(); // Refetch cart to show updated data
      } catch (err) {
        console.error('Failed to update quantity:', err);
        setError('Failed to update item quantity.');
      }
    }
  };

  const handleRemoveItem = async (id: number) => {
    try {
      await removeFromCart(id);
      fetchCartItems(); // Refetch cart
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item from cart.');
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };

  if (!state.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your cart</p>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_LOGIN_MODAL' })}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Loader className="h-16 w-16 text-blue-600 animate-spin" />
        </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center text-red-500">
                <p>{error}</p>
                <button onClick={fetchCartItems} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md">Try Again</button>
            </div>
        </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started</p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
          <p className="text-gray-600">{totalItems} items</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link to={`/product/${item.id}`} className="flex-shrink-0">
                    <img
                      src={item.imageUrl} // Note: using imageUrl from backend
                      alt={item.name}
                      className="w-full sm:w-20 h-32 sm:h-20 object-cover rounded-md"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.id}`}
                      className="text-lg font-medium text-gray-800 hover:text-blue-600 transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="text-gray-600 text-sm mt-1">{item.category}</p>
                    <p className="text-xl font-bold text-gray-800 mt-2">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:flex-col sm:items-end space-y-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="h-4 w-4 text-gray-600" />
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/"
                className="block text-center text-blue-600 hover:text-blue-800 mt-4 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

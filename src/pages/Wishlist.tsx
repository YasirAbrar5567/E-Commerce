import React from 'react';
import { useApp } from '../contexts/AppContext';
import ProductCard from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Wishlist: React.FC = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const handleRemoveFromWishlist = async (productId: number) => {
    if (!state.user) {
      dispatch({ type: 'TOGGLE_LOGIN_MODAL' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found. User not authenticated.');
      dispatch({ type: 'TOGGLE_LOGIN_MODAL' });
      return;
    }

    try {
      const response = await fetch(`/api/wishlist/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedWishlist = state.wishlist.filter(item => item.id !== productId);
        dispatch({ type: 'SET_WISHLIST', payload: updatedWishlist });
        console.log('Item removed from wishlist successfully.');
      } else {
        console.error('Failed to remove item from wishlist:', response.statusText);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)} // Go back to previous page
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Wishlist</h1>

        {!state.user ? (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <p className="text-lg text-gray-600">Please log in to view your wishlist.</p>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_LOGIN_MODAL' })}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </div>
        ) : state.wishlist.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <p className="text-lg text-gray-600">Your wishlist is empty.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {state.wishlist.map(product => (
              <ProductCard
                key={product.id}
                product={{ ...product, image: product.imageUrl }}
                onRemoveFromWishlist={handleRemoveFromWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
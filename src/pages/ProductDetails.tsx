import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const BASE_API_URL = 'http://localhost:3000'; // Define BASE_API_URL

const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const product = state.products.find(p => p.id === parseInt(id || '0'));

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Product not found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const isInWishlist = state.wishlist?.some(item => item.id === product.id) || false;
  const isInCart = state.cart?.some(item => item.id === product.id) || false;

  const handleWishlistToggle = async () => {
    if (!state.user) {
      dispatch({ type: 'TOGGLE_LOGIN_MODAL' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found. User not authenticated.');
      dispatch({ type: 'TOGGLE_LOGIN_MODAL' }); // Prompt login if no token
      return;
    }

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(`${BASE_API_URL}/api/wishlist/remove/${product.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          // After successful removal, refetch wishlist to update state
          // This is handled by the useEffect in AppContext, but we can also dispatch SET_WISHLIST here if needed
          // For now, relying on AppContext's useEffect to re-fetch on state.user change or explicit dispatch
          // A more direct approach would be to filter the local state, but refetching is safer for consistency
          const updatedWishlist = state.wishlist.filter(item => item.id !== product.id);
          dispatch({ type: 'SET_WISHLIST', payload: updatedWishlist });
          console.log('Item removed from wishlist successfully.');
        } else {
          console.error('Failed to remove item from wishlist:', response.statusText);
        }
      } else {
        // Add to wishlist
        const response = await fetch(`${BASE_API_URL}/api/wishlist/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: product.id }),
        });
        if (response.ok) {
          // After successful addition, refetch wishlist to update state
          const addedProduct = { ...product }; // Ensure product object is complete
          const updatedWishlist = [...state.wishlist, addedProduct];
          dispatch({ type: 'SET_WISHLIST', payload: updatedWishlist });
          console.log('Item added to wishlist successfully.');
        } else {
          const errorData = await response.json();
          console.error('Failed to add item to wishlist:', errorData.message || response.statusText);
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleAddToCart = () => {
    if (!state.user) {
      dispatch({ type: 'TOGGLE_LOGIN_MODAL' });
      return;
    }

    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };

  const images = product.images.length > 0 ? product.images : [product.image];

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Products</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div>
              <div className="mb-4">
                <img
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
              {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                        selectedImageIndex === index
                          ? 'border-blue-500'
                          : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {product.category}
                </span>
                <button
                  onClick={handleWishlistToggle}
                  disabled={!state.user}
                  className={`p-2 rounded-full transition-all ${
                    isInWishlist
                      ? 'bg-red-100 text-red-500'
                      : 'bg-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50'
                  } ${!state.user ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Heart className={`h-6 w-6 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
                {product.name}
              </h1>

              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-medium text-gray-700 ml-1">
                    {product.rating}
                  </span>
                </div>
                <span className="text-gray-500 ml-2">
                  ({product.reviews} reviews)
                </span>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-gray-800">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                    </span>
                  </>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Key Features</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!state.user}
                  className={`w-full py-3 px-6 rounded-lg flex items-center justify-center space-x-2 font-medium transition-colors ${
                    state.user
                      ? isInCart
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>
                    {isInCart ? 'Already in Cart' : 'Add to Cart'}
                  </span>
                </button>

                {!state.user && (
                  <p className="text-sm text-gray-500 text-center">
                    Please login to add items to cart or wishlist
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
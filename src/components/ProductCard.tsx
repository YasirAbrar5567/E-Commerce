import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { Product, useApp } from '../contexts/AppContext';
import { addToCart as apiAddToCart } from '../api/cart';

interface ProductCardProps {
  product: Product;
  onRemoveFromWishlist?: (productId: number) => void; // New optional prop
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onRemoveFromWishlist }) => {
  const { state, dispatch } = useApp();

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 sm:h-56 object-cover rounded-t-lg"
          />
        </div>

        <div className="p-4">
          <h3 className="font-medium text-gray-800 text-sm sm:text-base line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center mt-2 mb-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">
                {product.rating} ({product.reviews})
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-gray-800">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => console.log('Add to cart clicked')} // Simplified for testing
            disabled={!state.user}
            className={`w-full py-2 px-4 rounded-md flex items-center justify-center space-x-2 transition-colors ${
              state.user
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="text-sm font-medium">
              Add to Cart
            </span>
          </button>

          {!state.user && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Login to add to cart
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
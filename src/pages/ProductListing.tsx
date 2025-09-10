import React from 'react';
import { useApp } from '../contexts/AppContext';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import BannerCarousel from '../components/BannerCarousel';
// import CategoryNavBar from '../components/CategoryNavBar'; // Removed duplicate import

const ProductListing: React.FC = () => {
  const { state } = useApp();

  const filteredProducts = state.products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchesCategory = state.selectedCategory === 'All' || product.category === state.selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      {/* <CategoryNavBar /> */}{/* Removed duplicate rendering */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BannerCarousel />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {state.searchQuery ? `Search results for "${state.searchQuery}"` : 'All Products'}
          </h1>
          <p className="text-gray-600">
            {filteredProducts.length} products found
          </p>
        </div>

        <CategoryFilter />

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListing;

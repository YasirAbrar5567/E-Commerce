import React from 'react';
import { useApp } from '../contexts/AppContext';

const CategoryFilter: React.FC = () => {
  const { state, dispatch } = useApp();

  const categories = ['All', ...Array.from(new Set(state.products.map(p => p.category)))];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => dispatch({ type: 'SET_SELECTED_CATEGORY', payload: category })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              state.selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
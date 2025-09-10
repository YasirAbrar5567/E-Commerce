import React, { useState } from 'react';
import { ChevronDown, Smartphone, Shirt, Laptop, Home, Tv, Plane, Sparkles, UtensilsCrossed, ShoppingCart } from 'lucide-react';

interface SubCategory {
  name: string;
  link: string;
}

interface Category {
  id: number;
  name: string;
  icon: React.ReactNode;
  link: string;
  hasDropdown: boolean;
  subCategories?: SubCategory[];
}

const CategoryNavBar: React.FC = () => {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const categories: Category[] = [
    {
      id: 1,
      name: "Mobiles & Tablets",
      icon: <Smartphone className="w-6 h-6" />,
      link: "/mobiles-tablets",
      hasDropdown: true,
      subCategories: [
        { name: "Smartphones", link: "/smartphones" },
        { name: "Tablets", link: "/tablets" },
        { name: "Mobile Accessories", link: "/mobile-accessories" },
        { name: "Cases & Covers", link: "/cases-covers" }
      ]
    },
    {
      id: 2,
      name: "Fashion",
      icon: <Shirt className="w-6 h-6" />,
      link: "/fashion",
      hasDropdown: true,
      subCategories: [
        { name: "Men's Clothing", link: "/mens-clothing" },
        { name: "Women's Clothing", link: "/womens-clothing" },
        { name: "Kids' Clothing", link: "/kids-clothing" },
        { name: "Footwear", link: "/footwear" },
        { name: "Accessories", link: "/fashion-accessories" }
      ]
    },
    {
      id: 3,
      name: "Electronics",
      icon: <Laptop className="w-6 h-6" />,
      link: "/electronics",
      hasDropdown: true,
      subCategories: [
        { name: "Laptops", link: "/laptops" },
        { name: "Cameras", link: "/cameras" },
        { name: "Audio", link: "/audio" },
        { name: "Gaming", link: "/gaming" },
        { name: "Wearables", link: "/wearables" }
      ]
    },
    {
      id: 4,
      name: "Home & Furniture",
      icon: <Home className="w-6 h-6" />,
      link: "/home-furniture",
      hasDropdown: true,
      subCategories: [
        { name: "Furniture", link: "/furniture" },
        { name: "Home Decor", link: "/home-decor" },
        { name: "Kitchen & Dining", link: "/kitchen-dining" },
        { name: "Storage", link: "/storage" }
      ]
    },
    {
      id: 5,
      name: "TVs & Appliances",
      icon: <Tv className="w-6 h-6" />,
      link: "/tvs-appliances",
      hasDropdown: false
    },
    {
      id: 6,
      name: "Beauty",
      icon: <Sparkles className="w-6 h-6" />,
      link: "/beauty",
      hasDropdown: true,
      subCategories: [
        { name: "Makeup", link: "/makeup" },
        { name: "Skincare", link: "/skincare" },
        { name: "Haircare", link: "/haircare" },
        { name: "Fragrances", link: "/fragrances" }
      ]
    },
    {
      id: 7,
      name: "Food",
      icon: <UtensilsCrossed className="w-6 h-6" />,
      link: "/food",
      hasDropdown: false
    },
    {
      id: 8,
      name: "Grocery",
      icon: <ShoppingCart className="w-6 h-6" />,
      link: "/grocery",
      hasDropdown: false
    },
    {
      id: 9,
      name: "Flight Bookings",
      icon: <Plane className="w-6 h-6" />,
      link: "/flights",
      hasDropdown: false
    }
  ];

  const handleCategoryClick = (category: Category) => {
    console.log(`Category clicked: ${category.name}`);
    if (category.hasDropdown) {
      setActiveDropdown(activeDropdown === category.id ? null : category.id);
    } else {
      console.log(`Navigating to: ${category.link}`);
      setActiveDropdown(null);
    }
  };

  const handleSubCategoryClick = (subCategory: SubCategory) => {
    console.log(`Subcategory clicked: ${subCategory.name}`);
    console.log(`Navigating to: ${subCategory.link}`);
    setActiveDropdown(null);
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Horizontal scrollable container */}
          <div className="flex space-x-8 overflow-x-auto scrollbar-hide py-4">
            {categories.map((category) => (
              <div key={category.id} className="relative flex-shrink-0">
                <button
                  onClick={() => handleCategoryClick(category)}
                  className="flex flex-col items-center space-y-1 text-gray-600 hover:text-blue-600 transition-colors min-w-max group"
                >
                  <div className="p-2 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors">
                    {category.icon}
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium whitespace-nowrap">
                      {category.name}
                    </span>
                    {category.hasDropdown && (
                      <ChevronDown 
                        className={`w-3 h-3 transition-transform ${
                          activeDropdown === category.id ? 'rotate-180' : ''
                        }`} 
                      />
                    )}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {category.hasDropdown && activeDropdown === category.id && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {category.subCategories?.map((subCategory, index) => (
                      <button
                        key={index}
                        onClick={() => handleSubCategoryClick(subCategory)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                      >
                        {subCategory.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Gradient fade for scroll indication */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {activeDropdown !== null && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
};

export default CategoryNavBar;
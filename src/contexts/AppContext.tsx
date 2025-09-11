import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

// Types
export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
                imageUrl: string; // Reverted from 'imageUrl'
  category: string;
  rating: number;
  reviews: number;
  description: string;
  features: string[];
  images: string[];
}

export interface CartItem extends Product {
  quantity: number;
  size?: string;
  color?: string;
  cart_item_id?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

interface AppState {
  user: User | null;
  products: Product[];
  wishlist: Product[];
  searchQuery: string;
  selectedCategory: string;
  isLoginModalOpen: boolean;
}

// Actions
type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_WISHLIST'; payload: Product[] } // New action to set wishlist from API
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string }
  | { type: 'TOGGLE_LOGIN_MODAL' };

// Mock data
const mockProducts: Product[] = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    price: 159900,
    originalPrice: 179900,
    image: "https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Mobiles & Tablets",
    rating: 4.5,
    reviews: 1234,
    description: "The iPhone 15 Pro Max features the powerful A17 Pro chip, advanced camera system, and titanium design.",
    features: ["A17 Pro chip", "48MP Main camera", "Titanium design", "Action Button"],
    images: [
      "https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 2,
    name: "Samsung Galaxy Book3",
    price: 89990,
    originalPrice: 99990,
    image: "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400",
    category: "Electronics",
    rating: 4.3,
    reviews: 856,
    description: "Powerful laptop with Intel 13th gen processor and stunning AMOLED display.",
    features: ["Intel 13th Gen", "16GB RAM", "512GB SSD", "AMOLED Display"],
    images: [
      "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 3,
    name: "Nike Air Max 270",
    price: 12995,
    originalPrice: 15995,
    image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Fashion",
    rating: 4.2,
    reviews: 2341,
    description: "Comfortable and stylish running shoes with Air Max technology.",
    features: ["Air Max sole", "Breathable mesh", "Lightweight design", "Durable outsole"],
    images: [
      "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 4,
    name: "Bosch Washing Machine",
    price: 45990,
    originalPrice: 52990,
    image: "https://images.pexels.com/photos/4239119/pexels-photo-4239119.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Home & Furniture",
    rating: 4.4,
    reviews: 567,
    description: "Fully automatic front loading washing machine with advanced features.",
    features: ["8kg capacity", "Energy efficient", "15 wash programs", "Anti-vibration"],
    images: [
      "https://images.pexels.com/photos/4239119/pexels-photo-4239119.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 5,
    name: "Sony WH-1000XM5",
    price: 29990,
    originalPrice: 34990,
    image: "https://images.pexels.com/photos/3394658/pexels-photo-3394658.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Electronics",
    rating: 4.6,
    reviews: 1876,
    description: "Industry-leading noise canceling headphones with exceptional sound quality.",
    features: ["Active Noise Canceling", "30hr battery", "Quick charge", "Touch controls"],
    images: [
      "https://images.pexels.com/photos/3394658/pexels-photo-3394658.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 6,
    name: "Levi's Denim Jacket",
    price: 4999,
    originalPrice: 6999,
    image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Fashion",
    rating: 4.1,
    reviews: 892,
    description: "Classic denim jacket with timeless style and comfort.",
    features: ["100% Cotton", "Classic fit", "Button closure", "Multiple sizes"],
    images: [
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 7,
    name: "Samsung Galaxy S24 Ultra",
    price: 124999,
    originalPrice: 134999,
    image: "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Mobiles & Tablets",
    rating: 4.7,
    reviews: 3456,
    description: "Premium smartphone with S Pen, advanced camera system, and powerful performance.",
    features: ["200MP Camera", "S Pen included", "5000mAh battery", "120Hz Display"],
    images: [
      "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 8,
    name: "iPad Pro 12.9",
    price: 112900,
    originalPrice: 119900,
    image: "https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Mobiles & Tablets",
    rating: 4.6,
    reviews: 2187,
    description: "Professional tablet with M2 chip and stunning Liquid Retina XDR display.",
    features: ["M2 chip", "12.9-inch display", "Apple Pencil support", "All-day battery"],
    images: [
      "https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 9,
    name: "Adidas Ultraboost 22",
    price: 16999,
    originalPrice: 19999,
    image: "https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Fashion",
    rating: 4.4,
    reviews: 1876,
    description: "Premium running shoes with responsive Boost midsole technology.",
    features: ["Boost technology", "Primeknit upper", "Continental rubber", "Energy return"],
    images: [
      "https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 10,
    name: "Canon EOS R5",
    price: 329999,
    originalPrice: 349999,
    image: "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Electronics",
    rating: 4.8,
    reviews: 567,
    description: "Professional mirrorless camera with 45MP sensor and 8K video recording.",
    features: ["45MP sensor", "8K video", "In-body stabilization", "Dual card slots"],
    images: [
      "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 11,
    name: "LG OLED C3 55\"",
    price: 139990,
    originalPrice: 159990,
    image: "https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "TVs & Appliances",
    rating: 4.7,
    reviews: 1234,
    description: "Premium OLED TV with perfect blacks and vibrant colors.",
    features: ["OLED display", "4K resolution", "HDR10", "Smart TV features"],
    images: [
      "https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 12,
    name: "Dyson V15 Detect",
    price: 65900,
    originalPrice: 72900,
    image: "https://images.pexels.com/photos/4239013/pexels-photo-4239013.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Home & Furniture",
    rating: 4.5,
    reviews: 892,
    description: "Powerful cordless vacuum with laser dust detection technology.",
    features: ["Laser detection", "60min runtime", "HEPA filtration", "Lightweight design"],
    images: [
      "https://images.pexels.com/photos/4239013/pexels-photo-4239013.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 13,
    name: "Zara Blazer",
    price: 7999,
    originalPrice: 9999,
    image: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Fashion",
    rating: 4.2,
    reviews: 1567,
    description: "Elegant blazer perfect for professional and casual occasions.",
    features: ["Premium fabric", "Tailored fit", "Multiple colors", "Dry clean only"],
    images: [
      "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 14,
    name: "Maybelline Lipstick Set",
    price: 1299,
    originalPrice: 1599,
    image: "https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Beauty",
    rating: 4.3,
    reviews: 2341,
    description: "Long-lasting lipstick collection with vibrant colors.",
    features: ["Long-lasting", "Vibrant colors", "Moisturizing", "Cruelty-free"],
    images: [
      "https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 15,
    name: "Instant Pot Duo 7-in-1",
    price: 8999,
    originalPrice: 10999,
    image: "https://images.pexels.com/photos/4226796/pexels-photo-4226796.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Home & Furniture",
    rating: 4.6,
    reviews: 3456,
    description: "Multi-functional pressure cooker for quick and easy cooking.",
    features: ["7-in-1 functionality", "6L capacity", "Smart programs", "Safety features"],
    images: [
      "https://images.pexels.com/photos/4226796/pexels-photo-4226796.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 16,
    name: "OnePlus 12",
    price: 64999,
    originalPrice: 69999,
    image: "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Mobiles & Tablets",
    rating: 4.5,
    reviews: 1876,
    description: "Flagship smartphone with Snapdragon 8 Gen 3 and fast charging.",
    features: ["Snapdragon 8 Gen 3", "100W charging", "50MP camera", "120Hz display"],
    images: [
      "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 17,
    name: "Dell XPS 13",
    price: 119990,
    originalPrice: 129990,
    image: "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400",
    category: "Electronics",
    rating: 4.4,
    reviews: 1234,
    description: "Ultra-portable laptop with stunning InfinityEdge display.",
    features: ["Intel Core i7", "16GB RAM", "512GB SSD", "13.4-inch display"],
    images: [
      "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 18,
    name: "H&M Cotton T-Shirt",
    price: 799,
    originalPrice: 999,
    image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Fashion",
    rating: 4.0,
    reviews: 892,
    description: "Comfortable cotton t-shirt in various colors and sizes.",
    features: ["100% Cotton", "Regular fit", "Machine washable", "Multiple colors"],
    images: [
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 19,
    name: "Philips Air Fryer",
    price: 12999,
    originalPrice: 15999,
    image: "https://images.pexels.com/photos/4226796/pexels-photo-4226796.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "TVs & Appliances",
    rating: 4.5,
    reviews: 2187,
    description: "Healthy cooking with rapid air technology and digital display.",
    features: ["Rapid air technology", "Digital display", "4.1L capacity", "Dishwasher safe"],
    images: [
      "https://images.pexels.com/photos/4226796/pexels-photo-4226796.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 20,
    name: "L'Oreal Paris Skincare Set",
    price: 2499,
    originalPrice: 2999,
    image: "https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Beauty",
    rating: 4.4,
    reviews: 1567,
    description: "Complete skincare routine with cleanser, toner, and moisturizer.",
    features: ["Complete routine", "All skin types", "Dermatologist tested", "Anti-aging"],
    images: [
      "https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 21,
    name: "IKEA Study Desk",
    price: 8999,
    originalPrice: 10999,
    image: "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Home & Furniture",
    rating: 4.3,
    reviews: 892,
    description: "Modern study desk with storage compartments and cable management.",
    features: ["Storage compartments", "Cable management", "Easy assembly", "Durable material"],
    images: [
      "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 22,
    name: "Organic Basmati Rice 5kg",
    price: 899,
    originalPrice: 1099,
    image: "https://images.pexels.com/photos/1393382/pexels-photo-1393382.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Grocery",
    rating: 4.6,
    reviews: 3456,
    description: "Premium organic basmati rice with long grains and aromatic flavor.",
    features: ["Organic certified", "Long grain", "Aromatic", "5kg pack"],
    images: [
      "https://images.pexels.com/photos/1393382/pexels-photo-1393382.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 23,
    name: "Domino's Pizza Voucher",
    price: 499,
    originalPrice: 699,
    image: "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Food",
    rating: 4.2,
    reviews: 2341,
    description: "Digital voucher for medium pizza with your choice of toppings.",
    features: ["Medium pizza", "Choice of toppings", "Digital voucher", "Valid for 30 days"],
    images: [
      "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 24,
    name: "JBL Bluetooth Speaker",
    price: 4999,
    originalPrice: 5999,
    image: "https://images.pexels.com/photos/3394658/pexels-photo-3394658.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Electronics",
    rating: 4.4,
    reviews: 1876,
    description: "Portable Bluetooth speaker with powerful bass and waterproof design.",
    features: ["Bluetooth 5.0", "Waterproof", "12hr battery", "Powerful bass"],
    images: [
      "https://images.pexels.com/photos/3394658/pexels-photo-3394658.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    id: 25,
    name: "Puma Running Shoes",
    price: 5999,
    originalPrice: 7999,
    image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Fashion",
    rating: 4.3,
    reviews: 1567,
    description: "Lightweight running shoes with responsive cushioning and breathable mesh.",
    features: ["Lightweight design", "Responsive cushioning", "Breathable mesh", "Durable sole"],
    images: [
      "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  }
];

// Initial state
const initialState: AppState = {
  user: null,
  products: mockProducts,
  wishlist: [],
  searchQuery: '',
  selectedCategory: 'All',
  isLoginModalOpen: false,
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isLoginModalOpen: false };
    case 'LOGOUT':
      return { ...state, user: null, wishlist: [] };
    case 'SET_WISHLIST': // Handle setting wishlist from API
      return { ...state, wishlist: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'TOGGLE_LOGIN_MODAL':
      return { ...state, isLoginModalOpen: !state.isLoginModalOpen };
    default:
      return state;
  }
};

// Helper to decode JWT
const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

// Context
const AppContext = createContext<{ 
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Function to fetch wishlist from backend
  const BASE_API_URL = 'http://localhost:3000';

  const fetchWishlist = async (token: string) => {
    try {
      const response = await fetch(`${BASE_API_URL}/api/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data: Product[] = await response.json();
        dispatch({ type: 'SET_WISHLIST', payload: data });
      } else {
        console.error('Failed to fetch wishlist:', response.statusText);
        // Handle error, e.g., clear wishlist or show a message
        dispatch({ type: 'SET_WISHLIST', payload: [] });
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      dispatch({ type: 'SET_WISHLIST', payload: [] });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = parseJwt(token);
      if (decodedToken && decodedToken.exp * 1000 > Date.now()) { // Check if token is expired
        // Assuming the token contains id, username, and email
        dispatch({
          type: 'LOGIN',
          payload: {
            id: decodedToken.id,
            name: decodedToken.username,
            email: decodedToken.email || '',
          },
        });
        fetchWishlist(token); // Fetch wishlist on successful login/token validation
      } else {
        // Token expired or invalid, clear it
        localStorage.removeItem('token');
      }
    }
  }, []); // Run only once on mount

  // Effect to refetch wishlist when user logs in/out
  useEffect(() => {
    if (state.user) {
      const token = localStorage.getItem('token');
      if (token) {
        fetchWishlist(token);
      } else {
        dispatch({ type: 'SET_WISHLIST', payload: [] }); // Clear wishlist if token is somehow missing but user state exists
      }
    } else {
      dispatch({ type: 'SET_WISHLIST', payload: [] }); // Clear wishlist on logout
    }
  }, [state.user]); // Re-run when user state changes

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Clock, Zap } from 'lucide-react';
import GradientButton from '../../components/GradientButton';
import SearchBar from '../../components/SearchBar';
import realTimeNotificationService from '../../services/RealTimeNotificationService';

const HomeScreen = ({ onSearch, onSwitchToAgent }) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Store groups with similar products
  const storeGroups = [
    {
      groupName: "Luxury Fashion Hub",
      category: "luxury",
      brands: ["DIOR", "GUCCI", "PRADA", "SAINT LAURENT", "VERSACE"],
      productTypes: ["Designer Bags", "Luxury Watches", "Premium Clothing", "High-end Accessories"]
    },
    {
      groupName: "Sports & Athleisure",
      category: "sports",
      brands: ["ADIDAS", "NIKE", "PUMA", "REEBOK", "NEW BALANCE"],
      productTypes: ["Running Shoes", "Sports Apparel", "Gym Wear", "Athletic Accessories"]
    },
    {
      groupName: "Contemporary Fashion",
      category: "fashion",
      brands: ["SLOGUN", "YUMI KIM", "PLAINANDSIMPLE", "TFNC LONDON", "COTTSBURY LTD"],
      productTypes: ["Casual Wear", "Party Dresses", "Everyday Fashion", "Trendy Accessories"]
    },
    {
      groupName: "SuperDry Collection",
      category: "superdry",
      brands: ["SuperDry", "SuperDry", "SuperDry", "SuperDry", "SuperDry"],
      productTypes: ["Hoodies", "T-Shirts", "Jackets", "Casual Wear"]
    },
    {
      groupName: "Premium Lifestyle",
      category: "premium",
      brands: ["TURNBULL & ASSER", "MONCLER", "ALEXANDER MCQUEEN", "BALENCIAGA", "BOTTEGA VENETA"],
      productTypes: ["Formal Wear", "Designer Coats", "Luxury Shoes", "Premium Accessories"]
    }
  ];

  useEffect(() => {
    generateStores();
  }, []);

  const generateStores = () => {
    const generatedStores = [];
    let storeId = 1;

    storeGroups.forEach((group, groupIndex) => {
      // Create 5 stores per group
      for (let i = 0; i < 5; i++) {
        const store = {
          id: storeId++,
          name: `${group.brands[i]} Store`,
          brand: group.brands[i],
          category: group.category,
          groupName: group.groupName,
          location: `Floor ${Math.floor(Math.random() * 3) + 1}, Wing ${['A', 'B', 'C'][Math.floor(Math.random() * 3)]}`,
          rating: (4.0 + Math.random() * 1).toFixed(1),
          distance: `${(Math.random() * 500 + 50).toFixed(0)}m`,
          isOpen: Math.random() > 0.1, // 90% stores open
          productCount: Math.floor(Math.random() * 50) + 150, // 150-200 products per store
          specialOffer: Math.random() > 0.6 ? `${Math.floor(Math.random() * 30) + 10}% OFF` : null,
          popularProducts: group.productTypes.slice(0, 4),
          estimatedWalkTime: `${Math.floor(Math.random() * 5) + 2} min`,
          coins: Math.floor(Math.random() * 1000) + 500, // Available coins for bidding
          lastActive: Math.floor(Math.random() * 30) + 1 // minutes ago
        };
        generatedStores.push(store);
      }
    });

    setStores(generatedStores);
    setLoading(false);
  };

  const getStoreIcon = (category) => {
    switch (category) {
      case 'luxury': return '💎';
      case 'sports': return '⚽';
      case 'fashion': return '👗';
      case 'superdry': return '🧥';
      case 'premium': return '🎩';
      default: return '🏪';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'luxury': return 'from-yellow-400 to-yellow-600';
      case 'sports': return 'from-blue-400 to-blue-600';
      case 'fashion': return 'from-pink-400 to-pink-600';
      case 'superdry': return 'from-green-400 to-green-600';
      case 'premium': return 'from-purple-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-pink mx-auto mb-4"></div>
          <p className="text-neutral-gray700">Loading stores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-pink to-primary-violet text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Hushh Marketplace</h1>
              <p className="text-white/90">Discover 25 stores • 2000+ products</p>
            </div>
            {onSwitchToAgent && (
              <button
                onClick={onSwitchToAgent}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                🏪 Agent View
              </button>
            )}
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <SearchBar 
              onSearch={onSearch}
              placeholder="Search across all 25 stores..."
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Store Groups */}
      <div className="max-w-6xl mx-auto p-6">
        {storeGroups.map((group, groupIndex) => (
          <motion.div
            key={group.groupName}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
            className="mb-8"
          >
            {/* Group Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-neutral-gray900">
                  {getStoreIcon(group.category)} {group.groupName}
                </h2>
                <p className="text-neutral-gray600 text-sm">
                  5 stores • Similar products: {group.productTypes.join(', ')}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getCategoryColor(group.category)} text-white text-xs font-medium`}>
                20+ Similar Items
              </div>
            </div>

            {/* Stores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {stores
                .filter(store => store.category === group.category)
                .map((store, storeIndex) => (
                  <motion.div
                    key={store.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (groupIndex * 0.1) + (storeIndex * 0.05) }}
                    className="bg-white border-2 border-black rounded-card p-4 hover:shadow-xl hover:border-primary-pink transition-all duration-300 cursor-pointer group"
                    onClick={() => {
                      // Generate realistic search query based on store category
                      let searchQuery = '';
                      let priceRange = '';
                      
                      switch (store.category) {
                        case 'luxury':
                          searchQuery = store.brand === 'DIOR' ? 'black dress under ₹50000' : 
                                       store.brand === 'GUCCI' ? 'designer handbag under ₹80000' :
                                       'luxury dress under ₹60000';
                          priceRange = 'under ₹80000';
                          break;
                        case 'sports':
                          searchQuery = store.brand === 'NIKE' ? 'wireless headphones under ₹3000' :
                                       store.brand === 'ADIDAS' ? 'sports headphones under ₹2500' :
                                       'running headphones under ₹3000';
                          priceRange = 'under ₹3000';
                          break;
                        case 'superdry':
                          searchQuery = 'hoodie under ₹4000';
                          priceRange = 'under ₹4000';
                          break;
                        case 'fashion':
                          searchQuery = 'casual dress under ₹3000';
                          priceRange = 'under ₹3000';
                          break;
                        case 'premium':
                          searchQuery = 'designer jacket under ₹25000';
                          priceRange = 'under ₹25000';
                          break;
                        default:
                          searchQuery = store.brand;
                      }

                      // Create real-time notification for agents
                      const searchNotification = realTimeNotificationService.createSearchNotification({
                        user_id: 'demo_user_123',
                        user_name: 'Demo User',
                        search_query: searchQuery,
                        store_context: store.name,
                        price_range: priceRange,
                        category: store.category,
                        product_details: {
                          category: store.category,
                          brand: store.brand,
                          store_clicked: store.name
                        }
                      });
                      
                      console.log(`🔍 User clicked ${store.name}, searching for: "${searchQuery}"`);
                      console.log(`📍 Notification sent to matching stores:`, searchNotification);
                      
                      // Also trigger the original search
                      onSearch(searchNotification.id, searchQuery, null);
                    }}
                  >
                    {/* Store Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-gray900 text-sm group-hover:text-primary-pink transition-colors">
                          {store.name}
                        </h3>
                        <p className="text-xs text-neutral-gray600 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {store.location}
                        </p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${store.isOpen ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    </div>

                    {/* Store Stats */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center text-neutral-gray600">
                          <Star className="h-3 w-3 mr-1 text-yellow-400" />
                          {store.rating}
                        </span>
                        <span className="text-neutral-gray600">{store.distance}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-gray600">{store.productCount} products</span>
                        <span className="flex items-center text-neutral-gray600">
                          <Clock className="h-3 w-3 mr-1" />
                          {store.estimatedWalkTime}
                        </span>
                      </div>
                    </div>

                    {/* Popular Products */}
                    <div className="mb-3">
                      <p className="text-xs text-neutral-gray600 mb-1">Popular:</p>
                      <div className="flex flex-wrap gap-1">
                        {store.popularProducts.slice(0, 2).map((product, idx) => (
                          <span key={idx} className="text-xs bg-neutral-gray100 px-2 py-1 rounded text-neutral-gray700">
                            {product}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Store Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center text-xs text-neutral-gray600">
                          <Zap className="h-3 w-3 mr-1 text-yellow-500" />
                          {store.coins} coins
                        </div>
                      </div>
                      
                      {store.specialOffer && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-medium">
                          {store.specialOffer}
                        </span>
                      )}
                    </div>

                    {/* Active Status */}
                    <div className="mt-2 pt-2 border-t border-neutral-gray100">
                      <p className="text-xs text-neutral-gray500">
                        {store.isOpen ? `Active ${store.lastActive}m ago` : 'Currently Closed'}
                      </p>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="bg-neutral-gray50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-neutral-gray900">25</div>
              <div className="text-sm text-neutral-gray600">Total Stores</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-gray900">2000+</div>
              <div className="text-sm text-neutral-gray600">Products</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-gray900">93</div>
              <div className="text-sm text-neutral-gray600">Brands</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-gray900">5</div>
              <div className="text-sm text-neutral-gray600">Categories</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;

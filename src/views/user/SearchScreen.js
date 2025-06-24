import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '../../components/SearchBar';
import GradientButton from '../../components/GradientButton';
import searchNotificationService from '../../services/SearchNotificationService';
import { Search, Clock, TrendingUp } from 'lucide-react';

const SearchScreen = ({ onSearchResults }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    'iPhone 16 Pro Max',
    'Nike Air Jordan',
    'Wireless headphones'
  ]);
  const [popularCategories] = useState([
    { name: 'Electronics', icon: '📱', searches: '2.1k' },
    { name: 'Fashion', icon: '👕', searches: '1.8k' },
    { name: 'Food', icon: '🍔', searches: '1.5k' },
    { name: 'Gaming', icon: '🎮', searches: '1.2k' }
  ]);

  // Mock user ID for demo
  const userId = 'demo_user_123';

  const handleSearch = async (query) => {
    setIsSearching(true);
    
    try {
      console.log(`🔍 Starting search for: "${query}"`);
      
      // Add to recent searches
      setRecentSearches(prev => {
        const updated = [query, ...prev.filter(s => s !== query)].slice(0, 5);
        return updated;
      });

      // Call the brute force search service
      const result = await searchNotificationService.handleUserSearch(
        userId, 
        query, 
        { latitude: 28.5355, longitude: 77.3910 } // Mock location
      );

      console.log('🎯 SEARCH SUMMARY:', {
        query: query,
        searchSessionId: result.searchSessionId,
        agentsNotified: result.notifiedAgents,
        productsFound: result.productResults,
        source1Count: result.source1Count,
        source2Count: result.source2Count
      });
      
      // Navigate to results screen
      if (onSearchResults) {
        onSearchResults(result.searchSessionId, query, result);
      }
      
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRecentSearchClick = (query) => {
    handleSearch(query);
  };

  const handleCategoryClick = (category) => {
    handleSearch(category.name);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-neutral-gray100 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-h2 font-bold text-gradient">MallConnect</h1>
            <div className="w-8 h-8 bg-neutral-gray100 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-pink mb-4"></div>
              <h2 className="text-h2 font-semibold mb-2">Finding stores...</h2>
              <p className="text-neutral-gray700 text-center">
                Notifying all agents about your search
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="search-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Welcome Section */}
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Search className="h-16 w-16 text-primary-pink mx-auto mb-4" />
                </motion.div>
                <h2 className="text-h1 font-bold mb-2">Find anything</h2>
                <p className="text-neutral-gray700 text-lg">
                  Search across all stores in the mall
                </p>
              </div>

              {/* Search Bar */}
              <SearchBar 
                onSearch={handleSearch}
                placeholder="What are you looking for today?"
                className="mb-8"
              />

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center mb-4">
                    <Clock className="h-5 w-5 text-neutral-gray700 mr-2" />
                    <h3 className="font-semibold">Recent Searches</h3>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <motion.button
                        key={search}
                        onClick={() => handleRecentSearchClick(search)}
                        className="w-full text-left p-3 bg-neutral-gray100 rounded-button hover:bg-neutral-gray100/80 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <span className="text-neutral-gray700">•</span> {search}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Popular Categories */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center mb-4">
                  <TrendingUp className="h-5 w-5 text-neutral-gray700 mr-2" />
                  <h3 className="font-semibold">Popular Categories</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {popularCategories.map((category, index) => (
                    <motion.button
                      key={category.name}
                      onClick={() => handleCategoryClick(category)}
                      className="p-4 bg-white border border-neutral-gray100 rounded-card hover:shadow-card transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <div className="font-semibold text-sm">{category.name}</div>
                      <div className="text-xs text-neutral-gray700">{category.searches} searches</div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-8"
              >
                <GradientButton
                  onClick={() => handleSearch('Show me everything')}
                  className="w-full"
                  size="large"
                >
                  Browse All Stores
                </GradientButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchScreen;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HomeScreen from './views/user/HomeScreen';
import SearchScreen from './views/user/SearchScreen';
import SimpleAgentDashboard from './views/agent/SimpleAgentDashboard';
import DeveloperPanel from './components/DeveloperPanel';
import supabaseService from './services/SupabaseService';
import searchNotificationService from './services/SearchNotificationService';
import realTimeNotificationService from './services/RealTimeNotificationService';
import './App.css';

function App() {
  // Check URL for route
  const getInitialView = () => {
    const path = window.location.pathname;
    if (path.includes('/agent')) return 'agent';
    if (path.includes('/search')) return 'search';
    return 'home';
  };

  const [currentView, setCurrentView] = useState(getInitialView());
  const [searchSessionId, setSearchSessionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [connectionStatus, setConnectionStatus] = useState(null);

  // Test database connections on app load
  useEffect(() => {
    const testConnections = async () => {
      try {
        const status = await supabaseService.testConnection();
        setConnectionStatus(status);
        console.log('Database connection status:', status);
      } catch (error) {
        console.error('Failed to test connections:', error);
      }
    };

    testConnections();
  }, []);

  const handleSearchResults = (sessionId, query, searchData) => {
    setSearchSessionId(sessionId);
    setSearchQuery(query);
    setCurrentView('results');
    
    // Log the search data for debugging
    if (searchData) {
      console.log('📊 Search Data Received:', searchData);
    }
  };

  const handleBackToSearch = () => {
    setCurrentView('search');
    setSearchSessionId(null);
    setSearchQuery('');
  };

  return (
    <div className="App font-figtree">
      {/* Connection Status Indicator (for development) */}
      {connectionStatus && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-neutral-gray100 p-2 text-xs">
          <div className="max-w-md mx-auto flex justify-between">
            <span>Users: {connectionStatus.users === 'connected' ? '✅' : '❌'}</span>
            <span>Products1: {connectionStatus.products1 === 'connected' ? '✅' : '❌'}</span>
            <span>Products2: {connectionStatus.products2 === 'connected' ? '✅' : '❌'}</span>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <HomeScreen 
              onSearch={handleSearchResults} 
              onSwitchToAgent={() => setCurrentView('agent')}
            />
          </motion.div>
        )}

        {currentView === 'search' && (
          <motion.div
            key="search"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <SearchScreen onSearchResults={handleSearchResults} />
          </motion.div>
        )}

        {currentView === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <ResultsScreen 
              searchSessionId={searchSessionId}
              searchQuery={searchQuery}
              onBack={handleBackToSearch}
            />
          </motion.div>
        )}

        {currentView === 'agent' && (
          <motion.div
            key="agent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <SimpleAgentDashboard 
              onSwitchToUser={() => setCurrentView('home')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Developer Panel */}
      <DeveloperPanel />
    </div>
  );
}

// Temporary Results Screen component
const ResultsScreen = ({ searchSessionId, searchQuery, onBack }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBids = () => {
      if (!searchSessionId) return;

      // Get bids from real-time notification service
      const leaderboard = realTimeNotificationService.getBiddingLeaderboard(searchSessionId);
      setBids(leaderboard);
      setLoading(false);

      // Poll for updates every 2 seconds
      const interval = setInterval(() => {
        const updatedLeaderboard = realTimeNotificationService.getBiddingLeaderboard(searchSessionId);
        setBids(updatedLeaderboard);
      }, 2000);

      return () => clearInterval(interval);
    };

    if (searchSessionId) {
      // Initial load after 1 second to allow agents to bid
      setTimeout(loadBids, 1000);
    }
  }, [searchSessionId]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-neutral-gray100 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center">
            <button 
              onClick={onBack}
              className="mr-3 p-2 hover:bg-neutral-gray100 rounded-full"
            >
              ←
            </button>
            <div>
              <h1 className="font-semibold">Search Results</h1>
              <p className="text-sm text-neutral-gray700">"{searchQuery}"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-pink mx-auto mb-4"></div>
            <h2 className="text-h2 font-semibold mb-2">Agents are bidding...</h2>
            <p className="text-neutral-gray700">
              {searchSessionId ? `Session: ${searchSessionId.slice(0, 8)}...` : 'Loading...'}
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-h2 font-semibold mb-4">
              {bids.length > 0 ? `${bids.length} stores found` : 'No bids yet'}
            </h2>
            
            {bids.length > 0 ? (
              <div className="space-y-4">
                {bids.map((bid, index) => (
                  <motion.div
                    key={bid.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{bid.agents?.store_name || 'Store'}</h3>
                        <p className="text-sm text-neutral-gray700">
                          {bid.agents?.agent_name || 'Agent'}
                        </p>
                        <p className="text-xs text-neutral-gray700 mt-1">
                          {bid.displayLocation || 'Location not set'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-accent-coinGold">
                          <span className="text-lg mr-1">{bid.bidPriorityIcon}</span>
                          <span className="font-semibold">{bid.coins_bid} coins</span>
                        </div>
                        <p className="text-xs text-neutral-gray700">{bid.timeAgo}</p>
                      </div>
                    </div>
                    {bid.bid_message && (
                      <p className="text-sm mt-2 p-2 bg-neutral-gray100 rounded">
                        "{bid.bid_message}"
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-neutral-gray700">
                  Waiting for agents to place bids...
                </p>
                <p className="text-sm text-neutral-gray700 mt-2">
                  This may take a few moments
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

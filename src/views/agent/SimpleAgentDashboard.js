import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Coins, Store, TrendingUp, Clock, Zap, Users } from 'lucide-react';
import realTimeNotificationService from '../../services/RealTimeNotificationService';

const SimpleAgentDashboard = ({ onSwitchToUser }) => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [bids, setBids] = useState([]);

  // Mock 25 store agents
  const mockAgents = [
    // Luxury Fashion Hub
    { id: 1, store_name: 'DIOR Store', agent_name: 'Sophie Laurent', coins: 5000, category: 'Luxury' },
    { id: 2, store_name: 'GUCCI Store', agent_name: 'Marco Rossi', coins: 4800, category: 'Luxury' },
    { id: 3, store_name: 'PRADA Store', agent_name: 'Isabella Ferrari', coins: 4600, category: 'Luxury' },
    { id: 4, store_name: 'SAINT LAURENT Store', agent_name: 'Antoine Dubois', coins: 4400, category: 'Luxury' },
    { id: 5, store_name: 'VERSACE Store', agent_name: 'Valentina Greco', coins: 4200, category: 'Luxury' },
    
    // Sports & Athleisure
    { id: 6, store_name: 'ADIDAS Store', agent_name: 'Hans Mueller', coins: 3500, category: 'Sports' },
    { id: 7, store_name: 'NIKE Store', agent_name: 'Michael Johnson', coins: 3400, category: 'Sports' },
    { id: 8, store_name: 'PUMA Store', agent_name: 'Rudolf Dassler', coins: 3300, category: 'Sports' },
    { id: 9, store_name: 'REEBOK Store', agent_name: 'Joe Foster', coins: 3200, category: 'Sports' },
    { id: 10, store_name: 'NEW BALANCE Store', agent_name: 'William Riley', coins: 3100, category: 'Sports' },
    
    // Contemporary Fashion
    { id: 11, store_name: 'SLOGUN Store', agent_name: 'Rajesh Slogun', coins: 2800, category: 'Fashion' },
    { id: 12, store_name: 'YUMI KIM Store', agent_name: 'Yumi Tanaka', coins: 2700, category: 'Fashion' },
    { id: 13, store_name: 'PLAINANDSIMPLE Store', agent_name: 'Sarah Plain', coins: 2600, category: 'Fashion' },
    { id: 14, store_name: 'TFNC LONDON Store', agent_name: 'Emma London', coins: 2500, category: 'Fashion' },
    { id: 15, store_name: 'COTTSBURY LTD Store', agent_name: 'James Cottsbury', coins: 2400, category: 'Fashion' },
    
    // SuperDry Collection
    { id: 16, store_name: 'SuperDry Store #1', agent_name: 'Julian Dunkerton', coins: 3000, category: 'SuperDry' },
    { id: 17, store_name: 'SuperDry Store #2', agent_name: 'James Holder', coins: 2900, category: 'SuperDry' },
    { id: 18, store_name: 'SuperDry Store #3', agent_name: 'Sarah Mitchell', coins: 2800, category: 'SuperDry' },
    { id: 19, store_name: 'SuperDry Store #4', agent_name: 'David Chen', coins: 2700, category: 'SuperDry' },
    { id: 20, store_name: 'SuperDry Store #5', agent_name: 'Lisa Thompson', coins: 2600, category: 'SuperDry' },
    
    // Premium Lifestyle
    { id: 21, store_name: 'TURNBULL & ASSER Store', agent_name: 'Charles Turnbull', coins: 4000, category: 'Premium' },
    { id: 22, store_name: 'MONCLER Store', agent_name: 'Remo Ruffini', coins: 3900, category: 'Premium' },
    { id: 23, store_name: 'ALEXANDER MCQUEEN Store', agent_name: 'Sarah Burton', coins: 3800, category: 'Premium' },
    { id: 24, store_name: 'BALENCIAGA Store', agent_name: 'Demna Gvasalia', coins: 3700, category: 'Premium' },
    { id: 25, store_name: 'BOTTEGA VENETA Store', agent_name: 'Matthieu Blazy', coins: 3600, category: 'Premium' }
  ];

  // Mock notifications
  const mockNotifications = [
    { id: 1, search_query: 'iPhone 16 Pro Max', timeAgo: '2m ago', user: 'Ankit Singh' },
    { id: 2, search_query: 'DIOR handbag', timeAgo: '5m ago', user: 'Priya Sharma' },
    { id: 3, search_query: 'Nike running shoes', timeAgo: '8m ago', user: 'Rahul Kumar' },
    { id: 4, search_query: 'SuperDry hoodie', timeAgo: '12m ago', user: 'Sneha Gupta' },
    { id: 5, search_query: 'laptop', timeAgo: '15m ago', user: 'Amit Patel' }
  ];

  useEffect(() => {
    // Set default agent
    setSelectedAgent(mockAgents[0]);
    
    // Subscribe to real-time notifications
    const handleNewNotification = (notification) => {
      console.log(`🔔 Agent ${selectedAgent?.id} received notification:`, notification);
      setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep latest 10
    };

    if (selectedAgent) {
      realTimeNotificationService.subscribeAgent(selectedAgent.id, handleNewNotification);
      
      // Load existing notifications
      const existingNotifications = realTimeNotificationService.getActiveNotifications();
      setNotifications(existingNotifications);
    }

    // Cleanup subscription on unmount or agent change
    return () => {
      if (selectedAgent) {
        realTimeNotificationService.unsubscribeAgent(selectedAgent.id);
      }
    };
  }, [selectedAgent]);

  // Load initial data
  useEffect(() => {
    setSelectedAgent(mockAgents[0]);
    
    // Simulate some initial bids
    setBids([
      { id: 1, search_query: 'iPhone 16 Pro Max', coins_bid: 500, timeAgo: '3m ago' },
      { id: 2, search_query: 'DIOR handbag', coins_bid: 800, timeAgo: '6m ago' }
    ]);
  }, []);

  const placeBid = (notification, bidAmount) => {
    if (!selectedAgent || selectedAgent.coins < bidAmount) {
      alert('❌ Insufficient coins!');
      return;
    }

    // Place bid through notification service
    const bidData = {
      search_session_id: notification.id,
      agent_id: selectedAgent.id,
      agent_name: selectedAgent.agent_name,
      store_name: selectedAgent.store_name,
      coins_bid: bidAmount,
      bid_message: `${selectedAgent.store_name} has the best ${notification.search_query}!`,
      product_match: true
    };

    const bid = realTimeNotificationService.placeBid(bidData);

    // Update agent coins
    const updatedAgent = { ...selectedAgent, coins: selectedAgent.coins - bidAmount };
    setSelectedAgent(updatedAgent);

    // Add new bid to local state
    const newBid = {
      id: bid.id,
      search_query: notification.search_query,
      coins_bid: bidAmount,
      timeAgo: 'Just now'
    };
    setBids([newBid, ...bids]);

    alert(`✅ Bid placed! ${bidAmount} coins for "${notification.search_query}"`);
    console.log(`💰 ${selectedAgent.store_name} bid ${bidAmount} coins for "${notification.search_query}"`);
  };

  const getBidAmount = (searchQuery) => {
    const query = searchQuery.toLowerCase();
    const category = selectedAgent?.category?.toLowerCase() || '';
    
    if (category === 'luxury' && (query.includes('dior') || query.includes('luxury'))) {
      return 800;
    }
    if (category === 'sports' && (query.includes('nike') || query.includes('shoes'))) {
      return 600;
    }
    if (category === 'superdry' && query.includes('superdry')) {
      return 500;
    }
    return 300;
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Luxury': return 'bg-yellow-100 text-yellow-800';
      case 'Sports': return 'bg-blue-100 text-blue-800';
      case 'Fashion': return 'bg-pink-100 text-pink-800';
      case 'SuperDry': return 'bg-green-100 text-green-800';
      case 'Premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-pink to-primary-violet text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Agent Dashboard</h1>
              <p className="text-white/90">Manage your store and respond to customer searches</p>
            </div>
            <button
              onClick={onSwitchToUser}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              👤 Switch to User View
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Agent Selector */}
        <div className="mb-6 bg-white rounded-card p-4 border-2 border-black">
          <h3 className="font-semibold mb-3 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Select Store Agent (25 Available):
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 max-h-64 overflow-y-auto">
            {mockAgents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedAgent?.id === agent.id
                    ? 'border-primary-pink bg-primary-pink/10'
                    : 'border-gray-200 hover:border-primary-pink'
                }`}
              >
                <div className="text-sm font-medium">{agent.store_name}</div>
                <div className="text-xs text-gray-600">{agent.agent_name}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(agent.category)}`}>
                    {agent.category}
                  </span>
                  <div className="text-xs text-yellow-600 flex items-center">
                    <Coins className="h-3 w-3 mr-1" />
                    {agent.coins}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedAgent && (
          <>
            {/* Agent Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-card p-6 border-2 border-black">
                <div className="flex items-center mb-4">
                  <Store className="h-6 w-6 text-primary-pink mr-3" />
                  <h3 className="font-semibold">Store Info</h3>
                </div>
                <div className="space-y-2">
                  <div><strong>Store:</strong> {selectedAgent.store_name}</div>
                  <div><strong>Agent:</strong> {selectedAgent.agent_name}</div>
                  <div><strong>Category:</strong> {selectedAgent.category}</div>
                  <div><strong>Status:</strong> <span className="text-green-600">Active</span></div>
                </div>
              </div>

              <div className="bg-white rounded-card p-6 border-2 border-black">
                <div className="flex items-center mb-4">
                  <Coins className="h-6 w-6 text-yellow-500 mr-3" />
                  <h3 className="font-semibold">Coins Balance</h3>
                </div>
                <div className="text-3xl font-bold text-yellow-600 mb-2">{selectedAgent.coins}</div>
                <div className="text-sm text-gray-600">Available for bidding</div>
              </div>

              <div className="bg-white rounded-card p-6 border-2 border-black">
                <div className="flex items-center mb-4">
                  <TrendingUp className="h-6 w-6 text-green-500 mr-3" />
                  <h3 className="font-semibold">Active Bids</h3>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">{bids.length}</div>
                <div className="text-sm text-gray-600">Recent bidding activity</div>
              </div>
            </div>

            {/* Notifications and Bids */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Live Notifications */}
              <div className="bg-white rounded-card p-6 border-2 border-black">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Bell className="h-6 w-6 text-primary-pink mr-3" />
                    <h3 className="font-semibold">Live Search Notifications</h3>
                  </div>
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
                    {notifications.length} active
                  </span>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-pink transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">🔍 "{notification.search_query}"</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {notification.timeAgo}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        User {notification.user} is searching for: {notification.search_query}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-yellow-600">
                          Suggested bid: {getBidAmount(notification.search_query)} coins
                        </div>
                        <button
                          onClick={() => placeBid(notification, getBidAmount(notification.search_query))}
                          disabled={selectedAgent.coins < getBidAmount(notification.search_query)}
                          className="bg-primary-pink text-white px-3 py-1 rounded text-sm hover:bg-primary-pink/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Zap className="h-3 w-3 inline mr-1" />
                          Bid Now
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Your Bids */}
              <div className="bg-white rounded-card p-6 border-2 border-black">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <TrendingUp className="h-6 w-6 text-green-500 mr-3" />
                    <h3 className="font-semibold">Your Active Bids</h3>
                  </div>
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                    {bids.length} bids
                  </span>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {bids.length > 0 ? (
                    bids.map((bid) => (
                      <motion.div
                        key={bid.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">💰 {bid.coins_bid} coins</div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {bid.timeAgo}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          Search: "{bid.search_query}"
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No active bids</p>
                      <p className="text-sm">Start bidding on search notifications!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-blue-50 rounded-card p-6 border-2 border-blue-200">
              <h3 className="font-semibold mb-3 text-blue-800">🎯 How to Test:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                <div>
                  <strong>1. Select Agent:</strong> Choose any of the 25 store agents above
                </div>
                <div>
                  <strong>2. Place Bids:</strong> Click "Bid Now" on any search notification
                </div>
                <div>
                  <strong>3. Monitor Coins:</strong> Watch your coin balance decrease with each bid
                </div>
                <div>
                  <strong>4. Switch Views:</strong> Use "Switch to User View" to test user side
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SimpleAgentDashboard;

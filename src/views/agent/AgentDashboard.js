import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Coins, Store, Users, TrendingUp, Clock, Zap } from 'lucide-react';
import GradientButton from '../../components/GradientButton';
import supabaseService from '../../services/SupabaseService';
import searchNotificationService from '../../services/SearchNotificationService';

const AgentDashboard = ({ agentId, onSwitchToUser }) => {
  const [agent, setAgent] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeBids, setActiveBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [allAgents, setAllAgents] = useState([]);

  useEffect(() => {
    loadAgentData();
    loadAllAgents();
    
    // Poll for new notifications every 3 seconds
    const interval = setInterval(() => {
      loadNotifications();
      loadActiveBids();
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedAgent]);

  const loadAllAgents = async () => {
    try {
      const { data } = await supabaseService.getAllActiveAgents();
      setAllAgents(data || []);
      if (data && data.length > 0 && !selectedAgent) {
        setSelectedAgent(data[0]);
      }
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const loadAgentData = async () => {
    if (!selectedAgent) return;
    
    try {
      setAgent(selectedAgent);
      await loadNotifications();
      await loadActiveBids();
    } catch (error) {
      console.error('Error loading agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    if (!selectedAgent) return;
    
    try {
      // Get recent search sessions (last 10)
      const { data: sessions } = await supabaseService.users
        .from('search_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (sessions) {
        const notificationsWithTime = sessions.map(session => ({
          ...session,
          timeAgo: getTimeAgo(session.created_at),
          canBid: true
        }));
        setNotifications(notificationsWithTime);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadActiveBids = async () => {
    if (!selectedAgent) return;
    
    try {
      const { data: bids } = await supabaseService.users
        .from('bids')
        .select(`
          *,
          search_sessions (
            search_query,
            created_at
          )
        `)
        .eq('agent_id', selectedAgent.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (bids) {
        const bidsWithTime = bids.map(bid => ({
          ...bid,
          timeAgo: getTimeAgo(bid.created_at)
        }));
        setActiveBids(bidsWithTime);
      }
    } catch (error) {
      console.error('Error loading active bids:', error);
    }
  };

  const placeBid = async (searchSessionId, searchQuery, bidAmount, message = '') => {
    if (!selectedAgent) return;
    
    try {
      const bidData = {
        search_session_id: searchSessionId,
        agent_id: selectedAgent.id,
        coins_bid: bidAmount,
        bid_message: message || `${selectedAgent.store_name} has the best ${searchQuery}!`,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabaseService.users
        .from('bids')
        .insert(bidData);

      if (error) {
        console.error('Error placing bid:', error);
        alert('❌ Error placing bid');
        return;
      }

      // Update agent coins
      const newCoins = selectedAgent.coins - bidAmount;
      await supabaseService.users
        .from('agents')
        .update({ coins: newCoins })
        .eq('id', selectedAgent.id);

      // Update local state
      setSelectedAgent({ ...selectedAgent, coins: newCoins });
      
      alert(`✅ Bid placed! ${bidAmount} coins for "${searchQuery}"`);
      await loadActiveBids();
    } catch (error) {
      console.error('Error placing bid:', error);
      alert('❌ Error placing bid');
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getBidAmount = (searchQuery) => {
    if (!selectedAgent) return 100;
    
    // Smart bidding based on store category and search query
    const query = searchQuery.toLowerCase();
    const category = selectedAgent.store_category?.[0]?.toLowerCase() || '';
    
    if (category.includes('luxury') && (query.includes('dior') || query.includes('gucci') || query.includes('luxury'))) {
      return Math.min(1000, selectedAgent.coins * 0.3);
    }
    if (category.includes('sports') && (query.includes('adidas') || query.includes('nike') || query.includes('sports'))) {
      return Math.min(800, selectedAgent.coins * 0.25);
    }
    if (category.includes('superdry') && query.includes('superdry')) {
      return Math.min(600, selectedAgent.coins * 0.2);
    }
    
    // Default bid
    return Math.min(300, selectedAgent.coins * 0.15);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-pink mx-auto mb-4"></div>
          <p className="text-neutral-gray700">Loading agent dashboard...</p>
        </div>
      </div>
    );
  }

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
              Switch to User View
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Agent Selector */}
        <div className="mb-6 bg-white rounded-card p-4 border-2 border-black">
          <h3 className="font-semibold mb-3">Select Store Agent:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {allAgents.map((agentOption) => (
              <button
                key={agentOption.id}
                onClick={() => setSelectedAgent(agentOption)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedAgent?.id === agentOption.id
                    ? 'border-primary-pink bg-primary-pink/10'
                    : 'border-gray-200 hover:border-primary-pink'
                }`}
              >
                <div className="text-sm font-medium">{agentOption.store_name}</div>
                <div className="text-xs text-gray-600">{agentOption.agent_name}</div>
                <div className="text-xs text-yellow-600 flex items-center mt-1">
                  <Coins className="h-3 w-3 mr-1" />
                  {agentOption.coins} coins
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
                  <div><strong>Category:</strong> {selectedAgent.store_category?.join(', ')}</div>
                  <div><strong>Location:</strong> {selectedAgent.store_location?.floor}, {selectedAgent.store_location?.section}</div>
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
                <div className="text-3xl font-bold text-green-600 mb-2">{activeBids.length}</div>
                <div className="text-sm text-gray-600">Recent bidding activity</div>
              </div>
            </div>

            {/* Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
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
                          User is searching for: {notification.search_query}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-yellow-600">
                            Suggested bid: {getBidAmount(notification.search_query)} coins
                          </div>
                          <button
                            onClick={() => placeBid(
                              notification.id,
                              notification.search_query,
                              getBidAmount(notification.search_query)
                            )}
                            disabled={selectedAgent.coins < getBidAmount(notification.search_query)}
                            className="bg-primary-pink text-white px-3 py-1 rounded text-sm hover:bg-primary-pink/90 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Zap className="h-3 w-3 inline mr-1" />
                            Bid Now
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No active search notifications</p>
                      <p className="text-sm">Waiting for users to search...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Bids */}
              <div className="bg-white rounded-card p-6 border-2 border-black">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <TrendingUp className="h-6 w-6 text-green-500 mr-3" />
                    <h3 className="font-semibold">Your Active Bids</h3>
                  </div>
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                    {activeBids.length} bids
                  </span>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {activeBids.length > 0 ? (
                    activeBids.map((bid) => (
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
                        <div className="text-sm text-gray-600 mb-2">
                          Search: "{bid.search_sessions?.search_query}"
                        </div>
                        {bid.bid_message && (
                          <div className="text-sm bg-gray-50 p-2 rounded">
                            "{bid.bid_message}"
                          </div>
                        )}
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

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-card p-6 border-2 border-black">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-pink transition-colors text-center"
                >
                  <Bell className="h-6 w-6 mx-auto mb-2 text-primary-pink" />
                  <div className="text-sm font-medium">Refresh Notifications</div>
                </button>
                <button
                  onClick={() => alert('Auto-bidding feature coming soon!')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-pink transition-colors text-center"
                >
                  <Zap className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                  <div className="text-sm font-medium">Auto Bid</div>
                </button>
                <button
                  onClick={() => alert('Store analytics coming soon!')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-pink transition-colors text-center"
                >
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <div className="text-sm font-medium">Analytics</div>
                </button>
                <button
                  onClick={() => alert('Store settings coming soon!')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-pink transition-colors text-center"
                >
                  <Store className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <div className="text-sm font-medium">Store Settings</div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;

class RealTimeNotificationService {
  constructor() {
    this.notifications = [];
    this.subscribers = new Map(); // agentId -> callback function
    this.searchSessions = new Map(); // sessionId -> search data
  }

  // Subscribe agent to notifications
  subscribeAgent(agentId, callback) {
    this.subscribers.set(agentId, callback);
    console.log(`🔔 Agent ${agentId} subscribed to notifications`);
  }

  // Unsubscribe agent
  unsubscribeAgent(agentId) {
    this.subscribers.delete(agentId);
    console.log(`🔕 Agent ${agentId} unsubscribed from notifications`);
  }

  // User searches for a product
  createSearchNotification(searchData) {
    const notification = {
      id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: searchData.user_id || 'user_demo',
      user_name: searchData.user_name || 'Demo User',
      search_query: searchData.search_query,
      product_details: searchData.product_details || {},
      store_context: searchData.store_context || null,
      price_range: searchData.price_range || null, // e.g., "under ₹3000"
      category: searchData.category || null,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      status: 'active',
      matching_stores: [] // Will be populated by product matching
    };

    // Find matching stores based on product search
    const matchingStores = this.findMatchingStores(searchData.search_query, searchData.category);
    notification.matching_stores = matchingStores;

    // Store the search session
    this.searchSessions.set(notification.id, notification);
    this.notifications.push(notification);

    // Notify only relevant agents (not all agents)
    this.notifyRelevantAgents(notification, matchingStores);

    console.log(`🔍 Search notification created for "${notification.search_query}":`, notification);
    console.log(`📍 Found ${matchingStores.length} matching stores:`, matchingStores.map(s => s.store_name));
    return notification;
  }

  // Notify all subscribed agents
  notifyAllAgents(notification) {
    const agentCount = this.subscribers.size;
    console.log(`📢 Notifying ${agentCount} agents about search: "${notification.search_query}"`);

    this.subscribers.forEach((callback, agentId) => {
      try {
        callback(notification);
      } catch (error) {
        console.error(`Error notifying agent ${agentId}:`, error);
      }
    });
  }

  // Agent places bid
  placeBid(bidData) {
    const bid = {
      id: `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      search_session_id: bidData.search_session_id,
      agent_id: bidData.agent_id,
      agent_name: bidData.agent_name,
      store_name: bidData.store_name,
      coins_bid: bidData.coins_bid,
      bid_message: bidData.bid_message || '',
      product_match: bidData.product_match || false,
      created_at: new Date().toISOString()
    };

    // Find the search session
    const searchSession = this.searchSessions.get(bidData.search_session_id);
    if (searchSession) {
      if (!searchSession.bids) {
        searchSession.bids = [];
      }
      searchSession.bids.push(bid);
      
      // Sort bids by coins (highest first)
      searchSession.bids.sort((a, b) => b.coins_bid - a.coins_bid);
    }

    console.log(`💰 Bid placed:`, bid);
    return bid;
  }

  // Get bidding leaderboard for a search session
  getBiddingLeaderboard(searchSessionId) {
    const searchSession = this.searchSessions.get(searchSessionId);
    if (!searchSession || !searchSession.bids) {
      return [];
    }

    return searchSession.bids.map((bid, index) => ({
      ...bid,
      rank: index + 1,
      timeAgo: this.getTimeAgo(bid.created_at),
      bidPriorityIcon: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '💰'
    }));
  }

  // Get active notifications for an agent
  getActiveNotifications() {
    const now = new Date();
    return this.notifications
      .filter(notification => {
        const expiresAt = new Date(notification.expires_at);
        return expiresAt > now && notification.status === 'active';
      })
      .map(notification => ({
        ...notification,
        timeAgo: this.getTimeAgo(notification.created_at),
        bidCount: this.searchSessions.get(notification.id)?.bids?.length || 0
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // Get search session details
  getSearchSession(sessionId) {
    return this.searchSessions.get(sessionId);
  }

  // Helper function to get time ago
  getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }

  // Clear expired notifications
  clearExpiredNotifications() {
    const now = new Date();
    this.notifications = this.notifications.filter(notification => {
      const expiresAt = new Date(notification.expires_at);
      return expiresAt > now;
    });
  }

  // Find matching stores based on product search
  findMatchingStores(searchQuery, category) {
    const query = searchQuery.toLowerCase();
    
    // Complete store inventory for all 25 stores
    const storeInventory = {
      // Luxury Fashion Hub (5 stores)
      1: { store_name: 'DIOR Store', products: ['dress', 'black dress', 'evening dress', 'designer dress', 'luxury handbag', 'designer handbag', 'luxury watch', 'designer shoes', 'luxury accessories'] },
      2: { store_name: 'GUCCI Store', products: ['dress', 'black dress', 'luxury dress', 'designer dress', 'designer handbag', 'luxury handbag', 'luxury watch', 'designer shoes', 'luxury accessories'] },
      3: { store_name: 'PRADA Store', products: ['dress', 'black dress', 'designer dress', 'luxury dress', 'designer handbag', 'luxury handbag', 'designer shoes', 'luxury accessories'] },
      4: { store_name: 'SAINT LAURENT Store', products: ['dress', 'black dress', 'designer dress', 'luxury dress', 'designer handbag', 'luxury handbag', 'designer shoes', 'luxury accessories'] },
      5: { store_name: 'VERSACE Store', products: ['dress', 'black dress', 'designer dress', 'luxury dress', 'designer handbag', 'luxury handbag', 'designer shoes', 'luxury accessories'] },
      
      // Sports & Athleisure (5 stores)
      6: { store_name: 'ADIDAS Store', products: ['wireless headphones', 'sports headphones', 'running headphones', 'bluetooth headphones', 'running shoes', 'sports shoes', 'gym wear', 'sports apparel', 'athletic accessories'] },
      7: { store_name: 'NIKE Store', products: ['wireless headphones', 'sports headphones', 'fitness headphones', 'bluetooth headphones', 'running shoes', 'sports shoes', 'gym wear', 'sports apparel', 'athletic accessories'] },
      8: { store_name: 'PUMA Store', products: ['wireless headphones', 'sports headphones', 'running headphones', 'bluetooth headphones', 'running shoes', 'sports shoes', 'gym wear', 'sports apparel'] },
      9: { store_name: 'REEBOK Store', products: ['wireless headphones', 'sports headphones', 'running headphones', 'bluetooth headphones', 'running shoes', 'sports shoes', 'gym wear', 'sports apparel'] },
      10: { store_name: 'NEW BALANCE Store', products: ['wireless headphones', 'sports headphones', 'running headphones', 'bluetooth headphones', 'running shoes', 'sports shoes', 'gym wear', 'sports apparel'] },
      
      // Contemporary Fashion (5 stores)
      11: { store_name: 'SLOGUN Store', products: ['dress', 'casual dress', 'party dress', 'casual wear', 'everyday fashion', 'trendy accessories', 'fashion accessories'] },
      12: { store_name: 'YUMI KIM Store', products: ['dress', 'casual dress', 'party dress', 'casual wear', 'everyday fashion', 'trendy accessories', 'fashion accessories'] },
      13: { store_name: 'PLAINANDSIMPLE Store', products: ['dress', 'casual dress', 'party dress', 'casual wear', 'everyday fashion', 'trendy accessories', 'fashion accessories'] },
      14: { store_name: 'TFNC LONDON Store', products: ['dress', 'casual dress', 'party dress', 'casual wear', 'everyday fashion', 'trendy accessories', 'fashion accessories'] },
      15: { store_name: 'COTTSBURY LTD Store', products: ['dress', 'casual dress', 'party dress', 'casual wear', 'everyday fashion', 'trendy accessories', 'fashion accessories'] },
      
      // SuperDry Collection (5 stores)
      16: { store_name: 'SuperDry Store #1', products: ['hoodie', 'jacket', 't-shirt', 'casual wear', 'hoodies', 'jackets', 'casual clothing'] },
      17: { store_name: 'SuperDry Store #2', products: ['hoodie', 'jacket', 't-shirt', 'casual wear', 'hoodies', 'jackets', 'casual clothing'] },
      18: { store_name: 'SuperDry Store #3', products: ['hoodie', 'jacket', 't-shirt', 'casual wear', 'hoodies', 'jackets', 'casual clothing'] },
      19: { store_name: 'SuperDry Store #4', products: ['hoodie', 'jacket', 't-shirt', 'casual wear', 'hoodies', 'jackets', 'casual clothing'] },
      20: { store_name: 'SuperDry Store #5', products: ['hoodie', 'jacket', 't-shirt', 'casual wear', 'hoodies', 'jackets', 'casual clothing'] },
      
      // Premium Lifestyle (5 stores)
      21: { store_name: 'TURNBULL & ASSER Store', products: ['designer jacket', 'formal wear', 'luxury shoes', 'premium accessories', 'designer coat', 'formal clothing'] },
      22: { store_name: 'MONCLER Store', products: ['designer jacket', 'designer coat', 'luxury jacket', 'premium accessories', 'luxury shoes', 'formal wear'] },
      23: { store_name: 'ALEXANDER MCQUEEN Store', products: ['designer jacket', 'designer coat', 'luxury shoes', 'premium accessories', 'formal wear', 'luxury clothing'] },
      24: { store_name: 'BALENCIAGA Store', products: ['designer jacket', 'designer coat', 'luxury shoes', 'premium accessories', 'formal wear', 'luxury clothing'] },
      25: { store_name: 'BOTTEGA VENETA Store', products: ['designer jacket', 'designer coat', 'luxury shoes', 'premium accessories', 'formal wear', 'luxury clothing'] }
    };

    const matchingStores = [];
    
    // Check each store's inventory
    Object.entries(storeInventory).forEach(([storeId, storeData]) => {
      const hasMatchingProduct = storeData.products.some(product => 
        query.includes(product) || product.includes(query.split(' ')[0])
      );
      
      if (hasMatchingProduct) {
        matchingStores.push({
          store_id: parseInt(storeId),
          store_name: storeData.store_name,
          relevance_score: this.calculateRelevanceScore(query, storeData.products),
          has_inventory: true
        });
      }
    });

    // Sort by relevance score
    matchingStores.sort((a, b) => b.relevance_score - a.relevance_score);
    
    return matchingStores;
  }

  // Calculate relevance score for store matching
  calculateRelevanceScore(query, products) {
    const queryWords = query.toLowerCase().split(' ');
    let score = 0;
    
    products.forEach(product => {
      queryWords.forEach(word => {
        if (product.includes(word)) {
          score += word.length; // Longer matches get higher scores
        }
      });
    });
    
    return score;
  }

  // Notify only relevant agents (those with matching products)
  notifyRelevantAgents(notification, matchingStores) {
    const relevantAgentIds = matchingStores.map(store => store.store_id);
    let notifiedCount = 0;

    this.subscribers.forEach((callback, agentId) => {
      // Only notify agents whose stores have matching products
      if (relevantAgentIds.includes(parseInt(agentId))) {
        try {
          callback(notification);
          notifiedCount++;
        } catch (error) {
          console.error(`Error notifying agent ${agentId}:`, error);
        }
      }
    });

    console.log(`📢 Notified ${notifiedCount} relevant agents (out of ${this.subscribers.size} total) about search: "${notification.search_query}"`);
    console.log(`🎯 Relevant stores: ${matchingStores.map(s => s.store_name).join(', ')}`);
  }

  // Get all search sessions (for debugging)
  getAllSearchSessions() {
    return Array.from(this.searchSessions.values());
  }
}

// Create singleton instance
const realTimeNotificationService = new RealTimeNotificationService();

// Auto-clear expired notifications every minute
setInterval(() => {
  realTimeNotificationService.clearExpiredNotifications();
}, 60000);

export default realTimeNotificationService;

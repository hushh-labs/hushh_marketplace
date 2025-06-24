import supabaseService from './SupabaseService';

class SearchNotificationService {
  constructor() {
    this.fcmServerKey = process.env.REACT_APP_FCM_SERVER_KEY;
  }

  // BRUTE FORCE: Handle user search and notify ALL agents
  async handleUserSearch(userId, searchQuery, userLocation = {}) {
    try {
      console.log(`🔍 User search initiated: "${searchQuery}"`);
      console.log(`📍 User location:`, userLocation);
      
      // Step 1: Create search session
      console.log(`📝 Creating search session...`);
      const { data: searchSession, error: sessionError } = await supabaseService.createSearchSession(
        userId, 
        searchQuery, 
        userLocation
      );
      
      if (sessionError) throw sessionError;
      console.log(`✅ Search session created: ${searchSession.id}`);
      
      // Step 2: Search products from both sources FIRST
      console.log(`🔍 Searching products in both sources...`);
      const { data: productResults, source1Count, source2Count } = await supabaseService.searchAllProductSources(searchQuery);
      
      console.log(`📦 Product search results:`);
      console.log(`   Source 1 (${process.env.REACT_APP_SUPABASE_URL?.slice(-10)}): ${source1Count} products`);
      console.log(`   Source 2 (${process.env.REACT_APP_SUPABASE_URL_SOURCE2?.slice(-10)}): ${source2Count} products`);
      console.log(`   Total products found: ${productResults.length}`);
      
      if (productResults.length > 0) {
        console.log(`📋 Sample products:`, productResults.slice(0, 3).map(p => ({
          title: p.title || p.name || 'No title',
          source: p.source,
          price: p.price || 'No price'
        })));
      }
      
      // Step 3: Get ALL active agents (BRUTE FORCE)
      console.log(`👥 Fetching all active agents...`);
      const { data: allAgents, error: agentsError } = await supabaseService.getAllActiveAgents();
      
      if (agentsError) throw agentsError;
      
      console.log(`🚀 BRUTE FORCE APPROACH:`);
      console.log(`   Found ${allAgents.length} active agents`);
      console.log(`   Will notify ALL agents regardless of product match`);
      console.log(`   No filtering, no time limits, maximum competition!`);
      
      // Step 4: Notify ALL agents immediately (NO FILTERING)
      await this.notifyAllAgents(allAgents, searchQuery, searchSession.id, userId);
      
      return {
        searchSessionId: searchSession.id,
        notifiedAgents: allAgents.length,
        productResults: productResults.length,
        source1Count,
        source2Count,
        message: `Notified ${allAgents.length} agents about search: "${searchQuery}"`
      };
    } catch (error) {
      console.error('❌ Error in handleUserSearch:', error);
      throw error;
    }
  }

  // BRUTE FORCE: Send notification to ALL agents
  async notifyAllAgents(agents, searchQuery, searchSessionId, userId) {
    console.log(`📢 BRUTE FORCE: Sending notifications to ${agents.length} agents`);
    
    const notificationPromises = agents.map(async (agent, index) => {
      // Stagger notifications slightly to avoid overwhelming FCM
      const delay = index * 100; // 100ms delay between each notification
      
      setTimeout(async () => {
        await this.sendFCMNotification(agent, searchQuery, searchSessionId, userId);
      }, delay);
    });
    
    await Promise.allSettled(notificationPromises);
    console.log(`✅ All ${agents.length} notifications dispatched`);
  }

  async sendFCMNotification(agent, searchQuery, searchSessionId, userId) {
    try {
      const notificationPayload = {
        to: agent.fcm_token,
        notification: {
          title: "🔔 New Customer Search!",
          body: `Someone is looking for: "${searchQuery}"`,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/badge-72x72.png",
          click_action: `${window.location.origin}/agent/bid/${searchSessionId}`
        },
        data: {
          type: "new_search",
          search_session_id: searchSessionId,
          search_query: searchQuery,
          user_id: userId,
          agent_id: agent.id,
          timestamp: new Date().toISOString()
        }
      };

      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': `key=${this.fcmServerKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationPayload)
      });

      if (response.ok) {
        console.log(`✅ Notification sent to ${agent.agent_name} (${agent.store_name})`);
      } else {
        console.error(`❌ Failed to send notification to ${agent.agent_name}`);
      }
    } catch (error) {
      console.error(`Error sending FCM to ${agent.agent_name}:`, error);
    }
  }

  // Handle agent bidding (no time limit - until user satisfaction)
  async handleAgentBid(agentId, searchSessionId, coinsBid, bidMessage = '') {
    try {
      console.log(`💰 Agent ${agentId} placing bid: ${coinsBid} coins`);
      
      // Get agent details
      const { data: agent, error: agentError } = await supabaseService.getAgent(agentId);
      if (agentError) throw agentError;
      
      // Check if agent has enough coins
      if (agent.coins < coinsBid) {
        throw new Error('Insufficient coins');
      }
      
      // Deduct coins from agent (non-refundable)
      const { error: coinError } = await supabaseService.updateAgentCoins(agentId, -coinsBid);
      if (coinError) throw coinError;
      
      // Create bid record
      const { data: bid, error: bidError } = await supabaseService.createBid({
        search_session_id: searchSessionId,
        agent_id: agentId,
        coins_bid: coinsBid,
        bid_message: bidMessage,
        bid_status: 'active'
      });
      
      if (bidError) throw bidError;
      
      console.log(`✅ Bid placed successfully: ${coinsBid} coins`);
      
      // The real-time subscription will automatically update the user's leaderboard
      return bid;
    } catch (error) {
      console.error('Error in handleAgentBid:', error);
      throw error;
    }
  }

  // Get live bidding leaderboard for user
  async getBiddingLeaderboard(searchSessionId) {
    try {
      const { data: bids, error } = await supabaseService.getBidsForSession(searchSessionId);
      if (error) throw error;
      
      // Sort by coins_bid (descending) and add ranking
      const rankedBids = bids.map((bid, index) => ({
        ...bid,
        rank: index + 1,
        bidPriority: this.getBidPriority(bid.coins_bid),
        bidPriorityIcon: this.getBidPriorityIcon(bid.coins_bid)
      }));
      
      return rankedBids;
    } catch (error) {
      console.error('Error getting bidding leaderboard:', error);
      return [];
    }
  }

  // User selects winning agent (completes search)
  async selectWinningAgent(searchSessionId, selectedAgentId, userId) {
    try {
      console.log(`🎉 User selected winning agent: ${selectedAgentId}`);
      
      // Mark selected bid as won
      await supabaseService.updateBidStatus(searchSessionId, selectedAgentId, 'won');
      
      // Mark other bids as lost
      const { data: allBids } = await supabaseService.getBidsForSession(searchSessionId);
      const otherBids = allBids.filter(bid => bid.agent_id !== selectedAgentId);
      
      for (const bid of otherBids) {
        await supabaseService.updateBidStatus(searchSessionId, bid.agent_id, 'lost');
      }
      
      // Complete search session
      await supabaseService.updateSearchSession(searchSessionId, {
        status: 'completed',
        selected_agent_id: selectedAgentId,
        completed_at: new Date().toISOString()
      });
      
      // Update agent success metrics
      const { data: agent } = await supabaseService.getAgent(selectedAgentId);
      if (agent) {
        await supabaseService.updateAgentCoins(selectedAgentId, 0); // Just update metrics
      }
      
      // Notify winning agent
      await this.notifyAgentOfWin(selectedAgentId, userId, searchSessionId);
      
      console.log(`🎉 Search completed! Agent ${selectedAgentId} won the bid.`);
      
      return { success: true, selectedAgentId };
    } catch (error) {
      console.error('Error in selectWinningAgent:', error);
      throw error;
    }
  }

  async notifyAgentOfWin(agentId, userId, searchSessionId) {
    try {
      const { data: agent } = await supabaseService.getAgent(agentId);
      const { data: user } = await supabaseService.getUserProfile(userId);
      
      if (agent && agent.fcm_token) {
        const notificationPayload = {
          to: agent.fcm_token,
          notification: {
            title: "🎉 You Won the Bid!",
            body: `${user?.name || 'A customer'} is coming to your store!`,
            icon: "/icons/icon-192x192.png"
          },
          data: {
            type: "bid_won",
            search_session_id: searchSessionId,
            user_id: userId,
            agent_id: agentId,
            timestamp: new Date().toISOString()
          }
        };

        await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${this.fcmServerKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(notificationPayload)
        });
      }
    } catch (error) {
      console.error('Error notifying agent of win:', error);
    }
  }

  // Utility methods
  getBidPriority(coinsBid) {
    if (coinsBid >= 100) return 'high';
    if (coinsBid >= 50) return 'medium';
    return 'low';
  }

  getBidPriorityIcon(coinsBid) {
    if (coinsBid >= 100) return '🔥';
    if (coinsBid >= 50) return '⭐';
    return '💡';
  }

  // Subscribe to real-time bid updates
  subscribeToBidUpdates(searchSessionId, callback) {
    return supabaseService.subscribeToBids(searchSessionId, (payload) => {
      console.log('New bid received:', payload.new);
      callback(payload.new);
    });
  }

  // Unsubscribe from real-time updates
  unsubscribe(subscription) {
    supabaseService.unsubscribe(subscription);
  }
}

// Export singleton instance
const searchNotificationService = new SearchNotificationService();
export default searchNotificationService;

import { createClient } from '@supabase/supabase-js';

// Create Supabase clients for all three data sources
const supabaseUsers = createClient(
  process.env.REACT_APP_SUPABASE_URL_USERS,
  process.env.REACT_APP_SUPABASE_ANON_KEY_USERS
);

const supabaseProducts1 = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const supabaseProducts2 = createClient(
  process.env.REACT_APP_SUPABASE_URL_SOURCE2,
  process.env.REACT_APP_SUPABASE_ANON_KEY_SOURCE2
);

class SupabaseService {
  constructor() {
    this.users = supabaseUsers;
    this.products1 = supabaseProducts1;
    this.products2 = supabaseProducts2;
  }

  // User Operations
  async getUserProfile(hushh_id) {
    try {
      const { data, error } = await this.users
        .from('users')
        .select('*')
        .eq('hushh_id', hushh_id)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { data: null, error };
    }
  }

  async updateUserProfile(hushh_id, updates) {
    try {
      const { data, error } = await this.users
        .from('users')
        .update(updates)
        .eq('hushh_id', hushh_id)
        .select();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { data: null, error };
    }
  }

  // Agent Operations
  async getAllActiveAgents() {
    try {
      const { data, error } = await this.users
        .from('agents')
        .select('*')
        .eq('is_active', true)
        .not('fcm_token', 'is', null);
      
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching active agents:', error);
      return { data: [], error };
    }
  }

  async getAgent(agentId) {
    try {
      const { data, error } = await this.users
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching agent:', error);
      return { data: null, error };
    }
  }

  async updateAgentCoins(agentId, coinChange) {
    try {
      const { data, error } = await this.users
        .from('agents')
        .update({ 
          coins: this.users.raw(`coins + ${coinChange}`),
          total_bids: this.users.raw('total_bids + 1'),
          updated_at: new Date().toISOString()
        })
        .eq('id', agentId)
        .select();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating agent coins:', error);
      return { data: null, error };
    }
  }

  // Search Session Operations
  async createSearchSession(userId, searchQuery, userLocation = {}) {
    try {
      const { data, error } = await this.users
        .from('search_sessions')
        .insert({
          user_id: userId,
          search_query: searchQuery,
          search_filters: {},
          user_location: userLocation,
          status: 'active'
        })
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating search session:', error);
      return { data: null, error };
    }
  }

  async updateSearchSession(sessionId, updates) {
    try {
      const { data, error } = await this.users
        .from('search_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating search session:', error);
      return { data: null, error };
    }
  }

  // Bid Operations
  async createBid(bidData) {
    try {
      const { data, error } = await this.users
        .from('bids')
        .insert(bidData)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating bid:', error);
      return { data: null, error };
    }
  }

  async getBidsForSession(sessionId) {
    try {
      const { data, error } = await this.users
        .from('bids')
        .select(`
          *,
          agents (
            agent_name,
            store_name,
            store_location,
            store_category
          )
        `)
        .eq('search_session_id', sessionId)
        .eq('bid_status', 'active')
        .order('coins_bid', { ascending: false });
      
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching bids:', error);
      return { data: [], error };
    }
  }

  async updateBidStatus(sessionId, agentId, status) {
    try {
      const { data, error } = await this.users
        .from('bids')
        .update({ 
          bid_status: status,
          is_selected: status === 'won'
        })
        .eq('search_session_id', sessionId)
        .eq('agent_id', agentId)
        .select();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating bid status:', error);
      return { data: null, error };
    }
  }

  // Product Search Operations
  async searchProductSource1(searchQuery, limit = 20) {
    try {
      console.log(`🔍 Searching Source 1: ${process.env.REACT_APP_SUPABASE_URL}`);
      console.log(`📋 Table: product_search, Query: "${searchQuery}", Limit: ${limit}`);
      
      const { data, error } = await this.products1
        .from('product_search')
        .select('*')
        .textSearch('fts', searchQuery)
        .limit(limit);
      
      if (error) {
        console.error('❌ Source 1 Error:', error);
        throw error;
      }
      
      console.log(`✅ Source 1 Results: ${data?.length || 0} products found`);
      if (data && data.length > 0) {
        console.log(`📦 Source 1 Sample:`, data.slice(0, 2));
      }
      
      return { data: data || [], error: null };
    } catch (error) {
      console.error('❌ Error searching product source 1:', error);
      return { data: [], error };
    }
  }

  async searchProductSource2(searchQuery, limit = 20) {
    try {
      console.log(`🔍 Searching Source 2: ${process.env.REACT_APP_SUPABASE_URL_SOURCE2}`);
      console.log(`📋 Table: product_search, Query: "${searchQuery}", Limit: ${limit}`);
      
      const { data, error } = await this.products2
        .from('product_search')
        .select('*')
        .textSearch('fts', searchQuery)
        .limit(limit);
      
      if (error) {
        console.error('❌ Source 2 Error:', error);
        throw error;
      }
      
      console.log(`✅ Source 2 Results: ${data?.length || 0} products found`);
      if (data && data.length > 0) {
        console.log(`📦 Source 2 Sample:`, data.slice(0, 2));
      }
      
      return { data: data || [], error: null };
    } catch (error) {
      console.error('❌ Error searching product source 2:', error);
      return { data: [], error };
    }
  }

  async searchAllProductSources(searchQuery) {
    try {
      console.log(`🔍 Searching in both product sources for: "${searchQuery}"`);
      
      const [source1Results, source2Results] = await Promise.all([
        this.searchProductSource1(searchQuery),
        this.searchProductSource2(searchQuery)
      ]);

      const source1Count = source1Results.data.length;
      const source2Count = source2Results.data.length;

      console.log(`📊 Product search breakdown:`);
      console.log(`   Source 1: ${source1Count} products`);
      console.log(`   Source 2: ${source2Count} products`);

      const combinedResults = [
        ...source1Results.data.map(item => ({ ...item, source: 1 })),
        ...source2Results.data.map(item => ({ ...item, source: 2 }))
      ];

      console.log(`📦 Combined results: ${combinedResults.length} total products`);

      return { 
        data: combinedResults, 
        source1Count,
        source2Count,
        error: null 
      };
    } catch (error) {
      console.error('❌ Error searching all product sources:', error);
      return { 
        data: [], 
        source1Count: 0,
        source2Count: 0,
        error 
      };
    }
  }

  // Real-time Subscriptions
  subscribeToBids(sessionId, callback) {
    return this.users
      .channel(`bids_${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bids',
        filter: `search_session_id=eq.${sessionId}`
      }, callback)
      .subscribe();
  }

  subscribeToSearchUpdates(sessionId, callback) {
    return this.users
      .channel(`search_${sessionId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'search_sessions',
        filter: `id=eq.${sessionId}`
      }, callback)
      .subscribe();
  }

  subscribeToAgentNotifications(agentId, callback) {
    return this.users
      .channel(`agent_${agentId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'search_sessions'
      }, callback)
      .subscribe();
  }

  // Utility Methods
  unsubscribe(subscription) {
    if (subscription) {
      this.users.removeChannel(subscription);
    }
  }

  async testConnection() {
    try {
      const [usersTest, products1Test, products2Test] = await Promise.all([
        this.users.from('users').select('count', { count: 'exact', head: true }),
        this.products1.from('product_search').select('count', { count: 'exact', head: true }),
        this.products2.from('product_search').select('count', { count: 'exact', head: true })
      ]);

      return {
        users: usersTest.error ? 'error' : 'connected',
        products1: products1Test.error ? 'error' : 'connected',
        products2: products2Test.error ? 'error' : 'connected'
      };
    } catch (error) {
      console.error('Connection test failed:', error);
      return {
        users: 'error',
        products1: 'error',
        products2: 'error'
      };
    }
  }
}

// Export singleton instance
const supabaseService = new SupabaseService();
export default supabaseService;

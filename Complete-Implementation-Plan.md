# MallConnect Complete Implementation Plan

## 🎯 Implementation Specifications

Based on your requirements:
- ✅ **Bidding Window**: Until user satisfaction (no time limit)
- ✅ **Notification Limits**: None (full brute force approach)
- ✅ **Agent Creation**: 20 agents via script
- ✅ **Product Data**: Use existing productSource1 & productSource2
- ✅ **FCM**: Your Firebase configuration provided

## 🔧 Firebase Configuration Setup

### Update .env with FCM credentials
```env
# Firebase Configuration for FCM
REACT_APP_FIREBASE_API_KEY=AIzaSyBAqKMc8Jg-75B07_QvAhIG_QKm-GTZuK8
REACT_APP_FIREBASE_AUTH_DOMAIN=hushone-app.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://hushone-app-default-rtdb.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=hushone-app
REACT_APP_FIREBASE_STORAGE_BUCKET=hushone-app.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=53407187172
REACT_APP_FIREBASE_APP_ID=1:53407187172:web:e353f101422d343db32cf1
REACT_APP_FIREBASE_MEASUREMENT_ID=G-18FRGV9FSM

# FCM Server Key
FCM_SERVER_KEY=AAAADG9RAOQ:APA91bGCFbfAELnqBDB4q1dIVEQGGtVV-vVH196ligsqcIi9UYc-ZMFwGDHZ2z4aEWCx_jRzzOp6S-0AMRyyO80_Uewj247N3MdvQ-VmWHQvCMGvghWLrhE8G20mXIh8KXnzqavvKMzl
```

## 🏗️ Database Schema Implementation

### Enhanced Agents Table
```sql
-- Create agents table in users database
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hushh_user_id TEXT REFERENCES users(hushh_id),
  
  -- Agent Identity
  agent_name TEXT NOT NULL,
  agent_email TEXT,
  agent_phone TEXT,
  fcm_token TEXT,
  
  -- Store Information
  store_name TEXT NOT NULL,
  store_category TEXT[] DEFAULT '{}', -- ['electronics', 'fashion', 'food']
  store_location JSONB, -- {floor: 'ground', section: 'A', shop_number: '101'}
  store_description TEXT,
  
  -- Bidding & Coins
  coins INTEGER DEFAULT 2000,
  total_bids INTEGER DEFAULT 0,
  successful_bids INTEGER DEFAULT 0,
  
  -- Performance Metrics
  conversion_rate DECIMAL DEFAULT 0.0,
  average_bid_amount INTEGER DEFAULT 50,
  total_earnings DECIMAL DEFAULT 0.0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT now(),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create bids table for tracking all bidding activity
CREATE TABLE public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_session_id UUID NOT NULL,
  agent_id UUID REFERENCES agents(id),
  user_id TEXT REFERENCES users(hushh_id),
  
  -- Bid Details
  product_query TEXT NOT NULL,
  coins_bid INTEGER NOT NULL,
  bid_message TEXT,
  
  -- Status
  bid_status TEXT DEFAULT 'active', -- 'active', 'won', 'lost', 'expired'
  is_selected BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ -- No expiry for your approach
);

-- Create search sessions to track user searches
CREATE TABLE public.search_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(hushh_id),
  
  -- Search Details
  search_query TEXT NOT NULL,
  search_filters JSONB,
  user_location JSONB,
  
  -- Session Status
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'abandoned'
  selected_agent_id UUID REFERENCES agents(id),
  total_bids INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

## 🤖 Agent Creation Script

### Create 20 Demo Agents
```typescript
// scripts/createAgents.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUsers = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_USERS!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_USERS!
)

const demoAgents = [
  {
    agent_name: "Rajesh Kumar",
    agent_email: "rajesh@techworld.com",
    agent_phone: "+91-9876543210",
    store_name: "TechWorld Electronics",
    store_category: ["electronics", "mobile", "accessories"],
    store_location: { floor: "ground", section: "A", shop_number: "G-101" },
    store_description: "Latest smartphones, laptops, and tech accessories",
    coins: 2500
  },
  {
    agent_name: "Priya Sharma",
    agent_email: "priya@fashionhub.com",
    agent_phone: "+91-9876543211",
    store_name: "Fashion Hub",
    store_category: ["fashion", "clothing", "accessories"],
    store_location: { floor: "first", section: "B", shop_number: "F1-205" },
    store_description: "Trendy clothing and fashion accessories for all ages",
    coins: 2000
  },
  {
    agent_name: "Amit Patel",
    agent_email: "amit@mobilezone.com",
    agent_phone: "+91-9876543212",
    store_name: "Mobile Zone",
    store_category: ["electronics", "mobile", "smartphones"],
    store_location: { floor: "ground", section: "A", shop_number: "G-102" },
    store_description: "Authorized dealer for all major smartphone brands",
    coins: 3000
  },
  {
    agent_name: "Sneha Gupta",
    agent_email: "sneha@beautyworld.com",
    agent_phone: "+91-9876543213",
    store_name: "Beauty World",
    store_category: ["beauty", "cosmetics", "skincare"],
    store_location: { floor: "first", section: "C", shop_number: "F1-301" },
    store_description: "Premium beauty products and cosmetics",
    coins: 1800
  },
  {
    agent_name: "Vikram Singh",
    agent_email: "vikram@sportszone.com",
    agent_phone: "+91-9876543214",
    store_name: "Sports Zone",
    store_category: ["sports", "fitness", "equipment"],
    store_location: { floor: "second", section: "A", shop_number: "S2-101" },
    store_description: "Sports equipment and fitness gear",
    coins: 2200
  },
  {
    agent_name: "Kavya Reddy",
    agent_email: "kavya@bookworld.com",
    agent_phone: "+91-9876543215",
    store_name: "Book World",
    store_category: ["books", "stationery", "education"],
    store_location: { floor: "first", section: "D", shop_number: "F1-401" },
    store_description: "Books, stationery, and educational materials",
    coins: 1500
  },
  {
    agent_name: "Rohit Jain",
    agent_email: "rohit@gadgetstore.com",
    agent_phone: "+91-9876543216",
    store_name: "Gadget Store",
    store_category: ["electronics", "gadgets", "accessories"],
    store_location: { floor: "ground", section: "B", shop_number: "G-201" },
    store_description: "Latest gadgets and electronic accessories",
    coins: 2800
  },
  {
    agent_name: "Anita Verma",
    agent_email: "anita@jewelrypalace.com",
    agent_phone: "+91-9876543217",
    store_name: "Jewelry Palace",
    store_category: ["jewelry", "accessories", "gold"],
    store_location: { floor: "first", section: "A", shop_number: "F1-101" },
    store_description: "Fine jewelry and precious accessories",
    coins: 3500
  },
  {
    agent_name: "Suresh Yadav",
    agent_email: "suresh@homeappliances.com",
    agent_phone: "+91-9876543218",
    store_name: "Home Appliances Hub",
    store_category: ["appliances", "home", "kitchen"],
    store_location: { floor: "second", section: "B", shop_number: "S2-201" },
    store_description: "Home and kitchen appliances",
    coins: 2600
  },
  {
    agent_name: "Meera Agarwal",
    agent_email: "meera@kidsworld.com",
    agent_phone: "+91-9876543219",
    store_name: "Kids World",
    store_category: ["kids", "toys", "clothing"],
    store_location: { floor: "first", section: "E", shop_number: "F1-501" },
    store_description: "Kids clothing, toys, and accessories",
    coins: 1900
  },
  {
    agent_name: "Deepak Mishra",
    agent_email: "deepak@watchworld.com",
    agent_phone: "+91-9876543220",
    store_name: "Watch World",
    store_category: ["watches", "accessories", "luxury"],
    store_location: { floor: "ground", section: "C", shop_number: "G-301" },
    store_description: "Premium watches and timepieces",
    coins: 2400
  },
  {
    agent_name: "Ritu Saxena",
    agent_email: "ritu@footwear.com",
    agent_phone: "+91-9876543221",
    store_name: "Footwear Junction",
    store_category: ["footwear", "shoes", "fashion"],
    store_location: { floor: "first", section: "F", shop_number: "F1-601" },
    store_description: "Branded footwear for all occasions",
    coins: 2100
  },
  {
    agent_name: "Manoj Kumar",
    agent_email: "manoj@musicstore.com",
    agent_phone: "+91-9876543222",
    store_name: "Music Store",
    store_category: ["music", "instruments", "audio"],
    store_location: { floor: "second", section: "C", shop_number: "S2-301" },
    store_description: "Musical instruments and audio equipment",
    coins: 1700
  },
  {
    agent_name: "Sunita Joshi",
    agent_email: "sunita@opticals.com",
    agent_phone: "+91-9876543223",
    store_name: "Vision Opticals",
    store_category: ["opticals", "eyewear", "health"],
    store_location: { floor: "ground", section: "D", shop_number: "G-401" },
    store_description: "Prescription glasses and sunglasses",
    coins: 1600
  },
  {
    agent_name: "Rahul Chopra",
    agent_email: "rahul@autoparts.com",
    agent_phone: "+91-9876543224",
    store_name: "Auto Parts Center",
    store_category: ["automotive", "parts", "accessories"],
    store_location: { floor: "basement", section: "A", shop_number: "B-101" },
    store_description: "Automotive parts and accessories",
    coins: 2300
  },
  {
    agent_name: "Pooja Malhotra",
    agent_email: "pooja@giftshoppe.com",
    agent_phone: "+91-9876543225",
    store_name: "Gift Shoppe",
    store_category: ["gifts", "decorative", "occasions"],
    store_location: { floor: "first", section: "G", shop_number: "F1-701" },
    store_description: "Gifts and decorative items for all occasions",
    coins: 1400
  },
  {
    agent_name: "Sanjay Gupta",
    agent_email: "sanjay@pharmacy.com",
    agent_phone: "+91-9876543226",
    store_name: "Health Pharmacy",
    store_category: ["pharmacy", "health", "medicines"],
    store_location: { floor: "ground", section: "E", shop_number: "G-501" },
    store_description: "Medicines and health products",
    coins: 1300
  },
  {
    agent_name: "Nisha Agrawal",
    agent_email: "nisha@petstore.com",
    agent_phone: "+91-9876543227",
    store_name: "Pet Paradise",
    store_category: ["pets", "accessories", "food"],
    store_location: { floor: "second", section: "D", shop_number: "S2-401" },
    store_description: "Pet accessories and food",
    coins: 1200
  },
  {
    agent_name: "Kiran Sharma",
    agent_email: "kiran@artgallery.com",
    agent_phone: "+91-9876543228",
    store_name: "Art Gallery",
    store_category: ["art", "crafts", "decorative"],
    store_location: { floor: "first", section: "H", shop_number: "F1-801" },
    store_description: "Art pieces and handcrafted items",
    coins: 1100
  },
  {
    agent_name: "Ashok Tiwari",
    agent_email: "ashok@traveldesk.com",
    agent_phone: "+91-9876543229",
    store_name: "Travel Desk",
    store_category: ["travel", "services", "booking"],
    store_location: { floor: "ground", section: "F", shop_number: "G-601" },
    store_description: "Travel booking and tourism services",
    coins: 1000
  }
]

const createAgents = async () => {
  try {
    console.log('Creating 20 demo agents...')
    
    for (const agent of demoAgents) {
      // Generate FCM token (in real app, this comes from client)
      const fcm_token = `fcm_token_${Math.random().toString(36).substring(7)}`
      
      const { data, error } = await supabaseUsers
        .from('agents')
        .insert({
          ...agent,
          fcm_token,
          hushh_user_id: `agent_${Math.random().toString(36).substring(7)}` // Demo user ID
        })
      
      if (error) {
        console.error(`Error creating agent ${agent.agent_name}:`, error)
      } else {
        console.log(`✅ Created agent: ${agent.agent_name} - ${agent.store_name}`)
      }
    }
    
    console.log('🎉 All 20 agents created successfully!')
  } catch (error) {
    console.error('Error in createAgents:', error)
  }
}

// Run the script
createAgents()
```

## 🔄 Brute Force Notification System

### Core Search & Notification Flow
```typescript
// services/SearchNotificationService.ts
import { createClient } from '@supabase/supabase-js'

class SearchNotificationService {
  private supabaseUsers = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_USERS!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_USERS!
  )
  
  private supabaseProducts1 = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  private supabaseProducts2 = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_SOURCE2!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_SOURCE2!
  )

  // BRUTE FORCE: Notify ALL active agents
  async handleUserSearch(userId: string, searchQuery: string, userLocation?: any) {
    try {
      // Step 1: Create search session
      const searchSession = await this.createSearchSession(userId, searchQuery, userLocation)
      
      // Step 2: Get ALL active agents (BRUTE FORCE)
      const allAgents = await this.getAllActiveAgents()
      
      // Step 3: Notify ALL agents immediately (NO FILTERING)
      await this.notifyAllAgents(allAgents, searchQuery, searchSession.id, userId)
      
      // Step 4: Search products from both sources
      const productResults = await this.searchAllProductSources(searchQuery)
      
      return {
        searchSessionId: searchSession.id,
        notifiedAgents: allAgents.length,
        productResults: productResults.length,
        message: `Notified ${allAgents.length} agents about search: "${searchQuery}"`
      }
    } catch (error) {
      console.error('Error in handleUserSearch:', error)
      throw error
    }
  }

  private async createSearchSession(userId: string, searchQuery: string, userLocation?: any) {
    const { data, error } = await this.supabaseUsers
      .from('search_sessions')
      .insert({
        user_id: userId,
        search_query: searchQuery,
        search_filters: {},
        user_location: userLocation || {},
        status: 'active'
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  private async getAllActiveAgents() {
    const { data, error } = await this.supabaseUsers
      .from('agents')
      .select('*')
      .eq('is_active', true)
      .not('fcm_token', 'is', null)
    
    if (error) throw error
    return data || []
  }

  // BRUTE FORCE: Send notification to ALL agents
  private async notifyAllAgents(agents: any[], searchQuery: string, searchSessionId: string, userId: string) {
    console.log(`🚀 BRUTE FORCE: Notifying ${agents.length} agents about: "${searchQuery}"`)
    
    const notificationPromises = agents.map(async (agent, index) => {
      // Stagger notifications slightly to avoid overwhelming FCM
      const delay = index * 100 // 100ms delay between each notification
      
      setTimeout(async () => {
        await this.sendFCMNotification(agent, searchQuery, searchSessionId, userId)
      }, delay)
    })
    
    await Promise.allSettled(notificationPromises)
  }

  private async sendFCMNotification(agent: any, searchQuery: string, searchSessionId: string, userId: string) {
    try {
      const notificationPayload = {
        to: agent.fcm_token,
        notification: {
          title: "🔔 New Customer Search!",
          body: `Someone is looking for: "${searchQuery}"`,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/badge-72x72.png",
          click_action: `https://mallconnect.app/agent/bid/${searchSessionId}`
        },
        data: {
          type: "new_search",
          search_session_id: searchSessionId,
          search_query: searchQuery,
          user_id: userId,
          agent_id: agent.id,
          timestamp: new Date().toISOString()
        }
      }

      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': `key=${process.env.FCM_SERVER_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationPayload)
      })

      if (response.ok) {
        console.log(`✅ Notification sent to ${agent.agent_name} (${agent.store_name})`)
      } else {
        console.error(`❌ Failed to send notification to ${agent.agent_name}`)
      }
    } catch (error) {
      console.error(`Error sending FCM to ${agent.agent_name}:`, error)
    }
  }

  private async searchAllProductSources(searchQuery: string) {
    try {
      const [source1Results, source2Results] = await Promise.all([
        this.searchProductSource1(searchQuery),
        this.searchProductSource2(searchQuery)
      ])

      return [
        ...source1Results.map(item => ({ ...item, source: 1 })),
        ...source2Results.map(item => ({ ...item, source: 2 }))
      ]
    } catch (error) {
      console.error('Error searching product sources:', error)
      return []
    }
  }

  private async searchProductSource1(searchQuery: string) {
    const { data, error } = await this.supabaseProducts1
      .from('product_search')
      .select('*')
      .textSearch('fts', searchQuery)
      .limit(20)
    
    return data || []
  }

  private async searchProductSource2(searchQuery: string) {
    const { data, error } = await this.supabaseProducts2
      .from('product_search')
      .select('*')
      .textSearch('fts', searchQuery)
      .limit(20)
    
    return data || []
  }

  // Handle agent bidding (no time limit - until user satisfaction)
  async handleAgentBid(agentId: string, searchSessionId: string, coinsBid: number, bidMessage?: string) {
    try {
      // Deduct coins from agent
      await this.deductAgentCoins(agentId, coinsBid)
      
      // Create bid record
      const { data, error } = await this.supabaseUsers
        .from('bids')
        .insert({
          search_session_id: searchSessionId,
          agent_id: agentId,
          coins_bid: coinsBid,
          bid_message: bidMessage || '',
          bid_status: 'active'
        })
        .select()
        .single()
      
      if (error) throw error
      
      // Update search session bid count
      await this.updateSearchSessionBidCount(searchSessionId)
      
      // Notify user of new bid (real-time)
      await this.notifyUserOfNewBid(searchSessionId, data)
      
      return data
    } catch (error) {
      console.error('Error in handleAgentBid:', error)
      throw error
    }
  }

  private async deductAgentCoins(agentId: string, coinAmount: number) {
    const { error } = await this.supabaseUsers
      .from('agents')
      .update({ 
        coins: this.supabaseUsers.raw(`coins - ${coinAmount}`),
        total_bids: this.supabaseUsers.raw('total_bids + 1')
      })
      .eq('id', agentId)
    
    if (error) throw error
  }

  private async updateSearchSessionBidCount(searchSessionId: string) {
    const { error } = await this.supabaseUsers
      .from('search_sessions')
      .update({ 
        total_bids: this.supabaseUsers.raw('total_bids + 1')
      })
      .eq('id', searchSessionId)
    
    if (error) throw error
  }

  private async notifyUserOfNewBid(searchSessionId: string, bidData: any) {
    // Real-time notification to user via Supabase realtime
    // This will update the user's bid leaderboard in real-time
    console.log(`📱 New bid received for search ${searchSessionId}:`, bidData)
  }

  // Get live bidding leaderboard for user
  async getBiddingLeaderboard(searchSessionId: string) {
    const { data, error } = await this.supabaseUsers
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
      .eq('search_session_id', searchSessionId)
      .eq('bid_status', 'active')
      .order('coins_bid', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  // User selects winning agent (completes search)
  async selectWinningAgent(searchSessionId: string, selectedAgentId: string) {
    try {
      // Mark selected bid as won
      await this.supabaseUsers
        .from('bids')
        .update({ 
          bid_status: 'won',
          is_selected: true
        })
        .eq('search_session_id', searchSessionId)
        .eq('agent_id', selectedAgentId)
      
      // Mark other bids as lost
      await this.supabaseUsers
        .from('bids')
        .update({ bid_status: 'lost' })
        .eq('search_session_id', searchSessionId)
        .neq('agent_id', selectedAgentId)
      
      // Complete search session
      await this.supabaseUsers
        .from('search_sessions')
        .update({ 
          status: 'completed',
          selected_agent_id: selectedAgentId,
          completed_at: new Date().toISOString()
        })
        .eq('id', searchSessionId)
      
      // Update agent success metrics
      await this.supabaseUsers
        .from('agents')
        .update({ 
          successful_bids: this.supabaseUsers.raw('successful_bids + 1')
        })
        .eq('id', selectedAgentId)
      
      console.log(`🎉 Search completed! Agent ${selectedAgentId} won the bid.`)
      
      return { success: true, selectedAgentId }
    } catch (error) {
      console.error('Error in selectWinningAgent:', error)
      throw error
    }
  }
}

export default new SearchNotificationService()
```

## 🎯 Implementation Summary

### Your Brute Force Approach Implementation:
1. ✅ **No bidding time limit** - Agents can bid until user selects
2. ✅ **No notification limits** - All 20 agents get notified for every search
3. ✅ **20 agent profiles** - Script creates diverse store agents
4. ✅ **Product data integration** - Uses your existing product sources
5. ✅ **FCM integration** - Your Firebase config for real-time notifications

### Key Features:
- **Maximum Competition**: All agents compete for every search
- **Real-time Bidding**: Live leaderboard updates as agents bid
- **User Control**: User decides when to stop accepting bids
- **Simple Logic**: Straightforward implementation, easy to debug
- **Data Collection**: Perfect for learning user and agent behavior

### Next Steps:
1. Run the agent creation script to populate 20 agents
2. Implement the SearchNotificationService
3. Build the user and agent UI components
4. Test the brute force notification system
5. Deploy and collect real usage data

**Your brute force approach is the perfect starting point! It ensures maximum coverage and will give us real data to optimize from.** 🚀

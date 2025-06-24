# Agent (Store Owner) Flow - Complete User Story

## 🎯 Goal
Get high-intent foot traffic from users looking for products the store offers

## 🏪 Agent Journey Breakdown

### **Step 1: Agent Setup**
**Login**: Store rep logs in using phone/email via agent flow
**Dashboard**: Views current inventory and available coins

#### Inventory Management:
- Uploads product images and metadata to ProductMetadata & IndexedTable
- Can batch upload or integrate with POS (future enhancement)

#### Implementation Details:
```typescript
const agentLogin = async (phone: string, storeCode: string) => {
  // Authenticate agent
  const agent = await authenticateAgent(phone, storeCode)
  
  // Get agent dashboard data
  const dashboardData = await getAgentDashboard(agent.id)
  
  return {
    agent,
    coins: dashboardData.coins,
    todayStats: dashboardData.todayStats,
    inventory: dashboardData.inventory,
    recentActivity: dashboardData.recentActivity
  }
}

const uploadProductInventory = async (agentId: string, products: Product[]) => {
  // Batch upload to both product sources
  const uploadPromises = products.map(async (product) => {
    // Create vector embedding for product
    const embedding = await createProductEmbedding(product.description)
    
    // Upload to product_search table
    await uploadToProductSearch({
      ...product,
      agent_id: agentId,
      embeddings: embedding,
      refined_text: generateRefinedText(product)
    })
    
    // Upload to product_metadata table
    await uploadToProductMetadata({
      product_id: product.id,
      metadata: product
    })
  })
  
  await Promise.all(uploadPromises)
}
```

#### UI/UX Requirements:
- **Login Screen**: Simple phone/email + store code
- **Dashboard**: Clean overview with key metrics
- **Inventory Upload**: Drag & drop or camera capture
- **Bulk Actions**: CSV import, batch editing
- **Store Profile**: Edit store info, hours, contact

---

### **Step 2: Real-Time Lead Notification**
**Trigger**: User submits product search

#### System Process:
1. Compares user query vector to stored products
2. Matches stores with relevant inventory  
3. **Sends push notification to ALL matched agents (BRUTE FORCE)**

#### Implementation Details:
```typescript
const handleIncomingLead = async (searchNotification: SearchNotification) => {
  const { searchQuery, searchSessionId, userId, timestamp } = searchNotification
  
  // Calculate match score for this agent's inventory
  const matchScore = await calculateMatchScore(agentId, searchQuery)
  
  // Show notification in agent app
  showLeadNotification({
    title: "🔔 New Customer Search!",
    message: `Someone is looking for: "${searchQuery}"`,
    matchScore,
    searchSessionId,
    timestamp,
    urgency: matchScore > 0.8 ? 'high' : matchScore > 0.5 ? 'medium' : 'low'
  })
  
  // Track notification received
  await trackNotificationReceived(agentId, searchSessionId)
}

const calculateMatchScore = async (agentId: string, searchQuery: string) => {
  // Get agent's inventory
  const inventory = await getAgentInventory(agentId)
  
  // Calculate semantic similarity
  const queryEmbedding = await createEmbedding(searchQuery)
  
  let bestMatch = 0
  inventory.forEach(product => {
    const similarity = calculateCosineSimilarity(queryEmbedding, product.embeddings)
    bestMatch = Math.max(bestMatch, similarity)
  })
  
  return bestMatch
}
```

#### UI/UX Requirements:
- **Push Notification**: Clear, actionable with match score
- **In-App Alert**: Modal with search details
- **Quick Actions**: "Bid Now", "View Details", "Skip"
- **Match Indicator**: Visual score (🔥 High, ⭐ Medium, 💡 Low)
- **Time Stamp**: "2 seconds ago"
- **User Context**: "User is currently in the mall"

---

### **Step 3: Visibility Boost (Bidding)**
**Action**: Agent optionally bids coins (internally scored, hidden from user)

#### Logic:
- Agent's coin bid, product price, and similarity to user query determine rank
- Coins are deducted at bid time from agents table

#### Implementation Details:
```typescript
const placeBid = async (agentId: string, searchSessionId: string, bidData: BidData) => {
  const { coinsBid, productId, bidMessage, estimatedPrice } = bidData
  
  // Validate agent has enough coins
  const agent = await getAgent(agentId)
  if (agent.coins < coinsBid) {
    throw new Error('Insufficient coins')
  }
  
  // Deduct coins immediately (non-refundable)
  await deductAgentCoins(agentId, coinsBid)
  
  // Create bid record
  const bid = await createBid({
    search_session_id: searchSessionId,
    agent_id: agentId,
    coins_bid: coinsBid,
    product_id: productId,
    bid_message: bidMessage,
    estimated_price: estimatedPrice,
    bid_status: 'active'
  })
  
  // Update real-time leaderboard for user
  await updateBiddingLeaderboard(searchSessionId, bid)
  
  // Track bid placed
  await trackBidPlaced(agentId, searchSessionId, coinsBid)
  
  return bid
}

const getBiddingRecommendation = async (agentId: string, searchQuery: string) => {
  // Analyze historical bidding data
  const historicalData = await getHistoricalBids(agentId)
  
  // Get current competition level
  const competitionLevel = await getCompetitionLevel(searchQuery)
  
  // Recommend bid amount
  const recommendedBid = calculateRecommendedBid({
    historicalData,
    competitionLevel,
    agentCoins: agent.coins,
    matchScore: await calculateMatchScore(agentId, searchQuery)
  })
  
  return {
    recommended: recommendedBid,
    min: Math.max(10, recommendedBid * 0.5),
    max: Math.min(agent.coins, recommendedBid * 2),
    reasoning: generateBidReasoning(recommendedBid, competitionLevel)
  }
}
```

#### UI/UX Requirements:
- **Bid Interface**: Slider with coin amount
- **Bid Recommendation**: "Suggested: 50 coins for high visibility"
- **Competition Insight**: "3 other stores are likely to bid"
- **Cost Preview**: "50 coins = ₹35 marketing cost"
- **Quick Bid Options**: 25, 50, 100 coin buttons
- **Bid Message**: Optional message to user
- **Confirmation**: "Bid placed! Coins deducted."

---

### **Step 4: Conversion & Tracking**

#### System Process:
- If user selects this agent, system logs interaction in interactions table
- Optionally sends agent live notification: "User X is en route to your store"

#### Implementation Details:
```typescript
const handleUserSelection = async (agentId: string, searchSessionId: string, userId: string) => {
  // Agent won the bid!
  await updateBidStatus(searchSessionId, agentId, 'won')
  
  // Mark other bids as lost
  await updateOtherBids(searchSessionId, agentId, 'lost')
  
  // Create interaction record
  const interaction = await createInteraction({
    search_session_id: searchSessionId,
    agent_id: agentId,
    user_id: userId,
    status: 'selected',
    selected_at: new Date().toISOString()
  })
  
  // Notify agent of selection
  await notifyAgentOfSelection(agentId, {
    title: "🎉 You Won the Bid!",
    message: "A customer is coming to your store",
    userInfo: await getUserInfo(userId),
    estimatedArrival: calculateArrivalTime(userId, agentId)
  })
  
  // Update agent success metrics
  await updateAgentMetrics(agentId, {
    successful_bids: 'increment',
    conversion_rate: 'recalculate'
  })
  
  return interaction
}

const trackUserJourney = async (searchSessionId: string, agentId: string) => {
  // Real-time tracking of user journey
  const trackingStates = {
    'selected': 'User selected your store',
    'navigating': 'User is on their way',
    'nearby': 'User is nearby (within 50m)',
    'arrived': 'User has arrived at your store',
    'checked_in': 'User checked in',
    'completed': 'Visit completed'
  }
  
  // Subscribe to user location updates
  const subscription = supabase
    .channel(`user_journey_${searchSessionId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'search_sessions'
    }, (payload) => {
      updateAgentOnUserProgress(agentId, payload.new.status)
    })
    .subscribe()
  
  return subscription
}
```

#### UI/UX Requirements:
- **Win Notification**: Celebratory animation with confetti
- **Customer Info**: "Ankit is coming to your store"
- **ETA Display**: "Estimated arrival: 3-5 minutes"
- **Preparation Tips**: "Prepare iPhone 16 Pro Max for viewing"
- **Journey Tracking**: Live map showing user progress
- **Arrival Alert**: "Customer has arrived!"
- **Check-in Confirmation**: "Customer checked in successfully"

---

### **Step 5: Feedback Loop**

#### Agent View:
- Sees analytics of product views, user matches, and coin performance
- Adjusts future bidding, product pricing, and visibility tactics accordingly

#### Implementation Details:
```typescript
const getAgentAnalytics = async (agentId: string, timeframe: string = '7d') => {
  const analytics = await calculateAgentAnalytics(agentId, timeframe)
  
  return {
    // Performance Metrics
    totalLeads: analytics.totalNotifications,
    bidRate: analytics.bidsPlaced / analytics.totalNotifications,
    winRate: analytics.bidsWon / analytics.bidsPlaced,
    conversionRate: analytics.storeVisits / analytics.bidsWon,
    
    // Financial Metrics
    coinsSpent: analytics.totalCoinsSpent,
    coinsPerLead: analytics.totalCoinsSpent / analytics.totalLeads,
    coinsPerConversion: analytics.totalCoinsSpent / analytics.storeVisits,
    roi: calculateROI(analytics.revenue, analytics.totalCoinsSpent),
    
    // Product Performance
    topPerformingProducts: analytics.topProducts,
    searchTerms: analytics.popularSearchTerms,
    competitorAnalysis: analytics.competitorData,
    
    // Recommendations
    biddingRecommendations: generateBiddingRecommendations(analytics),
    inventoryRecommendations: generateInventoryRecommendations(analytics),
    pricingRecommendations: generatePricingRecommendations(analytics)
  }
}

const optimizeBiddingStrategy = async (agentId: string) => {
  const historicalData = await getAgentBiddingHistory(agentId)
  
  // Machine learning model to optimize bidding
  const optimizedStrategy = await mlModel.predict({
    features: {
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      searchCategory: 'electronics',
      competitionLevel: 'medium',
      agentPerformance: historicalData.performance
    }
  })
  
  return {
    recommendedBidRange: optimizedStrategy.bidRange,
    optimalTiming: optimizedStrategy.timing,
    targetCategories: optimizedStrategy.categories,
    expectedROI: optimizedStrategy.roi
  }
}
```

#### UI/UX Requirements:
- **Analytics Dashboard**: Clean charts and metrics
- **Performance Cards**: Leads, Bids, Wins, Conversions
- **Trend Charts**: Performance over time
- **Competitor Insights**: "TechWorld bids 20% higher on electronics"
- **Recommendations**: "Increase bids on weekends for 15% more wins"
- **ROI Calculator**: "₹100 spent = ₹350 revenue"
- **Strategy Optimizer**: AI-powered bidding suggestions

---

## 🔄 Complete Agent Flow Timeline

| Time | Agent Action | System Response |
|------|-------------|-----------------|
| T+0s | Receives notification | Shows lead details with match score |
| T+10s | Views lead details | Displays bidding recommendation |
| T+20s | Places bid | Deducts coins, updates leaderboard |
| T+30s | Waits for result | Shows live bidding status |
| T+2m | Wins bid | Celebration notification + user ETA |
| T+5m | User arrives | Arrival notification + check-in prompt |
| T+15m | Completes sale | Success metrics updated |
| T+1h | Reviews analytics | Performance insights and recommendations |

## 📊 Success Metrics

### Primary KPIs:
- **Notification Response Rate**: > 90% of agents view notifications
- **Bid Participation Rate**: > 60% of relevant notifications result in bids
- **Win Rate**: > 25% of bids result in user selection
- **Conversion Rate**: > 80% of wins result in store visits
- **Agent Satisfaction**: > 4.5/5 average rating

### Secondary KPIs:
- **Average Bid Amount**: Optimal range for profitability
- **Time to Bid**: < 30 seconds from notification to bid
- **Repeat Bidding**: > 70% of agents bid again within 24 hours
- **ROI**: > 3:1 return on coin investment

## 🎯 Technical Requirements

### Performance:
- **Notification Delivery**: < 2 seconds from user search
- **Bid Processing**: < 1 second to place bid
- **Real-time Updates**: < 500ms latency for status changes
- **Analytics Loading**: < 3 seconds for dashboard

### Reliability:
- **Notification Delivery**: 99.9% success rate
- **Bid Accuracy**: 100% accurate coin deduction
- **Data Consistency**: Real-time sync across all agents
- **Offline Capability**: Queue bids when offline

### Security:
- **Agent Authentication**: Secure login with store verification
- **Coin Protection**: Prevent unauthorized coin usage
- **Data Privacy**: Protect user information from agents
- **Audit Trail**: Complete bidding and transaction history

---

## 🚀 Implementation Priority

### Phase 1 (MVP):
1. ✅ Agent authentication and dashboard
2. ✅ Real-time lead notifications (brute force)
3. ✅ Basic bidding system
4. ✅ Win/loss notifications

### Phase 2 (Enhanced):
1. ✅ Advanced analytics dashboard
2. ✅ Bidding recommendations
3. ✅ User journey tracking
4. ✅ Performance optimization

### Phase 3 (Advanced):
1. ✅ AI-powered bidding strategies
2. ✅ Competitor analysis
3. ✅ Inventory optimization
4. ✅ Advanced ROI tracking

---

## 🎨 Agent App Design Principles

### Apple-Inspired Design:
- **Clean Interface**: Minimal, focused on key actions
- **Clear Hierarchy**: Important information stands out
- **Smooth Animations**: Delightful micro-interactions
- **Consistent Patterns**: Familiar iOS/Android patterns

### Business-Focused UX:
- **Quick Actions**: Fast bidding with minimal taps
- **Clear ROI**: Always show cost and expected return
- **Performance Focus**: Metrics that matter to business
- **Learning Oriented**: Help agents improve over time

### Mobile-First:
- **Touch-Friendly**: Large buttons, easy gestures
- **Notification-Driven**: Push notifications for all key events
- **Offline-Capable**: Work without constant internet
- **Fast Loading**: Optimized for mobile networks

**This agent story provides the complete roadmap for building the store owner experience that leads to successful customer acquisition and increased revenue.**

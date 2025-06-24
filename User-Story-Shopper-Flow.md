# User (Shopper) Flow - Complete User Story

## 🎯 Goal
Find a specific product in the mall and purchase it quickly

## 📱 User Journey Breakdown

### **Step 1: Entry Point**
**Context**: User enters the mall
**Trigger**: Sees a QR code/NFC standee or opens the Hushh Marketplace PWA
**Action**: Launches the app via browser or home screen shortcut (PWA install)

#### Implementation Details:
```typescript
// Entry point scenarios
const entryPoints = {
  qrCode: "Scan QR code from mall standee",
  nfc: "Tap NFC tag at mall entrance", 
  directAccess: "Open PWA from home screen",
  webBrowser: "Visit mallconnect.app in browser"
}

// PWA install prompt
const showInstallPrompt = () => {
  if (deferredPrompt) {
    deferredPrompt.prompt()
  }
}
```

#### UI/UX Requirements:
- **Welcome Screen**: Clean, Apple-inspired design
- **Install Prompt**: "Add MallConnect to your home screen"
- **Location Detection**: "Allow location access for better results"
- **Quick Entry**: Skip registration for immediate search

---

### **Step 2: Search Initiation**
**UI Prompt**: "What are you looking for today?"
**Action**: User types a query like "Wireless headphones under ₹3000"

#### System Process:
1. Sends search to Supabase backend (PreviousSearchSetting)
2. Embeds query using a vector model
3. Queries IndexedTable + ProductMetadata for best matches

#### Implementation Details:
```typescript
const handleUserSearch = async (searchQuery: string) => {
  // Step 1: Save search to history
  await saveSearchHistory(userId, searchQuery)
  
  // Step 2: Create vector embedding
  const queryEmbedding = await createEmbedding(searchQuery)
  
  // Step 3: Search both product sources
  const [source1Results, source2Results] = await Promise.all([
    searchProductSource1(searchQuery, queryEmbedding),
    searchProductSource2(searchQuery, queryEmbedding)
  ])
  
  // Step 4: Create search session
  const searchSession = await createSearchSession(userId, searchQuery)
  
  // Step 5: BRUTE FORCE - Notify ALL agents
  await notifyAllAgents(searchQuery, searchSession.id)
  
  return searchSession
}
```

#### UI/UX Requirements:
- **Search Bar**: Large, prominent with voice input option
- **Search Suggestions**: Recent searches and popular categories
- **Auto-complete**: Real-time suggestions as user types
- **Voice Search**: "Tap to speak" functionality
- **Search History**: "Recent Searches" section

---

### **Step 3: Store Discovery**

#### System Process:
1. Identifies relevant products across multiple stores
2. Notifies matching agents in real-time (via FCM) - **ALL AGENTS (Brute Force)**
3. Applies ranking logic (coins + pricing + ML score)

#### UI Display:
Shows sorted results (Store A, B, C...) with metadata:
- Price range
- Store name  
- Estimated distance
- Ratings (if available)
- **Coin bid indicator** (High/Medium/Low)

#### Implementation Details:
```typescript
const displaySearchResults = async (searchSessionId: string) => {
  // Real-time subscription to bids
  const bidsSubscription = supabase
    .channel(`search_${searchSessionId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public', 
      table: 'bids'
    }, (payload) => {
      updateBiddingLeaderboard(payload.new)
    })
    .subscribe()
  
  // Get current bids and rank stores
  const rankedStores = await getRankedStores(searchSessionId)
  return rankedStores
}

const rankStores = (bids: Bid[]) => {
  return bids.sort((a, b) => {
    // Ranking algorithm
    const coinScore = (b.coins_bid - a.coins_bid) * 0.4
    const priceScore = (a.product_price - b.product_price) * 0.3  
    const ratingScore = (b.store_rating - a.store_rating) * 0.2
    const distanceScore = (a.distance - b.distance) * 0.1
    
    return coinScore + priceScore + ratingScore + distanceScore
  })
}
```

#### UI/UX Requirements:
- **Live Updates**: Real-time bid updates with smooth animations
- **Store Cards**: Clean cards with store info, price, distance
- **Sorting Options**: "Best Match", "Lowest Price", "Nearest", "Highest Bid"
- **Filtering**: Price range, distance, store category
- **Bid Indicators**: 🪙 Gold coins for high bids, silver for medium
- **Loading State**: "Finding stores..." with skeleton cards

---

### **Step 4: Store Selection**
**Action**: User taps on one of the top-ranked stores

#### Details Shown:
- Store profile
- Product specs and stock info  
- Directions via Google Maps
- (Optional) Chat with agent

#### Implementation Details:
```typescript
const selectStore = async (storeId: string, searchSessionId: string) => {
  // Mark this agent as selected
  await markAgentSelected(searchSessionId, storeId)
  
  // Get store details
  const storeDetails = await getStoreDetails(storeId)
  
  // Get product information
  const productInfo = await getProductInfo(storeId, searchQuery)
  
  // Notify agent of selection
  await notifyAgentOfSelection(storeId, userId)
  
  return {
    store: storeDetails,
    product: productInfo,
    directions: generateDirections(userLocation, storeDetails.location)
  }
}
```

#### UI/UX Requirements:
- **Store Profile**: Hero image, name, rating, description
- **Product Details**: Price, specifications, availability
- **Action Buttons**: 
  - 🗺️ "Get Directions" (Primary CTA with gradient)
  - 💬 "Chat with Store" 
  - 📞 "Call Store"
- **Store Info**: Floor, section, shop number
- **Reviews**: Customer ratings and reviews
- **Gallery**: Store and product images

---

### **Step 5: In-store Visit**

#### System Tracking:
- Tracks walk-in via map view, NFC check-in, or user confirmation

#### User Completion:
- "Found what I needed" or "Didn't find it" (optional feedback)

#### Implementation Details:
```typescript
const trackStoreVisit = async (storeId: string, searchSessionId: string) => {
  // Multiple tracking methods
  const trackingMethods = {
    // GPS proximity detection
    gpsProximity: () => checkUserProximity(userLocation, storeLocation),
    
    // NFC check-in at store
    nfcCheckIn: () => handleNFCCheckIn(storeId),
    
    // Manual confirmation
    manualConfirm: () => showVisitConfirmation(),
    
    // QR code scan at store
    qrScan: () => handleQRScan(storeId)
  }
  
  // Log visit
  await logStoreVisit(searchSessionId, storeId, userId)
  
  // Update agent metrics
  await updateAgentConversion(storeId)
}

const completeUserJourney = async (searchSessionId: string, feedback: string) => {
  await updateSearchSession(searchSessionId, {
    status: 'completed',
    user_feedback: feedback,
    completed_at: new Date().toISOString()
  })
  
  // Show feedback form
  showFeedbackForm(searchSessionId)
}
```

#### UI/UX Requirements:
- **Navigation**: Turn-by-turn directions to store
- **Arrival Detection**: "You've arrived at TechWorld Store!"
- **Check-in Options**: 
  - "I'm here" button
  - NFC tap confirmation
  - QR code scan
- **Feedback Form**: 
  - "Did you find what you were looking for?"
  - ⭐ Rate your experience
  - 💬 Optional comments
- **Journey Complete**: "Thanks for using MallConnect!"

---

## 🔄 Complete User Flow Timeline

| Time | User Action | System Response |
|------|-------------|-----------------|
| T+0s | Opens PWA | Welcome screen, location request |
| T+10s | Types search query | Creates search session |
| T+12s | Submits search | Notifies ALL 20 agents (brute force) |
| T+15s | Views results | Shows live bidding leaderboard |
| T+30s | Selects store | Shows store details & directions |
| T+2m | Starts navigation | GPS tracking begins |
| T+5m | Arrives at store | Check-in confirmation |
| T+15m | Completes purchase | Feedback form |

## 📊 Success Metrics

### Primary KPIs:
- **Search to Store Selection**: < 60 seconds
- **Store Selection Rate**: > 70% of searches result in store selection
- **Successful Visit Rate**: > 80% of selections result in store visits
- **User Satisfaction**: > 4.5/5 average rating

### Secondary KPIs:
- **App Install Rate**: > 40% of first-time users install PWA
- **Repeat Usage**: > 60% of users return within 30 days
- **Search Success**: > 85% of searches find relevant results
- **Agent Response Rate**: > 90% of notified agents view the lead

## 🎯 Technical Requirements

### Performance:
- **Search Response**: < 2 seconds
- **Real-time Updates**: < 500ms latency
- **Offline Capability**: Basic functionality without internet
- **PWA Compliance**: Installable, fast, reliable

### Accessibility:
- **Voice Search**: For hands-free operation
- **Large Touch Targets**: Easy mobile interaction
- **High Contrast**: Readable in mall lighting
- **Screen Reader Support**: Full accessibility compliance

### Security:
- **Location Privacy**: User controls location sharing
- **Data Protection**: GDPR compliant data handling
- **Secure Communication**: HTTPS/WSS for all connections

---

## 🚀 Implementation Priority

### Phase 1 (MVP):
1. ✅ Basic search functionality
2. ✅ Agent notification system (brute force)
3. ✅ Store results display
4. ✅ Store selection and details

### Phase 2 (Enhanced):
1. ✅ Real-time bidding updates
2. ✅ Navigation integration
3. ✅ Visit tracking
4. ✅ Feedback system

### Phase 3 (Advanced):
1. ✅ Voice search
2. ✅ NFC/QR check-ins
3. ✅ Advanced analytics
4. ✅ Personalization

**This user story provides the complete roadmap for building the shopper experience that leads to successful store visits and purchases.**

# MallConnect - Smart Mall Discovery PWA

A Progressive Web App (PWA) that revolutionizes the shopping experience in large malls by connecting users with store agents through real-time product discovery and intelligent bidding system.

## 🎯 Project Vision

**The Problem**: In a mall with 400+ shops, finding a specific product like "iPhone 16 Pro Max" is time-consuming and inefficient.

**Our Solution**: MallConnect enables users to search for products instantly, notifies relevant store agents in real-time, and uses a coin-based bidding system combined with ML recommendations to connect users with the best-matching stores.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │◄──►│  Backend API     │◄──►│   PostgreSQL    │
│ (PWA - React)   │    │ (Node/Express)   │    │ (Supabase)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        ▼                        ▼
         │              ┌─────────────────────┐   ┌─────────────────┐
         │              │ Real-Time Engine    │◄─►│ ML Recommendation│
         │              │ (Supabase Realtime) │   │ (FastAPI/Python)│
         │              └─────────────────────┘   └─────────────────┘
```

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | PWA (React + Tailwind), Service Worker |
| **Backend** | Node.js/Express or Supabase Edge Functions |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **Real-time** | Supabase Realtime / WebSockets |
| **Notifications** | Firebase Cloud Messaging (FCM) |
| **ML Engine** | Python (FastAPI) + Price Prediction Model |
| **Hosting** | Vercel/Netlify + Supabase |

## 🎨 Design System

### Brand Identity
- **Inspiration**: Apple-inspired minimalism
- **Primary Gradient**: `#E54D60` → `#A342FF`
- **Typography**: Figtree (Google Fonts)
- **Style**: Clean, white backgrounds with strategic use of gradient for CTAs

### Color Palette
| Color | HEX | Usage |
|-------|-----|-------|
| Primary Pink | `#E54D60` | CTA start color, highlights |
| Primary Violet | `#A342FF` | CTA end color |
| White | `#FFFFFF` | Background, card base |
| Black | `#000000` | Text, icons |
| Coin Gold | `#FFD700` | Coin/bid visuals |

## 🔄 User Flow

```
User opens app → Searches product → Backend matches stores → 
Agents get notified → Agents bid coins → User sees top matches → 
User selects store → Visits physical store
```

## 👥 User Personas

### 🛍️ Shopper (User)
- Visits mall and opens PWA on-site
- Searches for specific products
- Views agent bids and selects best store
- Walks to chosen store for purchase

### 🏪 Store Agent
- Receives real-time search notifications
- Bids coins to attract potential customers
- Manages product catalog and pricing
- Increases visibility through strategic bidding

## 🗄️ Database Schema

### Core Tables

**users**
- Personal info, preferences, FCM token, location data

**agents**
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY,
  store_name TEXT NOT NULL,
  location JSONB,
  fcm_token TEXT,
  coins INTEGER DEFAULT 0,
  hushh_user_id UUID REFERENCES users(hushh_id),
  category TEXT,
  mall_id UUID
);
```

**products**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT,
  brand TEXT,
  category TEXT,
  agent_id UUID REFERENCES agents(id),
  price DECIMAL,
  quantity INTEGER,
  features JSONB
);
```

**bids**
```sql
CREATE TABLE bids (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(hushh_id),
  agent_id UUID REFERENCES agents(id),
  product_id UUID REFERENCES products(id),
  coins_bid INTEGER,
  timestamp TIMESTAMPTZ DEFAULT now()
);
```

**interactions**
```sql
CREATE TABLE interactions (
  id UUID PRIMARY KEY,
  user_id UUID,
  agent_id UUID,
  product_id UUID,
  coins_accepted INTEGER,
  completed BOOLEAN DEFAULT false,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## 🪙 Coin System

- **Conversion Rate**: 70 coins = $1 USD
- **Purpose**: Agents bid coins to increase visibility
- **Rules**: 
  - Limited daily coins per agent
  - Monthly coin reset/refill via subscription
  - Non-refundable bids
  - Tie-breaker: Price or distance

## 🤖 ML Features

### 1. Best Price Detection
- Predicts price fairness across stores
- Suggests lowest-priced matching products
- Sorts agents by "Value for Money"

### 2. Personalization Engine
- Analyzes user demographics and past behavior
- Recommends stores proactively
- Uses collaborative filtering for better matches

## 🔔 Real-Time Notifications

| Trigger | Receiver | Message |
|---------|----------|---------|
| User searches | Matching agents | "User Ankit is looking for iPhone 16 Pro Max" |
| Bid wins | User | "XYZ Store has bid highest for your search" |
| Price alert | User | "Lowest price found: ₹1,08,999 at ABC Store" |

## 🎯 Key Features

### For Users ✅
- Location-aware mall experience
- Instant product search across all stores
- Real-time agent bidding visibility
- ML-powered store recommendations
- Best price and coin bid comparisons

### For Agents 🏪
- Real-time search lead notifications
- Strategic coin bidding system
- Product catalog management
- Increased store visibility
- Direct customer engagement

## 📱 PWA Features

- **Installable**: Add to home screen
- **Offline Ready**: Service worker caching
- **Fast Loading**: Optimized performance
- **Responsive**: Mobile-first design
- **Push Notifications**: Real-time updates

## 🚀 Development Roadmap

### MVP Phases (24 days total)

| Phase | Tasks | Duration |
|-------|-------|----------|
| **Phase 1** | Auth + DB Schema Setup | 3 days |
| **Phase 2** | Product Search + Matching Logic | 4 days |
| **Phase 3** | Agent Notification + Bidding System | 5 days |
| **Phase 4** | User Selection Flow + UI Polish | 5 days |
| **Phase 5** | ML Integration (Basic) | 4 days |
| **Phase 6** | QA + Deployment | 3 days |

## 📊 Success Metrics

- **Conversion Rate**: % users visiting matched stores
- **Match Speed**: <10 seconds from search to results
- **Agent Engagement**: % agents bidding when notified
- **Recommendation Accuracy**: Top 3 stores clicked ≥70% of time

## 🔒 Security & Privacy

- JWT/Supabase token-based authentication
- Limited user info exposure to agents
- Coin abuse prevention mechanisms
- GDPR compliance
- Rate limiting for malicious bidding

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Firebase account (for FCM)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd hushh-marketplace-a

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase and Firebase credentials

# Start development server
npm start
```

### Environment Variables

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
```

## 🔮 Future Enhancements

- Real-time inventory synchronization
- Voice search integration
- NFC-based store check-in
- Comprehensive agent CRM panel
- User reward points system
- Multi-mall support
- AR store navigation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

For questions or support, please reach out to the development team.

---

**MallConnect** - Revolutionizing mall shopping through intelligent discovery and real-time connections.

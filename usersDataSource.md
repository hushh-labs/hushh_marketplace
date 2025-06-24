# Users Data Source Integration - MallConnect

This document outlines the users table integration for MallConnect PWA, providing comprehensive user management and authentication capabilities.

## 🗄️ Users Database Schema

### Users Table Structure

The users table provides comprehensive user profile management with authentication integration:

```sql
CREATE TABLE public.users (
  first_name text NULL,
  last_name text NULL,
  gender text NULL,
  email text NULL DEFAULT ''::text,
  phone json NULL,
  device json NULL,
  address character varying NULL,
  avatar text NULL,
  password character varying NULL,
  role text NULL,
  country character varying NULL,
  zipcode bigint NULL,
  city character varying NULL,
  creationtime text NULL,
  "fcmToken" text NULL,
  private_mode boolean NULL,
  user_coins integer NULL,
  conversations text[] NULL,
  gpt_token_usage integer NULL,
  last_used_token_date_time text NULL,
  dob text NULL,
  hushh_id text NOT NULL,
  "profileVideo" text NULL,
  name text NULL,
  "uploadedVideos" text[] NULL,
  demographic_card_questions jsonb[] NULL,
  hushh_id_card_questions jsonb[] NULL,
  is_hushh_app_user boolean NULL DEFAULT false,
  is_hushh_button_user boolean NULL,
  is_hushh_vibe_user boolean NULL,
  is_browser_companion_user boolean NULL,
  phone_number text NULL,
  country_code text NULL,
  phonenumberwithoutcountrycode text NULL,
  "phoneNumber" text NULL,
  onboard_status public.onboard_status_enum NOT NULL DEFAULT 'authenticated'::onboard_status_enum,
  hushh_id_uuid uuid GENERATED ALWAYS AS ((hushh_id)::uuid) STORED NULL,
  "accountCreation" timestamp with time zone NOT NULL DEFAULT now(),
  selected_reason_for_using_hushh text NULL,
  dummy boolean NULL,
  dob_updated_at timestamp with time zone NULL,
  CONSTRAINT users_pkey PRIMARY KEY (hushh_id),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_hushh_id_uuid_fkey FOREIGN KEY (hushh_id_uuid) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;
```

## 🔌 Supabase Connection - Users Source

### Environment Configuration
```env
# Users Data Source - Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL_USERS=https://rpmzykoxqnbozgdoqbpc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_USERS=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwbXp5a294cW5ib3pnZG9xYnBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE5Mjc5NzEsImV4cCI6MjAxNzUwMzk3MX0.3GwG8YQKwZSWfGgTBEEA47YZAZ-Nr4HiirYPWiZtpZ0
```

### Connection Setup - Multi-Source
```javascript
import { createClient } from '@supabase/supabase-js'

// Product Source 1 Connection
const supabaseUrl1 = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey1 = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const supabaseSource1 = createClient(supabaseUrl1, supabaseKey1)

// Product Source 2 Connection
const supabaseUrl2 = process.env.NEXT_PUBLIC_SUPABASE_URL_SOURCE2
const supabaseKey2 = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_SOURCE2
export const supabaseSource2 = createClient(supabaseUrl2, supabaseKey2)

// Users Source Connection
const supabaseUrlUsers = process.env.NEXT_PUBLIC_SUPABASE_URL_USERS
const supabaseKeyUsers = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_USERS
export const supabaseUsers = createClient(supabaseUrlUsers, supabaseKeyUsers)
```

## 👤 User Data Structure

### Core User Fields
```javascript
const userProfile = {
  // Basic Information
  hushh_id: "unique_user_identifier",
  first_name: "John",
  last_name: "Doe",
  name: "John Doe",
  email: "john.doe@example.com",
  gender: "male",
  dob: "1990-01-01",
  
  // Contact Information
  phone_number: "+1234567890",
  country_code: "+1",
  phonenumberwithoutcountrycode: "234567890",
  phone: { /* JSON phone data */ },
  
  // Location
  address: "123 Main St, City, State",
  country: "United States",
  city: "New York",
  zipcode: 10001,
  
  // Profile Media
  avatar: "https://example.com/avatar.jpg",
  profileVideo: "https://example.com/profile.mp4",
  uploadedVideos: ["video1.mp4", "video2.mp4"],
  
  // App Usage
  is_hushh_app_user: true,
  is_hushh_button_user: false,
  is_hushh_vibe_user: true,
  is_browser_companion_user: false,
  
  // Coins & Engagement
  user_coins: 1500,
  conversations: ["conv1", "conv2"],
  gpt_token_usage: 250,
  last_used_token_date_time: "2024-06-24T20:00:00Z",
  
  // Notifications
  fcmToken: "firebase_cloud_messaging_token",
  
  // Privacy & Settings
  private_mode: false,
  role: "user",
  onboard_status: "completed",
  
  // Metadata
  accountCreation: "2024-01-01T00:00:00Z",
  creationtime: "2024-01-01T00:00:00Z",
  selected_reason_for_using_hushh: "shopping_discovery"
}
```

## 🔍 User Management Functions

### 1. User Authentication & Profile
```javascript
const getUserProfile = async (hushh_id) => {
  const { data, error } = await supabaseUsers
    .from('users')
    .select('*')
    .eq('hushh_id', hushh_id)
    .single()
  
  return { data, error }
}

const updateUserProfile = async (hushh_id, updates) => {
  const { data, error } = await supabaseUsers
    .from('users')
    .update(updates)
    .eq('hushh_id', hushh_id)
    .select()
  
  return { data, error }
}

const createUserProfile = async (userProfile) => {
  const { data, error } = await supabaseUsers
    .from('users')
    .insert(userProfile)
    .select()
  
  return { data, error }
}
```

### 2. User Coins Management
```javascript
const getUserCoins = async (hushh_id) => {
  const { data, error } = await supabaseUsers
    .from('users')
    .select('user_coins')
    .eq('hushh_id', hushh_id)
    .single()
  
  return { data: data?.user_coins || 0, error }
}

const updateUserCoins = async (hushh_id, coinChange) => {
  const { data, error } = await supabaseUsers
    .rpc('update_user_coins', {
      user_id: hushh_id,
      coin_change: coinChange
    })
  
  return { data, error }
}

const addCoinsToUser = async (hushh_id, coinsToAdd) => {
  const { data, error } = await supabaseUsers
    .from('users')
    .update({ 
      user_coins: supabaseUsers.raw(`user_coins + ${coinsToAdd}`)
    })
    .eq('hushh_id', hushh_id)
    .select('user_coins')
  
  return { data, error }
}
```

### 3. FCM Token Management
```javascript
const updateFCMToken = async (hushh_id, fcmToken) => {
  const { data, error } = await supabaseUsers
    .from('users')
    .update({ fcmToken })
    .eq('hushh_id', hushh_id)
  
  return { data, error }
}

const getUsersWithFCMTokens = async (hushh_ids) => {
  const { data, error } = await supabaseUsers
    .from('users')
    .select('hushh_id, fcmToken, first_name, last_name')
    .in('hushh_id', hushh_ids)
    .not('fcmToken', 'is', null)
  
  return { data, error }
}
```

### 4. User Search & Filtering
```javascript
const searchUsers = async (searchTerm, filters = {}) => {
  let query = supabaseUsers
    .from('users')
    .select('hushh_id, first_name, last_name, email, city, country, avatar')

  if (searchTerm) {
    query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
  }

  if (filters.city) {
    query = query.eq('city', filters.city)
  }

  if (filters.country) {
    query = query.eq('country', filters.country)
  }

  if (filters.gender) {
    query = query.eq('gender', filters.gender)
  }

  const { data, error } = await query.limit(20)
  return { data, error }
}
```

## 🎯 MallConnect Integration

### 1. User Shopping Profile
```javascript
const getUserShoppingProfile = async (hushh_id) => {
  const { data, error } = await supabaseUsers
    .from('users')
    .select(`
      hushh_id,
      first_name,
      last_name,
      gender,
      city,
      country,
      user_coins,
      fcmToken,
      conversations,
      demographic_card_questions,
      selected_reason_for_using_hushh
    `)
    .eq('hushh_id', hushh_id)
    .single()
  
  return { data, error }
}
```

### 2. User Preferences for Product Recommendations
```javascript
const getUserPreferencesForML = async (hushh_id) => {
  const { data, error } = await supabaseUsers
    .from('users')
    .select(`
      gender,
      city,
      country,
      dob,
      conversations,
      demographic_card_questions,
      selected_reason_for_using_hushh
    `)
    .eq('hushh_id', hushh_id)
    .single()
  
  if (data) {
    // Calculate age from DOB
    const age = data.dob ? calculateAge(data.dob) : null
    
    return {
      data: {
        ...data,
        age,
        shopping_history: data.conversations || [],
        preferences: data.demographic_card_questions || []
      },
      error
    }
  }
  
  return { data, error }
}

const calculateAge = (dob) => {
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}
```

### 3. Notification Management for Shopping
```javascript
const sendShoppingNotification = async (hushh_id, productQuery, matchingStores) => {
  const { data: user } = await getUserProfile(hushh_id)
  
  if (user && user.fcmToken) {
    const notificationData = {
      title: "Product Found!",
      body: `Found ${matchingStores.length} stores with "${productQuery}"`,
      data: {
        type: "product_search_result",
        product_query: productQuery,
        store_count: matchingStores.length,
        user_id: hushh_id
      }
    }
    
    // Send FCM notification (implementation depends on your FCM setup)
    return await sendFCMNotification(user.fcmToken, notificationData)
  }
  
  return { error: "No FCM token found for user" }
}
```

## 🔄 Real-time User Updates

### User Activity Tracking
```javascript
const trackUserActivity = async (hushh_id, activity) => {
  const { data, error } = await supabaseUsers
    .from('users')
    .update({
      last_used_token_date_time: new Date().toISOString(),
      conversations: supabaseUsers.raw(`array_append(conversations, '${activity}')`)
    })
    .eq('hushh_id', hushh_id)
  
  return { data, error }
}

// Subscribe to user changes
const subscribeToUserChanges = (hushh_id, callback) => {
  return supabaseUsers
    .channel(`user_${hushh_id}`)
    .on('postgres_changes', 
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'users',
        filter: `hushh_id=eq.${hushh_id}`
      }, 
      callback
    )
    .subscribe()
}
```

## 📊 User Analytics

### User Engagement Metrics
```javascript
const getUserEngagementMetrics = async (hushh_id) => {
  const { data, error } = await supabaseUsers
    .from('users')
    .select(`
      hushh_id,
      accountCreation,
      last_used_token_date_time,
      gpt_token_usage,
      user_coins,
      conversations,
      is_hushh_app_user,
      is_hushh_button_user,
      is_hushh_vibe_user,
      is_browser_companion_user
    `)
    .eq('hushh_id', hushh_id)
    .single()
  
  if (data) {
    const metrics = {
      account_age_days: Math.floor((new Date() - new Date(data.accountCreation)) / (1000 * 60 * 60 * 24)),
      total_conversations: data.conversations?.length || 0,
      token_usage: data.gpt_token_usage || 0,
      coin_balance: data.user_coins || 0,
      platform_usage: {
        app: data.is_hushh_app_user,
        button: data.is_hushh_button_user,
        vibe: data.is_hushh_vibe_user,
        browser: data.is_browser_companion_user
      },
      last_activity: data.last_used_token_date_time
    }
    
    return { data: metrics, error }
  }
  
  return { data, error }
}
```

## 🔮 Integration with Product Search

### Complete User-Product Integration
```javascript
const performUserAwareProductSearch = async (hushh_id, productQuery, filters = {}) => {
  // Get user preferences
  const { data: userPrefs } = await getUserPreferencesForML(hushh_id)
  
  // Enhance filters with user preferences
  const enhancedFilters = {
    ...filters,
    gender: filters.gender || userPrefs?.gender,
    location: filters.location || userPrefs?.city
  }
  
  // Search products from both sources
  const productResults = await searchAllSources(productQuery, enhancedFilters)
  
  // Track user activity
  await trackUserActivity(hushh_id, `searched_for_${productQuery}`)
  
  return {
    results: productResults,
    user_context: userPrefs,
    search_query: productQuery,
    applied_filters: enhancedFilters
  }
}
```

## 📝 Configuration Summary

### Environment Variables Required
```env
# Users Data Source
NEXT_PUBLIC_SUPABASE_URL_USERS=https://rpmzykoxqnbozgdoqbpc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_USERS=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Product Sources (existing)
NEXT_PUBLIC_SUPABASE_URL=https://bndbyszujcbocpltxfah.supabase.co
NEXT_PUBLIC_SUPABASE_URL_SOURCE2=https://cuoejzgwnlrceypuxsgr.supabase.co
```

### Database Features
- ✅ Comprehensive user profile management
- ✅ Coin system integration
- ✅ FCM token management for notifications
- ✅ Multi-platform user tracking
- ✅ Real-time user updates
- ✅ User preference-based product recommendations

---

**Status**: Users data source integration ready
**Capability**: Complete user management with shopping profile integration
**Features**: Authentication, coins, notifications, preferences, and analytics

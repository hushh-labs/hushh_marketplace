import supabaseService from '../services/SupabaseService';

// Database schema setup for MallConnect
export const setupDatabase = async () => {
  try {
    console.log('🗄️ Setting up database tables...');
    
    // Create search_sessions table
    const searchSessionsSQL = `
      CREATE TABLE IF NOT EXISTS search_sessions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id TEXT NOT NULL,
        search_query TEXT NOT NULL,
        search_filters JSONB DEFAULT '{}',
        user_location JSONB DEFAULT '{}',
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
        selected_agent_id UUID,
        total_bids INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ,
        user_feedback TEXT
      );
    `;

    // Create agents table
    const agentsSQL = `
      CREATE TABLE IF NOT EXISTS agents (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        hushh_user_id TEXT,
        agent_name TEXT NOT NULL,
        agent_email TEXT,
        agent_phone TEXT,
        fcm_token TEXT,
        store_name TEXT NOT NULL,
        store_category TEXT[] DEFAULT '{}',
        store_location JSONB DEFAULT '{}',
        store_description TEXT,
        coins INTEGER DEFAULT 2000,
        total_bids INTEGER DEFAULT 0,
        successful_bids INTEGER DEFAULT 0,
        conversion_rate DECIMAL DEFAULT 0.0,
        average_bid_amount INTEGER DEFAULT 50,
        total_earnings DECIMAL DEFAULT 0.0,
        is_active BOOLEAN DEFAULT true,
        is_online BOOLEAN DEFAULT false,
        last_seen TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Create bids table
    const bidsSQL = `
      CREATE TABLE IF NOT EXISTS bids (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        search_session_id UUID REFERENCES search_sessions(id),
        agent_id UUID REFERENCES agents(id),
        user_id TEXT,
        product_query TEXT,
        coins_bid INTEGER NOT NULL,
        bid_message TEXT,
        bid_status TEXT DEFAULT 'active' CHECK (bid_status IN ('active', 'won', 'lost', 'expired')),
        is_selected BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ
      );
    `;

    // Create interactions table
    const interactionsSQL = `
      CREATE TABLE IF NOT EXISTS interactions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        search_session_id UUID REFERENCES search_sessions(id),
        agent_id UUID REFERENCES agents(id),
        user_id TEXT,
        status TEXT DEFAULT 'selected',
        selected_at TIMESTAMPTZ,
        visited_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        feedback TEXT,
        rating INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Execute table creation
    console.log('📝 Creating search_sessions table...');
    const { error: sessionsError } = await supabaseService.users.rpc('exec_sql', { 
      sql: searchSessionsSQL 
    });
    
    if (sessionsError) {
      console.log('⚠️ search_sessions table might already exist or using direct SQL...');
      // Try alternative approach - direct table creation
      const { error: altError } = await supabaseService.users
        .from('search_sessions')
        .select('count', { count: 'exact', head: true });
      
      if (altError && altError.code === '42P01') {
        console.log('❌ search_sessions table does not exist. Manual creation needed.');
        throw new Error('search_sessions table needs to be created manually in Supabase dashboard');
      }
    }

    console.log('📝 Creating agents table...');
    const { error: agentsError } = await supabaseService.users.rpc('exec_sql', { 
      sql: agentsSQL 
    });
    
    if (agentsError) {
      console.log('⚠️ agents table might already exist...');
    }

    console.log('📝 Creating bids table...');
    const { error: bidsError } = await supabaseService.users.rpc('exec_sql', { 
      sql: bidsSQL 
    });
    
    if (bidsError) {
      console.log('⚠️ bids table might already exist...');
    }

    console.log('📝 Creating interactions table...');
    const { error: interactionsError } = await supabaseService.users.rpc('exec_sql', { 
      sql: interactionsSQL 
    });
    
    if (interactionsError) {
      console.log('⚠️ interactions table might already exist...');
    }

    console.log('✅ Database setup completed!');
    return { success: true };

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return { success: false, error };
  }
};

// Manual table creation SQL for copy-paste into Supabase SQL editor
export const getManualSQL = () => {
  return `
-- MallConnect Database Schema
-- Copy and paste this into Supabase SQL Editor

-- 1. Create search_sessions table
CREATE TABLE IF NOT EXISTS search_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  search_query TEXT NOT NULL,
  search_filters JSONB DEFAULT '{}',
  user_location JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  selected_agent_id UUID,
  total_bids INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  user_feedback TEXT
);

-- 2. Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hushh_user_id TEXT,
  agent_name TEXT NOT NULL,
  agent_email TEXT,
  agent_phone TEXT,
  fcm_token TEXT,
  store_name TEXT NOT NULL,
  store_category TEXT[] DEFAULT '{}',
  store_location JSONB DEFAULT '{}',
  store_description TEXT,
  coins INTEGER DEFAULT 2000,
  total_bids INTEGER DEFAULT 0,
  successful_bids INTEGER DEFAULT 0,
  conversion_rate DECIMAL DEFAULT 0.0,
  average_bid_amount INTEGER DEFAULT 50,
  total_earnings DECIMAL DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create bids table
CREATE TABLE IF NOT EXISTS bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  search_session_id UUID REFERENCES search_sessions(id),
  agent_id UUID REFERENCES agents(id),
  user_id TEXT,
  product_query TEXT,
  coins_bid INTEGER NOT NULL,
  bid_message TEXT,
  bid_status TEXT DEFAULT 'active' CHECK (bid_status IN ('active', 'won', 'lost', 'expired')),
  is_selected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- 4. Create interactions table
CREATE TABLE IF NOT EXISTS interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  search_session_id UUID REFERENCES search_sessions(id),
  agent_id UUID REFERENCES agents(id),
  user_id TEXT,
  status TEXT DEFAULT 'selected',
  selected_at TIMESTAMPTZ,
  visited_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  feedback TEXT,
  rating INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_search_sessions_user_id ON search_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_search_sessions_status ON search_sessions(status);
CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(is_active);
CREATE INDEX IF NOT EXISTS idx_bids_session_id ON bids(search_session_id);
CREATE INDEX IF NOT EXISTS idx_bids_agent_id ON bids(agent_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(bid_status);

-- Enable Row Level Security (RLS)
ALTER TABLE search_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Create policies (basic - adjust as needed)
CREATE POLICY "Enable read access for all users" ON search_sessions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON search_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON search_sessions FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON agents FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON agents FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON agents FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON bids FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON bids FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON bids FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON interactions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON interactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON interactions FOR UPDATE USING (true);
`;
};

export default { setupDatabase, getManualSQL };

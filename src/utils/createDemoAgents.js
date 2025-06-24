import supabaseService from '../services/SupabaseService';

// Demo agents data for testing
const demoAgents = [
  {
    agent_name: 'Rajesh Kumar',
    agent_email: 'rajesh@techworld.com',
    agent_phone: '+91-9876543210',
    store_name: 'TechWorld Electronics',
    store_category: ['Electronics', 'Mobile', 'Accessories'],
    store_location: { floor: 'Ground Floor', section: 'A', shop_number: '101' },
    store_description: 'Latest smartphones, laptops, and tech accessories',
    coins: 2000,
    fcm_token: 'demo_fcm_token_1',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Priya Sharma',
    agent_email: 'priya@fashionhub.com',
    agent_phone: '+91-9876543211',
    store_name: 'Fashion Hub',
    store_category: ['Fashion', 'Clothing', 'Accessories'],
    store_location: { floor: 'First Floor', section: 'B', shop_number: '201' },
    store_description: 'Trendy clothing and fashion accessories for all ages',
    coins: 1800,
    fcm_token: 'demo_fcm_token_2',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Amit Patel',
    agent_email: 'amit@sportszone.com',
    agent_phone: '+91-9876543212',
    store_name: 'Sports Zone',
    store_category: ['Sports', 'Fitness', 'Footwear'],
    store_location: { floor: 'Second Floor', section: 'C', shop_number: '301' },
    store_description: 'Sports equipment, fitness gear, and athletic footwear',
    coins: 2200,
    fcm_token: 'demo_fcm_token_3',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Sneha Gupta',
    agent_email: 'sneha@bookworm.com',
    agent_phone: '+91-9876543213',
    store_name: 'BookWorm Paradise',
    store_category: ['Books', 'Stationery', 'Education'],
    store_location: { floor: 'First Floor', section: 'D', shop_number: '151' },
    store_description: 'Books, stationery, and educational materials',
    coins: 1500,
    fcm_token: 'demo_fcm_token_4',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Vikram Singh',
    agent_email: 'vikram@foodcourt.com',
    agent_phone: '+91-9876543214',
    store_name: 'Spice Garden',
    store_category: ['Food', 'Restaurant', 'Indian'],
    store_location: { floor: 'Food Court', section: 'F', shop_number: 'FC-05' },
    store_description: 'Authentic Indian cuisine and street food',
    coins: 1200,
    fcm_token: 'demo_fcm_token_5',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Meera Joshi',
    agent_email: 'meera@beautyworld.com',
    agent_phone: '+91-9876543215',
    store_name: 'Beauty World',
    store_category: ['Beauty', 'Cosmetics', 'Skincare'],
    store_location: { floor: 'Ground Floor', section: 'E', shop_number: '125' },
    store_description: 'Cosmetics, skincare, and beauty products',
    coins: 1700,
    fcm_token: 'demo_fcm_token_6',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Arjun Reddy',
    agent_email: 'arjun@gamezone.com',
    agent_phone: '+91-9876543216',
    store_name: 'Game Zone',
    store_category: ['Gaming', 'Electronics', 'Entertainment'],
    store_location: { floor: 'Second Floor', section: 'G', shop_number: '275' },
    store_description: 'Gaming consoles, accessories, and entertainment',
    coins: 2500,
    fcm_token: 'demo_fcm_token_7',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Kavya Nair',
    agent_email: 'kavya@jewelrypalace.com',
    agent_phone: '+91-9876543217',
    store_name: 'Jewelry Palace',
    store_category: ['Jewelry', 'Accessories', 'Gold'],
    store_location: { floor: 'Ground Floor', section: 'H', shop_number: '110' },
    store_description: 'Fine jewelry, gold, and precious accessories',
    coins: 3000,
    fcm_token: 'demo_fcm_token_8',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Rohit Agarwal',
    agent_email: 'rohit@homeessentials.com',
    agent_phone: '+91-9876543218',
    store_name: 'Home Essentials',
    store_category: ['Home', 'Furniture', 'Decor'],
    store_location: { floor: 'Third Floor', section: 'I', shop_number: '350' },
    store_description: 'Home decor, furniture, and household essentials',
    coins: 1600,
    fcm_token: 'demo_fcm_token_9',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Ananya Das',
    agent_email: 'ananya@kidsworld.com',
    agent_phone: '+91-9876543219',
    store_name: 'Kids World',
    store_category: ['Kids', 'Toys', 'Clothing'],
    store_location: { floor: 'Second Floor', section: 'J', shop_number: '225' },
    store_description: 'Toys, kids clothing, and children accessories',
    coins: 1400,
    fcm_token: 'demo_fcm_token_10',
    is_active: true,
    is_online: true
  }
];

export const createDemoAgents = async () => {
  try {
    console.log('🏪 Creating demo agents...');
    
    for (const agentData of demoAgents) {
      // Generate unique ID
      const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabaseService.users
        .from('agents')
        .insert({
          id: agentId,
          hushh_user_id: `user_${agentId}`,
          ...agentData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error(`Error creating agent ${agentData.store_name}:`, error);
      } else {
        console.log(`✅ Created agent: ${agentData.store_name}`);
      }
    }
    
    console.log('🎉 All demo agents created successfully!');
    return { success: true, count: demoAgents.length };
  } catch (error) {
    console.error('Error creating demo agents:', error);
    return { success: false, error };
  }
};

export const clearDemoAgents = async () => {
  try {
    console.log('🗑️ Clearing demo agents...');
    
    const { data, error } = await supabaseService.users
      .from('agents')
      .delete()
      .like('fcm_token', 'demo_fcm_token_%');
    
    if (error) {
      console.error('Error clearing demo agents:', error);
      return { success: false, error };
    }
    
    console.log('✅ Demo agents cleared successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error clearing demo agents:', error);
    return { success: false, error };
  }
};

export default { createDemoAgents, clearDemoAgents };

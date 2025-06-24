import supabaseService from '../services/SupabaseService';

// 25 Store Agents matching our home page layout
const storeAgents = [
  // Group 1: Luxury Fashion Hub (5 stores)
  {
    agent_name: 'Sophie Laurent',
    agent_email: 'sophie@dior.com',
    agent_phone: '+91-9876543201',
    store_name: 'DIOR Store',
    store_category: ['Luxury', 'Fashion', 'Designer'],
    store_location: { floor: 'Ground Floor', section: 'Luxury Wing', shop_number: 'L-01' },
    store_description: 'Designer bags, luxury watches, premium clothing',
    coins: 5000,
    fcm_token: 'dior_store_token',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Marco Rossi',
    agent_email: 'marco@gucci.com',
    agent_phone: '+91-9876543202',
    store_name: 'GUCCI Store',
    store_category: ['Luxury', 'Fashion', 'Designer'],
    store_location: { floor: 'Ground Floor', section: 'Luxury Wing', shop_number: 'L-02' },
    store_description: 'Designer bags, luxury watches, premium clothing',
    coins: 4800,
    fcm_token: 'gucci_store_token',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Isabella Ferrari',
    agent_email: 'isabella@prada.com',
    agent_phone: '+91-9876543203',
    store_name: 'PRADA Store',
    store_category: ['Luxury', 'Fashion', 'Designer'],
    store_location: { floor: 'Ground Floor', section: 'Luxury Wing', shop_number: 'L-03' },
    store_description: 'Designer bags, luxury watches, premium clothing',
    coins: 4600,
    fcm_token: 'prada_store_token',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Antoine Dubois',
    agent_email: 'antoine@saintlaurent.com',
    agent_phone: '+91-9876543204',
    store_name: 'SAINT LAURENT Store',
    store_category: ['Luxury', 'Fashion', 'Designer'],
    store_location: { floor: 'Ground Floor', section: 'Luxury Wing', shop_number: 'L-04' },
    store_description: 'Designer bags, luxury watches, premium clothing',
    coins: 4400,
    fcm_token: 'saintlaurent_store_token',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Valentina Greco',
    agent_email: 'valentina@versace.com',
    agent_phone: '+91-9876543205',
    store_name: 'VERSACE Store',
    store_category: ['Luxury', 'Fashion', 'Designer'],
    store_location: { floor: 'Ground Floor', section: 'Luxury Wing', shop_number: 'L-05' },
    store_description: 'Designer bags, luxury watches, premium clothing',
    coins: 4200,
    fcm_token: 'versace_store_token',
    is_active: true,
    is_online: true
  },

  // Group 2: Sports & Athleisure (5 stores)
  {
    agent_name: 'Hans Mueller',
    agent_email: 'hans@adidas.com',
    agent_phone: '+91-9876543206',
    store_name: 'ADIDAS Store',
    store_category: ['Sports', 'Athleisure', 'Footwear'],
    store_location: { floor: 'First Floor', section: 'Sports Zone', shop_number: 'S-01' },
    store_description: 'Running shoes, sports apparel, gym wear',
    coins: 3500,
    fcm_token: 'adidas_store_token',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Michael Johnson',
    agent_email: 'michael@nike.com',
    agent_phone: '+91-9876543207',
    store_name: 'NIKE Store',
    store_category: ['Sports', 'Athleisure', 'Footwear'],
    store_location: { floor: 'First Floor', section: 'Sports Zone', shop_number: 'S-02' },
    store_description: 'Running shoes, sports apparel, gym wear',
    coins: 3400,
    fcm_token: 'nike_store_token',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Rudolf Dassler',
    agent_email: 'rudolf@puma.com',
    agent_phone: '+91-9876543208',
    store_name: 'PUMA Store',
    store_category: ['Sports', 'Athleisure', 'Footwear'],
    store_location: { floor: 'First Floor', section: 'Sports Zone', shop_number: 'S-03' },
    store_description: 'Running shoes, sports apparel, gym wear',
    coins: 3300,
    fcm_token: 'puma_store_token',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Joe Foster',
    agent_email: 'joe@reebok.com',
    agent_phone: '+91-9876543209',
    store_name: 'REEBOK Store',
    store_category: ['Sports', 'Athleisure', 'Footwear'],
    store_location: { floor: 'First Floor', section: 'Sports Zone', shop_number: 'S-04' },
    store_description: 'Running shoes, sports apparel, gym wear',
    coins: 3200,
    fcm_token: 'reebok_store_token',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'William Riley',
    agent_email: 'william@newbalance.com',
    agent_phone: '+91-9876543210',
    store_name: 'NEW BALANCE Store',
    store_category: ['Sports', 'Athleisure', 'Footwear'],
    store_location: { floor: 'First Floor', section: 'Sports Zone', shop_number: 'S-05' },
    store_description: 'Running shoes, sports apparel, gym wear',
    coins: 3100,
    fcm_token: 'newbalance_store_token',
    is_active: true,
    is_online: true
  },

  // Group 3: Contemporary Fashion (5 stores)
  {
    agent_name: 'Rajesh Slogun',
    agent_email: 'rajesh@slogun.com',
    agent_phone: '+91-9876543211',
    store_name: 'SLOGUN Store',
    store_category: ['Fashion', 'Contemporary', 'Casual'],
    store_location: { floor: 'Second Floor', section: 'Fashion District', shop_number: 'F-01' },
    store_description: 'Casual wear, party dresses, everyday fashion',
    coins: 2800,
    fcm_token: 'slogun_store_token',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Yumi Tanaka',
    agent_email: 'yumi@yumikim.com',
    agent_phone: '+91-9876543212',
    store_name: 'YUMI KIM Store',
    store_category: ['Fashion', 'Contemporary', 'Casual'],
    store_location: { floor: 'Second Floor', section: 'Fashion District', shop_number: 'F-02' },
    store_description: 'Casual wear, party dresses, everyday fashion',
    coins: 2700,
    fcm_token: 'yumikim_store_token',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Sarah Plain',
    agent_email: 'sarah@plainandsimple.com',
    agent_phone: '+91-9876543213',
    store_name: 'PLAINANDSIMPLE Store',
    store_category: ['Fashion', 'Contemporary', 'Casual'],
    store_location: { floor: 'Second Floor', section: 'Fashion District', shop_number: 'F-03' },
    store_description: 'Casual wear, party dresses, everyday fashion',
    coins: 2600,
    fcm_token: 'plainandsimple_store_token',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Emma London',
    agent_email: 'emma@tfnclondon.com',
    agent_phone: '+91-9876543214',
    store_name: 'TFNC LONDON Store',
    store_category: ['Fashion', 'Contemporary', 'Casual'],
    store_location: { floor: 'Second Floor', section: 'Fashion District', shop_number: 'F-04' },
    store_description: 'Casual wear, party dresses, everyday fashion',
    coins: 2500,
    fcm_token: 'tfnclondon_store_token',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'James Cottsbury',
    agent_email: 'james@cottsbury.com',
    agent_phone: '+91-9876543215',
    store_name: 'COTTSBURY LTD Store',
    store_category: ['Fashion', 'Contemporary', 'Casual'],
    store_location: { floor: 'Second Floor', section: 'Fashion District', shop_number: 'F-05' },
    store_description: 'Casual wear, party dresses, everyday fashion',
    coins: 2400,
    fcm_token: 'cottsbury_store_token',
    is_active: true,
    is_online: true
  },

  // Group 4: SuperDry Collection (5 stores)
  {
    agent_name: 'Julian Dunkerton',
    agent_email: 'julian@superdry1.com',
    agent_phone: '+91-9876543216',
    store_name: 'SuperDry Store #1',
    store_category: ['SuperDry', 'Casual', 'Streetwear'],
    store_location: { floor: 'Third Floor', section: 'SuperDry Zone', shop_number: 'SD-01' },
    store_description: 'Hoodies, T-shirts, jackets, casual wear',
    coins: 3000,
    fcm_token: 'superdry1_store_token',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'James Holder',
    agent_email: 'james@superdry2.com',
    agent_phone: '+91-9876543217',
    store_name: 'SuperDry Store #2',
    store_category: ['SuperDry', 'Casual', 'Streetwear'],
    store_location: { floor: 'Third Floor', section: 'SuperDry Zone', shop_number: 'SD-02' },
    store_description: 'Hoodies, T-shirts, jackets, casual wear',
    coins: 2900,
    fcm_token: 'superdry2_store_token',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Sarah Mitchell',
    agent_email: 'sarah@superdry3.com',
    agent_phone: '+91-9876543218',
    store_name: 'SuperDry Store #3',
    store_category: ['SuperDry', 'Casual', 'Streetwear'],
    store_location: { floor: 'Third Floor', section: 'SuperDry Zone', shop_number: 'SD-03' },
    store_description: 'Hoodies, T-shirts, jackets, casual wear',
    coins: 2800,
    fcm_token: 'superdry3_store_token',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'David Chen',
    agent_email: 'david@superdry4.com',
    agent_phone: '+91-9876543219',
    store_name: 'SuperDry Store #4',
    store_category: ['SuperDry', 'Casual', 'Streetwear'],
    store_location: { floor: 'Third Floor', section: 'SuperDry Zone', shop_number: 'SD-04' },
    store_description: 'Hoodies, T-shirts, jackets, casual wear',
    coins: 2700,
    fcm_token: 'superdry4_store_token',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Lisa Thompson',
    agent_email: 'lisa@superdry5.com',
    agent_phone: '+91-9876543220',
    store_name: 'SuperDry Store #5',
    store_category: ['SuperDry', 'Casual', 'Streetwear'],
    store_location: { floor: 'Third Floor', section: 'SuperDry Zone', shop_number: 'SD-05' },
    store_description: 'Hoodies, T-shirts, jackets, casual wear',
    coins: 2600,
    fcm_token: 'superdry5_store_token',
    is_active: true,
    is_online: true
  },

  // Group 5: Premium Lifestyle (5 stores)
  {
    agent_name: 'Charles Turnbull',
    agent_email: 'charles@turnbullasser.com',
    agent_phone: '+91-9876543221',
    store_name: 'TURNBULL & ASSER Store',
    store_category: ['Premium', 'Formal', 'Luxury'],
    store_location: { floor: 'Ground Floor', section: 'Premium Wing', shop_number: 'P-01' },
    store_description: 'Formal wear, designer coats, luxury shoes',
    coins: 4000,
    fcm_token: 'turnbullasser_store_token',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Remo Ruffini',
    agent_email: 'remo@moncler.com',
    agent_phone: '+91-9876543222',
    store_name: 'MONCLER Store',
    store_category: ['Premium', 'Formal', 'Luxury'],
    store_location: { floor: 'Ground Floor', section: 'Premium Wing', shop_number: 'P-02' },
    store_description: 'Formal wear, designer coats, luxury shoes',
    coins: 3900,
    fcm_token: 'moncler_store_token',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Sarah Burton',
    agent_email: 'sarah@alexandermcqueen.com',
    agent_phone: '+91-9876543223',
    store_name: 'ALEXANDER MCQUEEN Store',
    store_category: ['Premium', 'Formal', 'Luxury'],
    store_location: { floor: 'Ground Floor', section: 'Premium Wing', shop_number: 'P-03' },
    store_description: 'Formal wear, designer coats, luxury shoes',
    coins: 3800,
    fcm_token: 'alexandermcqueen_store_token',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Demna Gvasalia',
    agent_email: 'demna@balenciaga.com',
    agent_phone: '+91-9876543224',
    store_name: 'BALENCIAGA Store',
    store_category: ['Premium', 'Formal', 'Luxury'],
    store_location: { floor: 'Ground Floor', section: 'Premium Wing', shop_number: 'P-04' },
    store_description: 'Formal wear, designer coats, luxury shoes',
    coins: 3700,
    fcm_token: 'balenciaga_store_token',
    is_active: true,
    is_online: true
  },
  {
    agent_name: 'Matthieu Blazy',
    agent_email: 'matthieu@bottegaveneta.com',
    agent_phone: '+91-9876543225',
    store_name: 'BOTTEGA VENETA Store',
    store_category: ['Premium', 'Formal', 'Luxury'],
    store_location: { floor: 'Ground Floor', section: 'Premium Wing', shop_number: 'P-05' },
    store_description: 'Formal wear, designer coats, luxury shoes',
    coins: 3600,
    fcm_token: 'bottegaveneta_store_token',
    is_active: true,
    is_online: true
  }
];

export const create25StoreAgents = async () => {
  try {
    console.log('🏪 Creating 25 store agents...');
    
    let successCount = 0;
    for (const agentData of storeAgents) {
      // Generate unique ID
      const agentId = `store_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
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
        console.error(`❌ Error creating agent ${agentData.store_name}:`, error);
      } else {
        console.log(`✅ Created agent: ${agentData.store_name}`);
        successCount++;
      }
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`🎉 Created ${successCount}/25 store agents successfully!`);
    return { success: true, count: successCount };
  } catch (error) {
    console.error('Error creating 25 store agents:', error);
    return { success: false, error };
  }
};

export const clear25StoreAgents = async () => {
  try {
    console.log('🗑️ Clearing 25 store agents...');
    
    const { data, error } = await supabaseService.users
      .from('agents')
      .delete()
      .or('fcm_token.like.*_store_token,store_name.like.*Store*');
    
    if (error) {
      console.error('Error clearing 25 store agents:', error);
      return { success: false, error };
    }
    
    console.log('✅ 25 store agents cleared successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error clearing 25 store agents:', error);
    return { success: false, error };
  }
};

export default { create25StoreAgents, clear25StoreAgents };

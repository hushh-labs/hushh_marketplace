const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create Supabase clients
const supabaseProducts1 = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const supabaseProducts2 = createClient(
  process.env.REACT_APP_SUPABASE_URL_SOURCE2,
  process.env.REACT_APP_SUPABASE_ANON_KEY_SOURCE2
);

async function analyzeProducts() {
  try {
    console.log('🔍 Fetching products from both sources...\n');
    
    // Fetch from both sources
    const [source1Response, source2Response] = await Promise.all([
      supabaseProducts1.from('product_search').select('*').limit(1000),
      supabaseProducts2.from('product_search').select('*').limit(1000)
    ]);

    console.log('📊 RAW RESPONSES:');
    console.log('Source 1 Error:', source1Response.error);
    console.log('Source 2 Error:', source2Response.error);
    console.log('Source 1 Count:', source1Response.data?.length || 0);
    console.log('Source 2 Count:', source2Response.data?.length || 0);
    console.log('');

    const source1Products = source1Response.data || [];
    const source2Products = source2Response.data || [];

    console.log(`📈 TOTAL PRODUCTS ANALYSIS:`);
    console.log(`   Source 1 (${process.env.REACT_APP_SUPABASE_URL}): ${source1Products.length} products`);
    console.log(`   Source 2 (${process.env.REACT_APP_SUPABASE_URL_SOURCE2}): ${source2Products.length} products`);
    console.log(`   GRAND TOTAL: ${source1Products.length + source2Products.length} products\n`);

    // Analyze Source 1 brands
    const source1Brands = {};
    source1Products.forEach(product => {
      const brand = product.brand || product.Brand || product.company || product.manufacturer || 'Unknown';
      source1Brands[brand] = (source1Brands[brand] || 0) + 1;
    });

    // Analyze Source 2 brands
    const source2Brands = {};
    source2Products.forEach(product => {
      const brand = product.brand || product.Brand || product.company || product.manufacturer || 'Unknown';
      source2Brands[brand] = (source2Brands[brand] || 0) + 1;
    });

    console.log('🏷️ SOURCE 1 BRAND BREAKDOWN:');
    const source1Sorted = Object.entries(source1Brands).sort(([,a], [,b]) => b - a);
    source1Sorted.forEach(([brand, count]) => {
      console.log(`   ${brand}: ${count} products`);
    });

    console.log('\n🏷️ SOURCE 2 BRAND BREAKDOWN:');
    const source2Sorted = Object.entries(source2Brands).sort(([,a], [,b]) => b - a);
    source2Sorted.forEach(([brand, count]) => {
      console.log(`   ${brand}: ${count} products`);
    });

    // Show sample products
    console.log('\n📋 SOURCE 1 SAMPLE PRODUCTS:');
    source1Products.slice(0, 5).forEach((product, i) => {
      console.log(`   ${i+1}. ${product.title || product.name || 'No title'} - Brand: ${product.brand || product.Brand || 'Unknown'}`);
    });

    console.log('\n📋 SOURCE 2 SAMPLE PRODUCTS:');
    source2Products.slice(0, 5).forEach((product, i) => {
      console.log(`   ${i+1}. ${product.title || product.name || 'No title'} - Brand: ${product.brand || product.Brand || 'Unknown'}`);
    });

    // Create analytics file
    const analyticsContent = `# MallConnect Product Analytics Report
Generated: ${new Date().toLocaleString()}

## 📊 Total Products Summary
- **Source 1**: ${source1Products.length} products
- **Source 2**: ${source2Products.length} products  
- **Grand Total**: ${source1Products.length + source2Products.length} products

## 🏷️ Source 1 Brand Breakdown
${source1Sorted.map(([brand, count]) => `- **${brand}**: ${count} products`).join('\n')}

## 🏷️ Source 2 Brand Breakdown
${source2Sorted.map(([brand, count]) => `- **${brand}**: ${count} products`).join('\n')}

## 📋 Sample Products

### Source 1 Samples:
${source1Products.slice(0, 5).map((product, i) => 
  `${i+1}. **${product.title || product.name || 'No title'}** - Brand: ${product.brand || product.Brand || 'Unknown'}`
).join('\n')}

### Source 2 Samples:
${source2Products.slice(0, 5).map((product, i) => 
  `${i+1}. **${product.title || product.name || 'No title'}** - Brand: ${product.brand || product.Brand || 'Unknown'}`
).join('\n')}

## 🔗 Database URLs
- **Source 1**: ${process.env.REACT_APP_SUPABASE_URL}
- **Source 2**: ${process.env.REACT_APP_SUPABASE_URL_SOURCE2}
`;

    // Write analytics file
    const fs = require('fs');
    fs.writeFileSync('analytics_store.md', analyticsContent);
    console.log('\n✅ Analytics report saved to analytics_store.md');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

analyzeProducts();

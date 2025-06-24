import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Database, Users, Zap, AlertTriangle } from 'lucide-react';
import { createDemoAgents, clearDemoAgents } from '../utils/createDemoAgents';
import { create25StoreAgents, clear25StoreAgents } from '../utils/create25StoreAgents';
import { setupDatabase, getManualSQL } from '../utils/setupDatabase';
import supabaseService from '../services/SupabaseService';

const DeveloperPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agentCount, setAgentCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState(null);

  const handleCreateAgents = async () => {
    setLoading(true);
    try {
      const result = await createDemoAgents();
      if (result.success) {
        alert(`✅ Created ${result.count} demo agents successfully!`);
        await checkAgentCount();
      } else {
        alert('❌ Failed to create demo agents');
      }
    } catch (error) {
      console.error('Error creating agents:', error);
      alert('❌ Error creating demo agents');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAgents = async () => {
    if (window.confirm('Are you sure you want to clear all demo agents?')) {
      setLoading(true);
      try {
        const result = await clearDemoAgents();
        if (result.success) {
          alert('✅ Demo agents cleared successfully!');
          await checkAgentCount();
        } else {
          alert('❌ Failed to clear demo agents');
        }
      } catch (error) {
        console.error('Error clearing agents:', error);
        alert('❌ Error clearing demo agents');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreate25StoreAgents = async () => {
    setLoading(true);
    try {
      const result = await create25StoreAgents();
      if (result.success) {
        alert(`✅ Created ${result.count}/25 store agents successfully!`);
        await checkAgentCount();
      } else {
        alert('❌ Failed to create 25 store agents');
      }
    } catch (error) {
      console.error('Error creating 25 store agents:', error);
      alert('❌ Error creating 25 store agents');
    } finally {
      setLoading(false);
    }
  };

  const handleClear25StoreAgents = async () => {
    if (window.confirm('Are you sure you want to clear all 25 store agents?')) {
      setLoading(true);
      try {
        const result = await clear25StoreAgents();
        if (result.success) {
          alert('✅ 25 store agents cleared successfully!');
          await checkAgentCount();
        } else {
          alert('❌ Failed to clear 25 store agents');
        }
      } catch (error) {
        console.error('Error clearing 25 store agents:', error);
        alert('❌ Error clearing 25 store agents');
      } finally {
        setLoading(false);
      }
    }
  };

  const checkAgentCount = async () => {
    try {
      const { data } = await supabaseService.getAllActiveAgents();
      setAgentCount(data.length);
    } catch (error) {
      console.error('Error checking agent count:', error);
    }
  };

  const checkConnections = async () => {
    setLoading(true);
    try {
      const status = await supabaseService.testConnection();
      setConnectionStatus(status);
      await checkAgentCount();
    } catch (error) {
      console.error('Error checking connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const testProductSearch = async (query) => {
    setLoading(true);
    try {
      console.log(`🧪 Testing product search for: "${query}"`);
      const result = await supabaseService.searchAllProductSources(query);
      
      console.log(`📊 Test Results for "${query}":`);
      console.log(`   Source 1: ${result.source1Count} products`);
      console.log(`   Source 2: ${result.source2Count} products`);
      console.log(`   Total: ${result.data.length} products`);
      
      if (result.data.length > 0) {
        console.log(`📋 Sample products:`, result.data.slice(0, 3));
      }
      
      alert(`Search Results:\nSource 1: ${result.source1Count} products\nSource 2: ${result.source2Count} products\nTotal: ${result.data.length} products\n\nCheck console for details!`);
    } catch (error) {
      console.error('Error testing product search:', error);
      alert('❌ Error testing product search');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupDatabase = async () => {
    setLoading(true);
    try {
      console.log('🗄️ Setting up database...');
      const result = await setupDatabase();
      if (result.success) {
        alert('✅ Database setup completed successfully!');
        await checkConnections();
      } else {
        alert('❌ Database setup failed. You may need to create tables manually in Supabase dashboard.');
        console.error('Database setup error:', result.error);
      }
    } catch (error) {
      console.error('Error setting up database:', error);
      alert('❌ Error setting up database. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowSQL = () => {
    const sql = getManualSQL();
    console.log('📋 Manual SQL for database setup:');
    console.log(sql);
    
    // Create a modal or copy to clipboard
    const textarea = document.createElement('textarea');
    textarea.value = sql;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    alert('📋 SQL copied to clipboard!\n\nAlso check console for full SQL.\n\nPaste this into Supabase SQL Editor to create tables manually.');
  };

  const showDatabaseURLs = () => {
    console.log('🔗 Database URLs Configuration:');
    console.log('Users DB:', process.env.REACT_APP_SUPABASE_URL_USERS);
    console.log('Products1 DB:', process.env.REACT_APP_SUPABASE_URL);
    console.log('Products2 DB:', process.env.REACT_APP_SUPABASE_URL_SOURCE2);
    
    alert(`Database URLs:\n\nUsers: ${process.env.REACT_APP_SUPABASE_URL_USERS}\n\nProducts1: ${process.env.REACT_APP_SUPABASE_URL}\n\nProducts2: ${process.env.REACT_APP_SUPABASE_URL_SOURCE2}\n\nCheck console for full details!`);
  };

  const fetchAllProductsAndAnalyze = async () => {
    setLoading(true);
    try {
      console.log('📊 Fetching ALL products from both sources...');
      
      // Fetch all products from both sources
      const [source1Response, source2Response] = await Promise.all([
        supabaseService.products1.from('product_search').select('*').limit(1000),
        supabaseService.products2.from('product_search').select('*').limit(1000)
      ]);

      console.log('📦 Source 1 Raw Response:', source1Response);
      console.log('📦 Source 2 Raw Response:', source2Response);

      const source1Products = source1Response.data || [];
      const source2Products = source2Response.data || [];

      console.log(`📊 TOTAL PRODUCTS ANALYSIS:`);
      console.log(`   Source 1 (${process.env.REACT_APP_SUPABASE_URL}): ${source1Products.length} products`);
      console.log(`   Source 2 (${process.env.REACT_APP_SUPABASE_URL_SOURCE2}): ${source2Products.length} products`);
      console.log(`   GRAND TOTAL: ${source1Products.length + source2Products.length} products`);

      // Analyze brands from Source 1
      const source1Brands = {};
      source1Products.forEach(product => {
        const brand = product.brand || product.Brand || product.company || product.manufacturer || 'Unknown';
        source1Brands[brand] = (source1Brands[brand] || 0) + 1;
      });

      // Analyze brands from Source 2
      const source2Brands = {};
      source2Products.forEach(product => {
        const brand = product.brand || product.Brand || product.company || product.manufacturer || 'Unknown';
        source2Brands[brand] = (source2Brands[brand] || 0) + 1;
      });

      console.log('🏷️ SOURCE 1 BRAND BREAKDOWN:');
      Object.entries(source1Brands)
        .sort(([,a], [,b]) => b - a)
        .forEach(([brand, count]) => {
          console.log(`   ${brand}: ${count} products`);
        });

      console.log('🏷️ SOURCE 2 BRAND BREAKDOWN:');
      Object.entries(source2Brands)
        .sort(([,a], [,b]) => b - a)
        .forEach(([brand, count]) => {
          console.log(`   ${brand}: ${count} products`);
        });

      // Show sample products
      console.log('📋 SOURCE 1 SAMPLE PRODUCTS:');
      source1Products.slice(0, 5).forEach((product, i) => {
        console.log(`   ${i+1}. ${product.title || product.name || 'No title'} - Brand: ${product.brand || product.Brand || 'Unknown'}`);
      });

      console.log('📋 SOURCE 2 SAMPLE PRODUCTS:');
      source2Products.slice(0, 5).forEach((product, i) => {
        console.log(`   ${i+1}. ${product.title || product.name || 'No title'} - Brand: ${product.brand || product.Brand || 'Unknown'}`);
      });

      // Create summary for alert
      const source1TopBrands = Object.entries(source1Brands)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([brand, count]) => `${brand}: ${count}`)
        .join('\n');

      const source2TopBrands = Object.entries(source2Brands)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([brand, count]) => `${brand}: ${count}`)
        .join('\n');

      alert(`📊 PRODUCTS ANALYSIS:\n\nSOURCE 1: ${source1Products.length} products\nTop Brands:\n${source1TopBrands}\n\nSOURCE 2: ${source2Products.length} products\nTop Brands:\n${source2TopBrands}\n\nTOTAL: ${source1Products.length + source2Products.length} products\n\nCheck console for detailed breakdown!`);

    } catch (error) {
      console.error('❌ Error fetching products:', error);
      alert('❌ Error fetching products. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      checkConnections();
    }
  }, [isOpen]);

  return (
    <>
      {/* Developer Panel Toggle */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-neutral-gray700 text-white rounded-full shadow-lg z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Settings className="h-6 w-6 mx-auto" />
      </motion.button>

      {/* Developer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-20 right-4 w-80 bg-white rounded-card shadow-lg border border-neutral-gray100 p-4 z-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Developer Panel
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-gray700 hover:text-black"
              >
                ✕
              </button>
            </div>

            {/* Connection Status */}
            <div className="mb-4 p-3 bg-neutral-gray100 rounded">
              <h4 className="font-medium mb-2">Database Connections</h4>
              {connectionStatus ? (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Users DB:</span>
                    <span className={connectionStatus.users === 'connected' ? 'text-green-600' : 'text-red-600'}>
                      {connectionStatus.users === 'connected' ? '✅ Connected' : '❌ Error'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Products1 DB:</span>
                    <span className={connectionStatus.products1 === 'connected' ? 'text-green-600' : 'text-red-600'}>
                      {connectionStatus.products1 === 'connected' ? '✅ Connected' : '❌ Error'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Products2 DB:</span>
                    <span className={connectionStatus.products2 === 'connected' ? 'text-green-600' : 'text-red-600'}>
                      {connectionStatus.products2 === 'connected' ? '✅ Connected' : '❌ Error'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-neutral-gray700">Checking connections...</div>
              )}
            </div>

            {/* Agent Management */}
            <div className="mb-4 p-3 bg-neutral-gray100 rounded">
              <h4 className="font-medium mb-2 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Agent Management
              </h4>
              <div className="text-sm mb-3">
                Active Agents: <span className="font-semibold">{agentCount}</span>
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleCreateAgents}
                  disabled={loading}
                  className="w-full py-2 px-3 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create 10 Demo Agents'}
                </button>
                <button
                  onClick={handleClearAgents}
                  disabled={loading}
                  className="w-full py-2 px-3 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
                >
                  {loading ? 'Clearing...' : 'Clear Demo Agents'}
                </button>
                <button
                  onClick={handleCreate25StoreAgents}
                  disabled={loading}
                  className="w-full py-2 px-3 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create 25 Store Agents'}
                </button>
                <button
                  onClick={handleClear25StoreAgents}
                  disabled={loading}
                  className="w-full py-2 px-3 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 disabled:opacity-50"
                >
                  {loading ? 'Clearing...' : 'Clear 25 Store Agents'}
                </button>
              </div>
            </div>

            {/* Test Actions */}
            <div className="mb-4 p-3 bg-neutral-gray100 rounded">
              <h4 className="font-medium mb-2 flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Test Actions
              </h4>
              <div className="space-y-2">
                <button
                  onClick={checkConnections}
                  disabled={loading}
                  className="w-full py-2 px-3 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Testing...' : 'Test Connections'}
                </button>
                <button
                  onClick={showDatabaseURLs}
                  className="w-full py-2 px-3 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600"
                >
                  Show Database URLs
                </button>
              </div>
            </div>

            {/* Database Setup */}
            <div className="mb-4 p-3 bg-red-50 rounded">
              <h4 className="font-medium mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Database Setup
              </h4>
              <div className="space-y-2">
                <button
                  onClick={handleSetupDatabase}
                  disabled={loading}
                  className="w-full py-2 px-3 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 disabled:opacity-50"
                >
                  {loading ? 'Setting up...' : 'Setup Database Tables'}
                </button>
                <button
                  onClick={handleShowSQL}
                  className="w-full py-2 px-3 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                >
                  Show Manual SQL
                </button>
              </div>
            </div>

            {/* Test Product Search */}
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <h4 className="font-medium mb-2 flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Test Product Search
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => testProductSearch('iPhone')}
                  disabled={loading}
                  className="w-full py-2 px-3 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:opacity-50"
                >
                  Test Search: "iPhone"
                </button>
                <button
                  onClick={() => testProductSearch('laptop')}
                  disabled={loading}
                  className="w-full py-2 px-3 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:opacity-50"
                >
                  Test Search: "laptop"
                </button>
                <button
                  onClick={fetchAllProductsAndAnalyze}
                  disabled={loading}
                  className="w-full py-2 px-3 bg-pink-500 text-white rounded text-sm hover:bg-pink-600 disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Analyze All Products & Brands'}
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-xs text-neutral-gray700 bg-yellow-50 p-2 rounded">
              <strong>Setup Instructions:</strong>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li><strong>Setup Database Tables</strong> (required first!)</li>
                <li>Create 10 demo agents</li>
                <li>Test product search to see counts</li>
                <li>Search for any product in main app</li>
                <li>Check console for detailed logs</li>
                <li>View results screen for bidding</li>
              </ol>
              <div className="mt-2 p-2 bg-red-100 rounded text-red-700">
                <strong>⚠️ Database Error?</strong><br/>
                Click "Show Manual SQL" and paste into Supabase SQL Editor
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DeveloperPanel;

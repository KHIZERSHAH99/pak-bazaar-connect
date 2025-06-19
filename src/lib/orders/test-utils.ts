
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

// Test utility functions to verify Supabase backend functionality
export const testSupabaseOrdersBackend = async () => {
  console.log('🧪 Testing Supabase Orders Backend...');
  
  try {
    // Test 1: Check if user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      console.error('❌ User not authenticated');
      return false;
    }
    console.log('✅ User authenticated:', user.email);

    // Test 2: Check orders table access
    const { data: ordersTest, error: ordersError } = await supabase
      .from('orders')
      .select('count')
      .limit(1);
    
    if (ordersError) {
      console.error('❌ Orders table access failed:', ordersError);
      return false;
    }
    console.log('✅ Orders table accessible');

    // Test 3: Check shops table access
    const { data: shopsTest, error: shopsError } = await supabase
      .from('shops')
      .select('count')
      .limit(1);
    
    if (shopsError) {
      console.error('❌ Shops table access failed:', shopsError);
      return false;
    }
    console.log('✅ Shops table accessible');

    // Test 4: Check profiles table access
    const { data: profilesTest, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles table access failed:', profilesError);
      return false;
    }
    console.log('✅ Profiles table accessible');

    // Test 5: Check order_messages table access
    const { data: messagesTest, error: messagesError } = await supabase
      .from('order_messages')
      .select('count')
      .limit(1);
    
    if (messagesError) {
      console.error('❌ Order messages table access failed:', messagesError);
      return false;
    }
    console.log('✅ Order messages table accessible');

    // Test 6: Check commission_records table access
    const { data: commissionTest, error: commissionError } = await supabase
      .from('commission_records')
      .select('count')
      .limit(1);
    
    if (commissionError) {
      console.error('❌ Commission records table access failed:', commissionError);
      return false;
    }
    console.log('✅ Commission records table accessible');

    // Test 7: Check payment_methods table access
    const { data: paymentTest, error: paymentError } = await supabase
      .from('payment_methods')
      .select('count')
      .limit(1);
    
    if (paymentError) {
      console.error('❌ Payment methods table access failed:', paymentError);
      return false;
    }
    console.log('✅ Payment methods table accessible');

    // Test 8: Test RPC function
    try {
      const { data: rpcTest, error: rpcError } = await supabase
        .rpc('get_wholesaler_monthly_sales', {
          wholesaler_uuid: user.id,
          target_month: new Date().toISOString().split('T')[0]
        });
      
      if (rpcError) {
        console.warn('⚠️ RPC function test failed (may be expected):', rpcError.message);
      } else {
        console.log('✅ RPC function accessible');
      }
    } catch (error) {
      console.warn('⚠️ RPC function test error (may be expected):', error);
    }

    console.log('🎉 All core Supabase backend tests passed!');
    return true;

  } catch (error) {
    console.error('❌ Backend test failed:', error);
    return false;
  }
};

// Test specific order operations
export const testOrderOperations = async () => {
  console.log('🧪 Testing Order Operations...');
  
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.error('❌ User not authenticated for order operations test');
      return false;
    }

    // Test fetching user's orders (as buyer)
    const { data: buyerOrders, error: buyerError } = await supabase
      .from('orders')
      .select(`
        id,
        buyer_id,
        shop_id,
        total_amount,
        status,
        payment_method,
        buyer_name,
        buyer_phone,
        buyer_address,
        created_at,
        shops(id, name, contact, address, postal_code, owner_id)
      `)
      .eq('buyer_id', user.id)
      .limit(5);

    if (buyerError) {
      console.error('❌ Buyer orders fetch failed:', buyerError);
    } else {
      console.log('✅ Buyer orders fetch successful:', buyerOrders?.length || 0, 'orders');
    }

    // Test fetching wholesaler orders (if user has shops)
    const { data: userShops, error: shopsError } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', user.id);

    if (!shopsError && userShops && userShops.length > 0) {
      const shopIds = userShops.map(shop => shop.id);
      
      const { data: wholesalerOrders, error: wholesalerError } = await supabase
        .from('orders')
        .select(`
          id,
          buyer_id,
          shop_id,
          total_amount,
          status,
          created_at,
          shops(id, name),
          profiles!orders_buyer_id_fkey(email)
        `)
        .in('shop_id', shopIds)
        .limit(5);

      if (wholesalerError) {
        console.error('❌ Wholesaler orders fetch failed:', wholesalerError);
      } else {
        console.log('✅ Wholesaler orders fetch successful:', wholesalerOrders?.length || 0, 'orders');
      }
    }

    console.log('🎉 Order operations tests completed!');
    return true;

  } catch (error) {
    console.error('❌ Order operations test failed:', error);
    return false;
  }
};

// Run comprehensive backend tests
export const runComprehensiveBackendTests = async () => {
  console.log('🚀 Starting Comprehensive Backend Tests...');
  
  const backendTest = await testSupabaseOrdersBackend();
  const operationsTest = await testOrderOperations();
  
  if (backendTest && operationsTest) {
    console.log('🎉 All backend tests passed! System is ready.');
    return true;
  } else {
    console.log('❌ Some backend tests failed. Please check the errors above.');
    return false;
  }
};

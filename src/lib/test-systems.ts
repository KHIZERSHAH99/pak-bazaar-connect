import { supabase } from '@/integrations/supabase/client';

export const testSystems = async () => {
  const results = {
    authentication: false,
    ordering: false,
    messaging: false,
    pricing: false,
    analytics: false
  };

  try {
    // Test Authentication
    const { data: authUser } = await supabase.auth.getUser();
    results.authentication = !!authUser.user;

    // Test Ordering
    const { error: orderError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);
    results.ordering = !orderError;

    // Test Messaging
    const { error: messageError } = await supabase
      .from('conversations')
      .select('id')
      .limit(1);
    results.messaging = !messageError;

    // Test Pricing
    const { error: pricingError } = await supabase
      .from('pricing_tiers')
      .select('id')
      .limit(1);
    results.pricing = !pricingError;

    // Test Analytics
    const { error: analyticsError } = await supabase
      .from('analytics_events')
      .select('id')
      .limit(1);
    results.analytics = !analyticsError;

    console.log('System Test Results:', results);
    return results;
  } catch (error) {
    console.error('System test failed:', error);
    return results;
  }
};
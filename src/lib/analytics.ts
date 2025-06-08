
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

export interface AnalyticsData {
  views: number;
  messages: number;
  orders: number;
  revenue: number;
  dailyStats: Array<{
    date: string;
    views: number;
    orders: number;
  }>;
}

export const getSellerAnalytics = async (timeframe: string = '7d'): Promise<AnalyticsData> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  // Calculate date range
  const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get seller's shops
  const { data: shops } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id);

  if (!shops?.length) {
    return {
      views: 0,
      messages: 0,
      orders: 0,
      revenue: 0,
      dailyStats: []
    };
  }

  // Mock data for now - in a real implementation, you'd track these metrics
  const mockAnalytics: AnalyticsData = {
    views: Math.floor(Math.random() * 1000) + 100,
    messages: Math.floor(Math.random() * 50) + 10,
    orders: Math.floor(Math.random() * 25) + 5,
    revenue: Math.floor(Math.random() * 100000) + 10000,
    dailyStats: Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return {
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 50) + 10,
        orders: Math.floor(Math.random() * 5) + 1
      };
    })
  };

  return mockAnalytics;
};

export const trackProductView = async (productId: string): Promise<void> => {
  try {
    const user = await getCurrentUser();
    
    // Mock implementation - in the future this would insert into product_views table
    console.log(`Product view tracked for product ${productId} by user ${user?.id}`);
    
    // Store in localStorage for now
    const views = JSON.parse(localStorage.getItem('product_views') || '[]');
    views.push({
      product_id: productId,
      user_id: user?.id,
      viewed_at: new Date().toISOString()
    });
    localStorage.setItem('product_views', JSON.stringify(views));
  } catch (error) {
    console.error('Error tracking product view:', error);
  }
};

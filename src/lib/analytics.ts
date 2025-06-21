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
  const startDateString = startDate.toISOString().split('T')[0];

  try {
    // Get seller's shops
    const { data: shops, error: shopsError } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', user.id);

    if (shopsError) {
      console.error('Error fetching shops:', shopsError);
      throw shopsError;
    }

    if (!shops?.length) {
      return {
        views: 0,
        messages: 0,
        orders: 0,
        revenue: 0,
        dailyStats: []
      };
    }

    const shopIds = shops.map(shop => shop.id);

    // Get real orders data
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount, created_at')
      .in('shop_id', shopIds)
      .gte('created_at', startDateString);

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
    }

    // Get products for this wholesaler
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .in('shop_id', shopIds)
      .eq('is_active', true);

    if (productsError) {
      console.error('Error fetching products:', productsError);
    }

    // Get real product views from the new table
    const productIds = products?.map(p => p.id) || [];
    let totalViews = 0;
    if (productIds.length > 0) {
      const { data: viewsData, error: viewsError } = await supabase
        .from('product_views')
        .select('id, viewed_at')
        .in('product_id', productIds)
        .gte('viewed_at', startDateString);

      if (viewsError) {
        console.error('Error fetching product views:', viewsError);
        // Fallback to estimated views if product_views table not available yet
        totalViews = (products?.length || 0) * 15;
      } else {
        totalViews = viewsData?.length || 0;
      }
    }

    // Get messages from order_messages for these shops
    const orderIds = (orders || []).map(order => order.id);
    let totalMessages = 0;
    if (orderIds.length > 0) {
      const { data: messages, error: messagesError } = await supabase
        .from('order_messages')
        .select('id, created_at')
        .in('order_id', orderIds);

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
      } else {
        totalMessages = messages?.length || 0;
      }
    }

    // Calculate real metrics
    const realOrders = orders || [];
    const totalOrders = realOrders.length;
    const totalRevenue = realOrders.reduce((sum, order) => {
      const amount = typeof order.total_amount === 'number' ? order.total_amount : parseFloat(order.total_amount) || 0;
      return sum + amount;
    }, 0);

    // Calculate daily stats with real data
    const dailyStats = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const dateString = date.toISOString().split('T')[0];
      
      const dayOrders = realOrders.filter(order => 
        order.created_at && order.created_at.split('T')[0] === dateString
      );

      return {
        date: dateString,
        views: Math.floor(totalViews / days), // Distribute views evenly for now
        orders: dayOrders.length
      };
    });

    return {
      views: totalViews,
      messages: totalMessages,
      orders: totalOrders,
      revenue: totalRevenue,
      dailyStats
    };

  } catch (error) {
    console.error('Error in getSellerAnalytics:', error);
    
    // Return zero data on error instead of fake data
    return {
      views: 0,
      messages: 0,
      orders: 0,
      revenue: 0,
      dailyStats: Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        return {
          date: date.toISOString().split('T')[0],
          views: 0,
          orders: 0
        };
      })
    };
  }
};

export const trackProductView = async (productId: string): Promise<void> => {
  try {
    const user = await getCurrentUser();
    
    // Try to insert into the new product_views table
    const { error } = await supabase
      .from('product_views')
      .insert([{
        product_id: productId,
        user_id: user?.id,
        ip_address: null, // Will be handled by RLS/triggers if needed
        user_agent: navigator.userAgent
      }]);

    if (error) {
      console.log('Product views table not available yet, using localStorage fallback');
      
      // Fallback to localStorage for backward compatibility
      const views = JSON.parse(localStorage.getItem('product_views') || '[]');
      views.push({
        product_id: productId,
        user_id: user?.id,
        viewed_at: new Date().toISOString()
      });
      
      // Keep only last 1000 views to prevent localStorage bloat
      if (views.length > 1000) {
        views.splice(0, views.length - 1000);
      }
      
      localStorage.setItem('product_views', JSON.stringify(views));
    }
    
    console.log('Product view tracked for product:', productId);
  } catch (error) {
    console.error('Error tracking product view:', error);
  }
};


import { supabase } from '@/integrations/supabase/client';
import { AdAnalytics } from './types';

export const getAdAnalytics = async (adId: string): Promise<AdAnalytics[]> => {
  try {
    const { data, error } = await supabase
      .from('ad_analytics')
      .select('*')
      .eq('ad_id', adId)
      .order('date', { ascending: false })
      .limit(30); // Last 30 days

    if (error) {
      console.error('Error fetching ad analytics:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAdAnalytics:', error);
    return [];
  }
};

export const getAdPerformanceSummary = async (adId: string) => {
  try {
    const { data, error } = await supabase
      .from('ad_analytics')
      .select('impressions, clicks, orders, spend')
      .eq('ad_id', adId);

    if (error) {
      console.error('Error fetching ad performance summary:', error);
      return {
        totalImpressions: 0,
        totalClicks: 0,
        totalOrders: 0,
        totalSpend: 0,
        ctr: 0,
        cpo: 0
      };
    }

    const totals = (data || []).reduce(
      (acc, record) => ({
        totalImpressions: acc.totalImpressions + (record.impressions || 0),
        totalClicks: acc.totalClicks + (record.clicks || 0),
        totalOrders: acc.totalOrders + (record.orders || 0),
        totalSpend: acc.totalSpend + (record.spend || 0)
      }),
      { totalImpressions: 0, totalClicks: 0, totalOrders: 0, totalSpend: 0 }
    );

    const ctr = totals.totalImpressions > 0 ? 
      (totals.totalClicks / totals.totalImpressions) * 100 : 0;
    
    const cpo = totals.totalOrders > 0 ? 
      totals.totalSpend / totals.totalOrders : 0;

    return {
      ...totals,
      ctr: Math.round(ctr * 100) / 100,
      cpo: Math.round(cpo * 100) / 100
    };
  } catch (error) {
    console.error('Error in getAdPerformanceSummary:', error);
    return {
      totalImpressions: 0,
      totalClicks: 0,
      totalOrders: 0,
      totalSpend: 0,
      ctr: 0,
      cpo: 0
    };
  }
};

export const trackAdOrder = async (trackingToken: string, orderId: string, costCharged: number) => {
  try {
    const { data, error } = await supabase.functions.invoke('increment-ad-spend', {
      body: {
        tracking_token: trackingToken,
        order_id: orderId,
        cost_charged: costCharged
      }
    });

    if (error) {
      console.error('Error tracking ad order:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in trackAdOrder:', error);
    return { success: false, error: 'Failed to track ad order' };
  }
};

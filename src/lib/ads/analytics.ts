
import { supabase } from '@/integrations/supabase/client';

export interface AdAnalytics {
  date: string;
  impressions: number;
  clicks: number;
  orders: number;
  spend: number;
}

// Mock analytics since ad_analytics table doesn't exist in TypeScript schema yet
export const getAdAnalytics = async (adId: string): Promise<AdAnalytics[]> => {
  try {
    // Return mock data for now since the table schema isn't updated yet
    console.log('Getting ad analytics for ad:', adId);
    
    // Generate mock analytics data for the last 30 days
    const mockAnalytics: AdAnalytics[] = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      mockAnalytics.push({
        date: date.toISOString().split('T')[0],
        impressions: Math.floor(Math.random() * 100) + 10,
        clicks: Math.floor(Math.random() * 20) + 1,
        orders: Math.floor(Math.random() * 5),
        spend: Math.floor(Math.random() * 50) + 5
      });
    }

    return mockAnalytics;
  } catch (error) {
    console.error('Error in getAdAnalytics:', error);
    return [];
  }
};

export const getAdPerformanceSummary = async (adId: string) => {
  try {
    // Return mock performance summary for now
    console.log('Getting ad performance summary for ad:', adId);
    
    const mockSummary = {
      totalImpressions: Math.floor(Math.random() * 3000) + 500,
      totalClicks: Math.floor(Math.random() * 500) + 50,
      totalOrders: Math.floor(Math.random() * 100) + 10,
      totalSpend: Math.floor(Math.random() * 1000) + 100,
      ctr: 0,
      cpo: 0
    };

    mockSummary.ctr = mockSummary.totalImpressions > 0 ? 
      Math.round((mockSummary.totalClicks / mockSummary.totalImpressions) * 10000) / 100 : 0;
    
    mockSummary.cpo = mockSummary.totalOrders > 0 ? 
      Math.round((mockSummary.totalSpend / mockSummary.totalOrders) * 100) / 100 : 0;

    return mockSummary;
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
    console.log('Tracking ad order:', { trackingToken, orderId, costCharged });

    // Use edge function to track the ad order
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


import { supabase } from '@/integrations/supabase/client';

// Calculate commission for a transaction
export const calculateCommission = async (userRole: string, amount: number): Promise<number> => {
  try {
    // Always use fallback commission since calculate_commission function doesn't exist yet
    console.log('Using fallback commission calculation');
    return amount * 0.025; // 2.5% commission
  } catch (error) {
    console.log('Using fallback commission calculation:', error);
    return amount * 0.025;
  }
};

// Get commission rates (mock implementation)
export const getCommissionRates = async () => {
  try {
    // Always return mock data since commission_rates table doesn't exist yet
    console.log('Using mock commission rates');
    return [
      { id: '1', role: 'wholesaler', rate: 0.025 },
      { id: '2', role: 'seller', rate: 0.025 }
    ];
  } catch (error) {
    console.log('Using mock commission rates:', error);
    return [
      { id: '1', role: 'wholesaler', rate: 0.025 },
      { id: '2', role: 'seller', rate: 0.025 }
    ];
  }
};

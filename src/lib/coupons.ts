
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

export interface Coupon {
  id: string;
  wholesaler_id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  usage_limit?: number;
  used_count: number;
  min_order_amount?: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  target_products?: string[];
  target_buyers?: string[];
  created_at: string;
  // Joined data
  profiles?: {
    contact_name?: string;
    business_name?: string;
  };
}

export interface CouponUsage {
  id: string;
  coupon_id: string;
  user_id: string;
  order_id?: string;
  discount_amount: number;
  used_at: string;
}

// Create a new coupon
export const createCoupon = async (couponData: Omit<Coupon, 'id' | 'used_count' | 'created_at' | 'profiles'>): Promise<Coupon> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('coupons')
      .insert([{
        ...couponData,
        wholesaler_id: user.id,
        used_count: 0
      }])
      .select()
      .maybeSingle();

    if (error) throw error;
    
    if (!data) {
      throw new Error('Failed to create coupon - no data returned');
    }
    
    return data as Coupon;
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw error;
  }
};

// Get wholesaler's coupons
export const getWholesalerCoupons = async (): Promise<Coupon[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('coupons')
      .select(`
        *,
        profiles:wholesaler_id (
          contact_name,
          business_name
        )
      `)
      .eq('wholesaler_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Coupon[];
  } catch (error) {
    console.error('Error fetching wholesaler coupons:', error);
    throw error;
  }
};

// Get all active coupons (for admin)
export const getAllCoupons = async (): Promise<Coupon[]> => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select(`
        *,
        profiles:wholesaler_id (
          contact_name,
          business_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Coupon[];
  } catch (error) {
    console.error('Error fetching all coupons:', error);
    throw error;
  }
};

// Validate and apply coupon
export const validateCoupon = async (code: string, orderAmount: number): Promise<{
  valid: boolean;
  coupon?: Coupon;
  discount?: number;
  error?: string;
}> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get coupon by code
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !coupon) {
      return { valid: false, error: 'Invalid coupon code' };
    }

    const couponData = coupon as Coupon;

    // Check if coupon is within valid date range
    const now = new Date();
    const validFrom = new Date(couponData.valid_from);
    const validUntil = new Date(couponData.valid_until);

    if (now < validFrom || now > validUntil) {
      return { valid: false, error: 'Coupon has expired or is not yet active' };
    }

    // Check usage limit
    if (couponData.usage_limit && couponData.used_count >= couponData.usage_limit) {
      return { valid: false, error: 'Coupon usage limit exceeded' };
    }

    // Check minimum order amount
    if (couponData.min_order_amount && orderAmount < couponData.min_order_amount) {
      return { 
        valid: false, 
        error: `Minimum order amount of Rs. ${couponData.min_order_amount} required` 
      };
    }

    // Check if user has already used this coupon
    const { data: existingUsage } = await supabase
      .from('coupon_usage')
      .select('id')
      .eq('coupon_id', couponData.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingUsage) {
      return { valid: false, error: 'You have already used this coupon' };
    }

    // Calculate discount
    let discount = 0;
    if (couponData.discount_type === 'percentage') {
      discount = (orderAmount * couponData.discount_value) / 100;
    } else {
      discount = couponData.discount_value;
    }

    // Ensure discount doesn't exceed order amount
    discount = Math.min(discount, orderAmount);

    return {
      valid: true,
      coupon: couponData,
      discount
    };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { valid: false, error: 'Error validating coupon' };
  }
};

// Apply coupon (record usage)
export const applyCoupon = async (couponId: string, orderId: string, discountAmount: number): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Record coupon usage
    const { error: usageError } = await supabase
      .from('coupon_usage')
      .insert([{
        coupon_id: couponId,
        user_id: user.id,
        order_id: orderId,
        discount_amount: discountAmount
      }]);

    if (usageError) throw usageError;

    // Update coupon used count using the database function
    const { error: updateError } = await supabase
      .rpc('increment_coupon_usage', { coupon_id: couponId });

    if (updateError) {
      console.warn('Failed to update coupon usage count:', updateError);
      // Continue execution as the usage was recorded
    }
  } catch (error) {
    console.error('Error applying coupon:', error);
    throw error;
  }
};

// Update coupon status (for admin or wholesaler)
export const updateCouponStatus = async (couponId: string, isActive: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: isActive })
      .eq('id', couponId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating coupon status:', error);
    throw error;
  }
};

// Get coupon usage statistics
export const getCouponUsageStats = async (couponId: string) => {
  try {
    const { data, error } = await supabase
      .from('coupon_usage')
      .select(`
        *,
        profiles:user_id (
          contact_name,
          business_name
        )
      `)
      .eq('coupon_id', couponId)
      .order('used_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching coupon usage stats:', error);
    throw error;
  }
};

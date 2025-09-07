import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

export interface EnhancedOrderData {
  shopId: string;
  totalAmount: number;
  paymentMethod?: 'bank_transfer' | 'jazzcash' | 'easypaisa' | 'cash_on_delivery';
  buyerName?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  buyerStreetAddress?: string;
  buyerArea?: string;
  buyerCity?: string;
  buyerProvince?: string;
  buyerPostalCode?: string;
  deliveryInstructions?: string;
  shippingMethod?: string;
  shippingCost?: number;
  paymentScreenshot?: File;
  isGuestOrder?: boolean;
}

export const createOrderWithPaymentEnhanced = async (orderData: EnhancedOrderData): Promise<string | null> => {
  try {
    const user = await getCurrentUser();
    
    // Allow guest orders
    if (!user && !orderData.isGuestOrder) {
      throw new Error('User not authenticated');
    }
    
    // Validate input
    if (!orderData.shopId || !orderData.totalAmount) {
      throw new Error('Shop ID and total amount are required');
    }
    
    if (orderData.totalAmount <= 0) {
      throw new Error('Order amount must be greater than 0');
    }
    
    // Check shop exists and get owner
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('owner_id, name')
      .eq('id', orderData.shopId)
      .single();
    
    if (shopError || !shop) {
      throw new Error('Shop not found');
    }
    
    // Prevent self-ordering for authenticated users
    if (user && shop.owner_id === user.id) {
      throw new Error('You cannot order from your own shop');
    }
    
    // Upload payment screenshot if provided
    let screenshotUrl = null;
    if (orderData.paymentScreenshot) {
      const fileExt = orderData.paymentScreenshot.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `payment-screenshots/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(filePath, orderData.paymentScreenshot);
      
      if (uploadError) {
        console.error('Screenshot upload error:', uploadError);
        throw new Error('Failed to upload payment screenshot');
      }
      
      screenshotUrl = filePath;
    }
    
    // Create the order with enhanced address fields
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        buyer_id: user?.id || '00000000-0000-0000-0000-000000000000',
        shop_id: orderData.shopId,
        total_amount: orderData.totalAmount,
        payment_method: orderData.paymentMethod || 'bank_transfer',
        payment_screenshot: screenshotUrl,
        buyer_name: orderData.buyerName,
        buyer_phone: orderData.buyerPhone,
        buyer_address: orderData.buyerAddress,
        buyer_street_address: orderData.buyerStreetAddress,
        buyer_area: orderData.buyerArea,
        buyer_city: orderData.buyerCity,
        buyer_province: orderData.buyerProvince || 'Punjab',
        buyer_postal_code: orderData.buyerPostalCode,
        delivery_instructions: orderData.deliveryInstructions,
        shipping_method: orderData.shippingMethod || 'standard',
        shipping_cost: orderData.shippingCost || 0,
        is_guest_order: !user,
        status: 'pending',
        screenshot_uploaded_at: screenshotUrl ? new Date().toISOString() : null
      }])
      .select()
      .single();
    
    if (orderError) {
      console.error('Order creation error:', orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }
    
    return order.id;
  } catch (error: any) {
    console.error('Error in createOrderWithPaymentEnhanced:', error);
    throw error;
  }
};
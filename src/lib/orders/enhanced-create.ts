import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { GUEST_USER_UUID } from '@/lib/constants';
import { sanitizeUserInput } from '@/lib/security/content-sanitizer';

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

// Sanitize order input fields to prevent XSS
const sanitizeOrderData = (orderData: EnhancedOrderData) => ({
  buyerName: orderData.buyerName ? sanitizeUserInput(orderData.buyerName, 100) : undefined,
  buyerPhone: orderData.buyerPhone ? sanitizeUserInput(orderData.buyerPhone, 20) : undefined,
  buyerAddress: orderData.buyerAddress ? sanitizeUserInput(orderData.buyerAddress, 500) : undefined,
  buyerStreetAddress: orderData.buyerStreetAddress ? sanitizeUserInput(orderData.buyerStreetAddress, 300) : undefined,
  buyerArea: orderData.buyerArea ? sanitizeUserInput(orderData.buyerArea, 100) : undefined,
  buyerCity: orderData.buyerCity ? sanitizeUserInput(orderData.buyerCity, 100) : undefined,
  buyerProvince: orderData.buyerProvince ? sanitizeUserInput(orderData.buyerProvince, 50) : 'Punjab',
  buyerPostalCode: orderData.buyerPostalCode ? sanitizeUserInput(orderData.buyerPostalCode, 10) : undefined,
  deliveryInstructions: orderData.deliveryInstructions ? sanitizeUserInput(orderData.deliveryInstructions, 500) : undefined,
});

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
    
    // Sanitize all user-provided text fields to prevent XSS
    const sanitized = sanitizeOrderData(orderData);
    
    // Create the order with sanitized address fields
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        buyer_id: user?.id || GUEST_USER_UUID,
        shop_id: orderData.shopId,
        total_amount: orderData.totalAmount,
        payment_method: orderData.paymentMethod || 'bank_transfer',
        payment_screenshot: screenshotUrl,
        buyer_name: sanitized.buyerName,
        buyer_phone: sanitized.buyerPhone,
        buyer_address: sanitized.buyerAddress,
        buyer_street_address: sanitized.buyerStreetAddress,
        buyer_area: sanitized.buyerArea,
        buyer_city: sanitized.buyerCity,
        buyer_province: sanitized.buyerProvince,
        buyer_postal_code: sanitized.buyerPostalCode,
        delivery_instructions: sanitized.deliveryInstructions,
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
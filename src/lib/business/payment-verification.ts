
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

export interface PaymentVerificationResult {
  isValid: boolean;
  score: number; // 0-100
  risks: string[];
  recommendations: string[];
}

export const verifyPaymentScreenshot = async (
  orderId: string,
  screenshotPath: string
): Promise<PaymentVerificationResult> => {
  const result: PaymentVerificationResult = {
    isValid: false,
    score: 0,
    risks: [],
    recommendations: []
  };

  try {
    // Get order details
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      result.risks.push('Order not found');
      return result;
    }

    // Basic file validation
    if (!screenshotPath) {
      result.risks.push('No payment screenshot provided');
      return result;
    }

    // Check file exists in storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('payment-screenshots')
      .download(screenshotPath);

    if (fileError || !fileData) {
      result.risks.push('Payment screenshot file not accessible');
      return result;
    }

    // File size validation
    if (fileData.size > 102400) { // 100KB
      result.risks.push('Payment screenshot file too large');
      return result;
    }

    if (fileData.size < 1024) { // 1KB
      result.risks.push('Payment screenshot file suspiciously small');
    }

    // Basic scoring based on available data
    let score = 50; // Base score

    // Upload timing check
    const uploadTime = new Date(order.screenshot_uploaded_at || Date.now());
    const orderTime = new Date(order.created_at);
    const timeDiff = uploadTime.getTime() - orderTime.getTime();

    if (timeDiff < 60000) { // Less than 1 minute
      result.risks.push('Screenshot uploaded very quickly after order');
      score -= 10;
    } else if (timeDiff > 3600000) { // More than 1 hour
      result.risks.push('Screenshot uploaded long after order creation');
      score -= 5;
    } else {
      score += 10;
    }

    // File type validation (basic)
    const fileType = fileData.type;
    if (fileType && ['image/jpeg', 'image/png', 'image/webp'].includes(fileType)) {
      score += 15;
    } else {
      result.risks.push('Invalid file type for payment screenshot');
      score -= 20;
    }

    // Payment method consistency
    if (order.payment_method) {
      score += 10;
      result.recommendations.push(`Verify ${order.payment_method} transaction details`);
    }

    // Order amount verification
    if (order.total_amount) {
      if (order.total_amount > 100000) { // High value orders
        result.recommendations.push('High value transaction - requires manual verification');
        score += 5;
      }
    }

    result.score = Math.max(0, Math.min(100, score));
    result.isValid = result.score >= 60 && result.risks.length === 0;

    if (result.score >= 80) {
      result.recommendations.push('Payment verification looks good');
    } else if (result.score >= 60) {
      result.recommendations.push('Payment requires manual review');
    } else {
      result.recommendations.push('Payment verification failed - manual investigation required');
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    result.risks.push('Payment verification system error');
  }

  return result;
};

export const checkPaymentMethodConsistency = async (
  orderId: string,
  reportedMethod: string
): Promise<boolean> => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        payment_method,
        shops!inner(owner_id)
      `)
      .eq('id', orderId)
      .single();

    if (error || !order) return false;

    // Check if the reported payment method matches order record
    if (order.payment_method !== reportedMethod) {
      return false;
    }

    // Get wholesaler's payment methods separately
    const { data: paymentMethods, error: pmError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('wholesaler_id', order.shops.owner_id)
      .eq('is_active', true);

    if (pmError || !paymentMethods) return false;

    // Check if wholesaler accepts this payment method
    const acceptsMethod = paymentMethods.some((pm: any) => {
      switch (reportedMethod) {
        case 'jazzcash':
          return pm.jazzcash_number && pm.is_active;
        case 'easypaisa':
          return pm.easypaisa_number && pm.is_active;
        case 'bank_transfer':
          return pm.bank_name && pm.account_number && pm.is_active;
        default:
          return false;
      }
    });

    return acceptsMethod;
  } catch (error) {
    console.error('Payment method consistency check error:', error);
    return false;
  }
};

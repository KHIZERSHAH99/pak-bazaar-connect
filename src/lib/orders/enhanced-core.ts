
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { validateOrderCreation, validateOrderStatusChange } from '@/lib/business/order-validation';
import { verifyPaymentScreenshot } from '@/lib/business/payment-verification';
import { createCommissionRecord } from '@/lib/business/commission-calculator';
import { auditLogger } from '@/lib/security/audit-logger';
import { transactionLogger } from '@/lib/security/transaction-logger';
import { securityMonitor } from '@/lib/security/monitoring';

export const createOrderWithBusinessLogic = async (
  shopId: string,
  totalAmount: number,
  paymentData: {
    method: string;
    screenshot: File;
    buyerName: string;
    buyerPhone: string;
    buyerAddress: string;
  }
) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  // Step 1: Validate order creation
  const validation = await validateOrderCreation(shopId, totalAmount, {
    name: paymentData.buyerName,
    phone: paymentData.buyerPhone,
    address: paymentData.buyerAddress
  });

  if (!validation.isValid) {
    await auditLogger.logError('order_validation_failed', 'orders', {
      shopId,
      errors: validation.errors,
      userId: user.id
    });
    throw new Error(`Order validation failed: ${validation.errors.join(', ')}`);
  }

  // Log warnings if any
  if (validation.warnings.length > 0) {
    await auditLogger.logWarning('order_validation_warnings', 'orders', {
      warnings: validation.warnings,
      userId: user.id
    });
  }

  // Step 2: Check rate limiting
  if (!securityMonitor.checkRateLimit(`order_creation_${user.id}`, 10, 60000)) {
    await securityMonitor.reportSecurityEvent({
      type: 'rate_limit_exceeded',
      severity: 'medium',
      details: { action: 'order_creation', userId: user.id }
    });
    throw new Error('Too many order creation attempts. Please wait before trying again.');
  }

  // Step 3: Upload and verify payment screenshot
  const fileExt = paymentData.screenshot.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('payment-screenshots')
    .upload(fileName, paymentData.screenshot);

  if (uploadError) {
    await auditLogger.logError('payment_upload_failed', 'payments', {
      error: uploadError.message,
      userId: user.id
    });
    throw new Error(`Failed to upload payment screenshot: ${uploadError.message}`);
  }

  // Step 4: Create order with comprehensive logging
  const orderData = {
    buyer_id: user.id,
    shop_id: shopId,
    total_amount: totalAmount,
    payment_method: paymentData.method,
    payment_screenshot: uploadData.path,
    buyer_name: paymentData.buyerName,
    buyer_phone: paymentData.buyerPhone,
    buyer_address: paymentData.buyerAddress,
    screenshot_uploaded_at: new Date().toISOString(),
    status: 'pending'
  };

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([orderData])
    .select(`
      *,
      shops!inner(name, contact, address, owner_id),
      profiles!orders_buyer_id_fkey(email)
    `)
    .single();

  if (orderError) {
    await auditLogger.logError('order_creation_failed', 'orders', {
      error: orderError.message,
      orderData,
      userId: user.id
    });
    throw new Error(`Failed to create order: ${orderError.message}`);
  }

  // Step 5: Log successful order creation
  await transactionLogger.logOrderCreation(order.id, orderData);
  await auditLogger.logInfo('order_created_successfully', 'orders', {
    orderId: order.id,
    shopId,
    totalAmount,
    userId: user.id
  });

  // Step 6: Verify payment screenshot
  const paymentVerification = await verifyPaymentScreenshot(order.id, uploadData.path);
  if (!paymentVerification.isValid) {
    await auditLogger.logWarning('payment_verification_failed', 'payments', {
      orderId: order.id,
      score: paymentVerification.score,
      risks: paymentVerification.risks
    });
  }

  // Step 7: Log payment upload
  await transactionLogger.logPaymentUpload(order.id, {
    method: paymentData.method,
    screenshotPath: uploadData.path,
    verificationScore: paymentVerification.score
  });

  return {
    ...order,
    paymentVerification
  };
};

export const confirmOrderWithBusinessLogic = async (orderId: string, notes?: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  // Validate status change
  const validation = await validateOrderStatusChange(orderId, 'confirmed', notes);
  if (!validation.isValid) {
    throw new Error(`Order confirmation failed: ${validation.errors.join(', ')}`);
  }

  // Update order status
  const { data: order, error } = await supabase
    .from('orders')
    .update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      wholesaler_notes: notes
    })
    .eq('id', orderId)
    .select(`
      *,
      shops!inner(owner_id, name)
    `)
    .single();

  if (error) {
    await auditLogger.logError('order_confirmation_failed', 'orders', {
      orderId,
      error: error.message,
      userId: user.id
    });
    throw new Error(`Failed to confirm order: ${error.message}`);
  }

  // Create commission record
  const commissionId = await createCommissionRecord(
    orderId,
    order.shops.owner_id,
    order.total_amount
  );

  // Log transaction
  await transactionLogger.logOrderStatusChange(orderId, 'pending', 'confirmed', {
    wholesalerNotes: notes,
    commissionId
  });

  await auditLogger.logInfo('order_confirmed_successfully', 'orders', {
    orderId,
    wholesalerId: user.id,
    commissionId
  });

  return order;
};

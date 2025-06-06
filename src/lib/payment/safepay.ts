
import { supabase } from '@/integrations/supabase/client';

export interface SafepayConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  webhookSecret?: string;
}

export interface SafepayPayment {
  amount: number;
  currency: string;
  orderId: string;
  customerEmail: string;
  customerPhone?: string;
  description: string;
  successUrl: string;
  cancelUrl: string;
}

export interface SafepayResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  error?: string;
}

// Initialize Safepay payment
export const createSafepayPayment = async (payment: SafepayPayment): Promise<SafepayResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('create-safepay-payment', {
      body: payment
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error: any) {
    console.error('Safepay payment creation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create payment'
    };
  }
};

// Verify Safepay payment status
export const verifySafepayPayment = async (transactionId: string): Promise<any> => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-safepay-payment', {
      body: { transactionId }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error: any) {
    console.error('Safepay payment verification error:', error);
    throw error;
  }
};

// Get Safepay payment methods
export const getSafepayMethods = () => {
  return [
    {
      id: 'safepay_card',
      name: 'Credit/Debit Card',
      type: 'card',
      processingFee: 0.025, // 2.5%
      minAmount: 100,
      maxAmount: 1000000,
      isActive: true
    },
    {
      id: 'safepay_bank',
      name: 'Bank Transfer',
      type: 'bank_transfer',
      processingFee: 0.015, // 1.5%
      minAmount: 1000,
      maxAmount: 5000000,
      isActive: true
    },
    {
      id: 'safepay_wallet',
      name: 'Mobile Wallet',
      type: 'mobile_wallet',
      processingFee: 0.02, // 2%
      minAmount: 50,
      maxAmount: 250000,
      isActive: true
    }
  ];
};


// Enhanced payment flow types
export interface PaymentMethodInfo {
  id: string;
  wholesaler_id: string;
  bank_name?: string;
  account_number?: string;
  account_title?: string;
  jazzcash_number?: string;
  easypaisa_number?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OrderFormData {
  productName: string;
  quantity: number;
  price: number;
  totalAmount: number;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  paymentMethod: 'bank_transfer' | 'jazzcash' | 'easypaisa';
  paymentScreenshot: File | null;
}

export interface CommissionSettings {
  id: string;
  commission_percentage: number;
  effective_from: string;
  created_by?: string;
  created_at?: string;
}

export interface MonthlyCommission {
  id: string;
  wholesaler_id: string;
  month: string;
  total_sales: number;
  commission_amount: number;
  commission_percentage: number;
  payment_status: 'unpaid' | 'paid' | 'overdue';
  paid_at?: string;
  due_date?: string;
  created_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order_status' | 'commission' | 'suspension' | 'general';
  read_at?: string;
  created_at?: string;
}

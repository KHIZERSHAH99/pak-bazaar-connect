
export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  processing_fee: number;
  min_amount: number;
  max_amount: number | null;
}

export interface Transaction {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  commission_amount: number;
  payment_method_id: string;
  status: string;
  payment_reference?: string;
  created_at: string;
  completed_at?: string;
}

export interface CommissionRate {
  id: string;
  role: string;
  rate: number;
}

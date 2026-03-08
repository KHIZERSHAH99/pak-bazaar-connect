
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UnifiedOrderManagement from '@/components/orders/UnifiedOrderManagement';

const OrdersManagement = () => {
  const { profile } = useAuth();
  const userRole = profile?.role === 'seller' ? 'seller' : 'wholesaler';
  
  return <UnifiedOrderManagement userRole={userRole} />;
};

export default OrdersManagement;

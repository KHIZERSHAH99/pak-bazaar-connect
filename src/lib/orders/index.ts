// Consolidated orders module - single entry point for all order functionality
export { 
  createOrderWithPayment, 
  confirmOrder, 
  rejectOrder, 
  reusePreviousOrder 
} from './core';

export { 
  getWholesalerOrders, 
  getSellerOrders 
} from './queries';


export { 
  sendOrderMessage, 
  getOrderMessages 
} from './messaging';

export { 
  getWholesalerPaymentMethods 
} from './payments';

// Re-export enhanced functions with better names
export { 
  createOrderWithPaymentEnhanced as createEnhancedOrder,
  confirmOrderEnhanced as confirmEnhancedOrder,
  rejectOrderEnhanced as rejectEnhancedOrder,
  getOrderWithSecurity as getSecureOrder
} from './core-enhanced';

export {
  createOrderWithBusinessLogic as createBusinessOrder,
  confirmOrderWithBusinessLogic as confirmBusinessOrder
} from './enhanced-core';
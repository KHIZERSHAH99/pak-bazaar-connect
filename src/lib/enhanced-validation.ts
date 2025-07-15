import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

// Enhanced Pakistani business validation
export const validatePakistaniPhone = (phone: string): boolean => {
  // Pakistani phone number validation: +92 or 0 followed by 3XX-XXXXXXX
  const phoneRegex = /^(\+92|0)?3[0-9]{2}[0-9]{7}$/;
  const cleanPhone = phone.replace(/[-\s]/g, '');
  return phoneRegex.test(cleanPhone);
};

export const validateCNIC = (cnic: string): boolean => {
  // Pakistani CNIC validation: XXXXX-XXXXXXX-X
  const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
  const cleanCnic = cnic.trim();
  
  if (!cnicRegex.test(cleanCnic)) {
    return false;
  }
  
  // Check for invalid patterns
  const digits = cleanCnic.replace(/-/g, '');
  if (digits === '0000000000000' || digits === '1111111111111') {
    return false;
  }
  
  return true;
};

export const validateBusinessAddress = (address: string): boolean => {
  return address.trim().length >= 10 && address.trim().length <= 200;
};

export const validateCity = (city: string): boolean => {
  const pakistaniCities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
    'Hyderabad', 'Sukkur', 'Bahawalpur', 'Sargodha', 'Mardan'
  ];
  return pakistaniCities.some(validCity => 
    validCity.toLowerCase() === city.trim().toLowerCase()
  );
};

// Product validation
export const validateProductData = (productData: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!productData.name?.trim()) {
    errors.push('Product name is required');
  } else if (productData.name.trim().length < 3) {
    errors.push('Product name must be at least 3 characters');
  } else if (productData.name.trim().length > 100) {
    errors.push('Product name must not exceed 100 characters');
  }
  
  if (!productData.price || productData.price <= 0) {
    errors.push('Product price must be greater than 0');
  } else if (productData.price > 10000000) {
    errors.push('Product price seems unreasonably high');
  }
  
  if (productData.moq && (productData.moq < 1 || !Number.isInteger(productData.moq))) {
    errors.push('Minimum order quantity must be a positive integer');
  }
  
  if (productData.description && productData.description.length > 1000) {
    errors.push('Product description must not exceed 1000 characters');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Shop validation
export const validateShopData = (shopData: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!shopData.name?.trim()) {
    errors.push('Shop name is required');
  } else if (shopData.name.trim().length < 3) {
    errors.push('Shop name must be at least 3 characters');
  } else if (shopData.name.trim().length > 100) {
    errors.push('Shop name must not exceed 100 characters');
  }
  
  if (!shopData.contact?.trim()) {
    errors.push('Contact information is required');
  } else if (!validatePakistaniPhone(shopData.contact)) {
    errors.push('Please provide a valid Pakistani phone number');
  }
  
  if (!shopData.address?.trim()) {
    errors.push('Address is required');
  } else if (!validateBusinessAddress(shopData.address)) {
    errors.push('Address must be between 10 and 200 characters');
  }
  
  if (!shopData.postal_code?.trim()) {
    errors.push('Postal code is required');
  } else if (!/^\d{5}$/.test(shopData.postal_code.trim())) {
    errors.push('Postal code must be exactly 5 digits');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Order validation
export const validateOrderData = (orderData: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!orderData.shopId?.trim()) {
    errors.push('Shop ID is required');
  }
  
  if (!orderData.totalAmount || orderData.totalAmount <= 0) {
    errors.push('Order amount must be greater than 0');
  } else if (orderData.totalAmount > 1000000) {
    errors.push('Order amount seems unusually high. Please verify.');
  }
  
  if (orderData.buyerPhone && !validatePakistaniPhone(orderData.buyerPhone)) {
    errors.push('Please provide a valid Pakistani phone number');
  }
  
  if (orderData.buyerName && (orderData.buyerName.trim().length < 2 || orderData.buyerName.trim().length > 100)) {
    errors.push('Buyer name must be between 2 and 100 characters');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Security checks
export const checkUserPermissions = async (userId: string, action: string, resourceId?: string): Promise<boolean> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, is_suspended')
      .eq('id', userId)
      .single();
    
    if (error || !profile) {
      return false;
    }
    
    if (profile.is_suspended) {
      return false;
    }
    
    // Admin can do everything
    if (profile.role === 'admin') {
      return true;
    }
    
    // Role-specific permissions
    switch (action) {
      case 'create_product':
      case 'update_product':
      case 'manage_shop':
        return profile.role === 'wholesaler';
      
      case 'create_order':
        return profile.role === 'seller';
      
      case 'update_order_status':
        if (profile.role !== 'wholesaler' || !resourceId) return false;
        // Additional check: verify shop ownership
        const { data: order } = await supabase
          .from('orders')
          .select(`
            shop_id,
            shops!inner(owner_id)
          `)
          .eq('id', resourceId)
          .single();
        return order?.shops?.owner_id === userId;
      
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};

// Rate limiting check
export const checkRateLimit = async (userId: string, action: string): Promise<boolean> => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Check audit logs for recent actions
    const { data, error } = await supabase
      .from('audit_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('event_type', action)
      .gte('created_at', oneHourAgo.toISOString());
    
    if (error) {
      console.error('Error checking rate limit:', error);
      return true; // Allow if we can't check
    }
    
    // Different limits for different actions
    const limits: Record<string, number> = {
      'product_created': 10,
      'order_created': 20,
      'shop_created': 3,
      'role_changed': 2
    };
    
    const limit = limits[action] || 100;
    return (data?.length || 0) < limit;
  } catch (error) {
    console.error('Error in rate limit check:', error);
    return true; // Allow if error occurs
  }
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .slice(0, 1000); // Limit length
};

export const sanitizeBusinessData = (data: any): any => {
  const sanitized = { ...data };
  
  const stringFields = ['name', 'description', 'contact', 'address', 'business_name', 'industry'];
  stringFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = sanitizeInput(sanitized[field]);
    }
  });
  
  return sanitized;
};
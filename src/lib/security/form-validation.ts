import { validateAndSanitizeInput } from './validation';
import { validatePasswordStrength } from './password-validation';
import { supabase } from '@/integrations/supabase/client';

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  sanitizedData?: Record<string, any>;
}

export const validateSignupForm = async (formData: {
  email?: string;
  phoneNumber?: string;
  password: string;
  confirmPassword?: string;
  businessName?: string;
  contactName?: string;
  role: string;
  [key: string]: any;
}): Promise<FormValidationResult> => {
  const errors: Record<string, string[]> = {};
  const sanitizedData: Record<string, any> = {};

  try {
    // Validate and sanitize email or phone
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = ['Please enter a valid email address'];
      } else {
        sanitizedData.email = validateAndSanitizeInput(formData.email, 'text').toLowerCase();
      }
    }

    if (formData.phoneNumber) {
      // More flexible phone validation to accept various formats
      const phoneRegex = /^(\+92|92|0)?3[0-9]{2}[0-9]{7}$/;
      const cleanPhone = formData.phoneNumber.replace(/[-\s\(\)]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        errors.phoneNumber = ['Please enter a valid Pakistani phone number (format: 03XXXXXXXXX)'];
      } else {
        // Normalize to standard format
        let normalizedPhone = cleanPhone;
        if (normalizedPhone.startsWith('+92')) {
          normalizedPhone = '0' + normalizedPhone.substring(3);
        } else if (normalizedPhone.startsWith('92')) {
          normalizedPhone = '0' + normalizedPhone.substring(2);
        }
        sanitizedData.phoneNumber = normalizedPhone;
      }
    }

    // Validate password strength
    if (formData.password) {
      const passwordValidation = validatePasswordStrength(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.errors;
      } else {
        sanitizedData.password = formData.password; // Don't sanitize passwords
      }
    }

    // Validate password confirmation
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = ['Passwords do not match'];
    }

    // Validate and sanitize business information
    if (formData.businessName) {
      try {
        sanitizedData.businessName = validateAndSanitizeInput(formData.businessName, 'business');
        if (sanitizedData.businessName.length < 2) {
          errors.businessName = ['Business name must be at least 2 characters'];
        }
      } catch (error) {
        errors.businessName = ['Business name contains invalid characters'];
      }
    }

    if (formData.contactName) {
      try {
        sanitizedData.contactName = validateAndSanitizeInput(formData.contactName, 'text');
        if (sanitizedData.contactName.length < 2) {
          errors.contactName = ['Contact name must be at least 2 characters'];
        }
      } catch (error) {
        errors.contactName = ['Contact name contains invalid characters'];
      }
    }

    // Validate role
    const allowedRoles = ['wholesaler', 'seller'];
    if (!allowedRoles.includes(formData.role)) {
      errors.role = ['Please select a valid role'];
    } else {
      sanitizedData.role = formData.role;
    }

    // Additional sanitization for other fields
    const stringFields = ['industry', 'address', 'city', 'ntnNumber', 'strnNumber'];
    stringFields.forEach(field => {
      if (formData[field]) {
        try {
          sanitizedData[field] = validateAndSanitizeInput(formData[field], 'text');
        } catch (error) {
          if (!errors[field]) errors[field] = [];
          errors[field].push(`${field} contains invalid characters`);
        }
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData
    };

  } catch (error) {
    console.error('Form validation error:', error);
    return {
      isValid: false,
      errors: { general: ['Form validation failed. Please try again.'] }
    };
  }
};

export const validateLoginForm = async (formData: {
  email?: string;
  phoneNumber?: string;
  password: string;
}): Promise<FormValidationResult> => {
  const errors: Record<string, string[]> = {};
  const sanitizedData: Record<string, any> = {};

  try {
    // Rate limit check
    const identifier = formData.email || formData.phoneNumber || 'unknown';
    const rateLimitResponse = await supabase.functions.invoke('rate-limit-check', {
      body: { 
        action: 'login', 
        identifier,
        maxRequests: 5,
        windowMinutes: 15
      }
    });

    if (!rateLimitResponse.data?.allowed) {
      errors.general = ['Too many login attempts. Please try again later.'];
    }

    // Validate identifier
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = ['Please enter a valid email address'];
      } else {
        sanitizedData.email = validateAndSanitizeInput(formData.email, 'text').toLowerCase();
      }
    }

    if (formData.phoneNumber) {
      // More flexible phone validation to accept various formats
      const phoneRegex = /^(\+92|92|0)?3[0-9]{2}[0-9]{7}$/;
      const cleanPhone = formData.phoneNumber.replace(/[-\s\(\)]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        errors.phoneNumber = ['Please enter a valid Pakistani phone number (format: 03XXXXXXXXX)'];
      } else {
        // Normalize to standard format
        let normalizedPhone = cleanPhone;
        if (normalizedPhone.startsWith('+92')) {
          normalizedPhone = '0' + normalizedPhone.substring(3);
        } else if (normalizedPhone.startsWith('92')) {
          normalizedPhone = '0' + normalizedPhone.substring(2);
        }
        sanitizedData.phoneNumber = normalizedPhone;
      }
    }

    // Basic password validation (not strength, just presence)
    if (!formData.password || formData.password.length < 1) {
      errors.password = ['Password is required'];
    } else {
      sanitizedData.password = formData.password;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData
    };

  } catch (error) {
    console.error('Login form validation error:', error);
    return {
      isValid: false,
      errors: { general: ['Form validation failed. Please try again.'] }
    };
  }
};

export const validateOrderForm = async (formData: {
  shopId: string;
  totalAmount: number;
  buyerName?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  paymentMethod?: string;
}): Promise<FormValidationResult> => {
  const errors: Record<string, string[]> = {};
  const sanitizedData: Record<string, any> = {};

  try {
    // Rate limit check for order creation
    const user = (await supabase.auth.getUser()).data.user;
    if (user) {
      const rateLimitResponse = await supabase.functions.invoke('rate-limit-check', {
        body: { 
          action: 'order_create', 
          identifier: user.id,
          maxRequests: 10,
          windowMinutes: 60
        }
      });

      if (!rateLimitResponse.data?.allowed) {
        errors.general = ['Too many orders created recently. Please try again later.'];
      }
    }

    // Validate shop ID
    if (!formData.shopId || formData.shopId.trim().length === 0) {
      errors.shopId = ['Shop selection is required'];
    } else {
      sanitizedData.shopId = formData.shopId.trim();
    }

    // Validate order amount
    if (!formData.totalAmount || formData.totalAmount <= 0) {
      errors.totalAmount = ['Order amount must be greater than 0'];
    } else if (formData.totalAmount > 10000000) {
      errors.totalAmount = ['Order amount seems unusually high. Please verify.'];
    } else {
      sanitizedData.totalAmount = formData.totalAmount;
    }

    // Validate buyer information
    if (formData.buyerName) {
      try {
        sanitizedData.buyerName = validateAndSanitizeInput(formData.buyerName, 'text');
        if (sanitizedData.buyerName.length < 2) {
          errors.buyerName = ['Buyer name must be at least 2 characters'];
        }
      } catch (error) {
        errors.buyerName = ['Buyer name contains invalid characters'];
      }
    }

    if (formData.buyerPhone) {
      // More flexible phone validation to accept various formats
      const phoneRegex = /^(\+92|92|0)?3[0-9]{2}[0-9]{7}$/;
      const cleanPhone = formData.buyerPhone.replace(/[-\s\(\)]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        errors.buyerPhone = ['Please enter a valid Pakistani phone number (format: 03XXXXXXXXX)'];
      } else {
        // Normalize to standard format
        let normalizedPhone = cleanPhone;
        if (normalizedPhone.startsWith('+92')) {
          normalizedPhone = '0' + normalizedPhone.substring(3);
        } else if (normalizedPhone.startsWith('92')) {
          normalizedPhone = '0' + normalizedPhone.substring(2);
        }
        sanitizedData.buyerPhone = normalizedPhone;
      }
    }

    if (formData.buyerAddress) {
      try {
        sanitizedData.buyerAddress = validateAndSanitizeInput(formData.buyerAddress, 'text');
      } catch (error) {
        errors.buyerAddress = ['Address contains invalid characters'];
      }
    }

    // Validate payment method
    const allowedPaymentMethods = ['bank_transfer', 'jazzcash', 'easypaisa', 'cod'];
    if (formData.paymentMethod && !allowedPaymentMethods.includes(formData.paymentMethod)) {
      errors.paymentMethod = ['Please select a valid payment method'];
    } else if (formData.paymentMethod) {
      sanitizedData.paymentMethod = formData.paymentMethod;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData
    };

  } catch (error) {
    console.error('Order form validation error:', error);
    return {
      isValid: false,
      errors: { general: ['Form validation failed. Please try again.'] }
    };
  }
};

import { z } from 'zod';

// Enhanced validation schema with stronger security requirements
export const formSchema = z.object({
  phoneNumber: z.string()
    .regex(/^(\+92|0)?3[0-9]{2}[0-9]{7}$/, 'Please enter a valid Pakistani mobile number (03XX-XXXXXXX)')
    .refine(val => {
      const networkCodes = ['300', '301', '302', '303', '304', '305', '306', '307', '308', '309', '310', '311', '312', '313', '314', '315', '316', '317', '318', '319', '320', '321', '322', '323', '324', '325', '330', '331', '332', '333', '334', '335', '336', '337', '338', '339', '340', '341', '342', '343', '344', '345', '346', '347', '348', '349'];
      const normalized = val.replace(/[^0-9]/g, '');
      const prefix = normalized.slice(-10, -7);
      return networkCodes.includes(prefix);
    }, 'Please enter a valid Pakistani mobile network number'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .refine(val => !/^(password|123456|admin|test)/i.test(val), 'Password cannot be a common weak password'),
  
  confirmPassword: z.string(),
  
  contactName: z.string()
    .min(3, 'Contact name must be at least 3 characters')
    .max(50, 'Contact name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s\u0600-\u06FF]+$/, 'Contact name can only contain letters and spaces'),
  
  businessName: z.string()
    .min(5, 'Business name must be at least 5 characters')
    .max(100, 'Business name must not exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s\u0600-\u06FF&.-]+$/, 'Business name contains invalid characters')
    .refine(val => !/^(test|demo|sample|placeholder)/i.test(val), 'Please enter a real business name'),
  
  businessType: z.enum(['Manufacturer', 'Wholesaler', 'Distributor', 'Retailer', 'Other']),
  
  address: z.string()
    .min(15, 'Please enter your complete business address (minimum 15 characters)')
    .max(200, 'Address must not exceed 200 characters')
    .regex(/^[a-zA-Z0-9\s\u0600-\u06FF,.-/#]+$/, 'Address contains invalid characters'),
  
  city: z.string()
    .min(2, 'Please enter a valid city name')
    .max(30, 'City name is too long')
    .regex(/^[a-zA-Z\s\u0600-\u06FF]+$/, 'City name can only contain letters and spaces'),
  
  postalCode: z.string()
    .regex(/^\d{5}$/, 'Postal code must be exactly 5 digits')
    .optional()
    .or(z.literal('')),
  
  industry: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
}).refine(data => {
  // Block demo/test data patterns
  const demoPatterns = ['test', 'demo', 'sample', 'placeholder', 'example'];
  const businessLower = data.businessName.toLowerCase();
  return !demoPatterns.some(pattern => businessLower.includes(pattern));
}, {
  message: "Please enter a real business name, not test data",
  path: ['businessName']
});

export type FormValues = z.infer<typeof formSchema>;

export const industries = [
  'Textiles', 
  'Leather Goods', 
  'Electronics', 
  'Food Products', 
  'Pharmaceuticals', 
  'Surgical Instruments', 
  'Sports Goods', 
  'Furniture', 
  'Handicrafts', 
  'Construction Materials',
  'Agriculture',
  'Automotive Parts',
  'Chemicals',
  'Other'
];


import { z } from 'zod';

// Enhanced validation schema with stronger security requirements
export const formSchema = z.object({
  phoneNumber: z.string()
    .transform(val => val.replace(/[^0-9]/g, '')) // Remove all non-digits first
    .refine(val => /^03[0-9]{9}$/.test(val), 'Please enter a valid Pakistani mobile number'),
  
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
  
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
    .min(8, 'Please enter your business address (minimum 8 characters)')
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
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the Terms & Conditions to create an account"
  }),
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

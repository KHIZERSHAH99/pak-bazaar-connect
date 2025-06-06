
import { z } from 'zod';

export const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  businessName: z.string().min(3, 'Business name must be at least 3 characters'),
  businessType: z.enum(['Manufacturer', 'Wholesaler', 'Distributor', 'Retailer', 'Other']),
  ntnNumber: z.string().regex(/^\d{7}-\d{1}$/, 'NTN must be in format XXXXXXX-X (7 digits, dash, 1 digit)'),
  strnNumber: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    return /^\d{11,15}$/.test(val.replace(/[-\s]/g, ''));
  }, 'STRN must be 11-15 digits'),
  address: z.string().min(10, 'Please enter your complete business address'),
  city: z.string().min(2, 'Please enter a valid city name'),
  postalCode: z.string().regex(/^\d{5}$/, 'Postal code must be exactly 5 digits'),
  industry: z.string().min(2, 'Please select your industry'),
  yearsInBusiness: z.enum(['Less than 1 year', '1-3 years', '3-5 years', '5+ years']),
  contactName: z.string().min(3, 'Contact name must be at least 3 characters'),
  phoneNumber: z.string().regex(/^(\+92|0)?[0-9]{10,11}$/, 'Please enter a valid Pakistani phone number'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
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

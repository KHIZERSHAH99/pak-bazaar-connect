
import { z } from 'zod';

export const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  businessName: z.string().min(3, 'Business name must be at least 3 characters'),
  businessType: z.enum(['Manufacturer', 'Wholesaler', 'Distributor', 'Retailer', 'Other']),
  ntnNumber: z.string().min(7, 'NTN number must be at least 7 characters'),
  strnNumber: z.string().optional(),
  address: z.string().min(10, 'Please enter your complete business address'),
  city: z.string().min(2, 'Please enter a valid city name'),
  postalCode: z.string().min(5, 'Please enter a valid postal code'),
  industry: z.string().min(2, 'Please select your industry'),
  yearsInBusiness: z.enum(['Less than 1 year', '1-3 years', '3-5 years', '5+ years']),
  contactName: z.string().min(3, 'Contact name must be at least 3 characters'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
  whatsappNumber: z.string().optional(),
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

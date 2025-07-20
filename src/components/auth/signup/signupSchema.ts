
import { z } from 'zod';

export const formSchema = z.object({
  phoneNumber: z.string().min(11, 'Phone number must be at least 11 digits').regex(/^(\+92|92|0)?[0-9]{10,11}$/, 'Please enter a valid Pakistani phone number (e.g., 03001234567)'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  businessName: z.string().min(3, 'Business name must be at least 3 characters'),
  businessType: z.enum(['Manufacturer', 'Wholesaler', 'Distributor', 'Retailer', 'Other']),
  address: z.string().min(10, 'Please enter your complete business address'),
  city: z.string().min(2, 'Please enter a valid city name'),
  industry: z.string().optional(),
  contactName: z.string().min(3, 'Contact name must be at least 3 characters'),
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

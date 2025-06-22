
import { supabase } from '@/integrations/supabase/client';

// Demo data creation functions
export const createDemoData = async () => {
  try {
    // Insert demo categories if they don't exist
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('name');
    
    const categoryNames = existingCategories?.map(c => c.name) || [];
    
    if (!categoryNames.includes('Electronics')) {
      await supabase.from('categories').insert([
        { name: 'Electronics', description: 'Mobile phones, computers, accessories' },
        { name: 'Textiles', description: 'Clothing, fabrics, garments' },
        { name: 'Food & Beverages', description: 'Wholesale food items and drinks' },
        { name: 'Home & Garden', description: 'Furniture, home decor, tools' },
        { name: 'Automotive', description: 'Car parts, accessories, tools' }
      ]);
    }

    // Insert demo cities if they don't exist
    const { data: existingCities } = await supabase
      .from('cities')
      .select('name');
    
    const cityNames = existingCities?.map(c => c.name) || [];
    
    if (!cityNames.includes('Karachi')) {
      await supabase.from('cities').insert([
        { name: 'Karachi', province: 'Sindh' },
        { name: 'Lahore', province: 'Punjab' },
        { name: 'Islamabad', province: 'Federal Capital' },
        { name: 'Faisalabad', province: 'Punjab' },
        { name: 'Rawalpindi', province: 'Punjab' }
      ]);
    }

    console.log('Demo data created successfully');
  } catch (error) {
    console.error('Error creating demo data:', error);
  }
};

// Demo accounts info
export const demoAccounts = {
  admin: {
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin'
  },
  wholesaler: {
    email: 'wholesaler1@test.com',
    password: 'wholesaler123',
    role: 'wholesaler'
  },
  seller: {
    email: 'seller1@test.com',
    password: 'seller123',
    role: 'seller'
  }
};

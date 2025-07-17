
import { supabase } from '@/integrations/supabase/client';

export const createSampleProducts = async () => {
  // First check if we have any categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id')
    .limit(1);

  if (!categories || categories.length === 0) {
    // Create a sample category
    await supabase
      .from('categories')
      .insert([
        { name: 'Electronics', description: 'Electronic products and accessories' },
        { name: 'Clothing', description: 'Clothing and fashion items' },
        { name: 'Home & Garden', description: 'Home and garden products' }
      ]);
  }

  // Get the first shop
  const { data: shops } = await supabase
    .from('shops')
    .select('id')
    .limit(1);

  if (!shops || shops.length === 0) {
    console.log('No shops found, cannot create sample products');
    return;
  }

  // Create sample products
  const { data: newCategories } = await supabase
    .from('categories')
    .select('id')
    .limit(3);

  const sampleProducts = [
    {
      name: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 2500,
      shop_id: shops[0].id,
      category_id: newCategories?.[0]?.id || null,
      moq: 10,
      is_active: true,
      verification_status: 'approved',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&auto=format'
    },
    {
      name: 'Cotton T-Shirt',
      description: 'Comfortable cotton t-shirt available in multiple colors',
      price: 800,
      shop_id: shops[0].id,
      category_id: newCategories?.[1]?.id || null,
      moq: 50,
      is_active: true,
      verification_status: 'approved',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop&auto=format'
    },
    {
      name: 'Ceramic Plant Pot',
      description: 'Beautiful ceramic plant pot for indoor plants',
      price: 450,
      shop_id: shops[0].id,
      category_id: newCategories?.[2]?.id || null,
      moq: 20,
      is_active: true,
      verification_status: 'approved',
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=300&fit=crop&auto=format'
    }
  ];

  const { error } = await supabase
    .from('products')
    .insert(sampleProducts);

  if (error) {
    console.error('Error creating sample products:', error);
  } else {
    console.log('Sample products created successfully');
  }
};

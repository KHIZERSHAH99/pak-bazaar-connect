
export interface DemoProduct {
  id: string;
  shop_id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  is_active: boolean;
  verification_status: 'pending' | 'approved' | 'rejected';
  wholesaler: string;
  location: string;
  minOrder: number;
  category: string;
  inStock: boolean;
}

export const demoProducts: DemoProduct[] = [
  {
    id: '1',
    shop_id: 'shop-1',
    name: 'Premium Rice Basmati',
    description: 'High-quality Basmati rice from Punjab, perfect for export and local markets',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&auto=format',
    is_active: true,
    verification_status: 'approved',
    wholesaler: 'Punjab Rice Mills',
    location: 'Lahore, Punjab',
    minOrder: 50,
    category: 'Food & Agriculture',
    inStock: true
  },
  {
    id: '2',
    shop_id: 'shop-2',
    name: 'Cotton Fabric Rolls',
    description: 'High-grade cotton fabric rolls suitable for garment manufacturing',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=300&fit=crop&auto=format',
    is_active: true,
    verification_status: 'approved',
    wholesaler: 'Textile Industries Ltd',
    location: 'Faisalabad, Punjab',
    minOrder: 100,
    category: 'Textiles',
    inStock: true
  },
  {
    id: '3',
    shop_id: 'shop-3',
    name: 'Leather Jackets',
    description: 'Handcrafted leather jackets made from premium Pakistani leather',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop&auto=format',
    is_active: true,
    verification_status: 'approved',
    wholesaler: 'Sialkot Leather Works',
    location: 'Sialkot, Punjab',
    minOrder: 25,
    category: 'Leather Goods',
    inStock: true
  },
  {
    id: '4',
    shop_id: 'shop-4',
    name: 'Football Sports Equipment',
    description: 'Professional FIFA-approved footballs manufactured in Sialkot',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=300&fit=crop&auto=format',
    is_active: true,
    verification_status: 'approved',
    wholesaler: 'Sports Goods International',
    location: 'Sialkot, Punjab',
    minOrder: 50,
    category: 'Sports Equipment',
    inStock: true
  },
  {
    id: '5',
    shop_id: 'shop-5',
    name: 'Himalayan Pink Salt',
    description: 'Pure Himalayan pink salt directly from Khewra Salt Mines',
    price: 450,
    image: 'https://images.unsplash.com/photo-1614347175678-eb50b0e2c195?w=400&h=300&fit=crop&auto=format',
    is_active: true,
    verification_status: 'approved',
    wholesaler: 'Salt Traders Co.',
    location: 'Khewra, Punjab',
    minOrder: 200,
    category: 'Food & Agriculture',
    inStock: true
  },
  {
    id: '6',
    shop_id: 'shop-6',
    name: 'Surgical Instruments',
    description: 'High-precision surgical instruments manufactured to international standards',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&auto=format',
    is_active: true,
    verification_status: 'approved',
    wholesaler: 'Medical Instruments Ltd',
    location: 'Sialkot, Punjab',
    minOrder: 10,
    category: 'Medical Equipment',
    inStock: false
  },
  {
    id: '7',
    shop_id: 'shop-7',
    name: 'Mangoes - Sindhri Variety',
    description: 'Premium Sindhri mangoes from Sindh, export quality',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1605027990121-cbae9d0b9fca?w=400&h=300&fit=crop&auto=format',
    is_active: true,
    verification_status: 'approved',
    wholesaler: 'Sindh Fruit Exporters',
    location: 'Hyderabad, Sindh',
    minOrder: 30,
    category: 'Food & Agriculture',
    inStock: true
  },
  {
    id: '8',
    shop_id: 'shop-8',
    name: 'Cement Bags',
    description: 'High-quality Portland cement bags for construction projects',
    price: 1450,
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop&auto=format',
    is_active: true,
    verification_status: 'approved',
    wholesaler: 'Construction Materials Co.',
    location: 'Karachi, Sindh',
    minOrder: 100,
    category: 'Construction Materials',
    inStock: true
  },
  {
    id: '9',
    shop_id: 'shop-9',
    name: 'Carpets & Rugs',
    description: 'Handwoven traditional Pakistani carpets and rugs',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop&auto=format',
    is_active: true,
    verification_status: 'approved',
    wholesaler: 'Heritage Carpets',
    location: 'Lahore, Punjab',
    minOrder: 5,
    category: 'Home Decor',
    inStock: true
  },
  {
    id: '10',
    shop_id: 'shop-10',
    name: 'Electronics Components',
    description: 'High-quality electronic components for manufacturing',
    price: 850,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop&auto=format',
    is_active: true,
    verification_status: 'approved',
    wholesaler: 'Tech Components Ltd',
    location: 'Karachi, Sindh',
    minOrder: 500,
    category: 'Electronics',
    inStock: true
  },
  {
    id: '11',
    shop_id: 'shop-11',
    name: 'Fresh Citrus Fruits',
    description: 'Premium oranges and grapefruits from Sargodha orchards',
    price: 2800,
    image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=300&fit=crop&auto=format',
    is_active: true,
    verification_status: 'approved',
    wholesaler: 'Sargodha Citrus Co.',
    location: 'Sargodha, Punjab',
    minOrder: 40,
    category: 'Food & Agriculture',
    inStock: true
  },
  {
    id: '12',
    shop_id: 'shop-12',
    name: 'Handmade Pottery',
    description: 'Traditional clay pottery and ceramics from local artisans',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&auto=format',
    is_active: true,
    verification_status: 'approved',
    wholesaler: 'Punjab Pottery House',
    location: 'Multan, Punjab',
    minOrder: 20,
    category: 'Handicrafts',
    inStock: true
  }
];

// Helper function to get a product by ID
export const getProductById = (id: string): DemoProduct | undefined => {
  return demoProducts.find(product => product.id === id);
};

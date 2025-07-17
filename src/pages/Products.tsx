
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Product } from '@/lib/types';
import ProductsHeader from '@/components/products/ProductsHeader';
import ProductsFilters from '@/components/products/ProductsFilters';
import ProductsGrid from '@/components/products/ProductsGrid';
import HeaderAdBanner from '@/components/ads/HeaderAdBanner';
import SidebarAdBanner from '@/components/ads/SidebarAdBanner';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products...');
      
      let query = supabase
        .from('products')
        .select(`
          *,
          shops (
            id,
            name,
            address,
            city_id
          ),
          categories (
            id,
            name
          )
        `)
        .eq('is_active', true)
        .eq('verification_status', 'approved');

      // Apply filters
      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      if (minPrice) {
        query = query.gte('price', parseFloat(minPrice));
      }

      if (maxPrice) {
        query = query.lte('price', parseFloat(maxPrice));
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log('Fetched products:', data);
      setProducts(data || []);
    } catch (error: any) {
      console.error('Failed to fetch products:', error);
      toast({
        title: "Error loading products",
        description: error.message || "Failed to load products. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('name');

      if (error) throw error;
      setCities(data || []);
    } catch (error: any) {
      console.error('Error fetching cities:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCities();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedCity, searchTerm, minPrice, maxPrice]);

  const handleSearch = () => {
    fetchProducts();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedCity('all');
    setSelectedRating('all');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <Layout>
      <HeaderAdBanner />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductsHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <ProductsFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              selectedRating={selectedRating}
              setSelectedRating={setSelectedRating}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              categories={categories}
              cities={cities}
              onSearch={handleSearch}
              onClearFilters={clearFilters}
            />

            <ProductsGrid products={products} loading={loading} />
          </div>
          
          {/* Sidebar with Ad */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <SidebarAdBanner />
              
              {/* Additional sidebar content */}
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2 font-poppins">
                  🌟 Featured Suppliers
                </h3>
                <p className="text-sm text-green-700 font-poppins">
                  Connect with verified wholesalers offering premium products at competitive prices.
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2 font-poppins">
                  💡 Buying Tips
                </h3>
                <ul className="text-sm text-blue-700 space-y-1 font-poppins">
                  <li>• Compare prices from multiple suppliers</li>
                  <li>• Check minimum order quantities</li>
                  <li>• Verify supplier credentials</li>
                  <li>• Read product reviews</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;

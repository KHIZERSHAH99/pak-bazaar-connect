
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { Product } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProductsHeader from '@/components/products/ProductsHeader';
import ProductsFilters from '@/components/products/ProductsFilters';
import ProductsGrid from '@/components/products/ProductsGrid';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const Products: React.FC = () => {
  const [urlParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState(urlParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const { toast } = useToast();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Show/hide scroll-to-top based on scroll position
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products with filters:', {
        selectedCategory,
        selectedCity,
        minPrice,
        maxPrice
      });
      
      let query = supabase
        .from('products')
        .select(`
          *,
            shops!products_shop_id_fkey (
              id,
              name,
              contact,
              address,
              postal_code,
              logo,
              owner_id,
              commission_rate,
              created_at
            ),
          categories!products_category_id_fkey (
            id,
            name,
            description
          )
        `)
        .eq('is_active', true)
        .eq('verification_status', 'approved')
        .order('created_at', { ascending: false });

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      // Apply price filters
      if (minPrice) {
        query = query.gte('price', parseFloat(minPrice));
      }
      if (maxPrice) {
        query = query.lte('price', parseFloat(maxPrice));
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log('Fetched products:', data);
      
      // Filter by city if selected (client-side filtering since it's a nested field)
      let filteredData = data || [];
      
      // Client-side search filtering
      if (debouncedSearch.trim()) {
        const term = debouncedSearch.toLowerCase();
        filteredData = filteredData.filter(p =>
          p.name?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          (p as any).shops?.name?.toLowerCase().includes(term)
        );
      }

      setProducts(filteredData);
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
      console.error('Failed to fetch categories:', error);
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
      console.error('Failed to fetch cities:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCities();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedCity, minPrice, maxPrice, debouncedSearch]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
  };

  const handlePriceChange = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedCity('all');
    setMinPrice('');
    setMaxPrice('');
    setSearchTerm('');
  };

  return (
    <Layout 
      title="Products - Pak Bazaar Connect"
      description="Browse quality products from verified wholesalers across Pakistan"
    >
      <div className="container mx-auto px-4 py-8 xl:max-w-5xl">
        <ProductsHeader />
        
        <ProductsFilters
          categories={categories}
          cities={cities}
          selectedCategory={selectedCategory}
          selectedCity={selectedCity}
          minPrice={minPrice}
          maxPrice={maxPrice}
          searchTerm={searchTerm}
          onCategoryChange={handleCategoryChange}
          onCityChange={handleCityChange}
          onPriceChange={handlePriceChange}
          onSearchChange={setSearchTerm}
          onClearFilters={clearFilters}
        />
        
        <ProductsGrid products={products} loading={loading} />

        {/* Back to Top Button - Fixed Position, scroll-aware */}
        {showScrollTop && (
          <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Button 
              onClick={scrollToTop}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
              size="icon"
              aria-label="Back to top"
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Products;

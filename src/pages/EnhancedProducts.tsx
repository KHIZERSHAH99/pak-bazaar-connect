
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { getMarketplaceProducts, getCategories, getCities } from '@/lib/marketplace';
import { Product, Category, City } from '@/lib/types';
import ProductsHeader from '@/components/products/ProductsHeader';
import ProductsFilters from '@/components/products/ProductsFilters';
import EnhancedProductsGrid from '@/components/products/EnhancedProductsGrid';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import EnhancedSearch from '@/components/ui/enhanced-search';
import { Card } from '@/components/ui/card';

const EnhancedProducts: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Infinite scroll for products
  const {
    items: products,
    loading,
    hasMore,
    loadMore,
    refresh
  } = useInfiniteScroll<Product>({
    fetchFunction: async (page, limit) => {
      return getMarketplaceProducts({
        category_id: selectedCategory === 'all' ? undefined : selectedCategory,
        city_id: selectedCity === 'all' ? undefined : selectedCity,
        search: searchTerm || undefined,
        min_price: minPrice ? parseFloat(minPrice) : undefined,
        max_price: maxPrice ? parseFloat(maxPrice) : undefined,
        min_rating: selectedRating === 'all' ? undefined : parseInt(selectedRating),
        limit
      });
    },
    initialLimit: 12
  });

  // Load categories and cities on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, citiesData] = await Promise.all([
          getCategories(),
          getCities(),
        ]);
        
        setCategories(categoriesData);
        setCities(citiesData);
      } catch (error) {
        console.error('Failed to fetch categories and cities:', error);
      }
    };

    loadData();
  }, []);

  // Refresh products when filters change
  useEffect(() => {
    refresh();
  }, [selectedCategory, selectedCity, selectedRating, minPrice, maxPrice, searchTerm, refresh]);

  const handleSearch = (query: string) => {
    setSearchTerm(query);
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
    <Layout
      title="Products | Pak Bazaar Connect"
      description="Discover wholesale products from verified suppliers across Pakistan"
      keywords="wholesale products, Pakistan suppliers, B2B marketplace"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductsHeader />
        
        {/* Enhanced Search */}
        <Card className="p-6 mb-8">
          <EnhancedSearch
            onSearch={handleSearch}
            placeholder="Search products, suppliers, or categories..."
            className="max-w-2xl mx-auto"
          />
        </Card>

        {/* Filters */}
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
          onSearch={() => {}} // Search is handled by enhanced search
          onClearFilters={clearFilters}
        />

        {/* Results count */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600 font-poppins">
            {products.length} product{products.length !== 1 ? 's' : ''} found
            {hasMore && ' (showing first results)'}
          </p>
        </div>

        {/* Enhanced Products Grid with Infinite Scroll */}
        <EnhancedProductsGrid
          products={products}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </div>
    </Layout>
  );
};

export default EnhancedProducts;

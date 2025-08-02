
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { getMarketplaceProducts, getCategories, getCities } from '@/lib/marketplace';
import { Product, Category, City } from '@/lib/types';
import ProductsHeader from '@/components/products/ProductsHeader';
import ProductsFilters from '@/components/products/ProductsFilters';
import ProductsGrid from '@/components/products/ProductsGrid';

const WholesalerProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      // Filter for wholesaler products only
      const [productsData, categoriesData, citiesData] = await Promise.all([
        getMarketplaceProducts({
          category_id: selectedCategory === 'all' ? undefined : selectedCategory,
          city_id: selectedCity === 'all' ? undefined : selectedCity,
          search: searchTerm || undefined,
          min_price: minPrice ? parseFloat(minPrice) : undefined,
          max_price: maxPrice ? parseFloat(maxPrice) : undefined,
          min_rating: selectedRating === 'all' ? undefined : parseInt(selectedRating),
          limit: 50 // More products for wholesaler view
        }),
        getCategories(),
        getCities(),
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
      setCities(citiesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedCity]);

  const handleSearch = () => {
    fetchData();
  };

  const handlePriceChange = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">Wholesaler Products</h1>
          <p className="text-gray-600 font-poppins">Discover wholesale products from verified suppliers across Pakistan</p>
        </div>
        
        <ProductsFilters
          categories={categories}
          cities={cities}
          selectedCategory={selectedCategory}
          selectedCity={selectedCity}
          minPrice={minPrice}
          maxPrice={maxPrice}
          searchTerm={searchTerm}
          onCategoryChange={setSelectedCategory}
          onCityChange={setSelectedCity}
          onPriceChange={handlePriceChange}
          onSearchChange={setSearchTerm}
          onClearFilters={clearFilters}
        />

        
        <ProductsGrid products={products} loading={loading} />
      </div>
    </Layout>
  );
};

export default WholesalerProducts;

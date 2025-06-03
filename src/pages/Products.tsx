
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { getMarketplaceProducts, getCategories, getCities } from '@/lib/marketplace';
import { Product, Category, City } from '@/lib/types';
import ProductsHeader from '@/components/products/ProductsHeader';
import ProductsFilters from '@/components/products/ProductsFilters';
import ProductsGrid from '@/components/products/ProductsGrid';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, citiesData] = await Promise.all([
        getMarketplaceProducts({
          category_id: selectedCategory === 'all' ? undefined : selectedCategory,
          city_id: selectedCity === 'all' ? undefined : selectedCity,
          search: searchTerm || undefined,
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

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedCity('all');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductsHeader />
        
        <ProductsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          categories={categories}
          cities={cities}
          onSearch={handleSearch}
          onClearFilters={clearFilters}
        />

        <ProductsGrid products={products} loading={loading} />
      </div>
    </Layout>
  );
};

export default Products;

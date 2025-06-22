
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { getMarketplaceProducts, getCategories, getCities } from '@/lib/marketplace';
import { Product, Category, City } from '@/lib/types';
import ProductsHeader from '@/components/products/ProductsHeader';
import ProductsFilters from '@/components/products/ProductsFilters';
import ProductsGrid from '@/components/products/ProductsGrid';
import HeaderAdBanner from '@/components/ads/HeaderAdBanner';
import SidebarAdBanner from '@/components/ads/SidebarAdBanner';

const Products: React.FC = () => {
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
      const [productsData, categoriesData, citiesData] = await Promise.all([
        getMarketplaceProducts({
          category_id: selectedCategory === 'all' ? undefined : selectedCategory,
          city_id: selectedCity === 'all' ? undefined : selectedCity,
          search: searchTerm || undefined,
          min_price: minPrice ? parseFloat(minPrice) : undefined,
          max_price: maxPrice ? parseFloat(maxPrice) : undefined,
          min_rating: selectedRating === 'all' ? undefined : parseInt(selectedRating),
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

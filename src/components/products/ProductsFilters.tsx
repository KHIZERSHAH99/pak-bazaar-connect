
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Category, City } from '@/lib/types';
import { Filter } from 'lucide-react';

interface ProductsFiltersProps {
  categories: Category[];
  cities: City[];
  selectedCategory: string;
  selectedCity: string;
  minPrice: string;
  maxPrice: string;
  searchTerm: string;
  onCategoryChange: (category: string) => void;
  onCityChange: (city: string) => void;
  onPriceChange: (min: string, max: string) => void;
  onSearchChange: (search: string) => void;
  onClearFilters: () => void;
}

const ProductsFilters: React.FC<ProductsFiltersProps> = ({
  categories,
  cities,
  selectedCategory,
  selectedCity,
  minPrice,
  maxPrice,
  searchTerm,
  onCategoryChange,
  onCityChange,
  onPriceChange,
  onSearchChange,
  onClearFilters
}) => {
  const hasActiveFilters = selectedCategory !== 'all' || selectedCity !== 'all' || minPrice || maxPrice || searchTerm;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 mb-8">
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCity} onValueChange={onCityChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map(city => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => onPriceChange(e.target.value, maxPrice)}
            />
            <Input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => onPriceChange(minPrice, e.target.value)}
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClearFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductsFilters;

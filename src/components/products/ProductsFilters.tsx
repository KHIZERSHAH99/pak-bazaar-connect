
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
    <div className="space-y-4 mb-6">
      <div className="bg-card rounded-lg shadow-sm border border-border p-4">
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 text-sm"
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="h-9 text-sm">
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
              <SelectTrigger className="h-9 text-sm">
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

            <Input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => onPriceChange(e.target.value, maxPrice)}
              className="h-9 text-sm"
            />
            <Input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => onPriceChange(minPrice, e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end mt-3">
            <Button variant="outline" size="sm" onClick={onClearFilters} className="h-8 text-xs">
              <Filter className="h-3 w-3 mr-1.5" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Category quick-filter chips */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryChange('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium font-poppins transition-colors ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium font-poppins transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsFilters;

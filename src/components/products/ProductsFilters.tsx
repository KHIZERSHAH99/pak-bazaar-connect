import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Category, City } from '@/lib/types';
import { Search, Filter, Star } from 'lucide-react';
interface ProductsFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedRating: string;
  setSelectedRating: (rating: string) => void;
  minPrice: string;
  setMinPrice: (price: string) => void;
  maxPrice: string;
  setMaxPrice: (price: string) => void;
  categories: Category[];
  cities: City[];
  onSearch: () => void;
  onClearFilters: () => void;
}
const ProductsFilters: React.FC<ProductsFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedCity,
  setSelectedCity,
  selectedRating,
  setSelectedRating,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  categories,
  cities,
  onSearch,
  onClearFilters
}) => {
  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || selectedCity !== 'all' || selectedRating !== 'all' || minPrice || maxPrice;
  return <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="md:col-span-2 lg:col-span-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" onKeyPress={e => e.key === 'Enter' && onSearch()} />
          </div>
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger>
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map(city => <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={selectedRating} onValueChange={setSelectedRating}>
          <SelectTrigger>
            <SelectValue placeholder="All Ratings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>5 stars only</span>
              </div>
            </SelectItem>
            <SelectItem value="4">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>4+ stars</span>
              </div>
            </SelectItem>
            <SelectItem value="3">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>3+ stars</span>
              </div>
            </SelectItem>
            <SelectItem value="2">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>2+ stars</span>
              </div>
            </SelectItem>
            <SelectItem value="1">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>1+ stars</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <div>
          <Label htmlFor="minPrice" className="text-sm font-medium">Min Price (PKR)</Label>
          <Input id="minPrice" type="number" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="mt-1" />
        </div>
        
        <div>
          <Label htmlFor="maxPrice" className="text-sm font-medium">Max Price (PKR)</Label>
          <Input id="maxPrice" type="number" placeholder="No limit" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="mt-1" />
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <Button onClick={onSearch} className="hover:bg-pakistani-green-800 bg-green-900 hover:bg-green-800 text-slate-50 font-thin text-base text-justify">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        
        {hasActiveFilters && <Button variant="outline" onClick={onClearFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>}
      </div>
    </div>;
};
export default ProductsFilters;
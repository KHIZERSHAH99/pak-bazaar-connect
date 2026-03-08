
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, X, MapPin, Building, Star } from 'lucide-react';

interface SearchFilters {
  query: string;
  category: string;
  location: string;
  priceRange: [number, number];
  minOrder: number;
  rating: number;
  businessType: string;
  inStock: boolean;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  categories: string[];
  locations: string[];
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onClear,
  categories,
  locations
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    location: '',
    priceRange: [0, 100000],
    minOrder: 0,
    rating: 0,
    businessType: '',
    inStock: true
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClearFilters = () => {
    setFilters({
      query: '',
      category: '',
      location: '',
      priceRange: [0, 100000],
      minOrder: 0,
      rating: 0,
      businessType: '',
      inStock: true
    });
    onClear();
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== '' && value !== 0 && value !== true && !Array.isArray(value)
  ).length;

  return (
    <Card className="p-6 mb-6">
      <div className="space-y-4">
        {/* Basic Search */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search products, suppliers, or categories..."
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              className="pl-10"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Select value={filters.location} onValueChange={(value) => setFilters({ ...filters, location: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        <MapPin className="h-4 w-4 mr-2" />
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Business Type */}
              <div>
                <label className="text-sm font-medium mb-2 block">Business Type</label>
                <Select value={filters.businessType} onValueChange={(value) => setFilters({ ...filters, businessType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="manufacturer">
                      <Building className="h-4 w-4 mr-2" />
                      Manufacturer
                    </SelectItem>
                    <SelectItem value="distributor">
                      <Building className="h-4 w-4 mr-2" />
                      Distributor
                    </SelectItem>
                    <SelectItem value="wholesaler">
                      <Building className="h-4 w-4 mr-2" />
                      Wholesaler
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Minimum Rating */}
              <div>
                <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                <Select value={filters.rating.toString()} onValueChange={(value) => setFilters({ ...filters, rating: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any Rating</SelectItem>
                    <SelectItem value="4">
                      <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
                      4+ Stars
                    </SelectItem>
                    <SelectItem value="3">
                      <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
                      3+ Stars
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Price Range: PKR {filters.priceRange[0].toLocaleString()} - PKR {filters.priceRange[1].toLocaleString()}
              </label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => setFilters({ ...filters, priceRange: value as [number, number] })}
                max={100000}
                min={0}
                step={1000}
                className="w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button variant="outline" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
              <Button onClick={handleSearch}>
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AdvancedSearch;

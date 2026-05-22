
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ProductsHeaderProps {
  onSearch?: (term: string) => void;
  searchTerm?: string;
}

const ProductsHeader: React.FC<ProductsHeaderProps> = ({ onSearch, searchTerm }) => {
  return (
    <div className="mb-4 sm:mb-6">
      <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2 font-poppins">Browse Products</h1>
      <p className="text-xs sm:text-sm text-muted-foreground font-poppins mb-3 sm:mb-4">Discover wholesale products from verified suppliers across Pakistan</p>
      
      {onSearch && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm || ''}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      )}
    </div>
  );
};

export default ProductsHeader;

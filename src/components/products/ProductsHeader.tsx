
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ProductsHeaderProps {
  onSearch?: (term: string) => void;
  searchTerm?: string;
}

const ProductsHeader: React.FC<ProductsHeaderProps> = ({ onSearch, searchTerm }) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">Browse Products</h1>
      <p className="text-gray-600 font-poppins mb-6">Discover wholesale products from verified suppliers across Pakistan</p>
      
      {onSearch && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search products..."
            value={searchTerm || ''}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      )}
    </div>
  );
};

export default ProductsHeader;

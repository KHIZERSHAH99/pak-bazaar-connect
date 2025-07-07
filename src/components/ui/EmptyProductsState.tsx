
import React from 'react';
import { Package, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyProductsStateProps {
  message?: string;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
}

const EmptyProductsState: React.FC<EmptyProductsStateProps> = ({
  message = "No products found matching your criteria",
  showCreateButton = false,
  onCreateClick
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 p-4 bg-gray-100 rounded-full">
        <Package className="h-12 w-12 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2 font-poppins">
        {message}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md font-poppins">
        Try adjusting your search criteria or browse different categories to find what you're looking for.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="font-poppins"
        >
          <Search className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
        
        {showCreateButton && onCreateClick && (
          <Button
            onClick={onCreateClick}
            className="bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-md">
        <h4 className="font-medium text-blue-800 mb-2 font-poppins">
          💡 Tip for Better Results
        </h4>
        <ul className="text-sm text-blue-700 space-y-1 font-poppins">
          <li>• Use broader search terms</li>
          <li>• Check different categories</li>
          <li>• Adjust price range filters</li>
          <li>• Try different city locations</li>
        </ul>
      </div>
    </div>
  );
};

export default EmptyProductsState;

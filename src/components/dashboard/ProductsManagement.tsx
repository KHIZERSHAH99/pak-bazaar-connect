
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';
import CreateProductDialog from '@/components/products/CreateProductDialog';
import ProductsList from './ProductsList';

const ProductsManagement: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleProductCreated = () => {
    // The ProductsList component will automatically refresh via React Query
    console.log('Product created successfully');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center gap-2">
        <h1 className="text-xl sm:text-3xl font-bold text-foreground font-poppins">Products</h1>
        <Button 
          size="sm"
          className="bg-primary hover:bg-primary/90 font-poppins h-9 sm:h-10 px-3 sm:px-4 text-sm"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Product</span>
          <span className="sm:hidden ml-1">Add</span>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-poppins">
            <Package className="w-5 h-5" />
            Product Catalog
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProductsList />
        </CardContent>
      </Card>

      <CreateProductDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onProductCreated={handleProductCreated}
      />
    </div>
  );
};

export default ProductsManagement;

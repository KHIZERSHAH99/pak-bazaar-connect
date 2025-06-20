
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';
import CreateProductDialog from '@/components/products/CreateProductDialog';

const ProductsManagement: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleProductCreated = () => {
    // Refresh products list if needed
    console.log('Product created successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins">Products</h1>
        <Button 
          className="bg-pakistani_green-700 hover:bg-pakistani_green-800 font-poppins"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
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
          <p className="text-gray-600 font-poppins">
            Manage your product inventory, prices, and availability. Upload product images and descriptions.
          </p>
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-green-800 font-poppins text-sm">
              💡 Add detailed product descriptions and high-quality images to attract more buyers.
            </p>
          </div>
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

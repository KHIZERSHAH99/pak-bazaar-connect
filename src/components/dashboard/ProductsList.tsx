
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, EyeOff, Package } from 'lucide-react';
import { Product } from '@/lib/types';
import { getProductsByWholesaler, updateProduct, deleteProduct } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';
import EditProductDialog from '@/components/products/EditProductDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ProductsList: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allProducts = [], isLoading, error } = useQuery({
    queryKey: ['wholesaler-products'],
    queryFn: getProductsByWholesaler,
  });

  // Filter products based on active/inactive status
  const products = showInactive 
    ? allProducts 
    : allProducts.filter(product => product.is_active);

  const toggleProductStatus = useMutation({
    mutationFn: ({ productId, isActive }: { productId: string; isActive: boolean }) =>
      updateProduct(productId, { is_active: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesaler-products'] });
      toast({
        title: "Product updated",
        description: "Product status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product status",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesaler-products'] });
      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleToggleStatus = (product: Product) => {
    toggleProductStatus.mutate({
      productId: product.id,
      isActive: !product.is_active
    });
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  const getStatusBadge = (product: Product) => {
    if (!product.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    switch (product.verification_status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-red-600 font-poppins">Failed to load products</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2 font-poppins">
          No products yet
        </h3>
        <p className="text-gray-600 font-poppins">
          Start by adding your first product to your shop.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            onClick={() => setShowInactive(!showInactive)}
            className="text-sm"
          >
            {showInactive ? 'Hide Inactive Products' : 'Show Inactive Products'}
            {!showInactive && allProducts.filter(p => !p.is_active).length > 0 && (
              <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                {allProducts.filter(p => !p.is_active).length}
              </span>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={product.image || "https://via.placeholder.com/400x300?text=Product"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  {getStatusBadge(product)}
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 font-poppins line-clamp-2">
                  {product.name}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <p className="text-xl font-bold text-pakistani_green-600 font-poppins">
                    PKR {product.price.toLocaleString()}
                  </p>
                  
                  {product.moq && product.moq > 1 && (
                    <p className="text-sm text-gray-600 font-poppins">
                      MOQ: {product.moq} pieces
                    </p>
                  )}
                  
                  {product.categories && (
                    <p className="text-sm text-gray-600 font-poppins">
                      Category: {product.categories.name}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(product)}
                    className="flex-1"
                  >
                    {product.is_active ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        Show
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <EditProductDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onProductUpdated={() => {
          queryClient.invalidateQueries({ queryKey: ['wholesaler-products'] });
        }}
      />
    </>
  );
};

export default ProductsList;

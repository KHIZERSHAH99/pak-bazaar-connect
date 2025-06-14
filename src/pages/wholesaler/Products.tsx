import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getShopsByOwner, Shop, createProduct, Product, getProductsByShop, uploadImage } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Plus, Package, Edit, Eye, Store } from 'lucide-react';
import EditProductDialog from '@/components/products/EditProductDialog';

const Products: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { toast } = useToast();

  const fetchShops = async () => {
    try {
      setLoading(true);
      const data = await getShopsByOwner();
      setShops(data);
      if (data.length > 0 && !selectedShop) {
        setSelectedShop(data[0].id);
        fetchProducts(data[0].id);
      } else if (selectedShop) {
        fetchProducts(selectedShop);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch shops:', error);
      setLoading(false);
    }
  };

  const fetchProducts = async (shopId: string) => {
    try {
      setLoading(true);
      const data = await getProductsByShop(shopId);
      setProducts(data);
    } catch (error) {
      console.error(`Failed to fetch products for shop ${shopId}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    if (selectedShop) {
      fetchProducts(selectedShop);
    }
  }, [selectedShop]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleActiveChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }));
  };

  const handleShopChange = (value: string) => {
    setSelectedShop(value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 100KB)
    if (file.size > 100 * 1024) {
      toast({
        title: 'File too large',
        description: 'Product image must be less than 100KB',
        variant: 'destructive',
      });
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedShop || !formData.name || !formData.price) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      let imageUrl;
      if (imageFile) {
        const fileName = `product_${Date.now()}_${imageFile.name}`;
        imageUrl = await uploadImage('product_images', fileName, imageFile);
      }

      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        throw new Error('Price must be a valid positive number');
      }

      const productData = {
        shop_id: selectedShop,
        name: formData.name,
        description: formData.description,
        price,
        image: imageUrl,
        is_active: formData.is_active,
        verification_status: 'pending' as const,
      };

      await createProduct(productData);
      
      toast({
        title: 'Product Created',
        description: 'Your product has been created successfully',
      });
      
      setIsDialogOpen(false);
      resetForm();
      
      if (selectedShop) {
        fetchProducts(selectedShop);
      }
    } catch (error: any) {
      toast({
        title: 'Failed to create product',
        description: error.message || 'An error occurred while creating the product',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      is_active: true,
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingProduct(null);
  };

  const handleProductUpdated = () => {
    if (selectedShop) {
      fetchProducts(selectedShop);
    }
  };

  if (shops.length === 0 && !loading) {
    return (
      <DashboardLayout>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Products</h1>
          <Card className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <Store className="h-16 w-16 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No shops created yet</h3>
            <p className="text-gray-600 mb-6">You need to create a shop before adding products.</p>
            <Button
              onClick={() => window.location.href = '/dashboard/shops'}
              className="bg-primary hover:bg-pakistani-green-800"
            >
              Create a Shop
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Select value={selectedShop || ''} onValueChange={handleShopChange}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select shop" />
              </SelectTrigger>
              <SelectContent>
                {shops.map(shop => (
                  <SelectItem key={shop.id} value={shop.id}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary hover:bg-pakistani-green-800"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : products.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <Package className="h-16 w-16 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No products yet</h3>
            <p className="text-gray-600 mb-6">Add your first product to start selling.</p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary hover:bg-pakistani-green-800"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="h-48 bg-muted">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/300x200?text=Product";
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${product.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-muted text-muted-foreground'}`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {product.description && (
                    <p className="text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
                  )}
                  
                  <p className="text-lg font-bold text-primary mb-4">
                    PKR {product.price.toLocaleString()}
                  </p>

                  <div className="flex space-x-2">
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      // To be implemented
                    >
                      <Eye className="h-4 w-4 mr-2" /> Preview
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price (PKR)
                </label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={handleActiveChange}
                />
                <Label htmlFor="is_active">Active product (visible to sellers)</Label>
              </div>
              
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image (optional, max 100KB)
                </label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img 
                      src={imagePreview} 
                      alt="Product Preview" 
                      className="h-40 w-auto object-contain rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-primary hover:bg-pakistani-green-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <EditProductDialog
        isOpen={isEditDialogOpen}
        onClose={handleEditDialogClose}
        product={editingProduct}
        onProductUpdated={handleProductUpdated}
      />
    </DashboardLayout>
  );
};

const ProductsWithAuth = () => (
  <ProtectedRoute allowedRoles={['wholesaler']}>
    <Products />
  </ProtectedRoute>
);

export default ProductsWithAuth;

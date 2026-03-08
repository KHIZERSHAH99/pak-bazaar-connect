
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getShopsByOwner, createShop, uploadImage } from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Store, Package, Edit, Eye } from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  contact: string;
  address: string;
  postal_code: string;
  logo?: string;
  owner_id: string;
  created_at?: string;
}

const Shops: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    postal_code: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchShops = async () => {
    try {
      setLoading(true);
      const data = await getShopsByOwner();
      setShops(data);
    } catch (error) {
      console.error('Failed to fetch shops:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 100KB)
    if (file.size > 100 * 1024) {
      toast({
        title: 'File too large',
        description: 'Logo image must be less than 100KB',
        variant: 'destructive',
      });
      return;
    }

    setLogoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.contact || !formData.address || !formData.postal_code) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      let logoUrl;
      if (logoFile) {
        const fileName = `shop_${Date.now()}_${logoFile.name}`;
        logoUrl = await uploadImage('shop_images', fileName, logoFile);
      }

      const shopData = {
        ...formData,
        logo: logoUrl,
      };

      await createShop(shopData);
      
      toast({
        title: 'Shop Created',
        description: 'Your shop has been created successfully',
      });
      
      setIsCreateDialogOpen(false);
      resetForm();
      fetchShops();
    } catch (error: any) {
      toast({
        title: 'Failed to create shop',
        description: error.message || 'An error occurred while creating the shop',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditShop = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingShop || !formData.name || !formData.contact || !formData.address || !formData.postal_code) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      let logoUrl = editingShop.logo;
      if (logoFile) {
        const fileName = `shop_${Date.now()}_${logoFile.name}`;
        logoUrl = await uploadImage('shop_images', fileName, logoFile);
      }

      const { error } = await supabase
        .from('shops')
        .update({
          name: formData.name,
          contact: formData.contact,
          address: formData.address,
          postal_code: formData.postal_code,
          logo: logoUrl,
        })
        .eq('id', editingShop.id);

      if (error) throw error;
      
      toast({
        title: 'Shop Updated',
        description: 'Your shop has been updated successfully',
      });
      
      setIsEditDialogOpen(false);
      resetForm();
      setEditingShop(null);
      fetchShops();
    } catch (error: any) {
      toast({
        title: 'Failed to update shop',
        description: error.message || 'An error occurred while updating the shop',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (shop: Shop) => {
    setEditingShop(shop);
    setFormData({
      name: shop.name,
      contact: shop.contact,
      address: shop.address,
      postal_code: shop.postal_code,
    });
    setLogoPreview(shop.logo || null);
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contact: '',
      address: '',
      postal_code: '',
    });
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleViewProducts = (shopId: string) => {
    navigate(`/dashboard/shops/${shopId}`);
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">My Shops</h1>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Shop
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : shops.length === 0 ? (
          <Card className="p-8 text-center bg-background/50 backdrop-blur-sm border-border">
            <div className="flex justify-center mb-4">
              <Store className="h-16 w-16 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No shops yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first shop to start selling products.</p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" /> Create Shop
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <Card key={shop.id} className="overflow-hidden bg-background/50 backdrop-blur-sm border-border">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                      {shop.logo ? (
                        <img 
                          src={shop.logo} 
                          alt={shop.name} 
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <Store className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{shop.name}</h3>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Contact:</span> {shop.contact}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Address:</span> {shop.address}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Postal Code:</span> {shop.postal_code}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleViewProducts(shop.id)}
                      className="flex-1 border-pakistani_green-200/50 hover:bg-pakistani_green-50/50 dark:hover:bg-pakistani_green-900/30"
                    >
                      <Package className="h-4 w-4 mr-2" /> Products
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 border-pakistani_green-200/50 hover:bg-pakistani_green-50/50 dark:hover:bg-pakistani_green-900/30"
                      onClick={() => openEditDialog(shop)}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Shop Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md bg-background/95 dark:bg-background/90 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Create New Shop</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateShop}>
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Shop Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter shop name"
                  disabled={isSubmitting}
                  className="bg-background/50 dark:bg-background/30"
                />
              </div>
              
              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Number
                </label>
                <Input
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  placeholder="Enter contact number"
                  disabled={isSubmitting}
                  className="bg-background/50 dark:bg-background/30"
                />
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter shop address"
                  disabled={isSubmitting}
                  rows={3}
                  className="bg-background/50 dark:bg-background/30"
                />
              </div>
              
              <div>
                <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Postal Code
                </label>
                <Input
                  id="postal_code"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  placeholder="Enter postal code"
                  disabled={isSubmitting}
                  className="bg-background/50 dark:bg-background/30"
                />
              </div>
              
              <div>
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Shop Logo (optional, max 100KB)
                </label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  disabled={isSubmitting}
                  className="bg-background/50 dark:bg-background/30"
                />
                {logoPreview && (
                  <div className="mt-2">
                    <img 
                      src={logoPreview} 
                      alt="Logo Preview" 
                      className="h-24 w-24 object-cover rounded-md"
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
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
                disabled={isSubmitting}
                className="border-pakistani_green-200/50 hover:bg-pakistani_green-50/50 dark:hover:bg-pakistani_green-900/30"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Shop'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Shop Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md bg-background/95 dark:bg-background/90 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Edit Shop</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleEditShop}>
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Shop Name
                </label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter shop name"
                  disabled={isSubmitting}
                  className="bg-background/50 dark:bg-background/30"
                />
              </div>
              
              <div>
                <label htmlFor="edit-contact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Number
                </label>
                <Input
                  id="edit-contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  placeholder="Enter contact number"
                  disabled={isSubmitting}
                  className="bg-background/50 dark:bg-background/30"
                />
              </div>
              
              <div>
                <label htmlFor="edit-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <Textarea
                  id="edit-address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter shop address"
                  disabled={isSubmitting}
                  rows={3}
                  className="bg-background/50 dark:bg-background/30"
                />
              </div>
              
              <div>
                <label htmlFor="edit-postal_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Postal Code
                </label>
                <Input
                  id="edit-postal_code"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  placeholder="Enter postal code"
                  disabled={isSubmitting}
                  className="bg-background/50 dark:bg-background/30"
                />
              </div>
              
              <div>
                <label htmlFor="edit-logo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Shop Logo (optional, max 100KB)
                </label>
                <Input
                  id="edit-logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  disabled={isSubmitting}
                  className="bg-background/50 dark:bg-background/30"
                />
                {logoPreview && (
                  <div className="mt-2">
                    <img 
                      src={logoPreview} 
                      alt="Logo Preview" 
                      className="h-24 w-24 object-cover rounded-md"
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
                  setIsEditDialogOpen(false);
                  resetForm();
                  setEditingShop(null);
                }}
                disabled={isSubmitting}
                className="border-pakistani_green-200/50 hover:bg-pakistani_green-50/50 dark:hover:bg-pakistani_green-900/30"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Shop'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

const ShopsWithAuth = () => (
  <ProtectedRoute allowedRoles={['wholesaler']}>
    <Shops />
  </ProtectedRoute>
);

export default ShopsWithAuth;

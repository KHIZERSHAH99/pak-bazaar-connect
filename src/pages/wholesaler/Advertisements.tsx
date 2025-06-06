
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAdsByWholesaler, Ad, createAd } from '@/lib/supabase';
import { getProductsByWholesaler } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, Edit, Package } from 'lucide-react';

const Advertisements: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    headline: '',
    productId: '',
  });
  
  const { toast } = useToast();

  const fetchAds = async () => {
    try {
      setLoading(true);
      const data = await getAdsByWholesaler();
      setAds(data);
    } catch (error) {
      console.error('Failed to fetch advertisements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await getProductsByWholesaler();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  useEffect(() => {
    fetchAds();
    fetchProducts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProductSelect = (productId: string) => {
    setFormData(prev => ({ ...prev, productId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.headline) {
      toast({
        title: 'Missing headline',
        description: 'Please provide a headline for your advertisement',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.productId) {
      toast({
        title: 'Missing product',
        description: 'Please select a product to advertise',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const selectedProduct = products.find(p => p.id === formData.productId);
      
      const adData = {
        headline: formData.headline,
        image: selectedProduct?.image || '',
        product_id: formData.productId,
      };

      await createAd(adData);
      
      toast({
        title: 'Advertisement Created',
        description: 'Your advertisement has been submitted for approval',
      });
      
      setIsDialogOpen(false);
      resetForm();
      fetchAds();
    } catch (error: any) {
      toast({
        title: 'Failed to create advertisement',
        description: error.message || 'An error occurred while creating the advertisement',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      headline: '',
      productId: '',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Advertisements</h1>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-primary hover:bg-pakistani-green-800"
            disabled={products.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" /> Create Ad
          </Button>
        </div>
        
        {products.length === 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <Package className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-blue-700">
                  You need to add products to your shop before creating advertisements. 
                  <a href="/dashboard/products" className="underline ml-1">Add products now</a>
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Advertisements require admin approval before they appear on the platform.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : ads.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <FileText className="h-16 w-16 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No advertisements yet</h3>
            <p className="text-gray-600 mb-6">Create your first advertisement to promote your products.</p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary hover:bg-pakistani-green-800"
            >
              <Plus className="w-4 h-4 mr-2" /> Create Ad
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <Card key={ad.id} className="overflow-hidden">
                <div className="h-48 bg-gray-100">
                  {ad.image ? (
                    <img 
                      src={ad.image} 
                      alt={ad.headline} 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/300x200?text=Advertisement";
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FileText className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{ad.headline}</h3>
                    {getStatusBadge(ad.status)}
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    Created: {new Date(ad.created_at || '').toLocaleDateString()}
                  </p>

                  {ad.status !== 'active' && ad.status !== 'pending' && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Advertisement</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-1">
                  Headline
                </label>
                <Input
                  id="headline"
                  name="headline"
                  value={formData.headline}
                  onChange={handleInputChange}
                  placeholder="Enter advertisement headline"
                  disabled={isSubmitting}
                  maxLength={100}
                />
              </div>
              
              <div>
                <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Product to Advertise
                </label>
                <Select onValueChange={handleProductSelect} disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a product from your shop" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-2" />
                          {product.name} - PKR {product.price}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  The product's image will be used for the advertisement
                </p>
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
                {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

const AdvertisementsWithAuth = () => (
  <ProtectedRoute allowedRoles={['wholesaler']}>
    <Advertisements />
  </ProtectedRoute>
);

export default AdvertisementsWithAuth;

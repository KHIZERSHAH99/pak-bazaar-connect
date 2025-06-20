
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createAd } from '@/lib/ads';
import { getProductsByWholesaler } from '@/lib/products';
import { uploadImage } from '@/lib/supabase';
import { Loader2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
}

interface EnhancedCreateAdDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdCreated: () => void;
}

const EnhancedCreateAdDialog: React.FC<EnhancedCreateAdDialogProps> = ({
  isOpen,
  onClose,
  onAdCreated
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [formData, setFormData] = useState({
    headline: '',
    budget_cap: '',
    daily_budget_limit: '',
    campaign_days: '7',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      const data = await getProductsByWholesaler();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedProduct) {
      newErrors.product = 'Please select a product to promote';
    }

    if (!formData.headline.trim()) {
      newErrors.headline = 'Advertisement headline is required';
    } else if (formData.headline.length < 5 || formData.headline.length > 200) {
      newErrors.headline = 'Headline must be between 5 and 200 characters';
    }

    if (!formData.budget_cap || parseFloat(formData.budget_cap) <= 0) {
      newErrors.budget_cap = 'Budget cap must be greater than 0';
    } else if (parseFloat(formData.budget_cap) < 100) {
      newErrors.budget_cap = 'Minimum budget cap is PKR 100';
    }

    if (formData.daily_budget_limit && parseFloat(formData.daily_budget_limit) > parseFloat(formData.budget_cap)) {
      newErrors.daily_budget_limit = 'Daily budget cannot exceed total budget';
    }

    if (!imageFile) {
      newErrors.image = 'Advertisement image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024) {
      toast({
        title: 'File too large',
        description: 'Advertisement image must be less than 100KB',
        variant: 'destructive',
      });
      return;
    }

    setImageFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const calculateEndDate = (days: string) => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days));
    return endDate.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      let imageUrl;
      if (imageFile) {
        const fileName = `ad_${Date.now()}_${imageFile.name}`;
        imageUrl = await uploadImage('ad_images', fileName, imageFile);
      }

      const campaignEndDate = calculateEndDate(formData.campaign_days);

      await createAd({
        product_id: selectedProduct,
        headline: formData.headline.trim(),
        image: imageUrl,
        budget_cap: parseFloat(formData.budget_cap),
        daily_budget_limit: formData.daily_budget_limit ? parseFloat(formData.daily_budget_limit) : undefined,
        campaign_start_date: new Date().toISOString(),
        campaign_end_date: campaignEndDate,
      });
      
      toast({
        title: 'Success',
        description: 'Advertisement created successfully! It will be reviewed by admin before going live.',
      });
      
      resetForm();
      onClose();
      onAdCreated();
    } catch (error: any) {
      console.error('Failed to create ad:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create advertisement. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      headline: '',
      budget_cap: '',
      daily_budget_limit: '',
      campaign_days: '7',
    });
    setSelectedProduct('');
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const selectedProductData = products.find(p => p.id === selectedProduct);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Advertisement Campaign</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Selection */}
          <div>
            <Label htmlFor="product">Select Product to Promote *</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a product from your shop" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    <div className="flex items-center gap-2">
                      {product.image && (
                        <img src={product.image} alt={product.name} className="w-8 h-8 object-cover rounded" />
                      )}
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">PKR {product.price}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.product && <p className="text-sm text-destructive mt-1">{errors.product}</p>}
          </div>

          {/* Selected Product Preview */}
          {selectedProductData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Selected Product</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                {selectedProductData.image && (
                  <img 
                    src={selectedProductData.image} 
                    alt={selectedProductData.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="font-medium">{selectedProductData.name}</h3>
                  <p className="text-sm text-gray-600">PKR {selectedProductData.price}</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Ad Creative */}
          <div>
            <Label htmlFor="headline">Advertisement Headline *</Label>
            <Input
              id="headline"
              name="headline"
              value={formData.headline}
              onChange={handleInputChange}
              placeholder="Write a catchy headline to attract customers"
              disabled={isSubmitting}
            />
            {errors.headline && <p className="text-sm text-destructive mt-1">{errors.headline}</p>}
          </div>
          
          <div>
            <Label htmlFor="image">Advertisement Image * (max 100KB)</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isSubmitting}
              className="mt-1"
            />
            {errors.image && <p className="text-sm text-destructive mt-1">{errors.image}</p>}
            {imagePreview && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="Ad Preview" 
                  className="h-32 w-auto object-contain rounded-md border"
                />
              </div>
            )}
          </div>

          {/* Budget Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget_cap">Total Budget Cap (PKR) *</Label>
              <Input
                id="budget_cap"
                name="budget_cap"
                type="number"
                min="100"
                value={formData.budget_cap}
                onChange={handleInputChange}
                placeholder="e.g. 1000"
                disabled={isSubmitting}
              />
              {errors.budget_cap && <p className="text-sm text-destructive mt-1">{errors.budget_cap}</p>}
            </div>
            
            <div>
              <Label htmlFor="daily_budget_limit">Daily Budget Limit (PKR)</Label>
              <Input
                id="daily_budget_limit"
                name="daily_budget_limit"
                type="number"
                min="50"
                value={formData.daily_budget_limit}
                onChange={handleInputChange}
                placeholder="Optional"
                disabled={isSubmitting}
              />
              {errors.daily_budget_limit && <p className="text-sm text-destructive mt-1">{errors.daily_budget_limit}</p>}
            </div>
          </div>

          {/* Campaign Duration */}
          <div>
            <Label htmlFor="campaign_days">Campaign Duration</Label>
            <Select value={formData.campaign_days} onValueChange={(value) => setFormData(prev => ({ ...prev, campaign_days: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="14">14 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="60">60 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">How Cost Per Order (CPO) Works:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>You only pay when customers place orders through your ad</li>
                  <li>Campaign stops automatically when budget or time limit is reached</li>
                  <li>You'll receive notifications when campaigns end</li>
                  <li>Track performance in real-time through your dashboard</li>
                </ul>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Campaign...
                </>
              ) : (
                'Create Advertisement Campaign'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedCreateAdDialog;

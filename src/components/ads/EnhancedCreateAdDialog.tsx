
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Upload, X, Package, DollarSign } from 'lucide-react';
import { getProductsByWholesaler } from '@/lib/products';
import { createAd } from '@/lib/ads';
import { uploadImage } from '@/lib/storage';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  shops?: {
    name: string;
  };
}

interface AdFormData {
  headline: string;
  description: string;
  image: File | null;
  linkedProducts: string[];
  targetAudience: string;
  budget: number;
  duration: number;
}

const EnhancedCreateAdDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<AdFormData>({
    headline: '',
    description: '',
    image: null,
    linkedProducts: [],
    targetAudience: 'general',
    budget: 0,
    duration: 7
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AdFormData, string>>>({});

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const data = await getProductsByWholesaler();
      setProducts(data);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load your products. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProductsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AdFormData, string>> = {};

    if (!formData.headline.trim()) {
      newErrors.headline = 'Headline is required';
    } else if (formData.headline.length < 10) {
      newErrors.headline = 'Headline must be at least 10 characters long';
    } else if (formData.headline.length > 100) {
      newErrors.headline = 'Headline must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters long';
    }

    if (!formData.image) {
      newErrors.image = 'Ad image is required';
    }

    if (formData.budget <= 0) {
      newErrors.budget = 'Budget must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Image size must be less than 5MB",
          variant: "destructive"
        });
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: undefined }));
      }
    }
  };

  const handleProductToggle = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      linkedProducts: prev.linkedProducts.includes(productId)
        ? prev.linkedProducts.filter(id => id !== productId)
        : [...prev.linkedProducts, productId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrl = '';
      
      // Upload image if provided
      if (formData.image) {
        const uploadResult = await uploadImage(formData.image, 'ad_images', 'ads');
        if (uploadResult.error) {
          throw new Error(`Image upload failed: ${uploadResult.error}`);
        }
        imageUrl = uploadResult.data?.publicUrl || '';
      }

      // Create the ad
      const adData = {
        headline: formData.headline.trim(),
        description: formData.description.trim(),
        image: imageUrl,
        linkedProducts: formData.linkedProducts,
        targetAudience: formData.targetAudience,
        budget: formData.budget,
        duration: formData.duration
      };

      await createAd(adData);

      toast({
        title: "Success!",
        description: "Your ad has been created and is pending approval.",
        variant: "default"
      });

      // Reset form
      setFormData({
        headline: '',
        description: '',
        image: null,
        linkedProducts: [],
        targetAudience: 'general',
        budget: 0,
        duration: 7
      });
      setErrors({});
      setOpen(false);

    } catch (error: any) {
      console.error('Error creating ad:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create ad. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AdFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-pakistani_green-700 hover:bg-pakistani_green-800 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create New Ad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-emerald-900/95 backdrop-blur-md border-emerald-200 dark:border-emerald-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-pakistani_green-800 dark:text-emerald-100">
            Create Enhanced Advertisement
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Headline */}
          <div className="space-y-2">
            <Label htmlFor="headline" className="text-pakistani_green-700 dark:text-emerald-200 font-medium">
              Ad Headline *
            </Label>
            <Input
              id="headline"
              value={formData.headline}
              onChange={(e) => handleInputChange('headline', e.target.value)}
              placeholder="Enter compelling headline for your ad"
              className="bg-white/80 dark:bg-emerald-800/50 border-emerald-300 dark:border-emerald-600 backdrop-blur-sm"
              maxLength={100}
            />
            {errors.headline && (
              <p className="text-red-500 text-sm">{errors.headline}</p>
            )}
            <p className="text-sm text-gray-600 dark:text-emerald-300">
              {formData.headline.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-pakistani_green-700 dark:text-emerald-200 font-medium">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your products or services in detail"
              className="bg-white/80 dark:bg-emerald-800/50 border-emerald-300 dark:border-emerald-600 backdrop-blur-sm min-h-[100px]"
              maxLength={500}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
            <p className="text-sm text-gray-600 dark:text-emerald-300">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-pakistani_green-700 dark:text-emerald-200 font-medium">
              Ad Image *
            </Label>
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
                className="bg-white/80 dark:bg-emerald-800/50 border-emerald-300 dark:border-emerald-600 backdrop-blur-sm"
              >
                <Upload className="w-4 h-4 mr-2" />
                {formData.image ? 'Change Image' : 'Upload Image'}
              </Button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {formData.image && (
                <span className="text-sm text-emerald-600 dark:text-emerald-300">
                  {formData.image.name}
                </span>
              )}
            </div>
            {errors.image && (
              <p className="text-red-500 text-sm">{errors.image}</p>
            )}
          </div>

          {/* Linked Products */}
          <div className="space-y-4">
            <Label className="text-pakistani_green-700 dark:text-emerald-200 font-medium">
              Link Products (Optional)
            </Label>
            {productsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pakistani_green-700"></div>
              </div>
            ) : products.length === 0 ? (
              <Card className="bg-white/80 dark:bg-emerald-800/50 border-emerald-300 dark:border-emerald-600 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-emerald-300">
                    You don't have any products yet. Create some products first to link them to your ads.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className={`cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                      formData.linkedProducts.includes(product.id)
                        ? 'ring-2 ring-pakistani_green-500 bg-emerald-50/80 dark:bg-emerald-700/50'
                        : 'bg-white/80 dark:bg-emerald-800/50 hover:bg-emerald-50/60 dark:hover:bg-emerald-700/30'
                    } border-emerald-300 dark:border-emerald-600`}
                    onClick={() => handleProductToggle(product.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-pakistani_green-800 dark:text-emerald-100 truncate">
                            {product.name}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              <DollarSign className="w-3 h-3 mr-1" />
                              {product.price}
                            </Badge>
                            {product.shops && (
                              <span className="text-xs text-gray-500 dark:text-emerald-400 truncate">
                                {product.shops.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Ad Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-pakistani_green-700 dark:text-emerald-200 font-medium">
                Target Audience
              </Label>
              <Select
                value={formData.targetAudience}
                onValueChange={(value) => handleInputChange('targetAudience', value)}
              >
                <SelectTrigger className="bg-white/80 dark:bg-emerald-800/50 border-emerald-300 dark:border-emerald-600 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-emerald-900/95 backdrop-blur-md border-emerald-300 dark:border-emerald-600">
                  <SelectItem value="general">General Audience</SelectItem>
                  <SelectItem value="retailers">Retailers</SelectItem>
                  <SelectItem value="wholesalers">Other Wholesalers</SelectItem>
                  <SelectItem value="local">Local Businesses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-pakistani_green-700 dark:text-emerald-200 font-medium">
                Budget (PKR)
              </Label>
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                className="bg-white/80 dark:bg-emerald-800/50 border-emerald-300 dark:border-emerald-600 backdrop-blur-sm"
              />
              {errors.budget && (
                <p className="text-red-500 text-sm">{errors.budget}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-pakistani_green-700 dark:text-emerald-200 font-medium">
                Duration (Days)
              </Label>
              <Select
                value={formData.duration.toString()}
                onValueChange={(value) => handleInputChange('duration', parseInt(value))}
              >
                <SelectTrigger className="bg-white/80 dark:bg-emerald-800/50 border-emerald-300 dark:border-emerald-600 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-emerald-900/95 backdrop-blur-md border-emerald-300 dark:border-emerald-600">
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="60">60 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selected Products Summary */}
          {formData.linkedProducts.length > 0 && (
            <div className="space-y-2">
              <Label className="text-pakistani_green-700 dark:text-emerald-200 font-medium">
                Selected Products ({formData.linkedProducts.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {formData.linkedProducts.map((productId) => {
                  const product = products.find(p => p.id === productId);
                  return product ? (
                    <Badge
                      key={productId}
                      variant="secondary"
                      className="bg-pakistani_green-100 dark:bg-emerald-700/50 text-pakistani_green-800 dark:text-emerald-100"
                    >
                      {product.name}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => handleProductToggle(productId)}
                      />
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-white/80 dark:bg-emerald-800/50 border-emerald-300 dark:border-emerald-600 backdrop-blur-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-pakistani_green-700 hover:bg-pakistani_green-800 text-white"
            >
              {loading ? 'Creating Ad...' : 'Create Ad'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedCreateAdDialog;

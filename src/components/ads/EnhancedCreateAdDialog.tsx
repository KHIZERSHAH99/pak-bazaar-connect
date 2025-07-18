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
import { supabase } from '@/integrations/supabase/client';
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
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const {
    toast
  } = useToast();
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
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);
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
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      if (errors.image) {
        setErrors(prev => ({
          ...prev,
          image: undefined
        }));
      }
    }
  };
  const handleProductToggle = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      linkedProducts: prev.linkedProducts.includes(productId) ? prev.linkedProducts.filter(id => id !== productId) : [...prev.linkedProducts, productId]
    }));
  };
  const uploadImage = async (file: File): Promise<string> => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const {
      data,
      error
    } = await supabase.storage.from('ad_images').upload(fileName, file);
    if (error) {
      console.error('Error uploading ad image:', error);
      throw new Error('Failed to upload ad image');
    }
    const {
      data: {
        publicUrl
      }
    } = supabase.storage.from('ad_images').getPublicUrl(fileName);
    return publicUrl;
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
        imageUrl = await uploadImage(formData.image);
      }

      // Create the ad with the correct parameters
      const adData = {
        headline: formData.headline.trim(),
        image: imageUrl,
        budget_cap: formData.budget
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
      onClose();
      onAdCreated();
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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-md border-emerald-200 dark:border-emerald-700 bg-[#62f50d]/[0.26]">
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
            <Input id="headline" value={formData.headline} onChange={e => handleInputChange('headline', e.target.value)} placeholder="Enter compelling headline for your ad" className="bg-white/80 dark:bg-emerald-800/50 border-emerald-300 dark:border-emerald-600 backdrop-blur-sm" maxLength={100} />
            {errors.headline && <p className="text-red-500 text-sm">{errors.headline}</p>}
            <p className="text-sm text-gray-600 dark:text-emerald-300">
              {formData.headline.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-pakistani_green-700 dark:text-emerald-200 font-medium">
              Description *
            </Label>
            <Textarea id="description" value={formData.description} onChange={e => handleInputChange('description', e.target.value)} placeholder="Describe your products or services in detail" className="bg-white/80 dark:bg-emerald-800/50 border-emerald-300 dark:border-emerald-600 backdrop-blur-sm min-h-[100px]" maxLength={500} />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
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
              <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload')?.click()} className="bg-white/80 dark:bg-emerald-800/50 border-emerald-300 dark:border-emerald-600 backdrop-blur-sm">
                <Upload className="w-4 h-4 mr-2" />
                {formData.image ? 'Change Image' : 'Upload Image'}
              </Button>
              <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              {formData.image && <span className="text-sm text-emerald-600 dark:text-emerald-300">
                  {formData.image.name}
                </span>}
            </div>
            {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label className="text-pakistani_green-700 dark:text-emerald-200 font-medium">
              Budget (PKR) *
            </Label>
            <Input type="number" value={formData.budget} onChange={e => handleInputChange('budget', parseFloat(e.target.value) || 0)} placeholder="0" min="0" className="bg-white/80 dark:bg-emerald-800/50 border-emerald-300 dark:border-emerald-600 backdrop-blur-sm" />
            {errors.budget && <p className="text-red-500 text-sm">{errors.budget}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="bg-white/80 dark:bg-emerald-800/50 border-emerald-300 dark:border-emerald-600 backdrop-blur-sm">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-pakistani_green-700 hover:bg-pakistani_green-800 text-white">
              {loading ? 'Creating Ad...' : 'Create Ad'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>;
};
export default EnhancedCreateAdDialog;
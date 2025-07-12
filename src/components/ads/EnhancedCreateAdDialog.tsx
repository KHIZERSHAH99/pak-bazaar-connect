
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createAd } from '@/lib/ads';
import { getProductsByWholesaler } from '@/lib/products';
import { uploadImage } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import ProductSelector from './create/ProductSelector';
import AdCreativeFields from './create/AdCreativeFields';
import BudgetControls from './create/BudgetControls';
import InfoBox from './create/InfoBox';

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

  const handleImageChange = (file: File | null) => {
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
        headline: formData.headline.trim(),
        image: imageUrl,
        budget_cap: parseFloat(formData.budget_cap),
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Advertisement Campaign</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <ProductSelector
            products={products}
            selectedProduct={selectedProduct}
            onProductChange={setSelectedProduct}
            error={errors.product}
          />
          
          <AdCreativeFields
            headline={formData.headline}
            onHeadlineChange={(value) => setFormData(prev => ({ ...prev, headline: value }))}
            imageFile={imageFile}
            onImageChange={handleImageChange}
            imagePreview={imagePreview}
            errors={errors}
            isSubmitting={isSubmitting}
          />

          <BudgetControls
            budgetCap={formData.budget_cap}
            dailyBudgetLimit={formData.daily_budget_limit}
            campaignDays={formData.campaign_days}
            onBudgetCapChange={(value) => setFormData(prev => ({ ...prev, budget_cap: value }))}
            onDailyBudgetLimitChange={(value) => setFormData(prev => ({ ...prev, daily_budget_limit: value }))}
            onCampaignDaysChange={(value) => setFormData(prev => ({ ...prev, campaign_days: value }))}
            errors={errors}
            isSubmitting={isSubmitting}
          />

          <InfoBox />
          
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

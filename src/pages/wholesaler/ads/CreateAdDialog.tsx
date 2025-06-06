
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package } from 'lucide-react';
import { createAd } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface CreateAdDialogProps {
  isOpen: boolean;
  onClose: () => void;
  products: any[];
  onAdCreated: () => void;
}

const CreateAdDialog: React.FC<CreateAdDialogProps> = ({ isOpen, onClose, products, onAdCreated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    headline: '',
    productId: '',
  });
  const { toast } = useToast();

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
      
      onClose();
      resetForm();
      onAdCreated();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                onClose();
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
  );
};

export default CreateAdDialog;

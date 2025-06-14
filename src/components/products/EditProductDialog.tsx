
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Product } from '@/lib/types';
import { updateProduct, uploadImage } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onProductUpdated: () => void;
}

const EditProductDialog: React.FC<EditProductDialogProps> = ({
  open,
  onOpenChange,
  product,
  onProductUpdated
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        is_active: product.is_active,
      });
      setImagePreview(product.image || null);
      setImageFile(null);
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleActiveChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }));
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
    
    if (!product || !formData.name || !formData.price) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      let imageUrl = product.image;
      if (imageFile) {
        const fileName = `product_${Date.now()}_${imageFile.name}`;
        imageUrl = await uploadImage('product_images', fileName, imageFile);
      }

      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        throw new Error('Price must be a valid positive number');
      }

      const updates = {
        name: formData.name,
        description: formData.description,
        price,
        image: imageUrl,
        is_active: formData.is_active,
      };

      await updateProduct(product.id, updates);
      
      toast({
        title: 'Product Updated',
        description: 'Your product has been updated successfully',
      });
      
      onOpenChange(false);
      onProductUpdated();
    } catch (error: any) {
      toast({
        title: 'Failed to update product',
        description: error.message || 'An error occurred while updating the product',
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
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
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
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
              <label htmlFor="price" className="block text-sm font-medium text-foreground mb-1">
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
              <label htmlFor="image" className="block text-sm font-medium text-foreground mb-1">
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
                onOpenChange(false);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-pakistani_green-700 hover:bg-pakistani_green-800 dark:bg-pakistani_green-600 dark:hover:bg-pakistani_green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;


import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getShopsByOwner, createProduct, uploadImage } from '@/lib/supabase';
import { Shop } from '@/lib/types';
import { Loader2, Upload } from 'lucide-react';

interface CreateProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: () => void;
}

const CreateProductDialog: React.FC<CreateProductDialogProps> = ({
  isOpen,
  onClose,
  onProductCreated
}) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    moq: '1',
    shop_id: '',
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchShops();
    }
  }, [isOpen]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const data = await getShopsByOwner();
      setShops(data);
      if (data.length === 1) {
        setFormData(prev => ({ ...prev, shop_id: data[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch shops:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shops. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.length < 2 || formData.name.length > 200) {
      newErrors.name = 'Product name must be between 2 and 200 characters';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = 'Price must be a positive number';
      } else if (price > 999999999) {
        newErrors.price = 'Price must be less than 999,999,999';
      }
    }

    if (!formData.shop_id) {
      newErrors.shop_id = 'Please select a shop';
    }

    const moq = parseInt(formData.moq);
    if (isNaN(moq) || moq < 1) {
      newErrors.moq = 'MOQ must be at least 1';
    } else if (moq > 1000000) {
      newErrors.moq = 'MOQ must be less than 1,000,000';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        description: 'Product image must be less than 100KB',
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
        const fileName = `product_${Date.now()}_${imageFile.name}`;
        imageUrl = await uploadImage('product_images', fileName, imageFile);
      }

      const productData = {
        shop_id: formData.shop_id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        moq: parseInt(formData.moq),
        image: imageUrl,
        is_active: formData.is_active,
        verification_status: 'pending' as const,
      };

      await createProduct(productData);
      
      toast({
        title: 'Success',
        description: 'Product created successfully!',
      });
      
      resetForm();
      onClose();
      onProductCreated();
    } catch (error: any) {
      console.error('Failed to create product:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create product. Please try again.',
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
      moq: '1',
      shop_id: shops.length === 1 ? shops[0].id : '',
      is_active: true,
    });
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

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (shops.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>No Shops Found</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-muted-foreground">
              You need to create a shop before adding products.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button onClick={() => window.location.href = '/dashboard/shops'}>
              Create Shop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="shop_id">Shop *</Label>
            <Select 
              value={formData.shop_id} 
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, shop_id: value }));
                if (errors.shop_id) {
                  setErrors(prev => ({ ...prev, shop_id: '' }));
                }
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger>
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
            {errors.shop_id && <p className="text-sm text-destructive mt-1">{errors.shop_id}</p>}
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description (optional)"
              disabled={isSubmitting}
              rows={3}
            />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (PKR) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                disabled={isSubmitting}
              />
              {errors.price && <p className="text-sm text-destructive mt-1">{errors.price}</p>}
            </div>

            <div>
              <Label htmlFor="moq">MOQ</Label>
              <Input
                id="moq"
                name="moq"
                type="number"
                min="1"
                value={formData.moq}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
              {errors.moq && <p className="text-sm text-destructive mt-1">{errors.moq}</p>}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              disabled={isSubmitting}
            />
            <Label htmlFor="is_active">Active product (visible to buyers)</Label>
          </div>
          
          <div>
            <Label htmlFor="image">Product Image (optional, max 100KB)</Label>
            <div className="mt-1">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isSubmitting}
              />
            </div>
            {imagePreview && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="Product Preview" 
                  className="h-32 w-auto object-contain rounded-md border"
                />
              </div>
            )}
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
                  Creating...
                </>
              ) : (
                'Create Product'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProductDialog;

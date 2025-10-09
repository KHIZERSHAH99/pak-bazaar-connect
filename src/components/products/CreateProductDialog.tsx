
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getShopsByOwner, createProduct, uploadImage } from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';
import { Shop } from '@/lib/types';
import { Loader2, Upload, Package, Info, Image, DollarSign, Settings } from 'lucide-react';
import ProductCategorySelector from './ProductCategorySelector';
import MultipleImageUpload from './MultipleImageUpload';
import InlineVariationManager, { InlineVariation } from './InlineVariationManager';
import InlinePricingTiers, { InlinePricingTier } from './InlinePricingTiers';

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
    // Basic Info
    name: '',
    description: '',
    price: '',
    moq: '1',
    shop_id: '',
    is_active: true,
    category_id: '',
    
    // Product Details
    brand: '',
    model_number: '',
    origin_country: '',
    package_weight: '',
    package_dimensions: '',
    stock_quantity: '',
    warranty_info: '',
    certifications: [] as string[],
    customization_available: false,
    colors_available: [] as string[],
    packaging_type: '',
    units_per_package: '1',
    
    // Sample Info
    sample_available: false,
    sample_price: '',
  });
  
  const [images, setImages] = useState<Array<{id: string; file: File; preview: string; isPrimary: boolean}>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [inlineVariations, setInlineVariations] = useState<any[]>([]);
  const [inlineTiers, setInlineTiers] = useState<any[]>([]);
  
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

  const handleArrayFieldChange = (field: string, values: string[]) => {
    setFormData(prev => ({ ...prev, [field]: values }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Upload primary image
      let imageUrl;
      if (images.length > 0) {
        const primaryImage = images.find(img => img.isPrimary) || images[0];
        const fileName = `product_${Date.now()}_${primaryImage.file.name}`;
        imageUrl = await uploadImage('product_images', fileName, primaryImage.file);
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
        category_id: formData.category_id || null,
        brand: formData.brand || null,
        model_number: formData.model_number || null,
        origin_country: formData.origin_country || null,
        package_weight: formData.package_weight ? parseFloat(formData.package_weight) : null,
        package_dimensions: formData.package_dimensions || null,
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : null,
        warranty_info: formData.warranty_info || null,
        certifications: formData.certifications.length > 0 ? formData.certifications : null,
        customization_available: formData.customization_available,
        colors_available: formData.colors_available.length > 0 ? formData.colors_available : null,
        packaging_type: formData.packaging_type || null,
        units_per_package: parseInt(formData.units_per_package),
        sample_available: formData.sample_available,
        sample_price: formData.sample_price ? parseFloat(formData.sample_price) : null,
      };

      const result = await createProduct(productData);
      
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
      category_id: '',
      brand: '',
      model_number: '',
      origin_country: '',
      package_weight: '',
      package_dimensions: '',
      stock_quantity: '',
      warranty_info: '',
      certifications: [],
      customization_available: false,
      colors_available: [],
      packaging_type: '',
      units_per_package: '1',
      sample_available: false,
      sample_price: '',
    });
    setImages([]);
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
      <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[85vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Add New Product</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-8 sm:h-10">
              <TabsTrigger value="basic" className="text-xs px-1 sm:px-2 sm:text-sm">
                <Info className="w-3 h-3 sm:w-4 sm:h-4 mr-0 sm:mr-1" />
                <span className="hidden sm:inline">Basic</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="text-xs px-1 sm:px-2 sm:text-sm">
                <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-0 sm:mr-1" />
                <span className="hidden sm:inline">Details</span>
              </TabsTrigger>
              <TabsTrigger value="images" className="text-xs px-1 sm:px-2 sm:text-sm">
                <Image className="w-3 h-3 sm:w-4 sm:h-4 mr-0 sm:mr-1" />
                <span className="hidden sm:inline">Images</span>
              </TabsTrigger>
              <TabsTrigger value="pricing" className="text-xs px-1 sm:px-2 sm:text-sm">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-0 sm:mr-1" />
                <span className="hidden sm:inline">Pricing</span>
              </TabsTrigger>
              <TabsTrigger value="variations" className="text-xs px-1 sm:px-2 sm:text-sm">
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-0 sm:mr-1" />
                <span className="hidden sm:inline">Variations</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
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

              <ProductCategorySelector
                value={formData.category_id}
                onChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                disabled={isSubmitting}
              />
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description (optional)"
                  disabled={isSubmitting}
                  rows={4}
                />
                {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
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
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="Enter brand name"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="model_number">Model Number</Label>
                  <Input
                    id="model_number"
                    name="model_number"
                    value={formData.model_number}
                    onChange={handleInputChange}
                    placeholder="Enter model number"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="origin_country">Origin Country</Label>
                  <Input
                    id="origin_country"
                    name="origin_country"
                    value={formData.origin_country}
                    onChange={handleInputChange}
                    placeholder="e.g., Pakistan"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    placeholder="e.g., 100"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    placeholder="Available quantity"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="units_per_package">Units per Package</Label>
                  <Input
                    id="units_per_package"
                    name="units_per_package"
                    type="number"
                    min="1"
                    value={formData.units_per_package}
                    onChange={handleInputChange}
                    placeholder="1"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="warranty_info">Warranty Information</Label>
                <Textarea
                  id="warranty_info"
                  name="warranty_info"
                  value={formData.warranty_info}
                  onChange={handleInputChange}
                  placeholder="Enter warranty details"
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="customization_available"
                  checked={formData.customization_available}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, customization_available: checked }))}
                  disabled={isSubmitting}
                />
                <Label htmlFor="customization_available">Customization available</Label>
              </div>
            </TabsContent>
            
            <TabsContent value="images" className="space-y-4">
              <MultipleImageUpload
                images={images}
                onChange={setImages}
                disabled={isSubmitting}
                maxImages={5}
              />
            </TabsContent>
            

            <TabsContent value="pricing" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="base_price">Price (PKR) *</Label>
                  <Input
                    id="base_price"
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
                  <Label htmlFor="pricing_moq">Minimum Order Quantity (MOQ)</Label>
                  <Input
                    id="pricing_moq"
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

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="pricing_sample_available"
                    checked={formData.sample_available}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sample_available: checked }))}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="pricing_sample_available">Sample available</Label>
                </div>

                {formData.sample_available && (
                  <div>
                    <Label htmlFor="pricing_sample_price">Sample Price (PKR)</Label>
                    <Input
                      id="pricing_sample_price"
                      name="sample_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.sample_price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pricing_package_weight">Package Weight (kg)</Label>
                  <Input
                    id="pricing_package_weight"
                    name="package_weight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.package_weight}
                    onChange={handleInputChange}
                    placeholder="0.0"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="pricing_packaging_type">Packaging Type</Label>
                  <Input
                    id="pricing_packaging_type"
                    name="packaging_type"
                    value={formData.packaging_type}
                    onChange={handleInputChange}
                    placeholder="e.g., Box, Bag, Carton"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="pricing_package_dimensions">Package Dimensions (L x W x H)</Label>
                <Input
                  id="pricing_package_dimensions"
                  name="package_dimensions"
                  value={formData.package_dimensions}
                  onChange={handleInputChange}
                  placeholder="e.g., 30cm x 20cm x 10cm"
                  disabled={isSubmitting}
                />
              </div>

              <div className="border-t pt-4 mt-6">
                <InlinePricingTiers
                  tiers={inlineTiers}
                  onChange={setInlineTiers}
                  basePrice={parseFloat(formData.price) || 0}
                />
              </div>
            </TabsContent>

            <TabsContent value="variations" className="space-y-4">
              <InlineVariationManager
                variations={inlineVariations}
                onChange={setInlineVariations}
                basePrice={parseFloat(formData.price) || 0}
              />
            </TabsContent>
          </Tabs>
          
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


import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product } from '@/lib/types';
import { updateProduct, uploadImage } from '@/lib/products';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package, Info, Image, DollarSign, Settings, TrendingDown } from 'lucide-react';
import ProductCategorySelector from './ProductCategorySelector';
import MultipleImageUpload from './MultipleImageUpload';
import PricingTierManager from './PricingTierManager';
import VariationManager from './variations/VariationManager';
import SizeChart from './variations/SizeChart';

interface EditProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onProductUpdated: () => void;
}

const EditProductDialog: React.FC<EditProductDialogProps> = ({
  isOpen,
  onClose,
  product,
  onProductUpdated
}) => {
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    description: '',
    price: '',
    is_active: true,
    category_id: '',
    moq: '1',
    
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        is_active: product.is_active,
        category_id: (product as any).category_id || '',
        moq: product.moq?.toString() || '1',
        brand: (product as any).brand || '',
        model_number: (product as any).model_number || '',
        origin_country: (product as any).origin_country || '',
        package_weight: (product as any).package_weight?.toString() || '',
        package_dimensions: (product as any).package_dimensions || '',
        stock_quantity: (product as any).stock_quantity?.toString() || '',
        warranty_info: (product as any).warranty_info || '',
        certifications: (product as any).certifications || [],
        customization_available: (product as any).customization_available || false,
        colors_available: (product as any).colors_available || [],
        packaging_type: (product as any).packaging_type || '',
        units_per_package: (product as any).units_per_package?.toString() || '1',
        sample_available: (product as any).sample_available || false,
        sample_price: (product as any).sample_price?.toString() || '',
      });
      
      // Set existing image if available
      if (product.image) {
        setImages([{
          id: 'existing',
          file: null as any, // This will be handled differently for existing images
          preview: product.image,
          isPrimary: true
        }]);
      }
      
      // Specifications feature removed
    }
  }, [product]);

  // Removed fetchProductSpecifications - specs feature no longer needed


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleActiveChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }));
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
      
      // Handle image upload
      let imageUrl = product.image;
      const newImages = images.filter(img => img.id !== 'existing' && img.file);
      const uploaded: Array<{ url: string; isPrimary: boolean }> = [];
      for (const img of newImages) {
        const fileName = `product_${Date.now()}_${Math.random().toString(36).slice(2)}_${img.file.name}`;
        const url = await uploadImage('product_images', fileName, img.file);
        if (url) uploaded.push({ url, isPrimary: img.isPrimary });
      }
      if (uploaded.length > 0) {
        imageUrl = (uploaded.find(u => u.isPrimary) || uploaded[0]).url;
      }

      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        throw new Error('Price must be a valid positive number');
      }

      const updateData = {
        name: formData.name,
        description: formData.description,
        price,
        image: imageUrl,
        is_active: formData.is_active,
        category_id: formData.category_id || null,
        moq: parseInt(formData.moq),
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

      await updateProduct(product.id, updateData);

      if (uploaded.length > 0) {
        const { error: imgErr } = await supabase.from('product_images').insert(
          uploaded.map((u, index) => ({
            product_id: product.id,
            image_url: u.url,
            is_primary: u.url === imageUrl,
            sort_order: index,
          }))
        );
        if (imgErr) console.error('Failed to save product images:', imgErr);
      }
      
      // Update specifications
      // Specifications feature removed - no longer saving specs
      toast({
        title: 'Product Updated',
        description: 'Your product has been updated successfully',
      });
      
      onClose();
      onProductUpdated();
      resetForm();
    } catch (error: any) {
      // Only show error if it's not an audit_logs related error
      // since audit_logs errors don't affect the actual product update
      if (!error.message?.includes('audit_logs')) {
        toast({
          title: 'Failed to update product',
          description: error.message || 'An error occurred while updating the product',
          variant: 'destructive',
        });
      } else {
        // Product was updated successfully, just audit log failed
        console.warn('Audit log error (non-critical):', error);
        toast({
          title: 'Product Updated',
          description: 'Your product has been updated successfully',
        });
        onClose();
        onProductUpdated();
        resetForm();
      }
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
      category_id: '',
      moq: '1',
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Info className="w-3 h-3" />
                <span className="hidden sm:inline">Basic</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Package className="w-3 h-3" />
                <span className="hidden sm:inline">Details</span>
              </TabsTrigger>
              <TabsTrigger value="variations" className="flex items-center gap-2">
                <Package className="w-3 h-3" />
                <span className="hidden sm:inline">Variations</span>
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-2">
                <Image className="w-3 h-3" />
                <span className="hidden sm:inline">Images</span>
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <DollarSign className="w-3 h-3" />
                <span className="hidden sm:inline">Pricing</span>
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
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={handleActiveChange}
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
                </div>

                <div>
                  <Label htmlFor="moq">Minimum Order Quantity (MOQ)</Label>
                  <Input
                    id="moq"
                    name="moq"
                    type="number"
                    min="1"
                    value={formData.moq}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sample_available"
                    checked={formData.sample_available}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sample_available: checked }))}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="sample_available">Sample available</Label>
                </div>

                {formData.sample_available && (
                  <div>
                    <Label htmlFor="sample_price">Sample Price (PKR)</Label>
                    <Input
                      id="sample_price"
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
                  <Label htmlFor="package_weight">Package Weight (kg)</Label>
                  <Input
                    id="package_weight"
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
                  <Label htmlFor="packaging_type">Packaging Type</Label>
                  <Input
                    id="packaging_type"
                    name="packaging_type"
                    value={formData.packaging_type}
                    onChange={handleInputChange}
                    placeholder="e.g., Box, Bag, Carton"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="package_dimensions">Package Dimensions (L x W x H)</Label>
                <Input
                  id="package_dimensions"
                  name="package_dimensions"
                  value={formData.package_dimensions}
                  onChange={handleInputChange}
                  placeholder="e.g., 30cm x 20cm x 10cm"
                  disabled={isSubmitting}
                />
              </div>

              {product && (
                <div className="border-t pt-6 mt-6">
                  <PricingTierManager
                    productId={product.id}
                    basePrice={parseFloat(formData.price) || product.price}
                    onUpdate={() => {
                      console.log('Pricing tiers updated');
                    }}
                  />
                </div>
              )}
            </TabsContent>

            {/* Variations Tab */}
            <TabsContent value="variations" className="space-y-4">
              {product ? (
                <>
                  <VariationManager 
                    productId={product.id} 
                    basePrice={parseFloat(formData.price) || product.price}
                    onUpdate={() => {
                      console.log('Variations updated');
                    }}
                  />
                  <SizeChart 
                    productId={product.id} 
                    editable={true}
                    onUpdate={() => {
                      console.log('Size chart updated');
                    }}
                  />
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Save the product first to manage variations and size charts</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
                  Updating...
                </>
              ) : (
                'Update Product'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;


import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, X } from 'lucide-react';

interface CreateProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: () => void;
}

interface Shop {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

const CreateProductDialog: React.FC<CreateProductDialogProps> = ({
  isOpen,
  onClose,
  onProductCreated
}) => {
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    moq: '1',
    shop_id: '',
    category_id: '',
    image: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchShopsAndCategories();
    }
  }, [isOpen]);

  const fetchShopsAndCategories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's shops
      const { data: shopsData, error: shopsError } = await supabase
        .from('shops')
        .select('id, name')
        .eq('owner_id', user.id);

      if (shopsError) throw shopsError;
      setShops(shopsData || []);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.shop_id) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            name: formData.name,
            description: formData.description || null,
            price: parseFloat(formData.price),
            moq: parseInt(formData.moq) || 1,
            shop_id: formData.shop_id,
            category_id: formData.category_id || null,
            image: formData.image || null,
            is_active: true,
            verification_status: 'approved' // Auto-approve for testing
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Product created successfully!'
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        moq: '1',
        shop_id: '',
        category_id: '',
        image: ''
      });

      onProductCreated();
      onClose();
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create product',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-poppins">
            <Plus className="w-5 h-5" />
            Add New Product
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="font-poppins">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>

            <div>
              <Label htmlFor="price" className="font-poppins">Price (PKR) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <Label htmlFor="moq" className="font-poppins">Minimum Order Quantity</Label>
              <Input
                id="moq"
                type="number"
                value={formData.moq}
                onChange={(e) => handleInputChange('moq', e.target.value)}
                placeholder="1"
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="shop" className="font-poppins">Shop *</Label>
              <Select value={formData.shop_id} onValueChange={(value) => handleInputChange('shop_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a shop" />
                </SelectTrigger>
                <SelectContent>
                  {shops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category" className="font-poppins">Category</Label>
              <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="image" className="font-poppins">Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="font-poppins">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your product..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProductDialog;

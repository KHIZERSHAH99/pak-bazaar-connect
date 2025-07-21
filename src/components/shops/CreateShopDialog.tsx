
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createShop, uploadImage } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface CreateShopDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onShopCreated: () => void;
}

const CreateShopDialog: React.FC<CreateShopDialogProps> = ({
  isOpen,
  onClose,
  onShopCreated
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    postal_code: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Shop name is required';
    } else if (formData.name.length < 2 || formData.name.length > 100) {
      newErrors.name = 'Shop name must be between 2 and 100 characters';
    }

    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact number is required';
    } else if (!/^(\+92|0)?3[0-9]{9}$/.test(formData.contact.replace(/\s|-/g, ''))) {
      newErrors.contact = 'Invalid Pakistani phone number format. Use: 03XXXXXXXXX or +923XXXXXXXXX';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.length < 10 || formData.address.length > 500) {
      newErrors.address = 'Address must be between 10 and 500 characters';
    }

    if (!formData.postal_code.trim()) {
      newErrors.postal_code = 'Postal code is required';
    } else if (!/^\d{5}$/.test(formData.postal_code)) {
      newErrors.postal_code = 'Pakistani postal code must be 5 digits';
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Logo image must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Logo must be an image file',
        variant: 'destructive',
      });
      return;
    }

    setLogoFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
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
      
      let logoUrl;
      if (logoFile) {
        logoUrl = await uploadImage(logoFile, 'shop_images');
      }

      const shopData = {
        name: formData.name.trim(),
        contact: formData.contact.trim(),
        address: formData.address.trim(),
        postal_code: formData.postal_code.trim(),
        logo: logoUrl,
      };

      await createShop(shopData);
      
      toast({
        title: 'Success',
        description: 'Shop created successfully!',
      });
      
      resetForm();
      onClose();
      onShopCreated();
    } catch (error: any) {
      console.error('Failed to create shop:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create shop. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contact: '',
      address: '',
      postal_code: '',
    });
    setLogoFile(null);
    setLogoPreview(null);
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Shop</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Shop Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter shop name"
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <Label htmlFor="contact">Contact Number *</Label>
            <Input
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              placeholder="03XXXXXXXXX or +923XXXXXXXXX"
              disabled={isSubmitting}
            />
            {errors.contact && <p className="text-sm text-destructive mt-1">{errors.contact}</p>}
          </div>
          
          <div>
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter complete shop address"
              disabled={isSubmitting}
              rows={3}
            />
            {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
          </div>
          
          <div>
            <Label htmlFor="postal_code">Postal Code *</Label>
            <Input
              id="postal_code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleInputChange}
              placeholder="5-digit postal code"
              disabled={isSubmitting}
              maxLength={5}
            />
            {errors.postal_code && <p className="text-sm text-destructive mt-1">{errors.postal_code}</p>}
          </div>
          
          <div>
            <Label htmlFor="logo">Shop Logo (optional, max 5MB)</Label>
            <div className="mt-1">
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                disabled={isSubmitting}
              />
            </div>
            {logoPreview && (
              <div className="mt-2">
                <img 
                  src={logoPreview} 
                  alt="Logo Preview" 
                  className="h-24 w-24 object-cover rounded-md border"
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
                'Create Shop'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateShopDialog;

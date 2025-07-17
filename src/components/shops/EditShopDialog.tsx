
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Shop, City } from '@/lib/types';
import { updateShop } from '@/lib/shops';
import { getCities } from '@/lib/marketplace';
import { uploadImage } from '@/lib/storage';

interface EditShopDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop | null;
  onShopUpdated: () => void;
}

const EditShopDialog: React.FC<EditShopDialogProps> = ({
  isOpen,
  onClose,
  shop,
  onShopUpdated
}) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    postal_code: '',
    city_id: '',
    logo: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Query for cities is removed since getCities might not exist - we'll fetch directly
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    // Fetch cities directly from Supabase
    const fetchCities = async () => {
      try {
        const citiesData = await getCities();
        setCities(citiesData);
      } catch (error) {
        console.error('Error fetching cities:', error);
        setCities([]);
      }
    };
    
    if (isOpen) {
      fetchCities();
    }
  }, [isOpen]);

  useEffect(() => {
    if (shop) {
      setFormData({
        name: shop.name || '',
        contact: shop.contact || '',
        address: shop.address || '',
        postal_code: shop.postal_code || '',
        city_id: shop.city_id || '',
        logo: shop.logo || ''
      });
    }
  }, [shop]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;

    setIsSubmitting(true);
    try {
      let logoUrl = formData.logo;

      // Upload new logo if selected
      if (logoFile) {
        logoUrl = await uploadImage(logoFile, 'shop_images');
      }

      await updateShop(shop.id, {
        name: formData.name,
        contact: formData.contact,
        address: formData.address,
        postal_code: formData.postal_code,
        city_id: formData.city_id || undefined,
        logo: logoUrl || undefined
      });

      toast({
        title: "Shop updated",
        description: "Your shop information has been updated successfully.",
      });

      onShopUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating shop:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update shop. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setLogoFile(file);
    }
  };

  if (!isOpen || !shop) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-poppins">Edit Shop Details</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="shop-name" className="font-poppins">Shop Name *</Label>
            <Input
              id="shop-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter shop name"
              required
            />
          </div>

          <div>
            <Label htmlFor="contact" className="font-poppins">Contact Number *</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="Enter contact number"
              required
            />
          </div>

          <div>
            <Label htmlFor="address" className="font-poppins">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter complete address"
              required
            />
          </div>

          <div>
            <Label htmlFor="postal-code" className="font-poppins">Postal Code *</Label>
            <Input
              id="postal-code"
              value={formData.postal_code}
              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              placeholder="Enter postal code"
              required
            />
          </div>

          <div>
            <Label htmlFor="city" className="font-poppins">City</Label>
            <Select value={formData.city_id} onValueChange={(value) => setFormData({ ...formData, city_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}, {city.province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="logo" className="font-poppins">Shop Logo</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pakistani_green-50 file:text-pakistani_green-700 hover:file:bg-pakistani_green-100"
            />
            {formData.logo && (
              <div className="mt-2">
                <img
                  src={formData.logo}
                  alt="Current logo"
                  className="w-16 h-16 object-cover rounded"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 font-poppins"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-pakistani_green-700 hover:bg-pakistani_green-800 font-poppins"
            >
              {isSubmitting ? 'Updating...' : 'Update Shop'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditShopDialog;


import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shop, City } from '@/lib/types';
import { updateShop } from '@/lib/shops';
import { supabase } from '@/integrations/supabase/client';

interface EditShopDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop | null;
  onShopUpdated: () => void;
}

// File upload function
const uploadImage = async (file: File, bucket: string) => {
  const user = await supabase.auth.getUser();
  
  if (!user.data.user) throw new Error('User not authenticated');
  
  const filePath = `${user.data.user.id}/${Date.now()}_${file.name}`;
  
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);
  
  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

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
    city_id: '',
    logo: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const { data, error } = await supabase
          .from('cities')
          .select('*')
          .order('name', { ascending: true });
        
        if (error) {
          console.error('Error fetching cities:', error);
          setCities([]);
        } else {
          setCities(data || []);
        }
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

      if (logoFile) {
        logoUrl = await uploadImage(logoFile, 'shop_images');
      }

      // Create the updates object with proper structure
      const updateData = {
        name: formData.name,
        contact: formData.contact,
        address: formData.address,
        postal_code: '',
        city_id: formData.city_id || undefined,
        logo: logoUrl || undefined
      };

      // Remove undefined values to match the function signature
      const cleanedUpdates = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      await updateShop(shop.id, cleanedUpdates);

      toast({
        title: t('shopUpdated'),
        description: t('shopUpdatedSuccessfully'),
      });

      onShopUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating shop:', error);
      toast({
        title: t('error'),
        description: error.message || t('failedToUpdateShop'),
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
          title: t('fileTooLarge'),
          description: t('selectImageSmaller'),
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
          <DialogTitle className="font-poppins">{t('editShopDetails')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="shop-name" className="font-poppins">{t('shopName')} *</Label>
            <Input
              id="shop-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('enterShopName')}
              required
            />
          </div>

          <div>
            <Label htmlFor="contact" className="font-poppins">{t('contactNumber')} *</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder={t('contactNumber')}
              required
            />
          </div>

          <div>
            <Label htmlFor="address" className="font-poppins">{t('address')} *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder={t('enterCompleteAddress')}
              required
            />
          </div>

          <div>
            <Label htmlFor="city" className="font-poppins">{t('city')}</Label>
            <Select value={formData.city_id} onValueChange={(value) => setFormData({ ...formData, city_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectCity')} />
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
            <Label htmlFor="logo" className="font-poppins">{t('shopLogo')}</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="file:mr-4 rtl:file:mr-0 rtl:file:ml-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
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
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-pakistani_green-700 hover:bg-pakistani_green-800 font-poppins"
            >
              {isSubmitting ? t('updating') : t('updateShop')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditShopDialog;

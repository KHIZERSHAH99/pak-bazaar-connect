import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getShopsByOwner, createProduct, uploadImage } from '@/lib/supabase';
import { Shop } from '@/lib/types';
import { Loader2, Camera, ImagePlus } from 'lucide-react';

interface QuickAddProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: () => void;
}

/**
 * Quick Add – 3 mandatory fields only: photo, name, price.
 * Camera-first for low-literacy shopkeepers on Android.
 * Bilingual (Urdu/English) labels. Everything else is optional
 * and can be filled later via the full editor.
 */
const QuickAddProductDialog: React.FC<QuickAddProductDialogProps> = ({
  isOpen,
  onClose,
  onProductCreated,
}) => {
  const { toast } = useToast();
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopId, setShopId] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getShopsByOwner();
        setShops(data);
        if (data.length === 1) setShopId(data[0].id);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen]);

  const reset = () => {
    setName('');
    setPrice('');
    setImageFile(null);
    setImagePreview(null);
    setShopId(shops.length === 1 ? shops[0].id : '');
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!shopId) {
      toast({ variant: 'destructive', title: 'Shop chunain · Select a shop' });
      return;
    }
    if (!imageFile) {
      toast({ variant: 'destructive', title: 'Tasveer laazmi · Photo required' });
      return;
    }
    if (!name.trim()) {
      toast({ variant: 'destructive', title: 'Naam likhen · Product name required' });
      return;
    }
    const priceNum = parseFloat(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      toast({ variant: 'destructive', title: 'Qeemat daalein · Enter a price' });
      return;
    }

    try {
      setSubmitting(true);
      const fileName = `product_${Date.now()}_${imageFile.name}`;
      const imageUrl = await uploadImage('product_images', fileName, imageFile);

      await createProduct({
        shop_id: shopId,
        name: name.trim(),
        description: null,
        price: priceNum,
        moq: 1,
        image: imageUrl,
        is_active: true,
        verification_status: 'pending',
      } as any);

      toast({
        title: 'Product shamil ho gayi ✓',
        description: 'Baaki tafseelat baad me bhar sakte hain · Add more details later',
      });
      reset();
      onClose();
      onProductCreated();
    } catch (e: any) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: e.message || 'Try again' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center py-12">
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
            <DialogTitle>Pehle shop banayen · Create a shop first</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Close</Button>
            <Button onClick={() => (window.location.href = '/dashboard/shops')}>
              Shop banayen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-poppins">
            Jaldi shamil karen · Quick Add
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Sirf 3 cheezein · Only 3 things needed
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Photo */}
          <div>
            <Label className="text-sm font-semibold">
              1. Tasveer · Photo <span className="text-destructive">*</span>
            </Label>
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={onFilePicked}
            />
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFilePicked}
            />
            {imagePreview ? (
              <div className="relative mt-2">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full h-48 object-cover rounded-lg border border-border"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-24 flex flex-col gap-1"
                  onClick={() => cameraRef.current?.click()}
                >
                  <Camera className="h-6 w-6" />
                  <span className="text-xs">Camera</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-24 flex flex-col gap-1"
                  onClick={() => galleryRef.current?.click()}
                >
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-xs">Gallery</span>
                </Button>
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="qa-name" className="text-sm font-semibold">
              2. Naam · Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="qa-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Misal: Sony headphones"
              className="h-12 text-base mt-1"
              disabled={submitting}
            />
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="qa-price" className="text-sm font-semibold">
              3. Qeemat (PKR) · Price <span className="text-destructive">*</span>
            </Label>
            <Input
              id="qa-price"
              type="number"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className="h-12 text-base mt-1"
              disabled={submitting}
            />
          </div>

          {/* Shop (only if >1) */}
          {shops.length > 1 && (
            <div>
              <Label className="text-sm font-semibold">Shop</Label>
              <Select value={shopId} onValueChange={setShopId} disabled={submitting}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Shop chunain" /></SelectTrigger>
                <SelectContent>
                  {shops.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center pt-1">
            Stock, tafseel, variations baad me shamil karen · Add stock, details & variations later
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="min-w-[120px] h-12 text-base font-semibold"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
            ) : (
              'Save · Mahfooz'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAddProductDialog;
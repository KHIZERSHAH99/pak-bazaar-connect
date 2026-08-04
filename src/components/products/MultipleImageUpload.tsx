import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MAX_PRODUCT_IMAGE_SIZE_KB } from '@/lib/constants';

interface ImagePreview {
  id: string;
  file: File;
  preview: string;
  isPrimary: boolean;
}

interface MultipleImageUploadProps {
  images: ImagePreview[];
  onChange: (images: ImagePreview[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({
  images,
  onChange,
  disabled = false,
  maxImages = 5
}) => {
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';

    if (files.length === 0) return;
    
    if (images.length + files.length > maxImages) {
      toast({
        title: 'Too many images',
        description: `You can only upload up to ${maxImages} images`,
        variant: 'destructive',
      });
      return;
    }

    const accepted = files.filter(file => {
      if (file.size > MAX_PRODUCT_IMAGE_SIZE_KB * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} is too large. Maximum size is ${MAX_PRODUCT_IMAGE_SIZE_KB / 1024}MB`,
          variant: 'destructive',
        });
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Unsupported file',
          description: `${file.name} is not an image`,
          variant: 'destructive',
        });
        return false;
      }
      return true;
    });

    if (accepted.length === 0) return;

    const readFile = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

    try {
      const previews = await Promise.all(accepted.map(readFile));
      const newImages: ImagePreview[] = accepted.map((file, index) => ({
        id: `${Date.now()}_${index}_${Math.random().toString(36).slice(2, 11)}`,
        file,
        preview: previews[index],
        isPrimary: images.length === 0 && index === 0,
      }));
      onChange([...images, ...newImages]);
    } catch {
      toast({
        title: 'Could not read images',
        description: 'Please try selecting the images again.',
        variant: 'destructive',
      });
    }
  };

  const removeImage = (id: string) => {
    const remaining = images.filter(img => img.id !== id);
    const hasPrimary = remaining.some(img => img.isPrimary);
    onChange(
      remaining.map((img, index) => ({
        ...img,
        isPrimary: hasPrimary ? img.isPrimary : index === 0,
      }))
    );
  };

  const setPrimaryImage = (id: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary: img.id === id
    }));
    onChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Product Images (max {maxImages})</Label>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={disabled || images.length >= maxImages}
            className="hidden"
            id="image-upload"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={disabled || images.length >= maxImages}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Images
          </Button>
        </div>
      </div>
      
      {images.length === 0 ? (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No images uploaded yet. Click "Upload Images" to add some.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                <img
                  src={image.preview}
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {image.isPrimary && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium">
                  Primary
                </div>
              )}
              
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!image.isPrimary && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setPrimaryImage(image.id)}
                    disabled={disabled}
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeImage(image.id)}
                  disabled={disabled}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        Each image must be less than 5MB. The first image will be used as the primary product image.
      </p>
    </div>
  );
};

export default MultipleImageUpload;
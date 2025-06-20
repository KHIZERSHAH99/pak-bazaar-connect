
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface AdCreativeFieldsProps {
  headline: string;
  onHeadlineChange: (value: string) => void;
  imageFile: File | null;
  onImageChange: (file: File | null) => void;
  imagePreview: string | null;
  errors: { headline?: string; image?: string };
  isSubmitting: boolean;
}

const AdCreativeFields: React.FC<AdCreativeFieldsProps> = ({
  headline,
  onHeadlineChange,
  imageFile,
  onImageChange,
  imagePreview,
  errors,
  isSubmitting
}) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    onImageChange(file || null);
  };

  return (
    <>
      <div>
        <Label htmlFor="headline">Advertisement Headline *</Label>
        <Input
          id="headline"
          name="headline"
          value={headline}
          onChange={(e) => onHeadlineChange(e.target.value)}
          placeholder="Write a catchy headline to attract customers"
          disabled={isSubmitting}
        />
        {errors.headline && <p className="text-sm text-destructive mt-1">{errors.headline}</p>}
      </div>
      
      <div>
        <Label htmlFor="image">Advertisement Image * (max 100KB)</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={isSubmitting}
          className="mt-1"
        />
        {errors.image && <p className="text-sm text-destructive mt-1">{errors.image}</p>}
        {imagePreview && (
          <div className="mt-2">
            <img 
              src={imagePreview} 
              alt="Ad Preview" 
              className="h-32 w-auto object-contain rounded-md border"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default AdCreativeFields;

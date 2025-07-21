
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { uploadImage } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface CreateAdDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdCreated: () => void;
}

const CreateAdDialog: React.FC<CreateAdDialogProps> = ({
  isOpen,
  onClose,
  onAdCreated
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    headline: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.headline.trim()) {
      newErrors.headline = 'Advertisement headline is required';
    } else if (formData.headline.length < 5 || formData.headline.length > 200) {
      newErrors.headline = 'Headline must be between 5 and 200 characters';
    }

    if (!imageFile) {
      newErrors.image = 'Advertisement image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        description: 'Advertisement image must be less than 100KB',
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

    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      let imageUrl;
      if (imageFile) {
        const fileName = `ad_${Date.now()}_${imageFile.name}`;
        imageUrl = await uploadImage('ad_images', fileName, imageFile);
      }

      const { data, error } = await supabase
        .from('ads')
        .insert([{
          wholesaler_id: user.id,
          headline: formData.headline.trim(),
          image: imageUrl,
          status: 'pending' as const
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating ad:', error);
        throw new Error('Failed to create advertisement');
      }
      
      toast({
        title: 'Success',
        description: 'Advertisement created successfully! It will be reviewed by admin before going live.',
      });
      
      resetForm();
      onClose();
      onAdCreated();
    } catch (error: any) {
      console.error('Failed to create ad:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create advertisement. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      headline: '',
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Advertisement</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="headline">Advertisement Headline *</Label>
            <Input
              id="headline"
              name="headline"
              value={formData.headline}
              onChange={handleInputChange}
              placeholder="Enter catchy headline for your ad"
              disabled={isSubmitting}
            />
            {errors.headline && <p className="text-sm text-destructive mt-1">{errors.headline}</p>}
          </div>
          
          <div>
            <Label htmlFor="image">Advertisement Image * (max 100KB)</Label>
            <div className="mt-1">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isSubmitting}
              />
            </div>
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

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Your advertisement will be reviewed by our admin team before going live. 
              This usually takes 24-48 hours.
            </p>
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
                'Create Advertisement'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAdDialog;

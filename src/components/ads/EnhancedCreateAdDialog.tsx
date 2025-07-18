
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createAd } from '@/lib/ads';
import { Upload, Target, DollarSign } from 'lucide-react';

interface EnhancedCreateAdDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdCreated?: () => void;
}

const EnhancedCreateAdDialog: React.FC<EnhancedCreateAdDialogProps> = ({
  isOpen,
  onClose,
  onAdCreated
}) => {
  const [formData, setFormData] = useState({
    headline: '',
    description: '',
    targetAudience: '',
    budget: '',
    duration: '30'
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.headline.trim()) {
        toast({
          title: "Missing Information",
          description: "Please provide a headline for your ad.",
          variant: "destructive"
        });
        return;
      }

      // Create ad data with proper typing
      const adData = {
        headline: formData.headline,
        image: undefined as string | undefined,
        budget_cap: 0,
        campaign_start_date: undefined as string | undefined,
        campaign_end_date: undefined as string | undefined
      };

      // If image exists, convert to data URL or handle upload
      if (image) {
        // For now, we'll use the preview URL or handle file upload separately
        // The createAd function expects a string URL, not a File
        adData.image = imagePreview || undefined;
      }

      await createAd(adData);

      toast({
        title: "Ad Created Successfully!",
        description: "Your advertisement has been submitted for review. You'll be notified once it's approved.",
      });

      // Reset form
      setFormData({
        headline: '',
        description: '',
        targetAudience: '',
        budget: '',
        duration: '30'
      });
      setImage(null);
      setImagePreview(null);
      
      onAdCreated?.();
      onClose();
    } catch (error: any) {
      toast({
        title: "Failed to Create Ad",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-pakistani_green-800 flex items-center gap-2">
            <Target className="h-6 w-6" />
            Create Advertisement Campaign
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Info */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">📢 Cost Per Order (CPO) Campaign</h3>
            <p className="text-sm text-blue-700">
              Pay only when customers place orders through your advertisement. Set budgets and track performance in real-time.
            </p>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="headline" className="text-gray-700 font-medium">
                Advertisement Headline *
              </Label>
              <Input
                id="headline"
                value={formData.headline}
                onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
                placeholder="Enter a compelling headline for your ad"
                className="mt-1 border-gray-300 focus:border-pakistani_green-500"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-700 font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your product or service..."
                className="mt-1 border-gray-300 focus:border-pakistani_green-500"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="image" className="text-gray-700 font-medium">
                Advertisement Image
              </Label>
              <div className="mt-1">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image')?.click()}
                  className="w-full border-gray-300 hover:border-pakistani_green-500"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {image ? 'Change Image' : 'Upload Image'}
                </Button>
              </div>

              {imagePreview && (
                <div className="mt-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Campaign Settings */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Campaign Settings (Coming Soon)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget" className="text-gray-600">Daily Budget</Label>
                <Input
                  id="budget"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="Rs. 500"
                  className="mt-1 border-gray-300"
                  disabled
                />
              </div>

              <div>
                <Label htmlFor="duration" className="text-gray-600">Campaign Duration (Days)</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="30"
                  className="mt-1 border-gray-300"
                  disabled
                />
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Advanced campaign settings and budget controls will be available soon.
            </p>
          </div>

          {/* Free Campaign Notice */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <Target className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800">🎯 Special Offer</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  First 10 wholesalers get FREE ads! Create your campaign now and start reaching more customers at no cost.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-pakistani_green-700 hover:bg-pakistani_green-800 text-white"
            >
              {isSubmitting ? 'Creating...' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedCreateAdDialog;


import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import EnhancedLoadingSpinner from '@/components/ui/enhanced-loading-spinner';

interface ProfileImageUploadProps {
  profile: any;
  onImageUpdate: () => void;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({ profile, onImageUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: t('file_too_large'),
        description: t('file_too_large_desc'),
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: t('invalid_file_type'),
        description: t('invalid_file_type_desc'),
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setImagePreview(URL.createObjectURL(file));

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      // Upload to Supabase Storage with proper path structure
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      // Update profile with image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image: data.publicUrl })
        .eq('id', profile.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      toast({
        title: t('profile_image_updated'),
        description: t('profile_image_updated_desc')
      });

      onImageUpdate();
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast({
        title: t('upload_failed'),
        description: error.message || t('upload_failed_desc'),
        variant: "destructive"
      });
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveConfirm = async () => {
    setUploading(true);
    try {
      // Remove from storage if exists
      if (profile.profile_image) {
        const pathParts = profile.profile_image.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const filePath = `${profile.id}/${fileName}`;
        if (fileName) {
          await supabase.storage
            .from('profile-images')
            .remove([filePath]);
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({ profile_image: null })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: t('profile_image_removed'),
        description: t('profile_image_removed_desc'),
        variant: "default"
      });

      setImagePreview(null);
      setShowRemoveDialog(false);
      onImageUpdate();
    } catch (error: any) {
      console.error('Remove image error:', error);
      toast({
        title: t('remove_failed'),
        description: error.message || t('remove_failed_desc'),
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Card className="p-6 text-center relative overflow-hidden">
        {uploading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <EnhancedLoadingSpinner 
              size="lg" 
              text={t('processing_image')} 
              variant="spinner"
            />
          </div>
        )}
        
        <div className="mb-4">
          <div className="relative inline-block">
            <Avatar className="h-24 w-24 border-4 border-pakistani_green-200 transition-all duration-200 hover:border-pakistani_green-300">
              <AvatarImage 
                src={imagePreview || profile.profile_image} 
                alt="Profile" 
                className="object-cover"
              />
              <AvatarFallback className="bg-pakistani_green-100 text-pakistani_green-700 text-2xl font-bold">
                {profile.email?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-pakistani_green-600 rounded-full p-2 shadow-lg">
              <Camera className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="profile-image-upload"
              disabled={uploading}
            />
            <label htmlFor="profile-image-upload">
              <Button 
                variant="outline" 
                className="w-full font-poppins hover:bg-pakistani_green-50 border-pakistani_green-200"
                disabled={uploading}
                asChild
              >
                <span className="flex items-center gap-2 cursor-pointer">
                  <Upload className="h-4 w-4" />
                  {uploading ? t('uploading') : t('upload_photo')}
                </span>
              </Button>
            </label>
          </div>

          {(profile.profile_image || imagePreview) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRemoveDialog(true)}
              disabled={uploading}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 font-poppins"
            >
              <X className="h-4 w-4 mr-2" />
              {t('remove_photo')}
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-3 font-poppins">
          {t('upload_photo_desc')}
        </p>
      </Card>

      <ConfirmationDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        title={t('remove_profile_image')}
        description={t('remove_image_confirm')}
        confirmText={t('remove_image')}
        cancelText={t('keep_image')}
        variant="destructive"
        onConfirm={handleRemoveConfirm}
        loading={uploading}
      />
    </>
  );
};

export default ProfileImageUpload;


import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfileImageUploadProps {
  profile: any;
  onImageUpdate: () => void;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({ profile, onImageUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 2MB",
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
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
      const filePath = `profiles/${fileName}`;

      // Create bucket if it doesn't exist (this will fail silently if it exists)
      await supabase.storage.from('profile-images').list('', { limit: 1 }).catch(() => {});

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) {
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
        throw updateError;
      }

      toast({
        title: "Profile image updated",
        description: "Your profile image has been successfully updated"
      });

      onImageUpdate();
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive"
      });
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    setUploading(true);
    try {
      // Remove from storage if exists
      if (profile.profile_image) {
        const fileName = profile.profile_image.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('profile-images')
            .remove([`profiles/${fileName}`]);
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({ profile_image: null })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Profile image removed",
        description: "Your profile image has been removed"
      });

      setImagePreview(null);
      onImageUpdate();
    } catch (error: any) {
      console.error('Remove image error:', error);
      toast({
        title: "Remove failed",
        description: error.message || "Failed to remove image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6 text-center">
      <div className="mb-4">
        <div className="relative inline-block">
          <Avatar className="h-24 w-24 border-4 border-pakistani_green-200">
            <AvatarImage 
              src={imagePreview || profile.profile_image} 
              alt="Profile" 
            />
            <AvatarFallback className="bg-pakistani_green-100 text-pakistani_green-700 text-2xl font-bold">
              {profile.email?.substring(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 -right-2 bg-pakistani_green-600 rounded-full p-2">
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
              className="w-full font-poppins"
              disabled={uploading}
              asChild
            >
              <span className="flex items-center gap-2 cursor-pointer">
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </span>
            </Button>
          </label>
        </div>

        {(profile.profile_image || imagePreview) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={removeImage}
            disabled={uploading}
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 font-poppins"
          >
            <X className="h-4 w-4 mr-2" />
            Remove Photo
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-3 font-poppins">
        Upload a photo to personalize your profile. Max 2MB.
      </p>
    </Card>
  );
};

export default ProfileImageUpload;

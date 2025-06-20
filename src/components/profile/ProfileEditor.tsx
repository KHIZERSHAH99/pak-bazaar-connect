
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit3, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfileEditorProps {
  profile: any;
  onProfileUpdate: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    phone_number: profile.phone_number || '',
    contact_name: profile.contact_name || '',
    address: profile.address || '',
    city: profile.city || '',
    postal_code: profile.postal_code || ''
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile information has been successfully updated"
      });

      setIsEditing(false);
      onProfileUpdate();
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      phone_number: profile.phone_number || '',
      contact_name: profile.contact_name || '',
      address: profile.address || '',
      city: profile.city || '',
      postal_code: profile.postal_code || ''
    });
    setIsEditing(false);
  };

  return (
    <Card className="overflow-hidden border-none shadow-md">
      <div className="bg-pakistani_green-500/20 dark:bg-pakistani_green-600/30 backdrop-blur-sm p-4 md:p-6 border-b border-pakistani_green-200/50 dark:border-pakistani_green-700/50">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-2 font-poppins text-pakistani_green-800 dark:text-pakistani_green-100">
              Personal Information
            </h2>
            <p className="text-pakistani_green-700 dark:text-pakistani_green-200 text-sm font-poppins">
              Manage your personal and contact details
            </p>
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-pakistani_green-700 hover:text-pakistani_green-800 hover:bg-pakistani_green-100 font-poppins"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 md:p-6 bg-background/95 dark:bg-background/95">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <Label htmlFor="contact_name" className="font-poppins">Full Name</Label>
            {isEditing ? (
              <Input
                id="contact_name"
                value={formData.contact_name}
                onChange={(e) => handleInputChange('contact_name', e.target.value)}
                placeholder="Enter your full name"
                className="font-poppins"
              />
            ) : (
              <div className="p-3 bg-muted/50 rounded-md border border-border/50">
                <p className="font-medium text-foreground font-poppins">
                  {profile.contact_name || 'Not provided'}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number" className="font-poppins">Phone Number</Label>
            {isEditing ? (
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                placeholder="Enter your phone number"
                className="font-poppins"
              />
            ) : (
              <div className="p-3 bg-muted/50 rounded-md border border-border/50">
                <p className="font-medium text-foreground font-poppins">
                  {profile.phone_number || 'Not provided'}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address" className="font-poppins">Address</Label>
            {isEditing ? (
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your address"
                className="font-poppins"
                rows={3}
              />
            ) : (
              <div className="p-3 bg-muted/50 rounded-md border border-border/50">
                <p className="font-medium text-foreground font-poppins">
                  {profile.address || 'Not provided'}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="font-poppins">City</Label>
            {isEditing ? (
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Enter your city"
                className="font-poppins"
              />
            ) : (
              <div className="p-3 bg-muted/50 rounded-md border border-border/50">
                <p className="font-medium text-foreground font-poppins">
                  {profile.city || 'Not provided'}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal_code" className="font-poppins">Postal Code</Label>
            {isEditing ? (
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                placeholder="Enter postal code"
                className="font-poppins"
              />
            ) : (
              <div className="p-3 bg-muted/50 rounded-md border border-border/50">
                <p className="font-medium text-foreground font-poppins">
                  {profile.postal_code || 'Not provided'}
                </p>
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3 mt-6 pt-4 border-t border-border/50">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white font-poppins"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
              className="font-poppins"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProfileEditor;

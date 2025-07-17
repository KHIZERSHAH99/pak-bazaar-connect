
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save, X } from 'lucide-react';

interface ProfileEditorProps {
  profile: any;
  onProfileUpdate: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, onProfileUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    contact_name: profile.contact_name || '',
    phone_number: profile.phone_number || '',
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
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your personal information has been successfully updated"
      });

      setEditing(false);
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
      contact_name: profile.contact_name || '',
      phone_number: profile.phone_number || '',
      address: profile.address || '',
      city: profile.city || '',
      postal_code: profile.postal_code || ''
    });
    setEditing(false);
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold font-poppins">Personal Information</h3>
        {!editing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
            className="font-poppins"
          >
            Edit
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="email" className="font-poppins">Email</Label>
          <Input
            id="email"
            value={profile.email}
            disabled
            className="bg-gray-50 font-poppins"
          />
        </div>

        <div>
          <Label htmlFor="contact_name" className="font-poppins">Contact Name</Label>
          <Input
            id="contact_name"
            value={formData.contact_name}
            onChange={(e) => handleInputChange('contact_name', e.target.value)}
            disabled={!editing}
            className="font-poppins"
          />
        </div>

        <div>
          <Label htmlFor="phone_number" className="font-poppins">Phone Number</Label>
          <Input
            id="phone_number"
            value={formData.phone_number}
            onChange={(e) => handleInputChange('phone_number', e.target.value)}
            disabled={!editing}
            className="font-poppins"
          />
        </div>

        <div>
          <Label htmlFor="address" className="font-poppins">Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            disabled={!editing}
            className="font-poppins"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city" className="font-poppins">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              disabled={!editing}
              className="font-poppins"
            />
          </div>
          <div>
            <Label htmlFor="postal_code" className="font-poppins">Postal Code</Label>
            <Input
              id="postal_code"
              value={formData.postal_code}
              onChange={(e) => handleInputChange('postal_code', e.target.value)}
              disabled={!editing}
              className="font-poppins"
            />
          </div>
        </div>

        {editing && (
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 font-poppins"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
              className="font-poppins"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProfileEditor;

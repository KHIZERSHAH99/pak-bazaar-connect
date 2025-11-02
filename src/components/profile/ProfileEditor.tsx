
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { uploadVerificationDocumentsEnhanced } from '@/lib/verification-enhanced';
import { Loader2, Save, X, Upload, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ProfileEditorProps {
  profile: any;
  onProfileUpdate: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, onProfileUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [cnicFile, setCnicFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
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
    setCnicFile(null);
    setSelfieFile(null);
    setEditing(false);
  };

  const handleFileChange = (type: 'cnic' | 'selfie', file: File | null) => {
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5242880) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPEG, PNG, or WebP image",
        variant: "destructive"
      });
      return;
    }

    if (type === 'cnic') {
      setCnicFile(file);
    } else {
      setSelfieFile(file);
    }
  };

  const handleUploadDocuments = async () => {
    if (!cnicFile || !selfieFile) {
      toast({
        title: "Missing files",
        description: "Please select both CNIC and selfie images",
        variant: "destructive"
      });
      return;
    }

    setUploadingDocs(true);
    try {
      await uploadVerificationDocumentsEnhanced(cnicFile, selfieFile);
      
      toast({
        title: "Documents uploaded",
        description: "Your verification documents have been submitted for review"
      });

      setCnicFile(null);
      setSelfieFile(null);
      onProfileUpdate();
    } catch (error: any) {
      console.error('Document upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingDocs(false);
    }
  };

  const getVerificationBadge = () => {
    const status = profile.verification_status;
    
    if (!status || status === 'unverified') {
      return <Badge variant="secondary" className="font-poppins"><Clock className="w-3 h-3 mr-1" />Not Verified</Badge>;
    }
    
    if (status === 'pending') {
      return <Badge variant="outline" className="font-poppins"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
    }
    
    if (status === 'approved') {
      return <Badge variant="default" className="font-poppins bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
    }
    
    if (status === 'rejected') {
      return <Badge variant="destructive" className="font-poppins"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    }
    
    return null;
  };

  return (
    <Card className="p-3 sm:p-4 md:p-6">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold font-poppins">Personal Information</h3>
        {!editing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
            className="font-poppins text-xs sm:text-sm h-8 sm:h-9"
          >
            Edit
          </Button>
        )}
      </div>

      <div className="space-y-3 sm:space-y-4">
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
          {editing ? (
            <PhoneInput
              value={formData.phone_number}
              onChange={(value) => handleInputChange('phone_number', value)}
              disabled={!editing}
              showValidation
              autoFormat
            />
          ) : (
            <>
              <Label htmlFor="phone_number" className="font-poppins">Phone Number</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                disabled
                className="font-poppins bg-gray-50"
              />
            </>
          )}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <Label htmlFor="city" className="font-poppins text-xs sm:text-sm">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              disabled={!editing}
              className="font-poppins text-sm h-9 sm:h-10"
            />
          </div>
          <div>
            <Label htmlFor="postal_code" className="font-poppins text-xs sm:text-sm">Postal Code</Label>
            <Input
              id="postal_code"
              value={formData.postal_code}
              onChange={(e) => handleInputChange('postal_code', e.target.value)}
              disabled={!editing}
              className="font-poppins text-sm h-9 sm:h-10"
            />
          </div>
        </div>

        {/* Verification Documents Section */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <Label className="font-poppins text-base">Identity Verification</Label>
            {getVerificationBadge()}
          </div>

          {profile.verification_status === 'approved' ? (
            <p className="text-sm text-muted-foreground font-poppins">
              Your identity has been verified ✓
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground font-poppins mb-4">
                {profile.verification_status === 'pending' 
                  ? 'Your documents are under review'
                  : 'Upload your CNIC and selfie to verify your identity'}
              </p>

              {profile.verification_status !== 'pending' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="cnic" className="font-poppins text-xs sm:text-sm">
                      CNIC Picture (Front or Back)
                    </Label>
                    <Input
                      id="cnic"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleFileChange('cnic', e.target.files?.[0] || null)}
                      className="font-poppins text-sm h-9 sm:h-10"
                    />
                    {cnicFile && (
                      <p className="text-xs text-muted-foreground mt-1 font-poppins">
                        Selected: {cnicFile.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="selfie" className="font-poppins text-xs sm:text-sm">
                      Selfie Picture
                    </Label>
                    <Input
                      id="selfie"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleFileChange('selfie', e.target.files?.[0] || null)}
                      className="font-poppins text-sm h-9 sm:h-10"
                    />
                    {selfieFile && (
                      <p className="text-xs text-muted-foreground mt-1 font-poppins">
                        Selected: {selfieFile.name}
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleUploadDocuments}
                    disabled={!cnicFile || !selfieFile || uploadingDocs}
                    className="w-full font-poppins text-xs sm:text-sm h-9 sm:h-10"
                    variant="outline"
                  >
                    {uploadingDocs ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Submit for Verification
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground font-poppins">
                    Maximum file size: 5MB. Accepted formats: JPEG, PNG, WebP
                  </p>
                </div>
              )}

              {profile.verification_status === 'rejected' && profile.verification_notes && (
                <div className="mt-3 p-3 bg-destructive/10 rounded-md">
                  <p className="text-sm font-poppins text-destructive">
                    <strong>Rejection Reason:</strong> {profile.verification_notes}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {editing && (
          <div className="flex gap-2 pt-3 sm:pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 font-poppins text-xs sm:text-sm h-9 sm:h-10"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
              className="font-poppins text-xs sm:text-sm h-9 sm:h-10"
            >
              <X className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProfileEditor;

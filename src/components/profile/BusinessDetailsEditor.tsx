
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit3, Save, X, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BusinessDetailsEditorProps {
  profile: any;
  onProfileUpdate: () => void;
}

const BusinessDetailsEditor: React.FC<BusinessDetailsEditorProps> = ({ profile, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    business_name: profile.business_name || '',
    business_type: profile.business_type || 'wholesaler',
    industry: profile.industry || '',
    years_in_business: profile.years_in_business || '',
    ntn_number: profile.ntn_number || '',
    strn_number: profile.strn_number || ''
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
      console.log('Saving business data:', formData);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', profile.id)
        .select();

      if (error) {
        console.error('Business details update error:', error);
        throw error;
      }

      console.log('Business details updated successfully:', data);

      toast({
        title: "Business details updated",
        description: "Your business information has been successfully updated"
      });

      setIsEditing(false);
      onProfileUpdate();
    } catch (error: any) {
      console.error('Business details update error:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update business details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      business_name: profile.business_name || '',
      business_type: profile.business_type || 'wholesaler',
      industry: profile.industry || '',
      years_in_business: profile.years_in_business || '',
      ntn_number: profile.ntn_number || '',
      strn_number: profile.strn_number || ''
    });
    setIsEditing(false);
  };

  return (
    <Card className="overflow-hidden border-none shadow-md">
      <div className="bg-pakistani_green-500/20 dark:bg-pakistani_green-600/30 backdrop-blur-sm p-4 md:p-6 border-b border-pakistani_green-200/50 dark:border-pakistani_green-700/50">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-2 font-poppins text-pakistani_green-800 dark:text-pakistani_green-100 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Business Information
            </h2>
            <p className="text-pakistani_green-700 dark:text-pakistani_green-200 text-sm font-poppins">
              Manage your business and company details
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
            <Label htmlFor="business_name" className="font-poppins">Business Name</Label>
            {isEditing ? (
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => handleInputChange('business_name', e.target.value)}
                placeholder="Enter your business name"
                className="font-poppins"
              />
            ) : (
              <div className="p-3 bg-muted/50 rounded-md border border-border/50">
                <p className="font-medium text-foreground font-poppins">
                  {profile.business_name || 'Not provided'}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_type" className="font-poppins">Business Type</Label>
            {isEditing ? (
              <Select value={formData.business_type} onValueChange={(value) => handleInputChange('business_type', value)}>
                <SelectTrigger className="font-poppins">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wholesaler">Wholesaler</SelectItem>
                  <SelectItem value="manufacturer">Manufacturer</SelectItem>
                  <SelectItem value="distributor">Distributor</SelectItem>
                  <SelectItem value="supplier">Supplier</SelectItem>
                  <SelectItem value="trader">Trader</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="p-3 bg-muted/50 rounded-md border border-border/50">
                <p className="font-medium text-foreground font-poppins capitalize">
                  {profile.business_type || 'Not provided'}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry" className="font-poppins">Industry</Label>
            {isEditing ? (
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                placeholder="e.g., Textiles, Electronics, Food"
                className="font-poppins"
              />
            ) : (
              <div className="p-3 bg-muted/50 rounded-md border border-border/50">
                <p className="font-medium text-foreground font-poppins">
                  {profile.industry || 'Not provided'}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="years_in_business" className="font-poppins">Years in Business</Label>
            {isEditing ? (
              <Select value={formData.years_in_business} onValueChange={(value) => handleInputChange('years_in_business', value)}>
                <SelectTrigger className="font-poppins">
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1">0-1 years</SelectItem>
                  <SelectItem value="1-3">1-3 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="5-10">5-10 years</SelectItem>
                  <SelectItem value="10+">10+ years</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="p-3 bg-muted/50 rounded-md border border-border/50">
                <p className="font-medium text-foreground font-poppins">
                  {profile.years_in_business || 'Not provided'}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ntn_number" className="font-poppins">NTN Number (Optional)</Label>
            {isEditing ? (
              <Input
                id="ntn_number"
                value={formData.ntn_number}
                onChange={(e) => handleInputChange('ntn_number', e.target.value)}
                placeholder="Enter NTN number"
                className="font-poppins"
              />
            ) : (
              <div className="p-3 bg-muted/50 rounded-md border border-border/50">
                <p className="font-medium text-foreground font-poppins">
                  {profile.ntn_number || 'Not provided'}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="strn_number" className="font-poppins">STRN Number (Optional)</Label>
            {isEditing ? (
              <Input
                id="strn_number"
                value={formData.strn_number}
                onChange={(e) => handleInputChange('strn_number', e.target.value)}
                placeholder="Enter STRN number"
                className="font-poppins"
              />
            ) : (
              <div className="p-3 bg-muted/50 rounded-md border border-border/50">
                <p className="font-medium text-foreground font-poppins">
                  {profile.strn_number || 'Not provided'}
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

export default BusinessDetailsEditor;

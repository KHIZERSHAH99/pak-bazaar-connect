
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Edit3, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BusinessDetailsProps {
  profile: any;
  onUpdate: () => void;
}

const BusinessDetails: React.FC<BusinessDetailsProps> = ({ profile, onUpdate }) => {
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
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Business details updated",
        description: "Your business information has been successfully updated"
      });

      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      console.error('Business update error:', error);
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
      <div className="bg-blue-500/20 dark:bg-blue-600/30 backdrop-blur-sm p-4 md:p-6 border-b border-blue-200/50 dark:border-blue-700/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-800/50 p-3 rounded-full">
              <Building2 className="h-5 w-5 text-blue-700 dark:text-blue-300" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-1 font-poppins text-blue-800 dark:text-blue-100">
                Business Information
              </h2>
              <p className="text-blue-700 dark:text-blue-200 text-sm font-poppins">
                Manage your business details and registration information
              </p>
            </div>
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-blue-700 hover:text-blue-800 hover:bg-blue-100 font-poppins"
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
                  <SelectItem value="distributor">Distributor</SelectItem>
                  <SelectItem value="manufacturer">Manufacturer</SelectItem>
                  <SelectItem value="retailer">Retailer</SelectItem>
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
                  <SelectValue placeholder="Select years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-2">1-2 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="6-10">6-10 years</SelectItem>
                  <SelectItem value="11-20">11-20 years</SelectItem>
                  <SelectItem value="20+">20+ years</SelectItem>
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
            <Label htmlFor="ntn_number" className="font-poppins">NTN Number</Label>
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
            <Label htmlFor="strn_number" className="font-poppins">STRN Number</Label>
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-poppins"
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

export default BusinessDetails;

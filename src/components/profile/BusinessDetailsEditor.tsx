import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save, X } from 'lucide-react';
interface BusinessDetailsEditorProps {
  profile: any;
  onProfileUpdate: () => void;
}
const BusinessDetailsEditor: React.FC<BusinessDetailsEditorProps> = ({
  profile,
  onProfileUpdate
}) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    business_name: profile.business_name || '',
    business_type: profile.business_type || 'wholesaler',
    industry: profile.industry || '',
    years_in_business: profile.years_in_business || '',
    ntn_number: profile.ntn_number || '',
    strn_number: profile.strn_number || ''
  });
  const {
    toast
  } = useToast();
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      const {
        error
      } = await supabase.from('profiles').update({
        ...formData,
        updated_at: new Date().toISOString()
      }).eq('id', profile.id);
      if (error) throw error;
      toast({
        title: "Business details updated",
        description: "Your business information has been successfully updated"
      });
      setEditing(false);
      onProfileUpdate();
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
    setEditing(false);
  };
  return <Card className="p-3 sm:p-4 md:p-6">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold font-poppins">Business Information</h3>
        {!editing && <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="font-poppins text-xs sm:text-sm h-8 sm:h-9">
            Edit
          </Button>}
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div>
          <Label htmlFor="business_name" className="font-poppins">Business Name</Label>
          <Input id="business_name" value={formData.business_name} onChange={e => handleInputChange('business_name', e.target.value)} disabled={!editing} className="font-poppins" />
        </div>

        

        <div>
          <Label htmlFor="industry" className="font-poppins">Industry</Label>
          <Input id="industry" value={formData.industry} onChange={e => handleInputChange('industry', e.target.value)} disabled={!editing} className="font-poppins" />
        </div>

        <div>
          <Label htmlFor="years_in_business" className="font-poppins">Years in Business</Label>
          <Select value={formData.years_in_business} onValueChange={value => handleInputChange('years_in_business', value)} disabled={!editing}>
            <SelectTrigger className="font-poppins">
              <SelectValue placeholder="Select years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-1">0-1 years</SelectItem>
              <SelectItem value="1-3">1-3 years</SelectItem>
              <SelectItem value="3-5">3-5 years</SelectItem>
              <SelectItem value="5-10">5-10 years</SelectItem>
              <SelectItem value="10+">10+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <Label htmlFor="ntn_number" className="font-poppins text-xs sm:text-sm">NTN Number</Label>
            <Input id="ntn_number" value={formData.ntn_number} onChange={e => handleInputChange('ntn_number', e.target.value)} disabled={!editing} className="font-poppins text-sm h-9 sm:h-10" />
          </div>
          <div>
            <Label htmlFor="strn_number" className="font-poppins text-xs sm:text-sm">STRN Number</Label>
            <Input id="strn_number" value={formData.strn_number} onChange={e => handleInputChange('strn_number', e.target.value)} disabled={!editing} className="font-poppins text-sm h-9 sm:h-10" />
          </div>
        </div>

        {editing && <div className="flex gap-2 pt-3 sm:pt-4">
            <Button onClick={handleSave} disabled={saving} className="flex-1 font-poppins text-xs sm:text-sm h-9 sm:h-10">
              {saving ? <>
                  <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  Saving...
                </> : <>
                  <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Save Changes
                </>}
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={saving} className="font-poppins text-xs sm:text-sm h-9 sm:h-10">
              <X className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Cancel
            </Button>
          </div>}
      </div>
    </Card>;
};
export default BusinessDetailsEditor;
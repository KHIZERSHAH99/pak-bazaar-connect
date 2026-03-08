import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { MapPin, Plus, Edit, Trash2, Star, Home, Building } from 'lucide-react';

interface Address {
  id: string;
  user_id: string;
  address_type: string;
  is_default: boolean;
  label?: string;
  street_address: string;
  area?: string;
  city: string;
  province: string;
  postal_code: string;
  contact_name?: string;
  contact_phone?: string;
  instructions?: string;
}

interface Province {
  id: string;
  name: string;
  code: string;
}

interface City {
  id: string;
  province_id: string;
  name: string;
  is_major: boolean;
}

interface AddressBookProps {
  onSelectAddress?: (address: Address) => void;
  showSelection?: boolean;
}

export const AddressBook = ({ onSelectAddress, showSelection = false }: AddressBookProps) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    street_address: '',
    area: '',
    city: '',
    province: 'Punjab',
    postal_code: '',
    contact_name: '',
    contact_phone: '',
    instructions: '',
    is_default: false
  });

  useEffect(() => {
    fetchAddresses();
    fetchProvincesAndCities();
  }, []);

  useEffect(() => {
    // Filter cities based on selected province
    if (formData.province) {
      const selectedProvince = provinces.find(p => p.name === formData.province);
      if (selectedProvince) {
        const provinceCities = cities.filter(c => c.province_id === selectedProvince.id);
        setFilteredCities(provinceCities);
      }
    }
  }, [formData.province, provinces, cities]);

  const fetchAddresses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('seller_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProvincesAndCities = async () => {
    try {
      const [provincesRes, citiesRes] = await Promise.all([
        supabase.from('provinces').select('*').order('name'),
        supabase.from('cities').select('*').order('name')
      ]);

      if (provincesRes.data) setProvinces(provincesRes.data);
      if (citiesRes.data) setCities(citiesRes.data);
    } catch (error) {
      console.error('Error fetching provinces and cities:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const addressData = {
        ...formData,
        user_id: user.id,
        address_type: 'delivery'
      };

      if (editingAddress) {
        const { error } = await supabase
          .from('seller_addresses')
          .update(addressData)
          .eq('id', editingAddress.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Address updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('seller_addresses')
          .insert([addressData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Address added successfully"
        });
      }

      setIsAddDialogOpen(false);
      setEditingAddress(null);
      resetForm();
      fetchAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: "Error",
        description: "Failed to save address",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const { error } = await supabase
        .from('seller_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Address deleted successfully"
      });
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive"
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const { error } = await supabase
        .from('seller_addresses')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Default address updated"
      });
      fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      toast({
        title: "Error",
        description: "Failed to set default address",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
      street_address: '',
      area: '',
      city: '',
      province: 'Punjab',
      postal_code: '',
      contact_name: '',
      contact_phone: '',
      instructions: '',
      is_default: false
    });
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label || '',
      street_address: address.street_address,
      area: address.area || '',
      city: address.city,
      province: address.province,
      postal_code: address.postal_code,
      contact_name: address.contact_name || '',
      contact_phone: address.contact_phone || '',
      instructions: address.instructions || '',
      is_default: address.is_default
    });
    setIsAddDialogOpen(true);
  };

  const getAddressIcon = (label?: string) => {
    if (label?.toLowerCase().includes('home')) return <Home className="h-4 w-4" />;
    if (label?.toLowerCase().includes('office')) return <Building className="h-4 w-4" />;
    return <MapPin className="h-4 w-4" />;
  };

  if (loading) {
    return <div className="text-center py-4">Loading addresses...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Delivery Addresses</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingAddress(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Address Label</Label>
                <Input
                  placeholder="e.g., Home, Office, Warehouse"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                />
              </div>

              <div>
                <Label>Contact Name *</Label>
                <Input
                  placeholder="Recipient's name"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                />
              </div>

              <div>
                <Label>Contact Phone *</Label>
                <Input
                  placeholder="03XX-XXXXXXX"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>

              <div>
                <Label>Street Address *</Label>
                <Input
                  placeholder="House/Building No, Street name"
                  value={formData.street_address}
                  onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Area/Locality</Label>
                <Input
                  placeholder="e.g., Gulberg, DHA, Model Town"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Province *</Label>
                  <Select 
                    value={formData.province}
                    onValueChange={(value) => setFormData({ ...formData, province: value, city: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map(province => (
                        <SelectItem key={province.id} value={province.name}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>City *</Label>
                  <Select 
                    value={formData.city}
                    onValueChange={(value) => setFormData({ ...formData, city: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCities.map(city => (
                        <SelectItem key={city.id} value={city.name}>
                          {city.name} {city.is_major && '★'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Postal Code *</Label>
                <Input
                  placeholder="5-digit postal code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  maxLength={5}
                  required
                />
              </div>

              <div>
                <Label>Delivery Instructions</Label>
                <Textarea
                  placeholder="Any special instructions for delivery"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                />
                <Label htmlFor="default">Set as default address</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingAddress(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingAddress ? 'Update' : 'Add'} Address
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <Card className="p-8 text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No addresses saved yet</p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Address
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {addresses.map((address) => (
            <Card key={address.id} className={`p-4 ${address.is_default ? 'border-primary' : ''}`}>
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getAddressIcon(address.label)}
                    <span className="font-semibold">{address.label || 'Delivery Address'}</span>
                    {address.is_default && (
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                        Default
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {address.contact_name} • {address.contact_phone}
                  </p>
                  
                  <p className="mt-2">
                    {address.street_address}
                    {address.area && `, ${address.area}`}
                  </p>
                  <p>
                    {address.city}, {address.province} {address.postal_code}
                  </p>
                  
                  {address.instructions && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Note: {address.instructions}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {showSelection && onSelectAddress && (
                    <Button
                      size="sm"
                      onClick={() => onSelectAddress(address)}
                    >
                      Select
                    </Button>
                  )}
                  {!address.is_default && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(address)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(address.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
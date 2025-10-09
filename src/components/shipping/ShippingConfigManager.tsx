import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Package, Truck, MapPin, DollarSign, Zap, Save, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ShippingConfigManagerProps {
  shopId: string;
}

interface ShippingConfig {
  id?: string;
  shop_id: string;
  shipping_method: 'flat_rate' | 'weight_based' | 'city_based' | 'free_above_amount' | 'custom';
  flat_rate_cost?: number;
  free_shipping_above?: number;
  base_weight_rate?: number;
  additional_weight_rate?: number;
  city_rates?: Record<string, number>;
  is_active: boolean;
  estimated_delivery_days: number;
  express_shipping_available: boolean;
  express_shipping_cost?: number;
  express_delivery_days: number;
}

const MAJOR_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana'
];

const ShippingConfigManager: React.FC<ShippingConfigManagerProps> = ({ shopId }) => {
  const [config, setConfig] = useState<ShippingConfig>({
    shop_id: shopId,
    shipping_method: 'flat_rate',
    flat_rate_cost: 150,
    is_active: true,
    estimated_delivery_days: 3,
    express_shipping_available: false,
    express_delivery_days: 1,
  });
  const [cityRates, setCityRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchShippingConfig();
  }, [shopId]);

  const fetchShippingConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('shipping_configs')
        .select('*')
        .eq('shop_id', shopId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig(data as any);
        if (data.city_rates) {
          setCityRates(data.city_rates as Record<string, number>);
        }
      }
    } catch (error: any) {
      console.error('Error fetching shipping config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const configToSave = {
        ...config,
        city_rates: config.shipping_method === 'city_based' ? cityRates : null,
      };

      if (config.id) {
        const { error } = await supabase
          .from('shipping_configs')
          .update(configToSave)
          .eq('id', config.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('shipping_configs')
          .insert([configToSave]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Shipping configuration saved successfully",
      });

      await fetchShippingConfig();
    } catch (error: any) {
      console.error('Error saving shipping config:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save shipping configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Card><CardContent className="p-6">Loading shipping configuration...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Shipping Configuration
        </CardTitle>
        <CardDescription>
          Configure how shipping costs are calculated for your shop
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Shipping Method Selection */}
        <div className="space-y-2">
          <Label>Shipping Calculation Method</Label>
          <Select
            value={config.shipping_method}
            onValueChange={(value: any) => setConfig({ ...config, shipping_method: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flat_rate">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Flat Rate - Same cost for all orders
                </div>
              </SelectItem>
              <SelectItem value="weight_based">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Weight Based - Cost based on product weight
                </div>
              </SelectItem>
              <SelectItem value="city_based">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  City Based - Different rates for different cities
                </div>
              </SelectItem>
              <SelectItem value="free_above_amount">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Free Above Amount - Free shipping on large orders
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Flat Rate Settings */}
        {(config.shipping_method === 'flat_rate' || config.shipping_method === 'free_above_amount') && (
          <div className="space-y-2">
            <Label>Flat Shipping Rate (PKR)</Label>
            <Input
              type="number"
              value={config.flat_rate_cost || ''}
              onChange={(e) => setConfig({ ...config, flat_rate_cost: parseFloat(e.target.value) })}
              placeholder="150"
            />
            <p className="text-sm text-muted-foreground">
              Standard shipping cost for all orders
            </p>
          </div>
        )}

        {/* Free Shipping Threshold */}
        <div className="space-y-2">
          <Label>Free Shipping Above (PKR) - Optional</Label>
          <Input
            type="number"
            value={config.free_shipping_above || ''}
            onChange={(e) => setConfig({ ...config, free_shipping_above: parseFloat(e.target.value) || undefined })}
            placeholder="5000"
          />
          <p className="text-sm text-muted-foreground">
            Offer free shipping for orders above this amount
          </p>
        </div>

        {/* Weight-Based Settings */}
        {config.shipping_method === 'weight_based' && (
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Weight-Based Pricing</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Base Rate (PKR)</Label>
                <Input
                  type="number"
                  value={config.base_weight_rate || ''}
                  onChange={(e) => setConfig({ ...config, base_weight_rate: parseFloat(e.target.value) })}
                  placeholder="50"
                />
                <p className="text-xs text-muted-foreground">Starting cost</p>
              </div>
              <div className="space-y-2">
                <Label>Per KG Rate (PKR)</Label>
                <Input
                  type="number"
                  value={config.additional_weight_rate || ''}
                  onChange={(e) => setConfig({ ...config, additional_weight_rate: parseFloat(e.target.value) })}
                  placeholder="20"
                />
                <p className="text-xs text-muted-foreground">Cost per kilogram</p>
              </div>
            </div>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Formula: Base Rate + (Weight in KG × Per KG Rate)
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* City-Based Settings */}
        {config.shipping_method === 'city_based' && (
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">City-Based Rates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {MAJOR_CITIES.map((city) => (
                <div key={city} className="flex items-center gap-2">
                  <Label className="min-w-[120px]">{city}</Label>
                  <Input
                    type="number"
                    value={cityRates[city] || ''}
                    onChange={(e) => setCityRates({ ...cityRates, [city]: parseFloat(e.target.value) || 0 })}
                    placeholder="150"
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estimated Delivery */}
        <div className="space-y-2">
          <Label>Estimated Delivery Days</Label>
          <Input
            type="number"
            value={config.estimated_delivery_days}
            onChange={(e) => setConfig({ ...config, estimated_delivery_days: parseInt(e.target.value) || 3 })}
            min="1"
            max="30"
          />
        </div>

        {/* Express Shipping */}
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                Express Shipping Option
              </Label>
              <p className="text-sm text-muted-foreground">
                Offer faster delivery for an additional fee
              </p>
            </div>
            <Switch
              checked={config.express_shipping_available}
              onCheckedChange={(checked) => setConfig({ ...config, express_shipping_available: checked })}
            />
          </div>

          {config.express_shipping_available && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label>Express Cost (PKR)</Label>
                <Input
                  type="number"
                  value={config.express_shipping_cost || ''}
                  onChange={(e) => setConfig({ ...config, express_shipping_cost: parseFloat(e.target.value) })}
                  placeholder="300"
                />
              </div>
              <div className="space-y-2">
                <Label>Express Delivery Days</Label>
                <Input
                  type="number"
                  value={config.express_delivery_days}
                  onChange={(e) => setConfig({ ...config, express_delivery_days: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="7"
                />
              </div>
            </div>
          )}
        </div>

        {/* Active Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <Label>Enable Shipping Configuration</Label>
            <p className="text-sm text-muted-foreground">
              Activate this shipping configuration for your shop
            </p>
          </div>
          <Switch
            checked={config.is_active}
            onCheckedChange={(checked) => setConfig({ ...config, is_active: checked })}
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
          size="lg"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Shipping Configuration'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ShippingConfigManager;

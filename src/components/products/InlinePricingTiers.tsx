import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

export interface InlinePricingTier {
  min_quantity: number;
  max_quantity?: number | null;
  unit_price: number;
}

interface InlinePricingTiersProps {
  tiers: InlinePricingTier[];
  onChange: (tiers: InlinePricingTier[]) => void;
  basePrice: number;
}

const InlinePricingTiers: React.FC<InlinePricingTiersProps> = ({
  tiers,
  onChange,
  basePrice
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTier, setNewTier] = useState<InlinePricingTier>({
    min_quantity: 1,
    max_quantity: null,
    unit_price: basePrice
  });

  const handleAddTier = () => {
    if (newTier.min_quantity <= 0 || newTier.unit_price <= 0) return;

    const updatedTiers = [...tiers, newTier]
      .sort((a, b) => a.min_quantity - b.min_quantity);
    
    onChange(updatedTiers);
    
    // Reset form
    setNewTier({
      min_quantity: 1,
      max_quantity: null,
      unit_price: basePrice
    });
    setIsAdding(false);
  };

  const handleDeleteTier = (index: number) => {
    const updated = tiers.filter((_, i) => i !== index);
    onChange(updated);
  };

  const calculateDiscount = (tierPrice: number) => {
    if (basePrice <= 0) return 0;
    return Math.round(((basePrice - tierPrice) / basePrice) * 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Bulk Pricing Tiers</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Tier
        </Button>
      </div>

      {isAdding && (
        <div className="p-4 border rounded-lg space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="min_quantity">Min Quantity *</Label>
              <Input
                id="min_quantity"
                type="number"
                min="1"
                value={newTier.min_quantity}
                onChange={(e) => setNewTier(prev => ({ ...prev, min_quantity: parseInt(e.target.value) || 1 }))}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="max_quantity">Max Quantity</Label>
              <Input
                id="max_quantity"
                type="number"
                min={newTier.min_quantity + 1}
                value={newTier.max_quantity || ''}
                onChange={(e) => setNewTier(prev => ({ 
                  ...prev, 
                  max_quantity: e.target.value ? parseInt(e.target.value) : null 
                }))}
                placeholder="Unlimited"
              />
            </div>
            <div>
              <Label htmlFor="unit_price">Unit Price *</Label>
              <Input
                id="unit_price"
                type="number"
                min="0.01"
                step="0.01"
                value={newTier.unit_price}
                onChange={(e) => setNewTier(prev => ({ ...prev, unit_price: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAddTier}
              disabled={newTier.min_quantity <= 0 || newTier.unit_price <= 0}
            >
              Add Tier
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {tiers.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Base Price: PKR {basePrice.toFixed(2)}
          </div>
          {tiers.map((tier, index) => {
            const discount = calculateDiscount(tier.unit_price);
            return (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="font-medium">
                      {tier.min_quantity}
                      {tier.max_quantity ? ` - ${tier.max_quantity}` : '+'} units
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-primary">
                      PKR {tier.unit_price.toFixed(2)}
                    </span>
                    {discount > 0 && (
                      <span className="ml-2 text-sm text-green-600">
                        ({discount}% off)
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTier(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InlinePricingTiers;
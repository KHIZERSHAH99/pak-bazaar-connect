import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import ColorSwatch from './variations/ColorSwatch';

export interface InlineVariation {
  variation_type: string;
  variation_value: string;
  variation_label?: string;
  hex_color?: string;
  price_adjustment?: number;
  stock_quantity?: number;
  is_available: boolean;
  sort_order: number;
  image_url?: string;
}

interface InlineVariationManagerProps {
  variations: InlineVariation[];
  onChange: (variations: InlineVariation[]) => void;
  basePrice: number;
}

const InlineVariationManager: React.FC<InlineVariationManagerProps> = ({
  variations,
  onChange,
  basePrice
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newVariation, setNewVariation] = useState<InlineVariation>({
    variation_type: 'color',
    variation_value: '',
    variation_label: '',
    hex_color: '',
    price_adjustment: 0,
    stock_quantity: 0,
    is_available: true,
    sort_order: variations.length
  });

  const handleAddVariation = () => {
    if (!newVariation.variation_value) return;

    onChange([...variations, { ...newVariation, sort_order: variations.length }]);
    
    // Reset form
    setNewVariation({
      variation_type: 'color',
      variation_value: '',
      variation_label: '',
      hex_color: '',
      price_adjustment: 0,
      stock_quantity: 0,
      is_available: true,
      sort_order: variations.length + 1
    });
    setIsAdding(false);
  };

  const handleDeleteVariation = (index: number) => {
    const updated = variations.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdateVariation = (index: number, updates: Partial<InlineVariation>) => {
    const updated = [...variations];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Product Variations</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Variation
        </Button>
      </div>

      {isAdding && (
        <div className="p-4 border rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="variation_type">Type</Label>
              <select
                id="variation_type"
                className="w-full p-2 border rounded-md"
                value={newVariation.variation_type}
                onChange={(e) => setNewVariation(prev => ({ ...prev, variation_type: e.target.value }))}
              >
                <option value="color">Color</option>
                <option value="size">Size</option>
                <option value="material">Material</option>
                <option value="style">Style</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="variation_value">Value *</Label>
              <Input
                id="variation_value"
                value={newVariation.variation_value}
                onChange={(e) => setNewVariation(prev => ({ ...prev, variation_value: e.target.value }))}
                placeholder="e.g., Red, Large, Cotton"
              />
            </div>
          </div>

          {newVariation.variation_type === 'color' && (
            <div>
              <Label htmlFor="hex_color">Color Code</Label>
              <Input
                id="hex_color"
                type="color"
                value={newVariation.hex_color || '#000000'}
                onChange={(e) => setNewVariation(prev => ({ ...prev, hex_color: e.target.value }))}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price_adjustment">Price Adjustment</Label>
              <Input
                id="price_adjustment"
                type="number"
                value={newVariation.price_adjustment}
                onChange={(e) => setNewVariation(prev => ({ ...prev, price_adjustment: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="stock_quantity">Stock Quantity</Label>
              <Input
                id="stock_quantity"
                type="number"
                min="0"
                value={newVariation.stock_quantity}
                onChange={(e) => setNewVariation(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="variation_label">Display Label (Optional)</Label>
            <Input
              id="variation_label"
              value={newVariation.variation_label}
              onChange={(e) => setNewVariation(prev => ({ ...prev, variation_label: e.target.value }))}
              placeholder="Optional label for display"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAddVariation}
              disabled={!newVariation.variation_value}
            >
              Add
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

      {variations.length > 0 && (
        <div className="space-y-2">
          {variations.map((variation, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {variation.variation_type === 'color' && variation.hex_color && (
                  <ColorSwatch
                    color={variation.variation_value}
                    hex={variation.hex_color}
                    size="sm"
                  />
                )}
                <div>
                  <span className="font-medium capitalize">{variation.variation_type}: </span>
                  <span>{variation.variation_label || variation.variation_value}</span>
                  {variation.stock_quantity !== undefined && (
                    <span className="text-sm text-muted-foreground ml-2">
                      (Stock: {variation.stock_quantity})
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {variation.price_adjustment !== undefined && variation.price_adjustment !== 0 && (
                  <span className="text-sm">
                    {variation.price_adjustment > 0 ? '+' : ''}PKR {variation.price_adjustment}
                  </span>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteVariation(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InlineVariationManager;
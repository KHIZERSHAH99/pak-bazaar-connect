import React from 'react';
import { Card } from '@/components/ui/card';
import ColorSwatch from './variations/ColorSwatch';
import SizeSelector from './variations/SizeSelector';

const TestVariations: React.FC = () => {
  const [selectedColor, setSelectedColor] = React.useState<string>('');
  const [selectedSize, setSelectedSize] = React.useState<string>('');

  const colors = [
    { color: 'Red', hex: '#FF0000' },
    { color: 'Blue', hex: '#0000FF' },
    { color: 'Green', hex: '#00FF00' },
    { color: 'Black', hex: '#000000' },
    { color: 'White', hex: '#FFFFFF' }
  ];

  const sizes = [
    { value: 'XS', label: 'Extra Small', stock: 5, priceAdjustment: -50 },
    { value: 'S', label: 'Small', stock: 10, priceAdjustment: 0 },
    { value: 'M', label: 'Medium', stock: 15, priceAdjustment: 0 },
    { value: 'L', label: 'Large', stock: 8, priceAdjustment: 50 },
    { value: 'XL', label: 'Extra Large', stock: 3, priceAdjustment: 100 },
    { value: 'XXL', label: '2X Large', stock: 0, available: false }
  ];

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Product Variations Test</h2>
      
      {/* Color Swatches */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold">Color Selection</h3>
        <div className="flex gap-3">
          {colors.map((c) => (
            <ColorSwatch
              key={c.color}
              color={c.color}
              hex={c.hex}
              label={c.color}
              selected={selectedColor === c.color}
              onClick={() => setSelectedColor(c.color)}
              size="md"
            />
          ))}
        </div>
        {selectedColor && (
          <p className="text-sm text-muted-foreground">Selected: {selectedColor}</p>
        )}
      </div>

      {/* Size Selector */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Size Selection</h3>
        <SizeSelector
          sizes={sizes}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
          showStock={true}
          basePrice={1000}
          currency="PKR"
        />
      </div>

      {/* Summary */}
      {(selectedColor || selectedSize) && (
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Selected Variations:</h4>
          <ul className="text-sm space-y-1">
            {selectedColor && <li>Color: {selectedColor}</li>}
            {selectedSize && <li>Size: {selectedSize}</li>}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default TestVariations;
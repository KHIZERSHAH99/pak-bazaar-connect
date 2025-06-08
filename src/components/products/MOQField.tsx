
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Package } from 'lucide-react';

interface MOQFieldProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const MOQField: React.FC<MOQFieldProps> = ({ value, onChange, disabled }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="moq" className="flex items-center gap-2">
        <Package className="h-4 w-4" />
        Minimum Order Quantity (MOQ)
      </Label>
      <Input
        id="moq"
        type="number"
        min="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 1)}
        disabled={disabled}
        placeholder="Enter minimum order quantity"
      />
      <p className="text-sm text-gray-600">
        Set the minimum quantity buyers must order for this product
      </p>
    </div>
  );
};

export default MOQField;

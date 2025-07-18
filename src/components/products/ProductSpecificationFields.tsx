import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';

interface Specification {
  id: string;
  name: string;
  value: string;
}

interface ProductSpecificationFieldsProps {
  specifications: Specification[];
  onChange: (specs: Specification[]) => void;
  disabled?: boolean;
}

const ProductSpecificationFields: React.FC<ProductSpecificationFieldsProps> = ({
  specifications,
  onChange,
  disabled = false
}) => {
  const addSpecification = () => {
    const newSpec: Specification = {
      id: Date.now().toString(),
      name: '',
      value: ''
    };
    onChange([...specifications, newSpec]);
  };

  const removeSpecification = (id: string) => {
    onChange(specifications.filter(spec => spec.id !== id));
  };

  const updateSpecification = (id: string, field: 'name' | 'value', value: string) => {
    onChange(
      specifications.map(spec =>
        spec.id === id ? { ...spec, [field]: value } : spec
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Product Specifications</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSpecification}
          disabled={disabled}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Specification
        </Button>
      </div>
      
      {specifications.length === 0 ? (
        <p className="text-sm text-muted-foreground">No specifications added yet.</p>
      ) : (
        <div className="space-y-3">
          {specifications.map((spec) => (
            <div key={spec.id} className="flex gap-3 items-start">
              <div className="flex-1">
                <Input
                  placeholder="Specification name (e.g., Material)"
                  value={spec.name}
                  onChange={(e) => updateSpecification(spec.id, 'name', e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Specification value (e.g., Cotton)"
                  value={spec.value}
                  onChange={(e) => updateSpecification(spec.id, 'value', e.target.value)}
                  disabled={disabled}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeSpecification(spec.id)}
                disabled={disabled}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductSpecificationFields;
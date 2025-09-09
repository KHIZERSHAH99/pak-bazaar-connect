import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Size {
  value: string;
  label?: string;
  stock?: number;
  available?: boolean;
  priceAdjustment?: number;
}

interface SizeSelectorProps {
  sizes: Size[];
  selectedSize?: string;
  onSelectSize: (size: string) => void;
  showStock?: boolean;
  basePrice?: number;
  currency?: string;
  disabled?: boolean;
}

const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  selectedSize,
  onSelectSize,
  showStock = false,
  basePrice,
  currency = "PKR",
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">Size</label>
        {selectedSize && (
          <span className="text-sm text-muted-foreground">
            Selected: {sizes.find(s => s.value === selectedSize)?.label || selectedSize}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isSelected = selectedSize === size.value;
          const isAvailable = size.available !== false && (!size.stock || size.stock > 0);
          const adjustedPrice = basePrice && size.priceAdjustment 
            ? basePrice + size.priceAdjustment 
            : basePrice;

          return (
            <div key={size.value} className="relative">
              <Button
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onSelectSize(size.value)}
                disabled={disabled || !isAvailable}
                className={cn(
                  "min-w-[60px] relative",
                  !isAvailable && "opacity-50 cursor-not-allowed"
                )}
              >
                <span>{size.label || size.value}</span>
                {showStock && size.stock !== undefined && size.stock <= 5 && size.stock > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 text-xs px-1 py-0 h-4"
                  >
                    {size.stock}
                  </Badge>
                )}
              </Button>
              {size.priceAdjustment && size.priceAdjustment !== 0 && adjustedPrice && (
                <span className="text-xs text-muted-foreground mt-1 block text-center">
                  {currency} {adjustedPrice.toLocaleString()}
                </span>
              )}
              {!isAvailable && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-background px-2 text-xs text-muted-foreground">
                    Out of Stock
                  </span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SizeSelector;
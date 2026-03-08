
import React from "react";
import { ProductVariation } from "@/data/demoProducts";

interface VariationPickerProps {
  variations: ProductVariation[];
  selected: ProductVariation | null;
  onSelect: (variation: ProductVariation) => void;
}

const VariationPicker: React.FC<VariationPickerProps> = ({ variations, selected, onSelect }) => {
  if (!variations || !variations.length) return null;
  // If only one variation type (color or size or both), display as buttons
  const hasColor = variations.some(v => v.color);
  const hasSize = variations.some(v => v.size);

  return (
    <div className="mb-4">
      <div className="flex gap-4 items-center">
        {hasColor && (
          <div>
            <div className="font-medium mb-1">Color:</div>
            <div className="flex gap-2">
              {[...new Set(variations.map(v => v.color))].map((color) =>
                color ? (
                  <button
                    key={color}
                    className={`px-3 py-1 rounded border font-poppins ${selected?.color === color ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    onClick={() => {
                      const firstMatching = variations.find(v => v.color === color);
                      if (firstMatching) onSelect(firstMatching);
                    }}
                    type="button"
                  >
                    {color}
                  </button>
                ) : null
              )}
            </div>
          </div>
        )}
        {hasSize && (
          <div>
            <div className="font-medium mb-1">Size:</div>
            <div className="flex gap-2">
              {[...new Set(variations.map(v => v.size))].map((size) =>
                size ? (
                  <button
                    key={size}
                    className={`px-3 py-1 rounded border font-poppins ${selected?.size === size ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    onClick={() => {
                      const firstMatching = variations.find(v => v.size === size && (!selected?.color || v.color === selected.color));
                      if (firstMatching) onSelect(firstMatching);
                    }}
                    type="button"
                  >
                    {size}
                  </button>
                ) : null
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VariationPicker;

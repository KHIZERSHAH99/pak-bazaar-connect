import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ColorSwatch from "./ColorSwatch";
import SizeSelector from "./SizeSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductVariation {
  id: string;
  variation_type: string;
  variation_value: string;
  variation_label?: string;
  hex_color?: string;
  price_adjustment: number;
  stock_quantity: number;
  is_available: boolean;
  image_url?: string;
}

interface EnhancedVariationPickerProps {
  productId: string;
  basePrice: number;
  onVariationChange?: (variation: ProductVariation | null, finalPrice: number) => void;
  className?: string;
}

const EnhancedVariationPicker: React.FC<EnhancedVariationPickerProps> = ({
  productId,
  basePrice,
  onVariationChange,
  className,
}) => {
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, ProductVariation>>({});
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(basePrice);

  useEffect(() => {
    fetchVariations();
  }, [productId]);

  useEffect(() => {
    // Calculate total price based on selected variations
    const totalAdjustment = Object.values(selectedVariations).reduce(
      (sum, variation) => sum + variation.price_adjustment,
      0
    );
    const finalPrice = basePrice + totalAdjustment;
    setCurrentPrice(finalPrice);

    // Notify parent of selection change
    const selectedVariation = Object.values(selectedVariations)[0] || null;
    onVariationChange?.(selectedVariation, finalPrice);
  }, [selectedVariations, basePrice, onVariationChange]);

  const fetchVariations = async () => {
    try {
      const { data, error } = await supabase
        .from("product_variations")
        .select("*")
        .eq("product_id", productId)
        .eq("is_available", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setVariations(data || []);
    } catch (error) {
      console.error("Error fetching variations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVariationSelect = (type: string, variation: ProductVariation) => {
    setSelectedVariations((prev) => ({
      ...prev,
      [type]: variation,
    }));
  };

  // Group variations by type
  const variationsByType = variations.reduce((acc, variation) => {
    if (!acc[variation.variation_type]) {
      acc[variation.variation_type] = [];
    }
    acc[variation.variation_type].push(variation);
    return acc;
  }, {} as Record<string, ProductVariation[]>);

  if (loading) {
    return <div className="animate-pulse h-32 bg-muted rounded-lg" />;
  }

  if (variations.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Color variations */}
      {variationsByType.color && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Color</label>
            {selectedVariations.color && (
              <span className="text-sm text-muted-foreground">
                {selectedVariations.color.variation_label || selectedVariations.color.variation_value}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {variationsByType.color.map((variation) => (
              <div key={variation.id} className="relative">
                <ColorSwatch
                  color={variation.variation_value}
                  hex={variation.hex_color}
                  label={variation.variation_label || variation.variation_value}
                  selected={selectedVariations.color?.id === variation.id}
                  onClick={() => handleVariationSelect("color", variation)}
                  disabled={variation.stock_quantity === 0}
                />
                {variation.stock_quantity <= 5 && variation.stock_quantity > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 text-xs px-1 py-0 h-4"
                  >
                    {variation.stock_quantity}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Size variations */}
      {variationsByType.size && (
        <SizeSelector
          sizes={variationsByType.size.map((v) => ({
            value: v.variation_value,
            label: v.variation_label,
            stock: v.stock_quantity,
            available: v.is_available && v.stock_quantity > 0,
            priceAdjustment: v.price_adjustment,
          }))}
          selectedSize={selectedVariations.size?.variation_value}
          onSelectSize={(size) => {
            const variation = variationsByType.size.find((v) => v.variation_value === size);
            if (variation) {
              handleVariationSelect("size", variation);
            }
          }}
          showStock
          basePrice={basePrice}
        />
      )}

      {/* Other variation types */}
      {Object.entries(variationsByType).map(([type, variations]) => {
        if (type === "color" || type === "size") return null;

        return (
          <div key={type} className="space-y-2">
            <label className="text-sm font-medium text-foreground capitalize">{type}</label>
            <div className="flex flex-wrap gap-2">
              {variations.map((variation) => {
                const isSelected = selectedVariations[type]?.id === variation.id;
                const isAvailable = variation.is_available && variation.stock_quantity > 0;

                return (
                  <button
                    key={variation.id}
                    type="button"
                    onClick={() => handleVariationSelect(type, variation)}
                    disabled={!isAvailable}
                    className={cn(
                      "px-4 py-2 rounded-md border transition-all duration-200",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted border-border",
                      !isAvailable && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <span>{variation.variation_label || variation.variation_value}</span>
                    {variation.price_adjustment !== 0 && (
                      <span className="ml-2 text-xs">
                        {variation.price_adjustment > 0 ? "+" : ""}
                        PKR {variation.price_adjustment.toLocaleString()}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Price display */}
      {currentPrice !== basePrice && (
        <Card className="bg-muted/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Price:</span>
              <div className="flex items-center gap-2">
                {currentPrice !== basePrice && (
                  <span className="text-sm line-through text-muted-foreground">
                    PKR {basePrice.toLocaleString()}
                  </span>
                )}
                <span className="text-lg font-semibold text-primary">
                  PKR {currentPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedVariationPicker;

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calculator, Package, TrendingDown, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface PricingTier {
  id: string;
  min_quantity: number;
  max_quantity: number | null;
  unit_price: number;
}

interface PriceCalculatorProps {
  tiers: PricingTier[];
  basePrice: number;
  moq?: number;
  onQuantityChange?: (quantity: number, unitPrice: number, totalPrice: number) => void;
  className?: string;
}

const PriceCalculator: React.FC<PriceCalculatorProps> = ({
  tiers,
  basePrice,
  moq = 1,
  onQuantityChange,
  className
}) => {
  const [quantity, setQuantity] = useState(moq);
  const [showSavings, setShowSavings] = useState(false);

  const sortedTiers = useMemo(() => {
    // Ensure we have a valid base price (never 0)
    const validBasePrice = basePrice > 0 ? basePrice : 100;
    
    if (!tiers || tiers.length === 0) {
      return [
        { id: '1', min_quantity: 1, max_quantity: 99, unit_price: validBasePrice },
        { id: '2', min_quantity: 100, max_quantity: 999, unit_price: validBasePrice * 0.95 },
        { id: '3', min_quantity: 1000, max_quantity: null, unit_price: validBasePrice * 0.90 }
      ];
    }
    
    // Validate existing tiers to ensure no zero prices
    return [...tiers]
      .map(tier => ({
        ...tier,
        unit_price: tier.unit_price > 0 ? tier.unit_price : validBasePrice
      }))
      .sort((a, b) => a.min_quantity - b.min_quantity);
  }, [tiers, basePrice]);

  const calculations = useMemo(() => {
    // Find the applicable tier based on quantity
    let currentTier = sortedTiers.find(tier => 
      quantity >= tier.min_quantity && 
      (tier.max_quantity === null || quantity <= tier.max_quantity)
    );
    
    // If no tier found, use the last tier for quantities beyond max
    if (!currentTier && sortedTiers.length > 0) {
      const lastTier = sortedTiers[sortedTiers.length - 1];
      if (quantity >= lastTier.min_quantity) {
        currentTier = lastTier;
      }
    }
    
    // Fall back to first tier if still no tier found
    currentTier = currentTier || sortedTiers[0];

    // Ensure unit price is never 0 - use basePrice as fallback
    const unitPrice = currentTier.unit_price > 0 ? currentTier.unit_price : basePrice;
    const totalPrice = quantity * unitPrice;
    
    // Calculate savings based on the first tier or base price
    const baseUnitPrice = sortedTiers[0]?.unit_price > 0 ? sortedTiers[0].unit_price : basePrice;
    const baseTotal = quantity * baseUnitPrice;
    const savings = baseTotal - totalPrice;
    const savingsPercent = baseTotal > 0 ? (savings / baseTotal) * 100 : 0;

    // Find next tier for suggestion
    const nextTier = sortedTiers.find(tier => tier.min_quantity > quantity);
    const unitsToNextTier = nextTier ? nextTier.min_quantity - quantity : null;

    return {
      currentTier,
      unitPrice,
      totalPrice,
      savings,
      savingsPercent,
      nextTier,
      unitsToNextTier
    };
  }, [quantity, sortedTiers, basePrice]);

  useEffect(() => {
    if (onQuantityChange) {
      onQuantityChange(quantity, calculations.unitPrice, calculations.totalPrice);
    }
    setShowSavings(calculations.savings > 0);
  }, [quantity, calculations, onQuantityChange]);

  const handleQuantityChange = (value: string) => {
    const newQuantity = parseInt(value) || 1;
    setQuantity(Math.max(moq, newQuantity));
  };

  const quickQuantityButtons = [
    { label: 'MOQ', value: moq },
    { label: '100', value: 100 },
    { label: '500', value: 500 },
    { label: '1000', value: 1000 },
    { label: '5000', value: 5000 }
  ].filter(btn => btn.value >= moq);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Price Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Quantity Input */}
        <div className="space-y-2">
          <Label htmlFor="quantity" className="flex items-center gap-2">
            Quantity
            {moq > 1 && (
              <Badge variant="outline" className="text-xs">
                Min: {moq} units
              </Badge>
            )}
          </Label>
          <Input
            id="quantity"
            type="number"
            min={moq}
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            className="text-lg font-semibold"
          />
          
          {/* Quick select buttons */}
          <div className="flex flex-wrap gap-2 mt-2">
            {quickQuantityButtons.map(btn => (
              <button
                key={btn.value}
                onClick={() => setQuantity(btn.value)}
                className={cn(
                  "px-3 py-1 text-xs rounded-md border transition-colors",
                  quantity === btn.value 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-background hover:bg-muted border-border"
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Current Pricing */}
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Unit Price:</span>
            <span className="text-lg font-bold text-primary">
              PKR {calculations.unitPrice.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Quantity:</span>
            <span className="font-medium">× {quantity.toLocaleString()}</span>
          </div>
          
          <div className="h-px bg-border" />
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Amount:</span>
            <span className="text-xl font-bold text-primary">
              PKR {calculations.totalPrice.toLocaleString()}
            </span>
          </div>
          
          {showSavings && (
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <TrendingDown className="h-4 w-4" />
                You Save:
              </span>
              <div className="text-right">
                <div className="text-green-600 dark:text-green-400 font-bold">
                  PKR {calculations.savings.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  ({calculations.savingsPercent.toFixed(1)}% off)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Next Tier Suggestion */}
        {calculations.unitsToNextTier && calculations.unitsToNextTier <= 100 && (
          <Alert className="border-primary/20 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              Add <strong>{calculations.unitsToNextTier}</strong> more units to unlock{' '}
              <strong>PKR {calculations.nextTier?.unit_price.toLocaleString()}</strong> per unit!
            </AlertDescription>
          </Alert>
        )}

        {/* Bulk Order Benefits */}
        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Package className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-green-800 dark:text-green-200">
                Bulk Order Benefits
              </p>
              <ul className="text-xs text-green-700 dark:text-green-300 space-y-0.5">
                <li>• Better unit prices at higher quantities</li>
                <li>• Priority processing for large orders</li>
                <li>• Dedicated support for bulk buyers</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceCalculator;
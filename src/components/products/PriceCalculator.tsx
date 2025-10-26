import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calculator, Package, TrendingDown, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { calculateFinalPrice, validateMOQ, validateStock } from '@/lib/products/price-calculator';
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
  stockQuantity?: number;
  onQuantityChange?: (quantity: number, unitPrice: number, totalPrice: number) => void;
  className?: string;
}
const PriceCalculator: React.FC<PriceCalculatorProps> = ({
  tiers,
  basePrice,
  moq = 1,
  stockQuantity,
  onQuantityChange,
  className
}) => {
  const [quantity, setQuantity] = useState(moq);
  const [showSavings, setShowSavings] = useState(false);
  const { toast } = useToast();
  const sortedTiers = useMemo(() => {
    if (!tiers || tiers.length === 0 || basePrice <= 0) {
      return [];
    }
    return [...tiers].sort((a, b) => a.min_quantity - b.min_quantity);
  }, [tiers, basePrice]);
  const calculations = useMemo(() => {
    const result = calculateFinalPrice(basePrice, quantity, {}, sortedTiers);
    const nextTier = sortedTiers.find(tier => tier.min_quantity > quantity);
    const unitsToNextTier = nextTier ? nextTier.min_quantity - quantity : null;
    
    return {
      currentTier: result.appliedTier,
      unitPrice: result.unitPrice,
      totalPrice: result.totalPrice,
      savings: result.savings,
      savingsPercent: result.savingsPercent,
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
    
    // Validate MOQ
    const moqValidation = validateMOQ(newQuantity, moq || null);
    if (!moqValidation.isValid) {
      toast({
        title: "Below Minimum",
        description: moqValidation.message,
        variant: "destructive"
      });
      setQuantity(moq);
      return;
    }
    
    // Validate stock
    const stockValidation = validateStock(newQuantity, stockQuantity || null);
    if (!stockValidation.isValid) {
      toast({
        title: "Exceeds Stock",
        description: stockValidation.message,
        variant: "destructive"
      });
      setQuantity(stockQuantity!);
      return;
    }
    
    setQuantity(newQuantity);
  };
  const quickQuantityButtons = [{
    label: 'MOQ',
    value: moq
  }, {
    label: '100',
    value: 100
  }, {
    label: '500',
    value: 500
  }, {
    label: '1000',
    value: 1000
  }, {
    label: '5000',
    value: 5000
  }].filter(btn => {
    // Filter by MOQ and stock quantity
    if (btn.value < moq) return false;
    if (stockQuantity && btn.value > stockQuantity) return false;
    return true;
  });
  return <Card className={cn("overflow-hidden", className)}>
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
            {moq > 1 && <Badge variant="outline" className="text-xs">
                Min: {moq} units
              </Badge>}
          </Label>
          <Input 
            id="quantity" 
            type="number" 
            min={moq} 
            max={stockQuantity}
            value={quantity} 
            onChange={e => handleQuantityChange(e.target.value)} 
            className="text-lg font-semibold" 
          />
          
          {/* Quick select buttons */}
          <div className="flex flex-wrap gap-2 mt-2">
            {quickQuantityButtons.map(btn => <button key={btn.value} onClick={() => setQuantity(btn.value)} className={cn("px-3 py-1 text-xs rounded-md border transition-colors", quantity === btn.value ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-border")}>
                {btn.label}
              </button>)}
          </div>
        </div>

        {/* Next Tier Suggestion */}
        {calculations.unitsToNextTier && calculations.unitsToNextTier <= 100 && <Alert className="border-primary/20 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              Add <strong>{calculations.unitsToNextTier}</strong> more units to unlock{' '}
              <strong>PKR {calculations.nextTier?.unit_price.toLocaleString()}</strong> per unit!
            </AlertDescription>
          </Alert>}

        {/* Bulk Order Benefits */}
        
      </CardContent>
    </Card>;
};
export default PriceCalculator;
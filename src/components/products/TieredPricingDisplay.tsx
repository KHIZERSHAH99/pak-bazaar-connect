import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export interface PricingTier {
  id: string;
  min_quantity: number;
  max_quantity: number | null;
  unit_price: number;
}

interface TieredPricingDisplayProps {
  tiers: PricingTier[];
  currentQuantity?: number;
  basePrice: number;
  className?: string;
}

const TieredPricingDisplay: React.FC<TieredPricingDisplayProps> = ({
  tiers,
  currentQuantity = 1,
  basePrice,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const sortedTiers = useMemo(() => {
    // Ensure we have a valid base price (never 0)
    const validBasePrice = basePrice > 0 ? basePrice : 100;
    
    if (!tiers || tiers.length === 0) {
      // Create default tiers if none exist
      return [
        { id: '1', min_quantity: 1, max_quantity: 99, unit_price: validBasePrice },
        { id: '2', min_quantity: 100, max_quantity: 999, unit_price: validBasePrice * 0.95 },
        { id: '3', min_quantity: 1000, max_quantity: null, unit_price: validBasePrice * 0.90 }
      ];
    }
    
    // Sort tiers and ensure no zero prices
    return [...tiers]
      .map(tier => ({
        ...tier,
        unit_price: tier.unit_price > 0 ? tier.unit_price : validBasePrice
      }))
      .sort((a, b) => a.min_quantity - b.min_quantity);
  }, [tiers, basePrice]);

  const activeTier = useMemo(() => {
    // Find the applicable tier
    let tier = sortedTiers.find(tier => 
      currentQuantity >= tier.min_quantity && 
      (tier.max_quantity === null || currentQuantity <= tier.max_quantity)
    );
    
    // If quantity exceeds all tiers, use the last tier
    if (!tier && sortedTiers.length > 0) {
      const lastTier = sortedTiers[sortedTiers.length - 1];
      if (currentQuantity >= lastTier.min_quantity) {
        tier = lastTier;
      }
    }
    
    return tier || sortedTiers[0];
  }, [sortedTiers, currentQuantity]);

  const calculateSavings = (tier: PricingTier) => {
    const baseUnitPrice = sortedTiers[0]?.unit_price || basePrice;
    const savings = ((baseUnitPrice - tier.unit_price) / baseUnitPrice) * 100;
    return savings > 0 ? savings : 0;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn("overflow-hidden", className)}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-primary/10 cursor-pointer hover:from-primary/10 hover:to-primary/15 transition-colors">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-primary" />
                Bulk Pricing Tiers
              </div>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-primary" />
              ) : (
                <ChevronDown className="h-5 w-5 text-primary" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="p-0">
        <div className="divide-y divide-border">
          {sortedTiers.map((tier, index) => {
            const isActive = activeTier?.id === tier.id;
            const savings = calculateSavings(tier);
            
            return (
              <div
                key={tier.id}
                className={cn(
                  "px-4 py-3 transition-colors",
                  isActive && "bg-primary/5 border-l-4 border-primary"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">
                        {tier.max_quantity 
                          ? `${tier.min_quantity.toLocaleString()} - ${tier.max_quantity.toLocaleString()}`
                          : `${tier.min_quantity.toLocaleString()}+`
                        } units
                      </span>
                    </div>
                    {isActive && (
                      <Badge className="text-xs" variant="default">
                        Current Tier
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        PKR {tier.unit_price.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">per unit</div>
                    </div>
                    
                    {savings > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      >
                        Save {savings.toFixed(0)}%
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Show total for current quantity if this is the active tier */}
                {isActive && currentQuantity > 1 && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        Total for {currentQuantity.toLocaleString()} units:
                      </span>
                      <span className="font-semibold text-primary">
                        PKR {(currentQuantity * tier.unit_price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Bulk order encouragement */}
        <div className="px-4 py-3 bg-muted/50 border-t">
          <p className="text-xs text-muted-foreground text-center">
            💡 Order more to unlock better prices! Bulk orders save up to {
              Math.max(...sortedTiers.map(calculateSavings)).toFixed(0)
            }%
          </p>
        </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default TieredPricingDisplay;
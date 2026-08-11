import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Package } from 'lucide-react';
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
  const sortedTiers = useMemo(() => {
    // Ensure we have a valid base price (never 0)
    const validBasePrice = basePrice > 0 ? basePrice : 100;
    if (!tiers || tiers.length === 0) {
      return [];
    }

    // Sort tiers and ensure no zero prices
    return [...tiers].map(tier => ({
      ...tier,
      unit_price: tier.unit_price > 0 ? tier.unit_price : validBasePrice
    })).sort((a, b) => a.min_quantity - b.min_quantity);
  }, [tiers, basePrice]);
  const activeTier = useMemo(() => {
    // Below the first discount tier -> no tier is active; base price applies
    if (!sortedTiers.length || currentQuantity < sortedTiers[0].min_quantity) {
      return null;
    }

    // Find the applicable tier
    let tier = sortedTiers.find(tier => currentQuantity >= tier.min_quantity && (tier.max_quantity === null || currentQuantity <= tier.max_quantity));

    // If quantity exceeds all tiers, use the last tier
    if (!tier && sortedTiers.length > 0) {
      const lastTier = sortedTiers[sortedTiers.length - 1];
      if (currentQuantity >= lastTier.min_quantity) {
        tier = lastTier;
      }
    }
    return tier || null;
  }, [sortedTiers, currentQuantity]);
  if (!sortedTiers || sortedTiers.length === 0) return null;
  return <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3 px-4 py-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <TrendingDown className="h-4 w-4 text-primary" />
          Bulk Pricing Tiers
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {sortedTiers.map(tier => {
          const isActive = activeTier?.id === tier.id;
          return <div key={tier.id} className={cn("px-4 py-3 flex items-center justify-between", isActive && "bg-primary/5")}>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {tier.max_quantity ? `${tier.min_quantity.toLocaleString()} - ${tier.max_quantity.toLocaleString()}` : `${tier.min_quantity.toLocaleString()}+`} units
                  </span>
                  {isActive && <Badge className="text-xs h-5" variant="default">
                      Current Tier
                    </Badge>}
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    PKR {tier.unit_price.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">per unit</div>
                </div>
              </div>;
        })}
        </div>
        
        {/* Show total for current quantity */}
        <div className="px-4 py-3 bg-muted/30 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              Total for {currentQuantity.toLocaleString()} units:
            </span>
            <span className="font-bold text-primary">
              PKR {((activeTier?.unit_price ?? basePrice) * currentQuantity).toLocaleString()}
            </span>
          </div>
        </div>
        
        {/* Bulk order message */}
        <div className="px-4 py-2 bg-muted/50 border-t">
          
        </div>
      </CardContent>
    </Card>;
};
export default TieredPricingDisplay;
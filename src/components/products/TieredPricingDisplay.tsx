import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Circle, CircleCheck } from 'lucide-react';
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

  if (!sortedTiers || sortedTiers.length === 0) return null;

  return (
    <Card className={cn("overflow-hidden border-border/50", className)}>
      <CardHeader className="pb-2 px-4 py-3 bg-muted/20">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <TrendingDown className="h-4 w-4" />
          Bulk Pricing Tiers
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {sortedTiers.map((tier) => {
            const isActive = activeTier?.id === tier.id;
            
            return (
              <div
                key={tier.id}
                className={cn(
                  "px-4 py-2.5 flex items-center justify-between hover:bg-muted/30 transition-colors",
                  isActive && "bg-muted/40"
                )}
              >
                <div className="flex items-center gap-2.5">
                  {isActive ? (
                    <CircleCheck className="h-4 w-4 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                  )}
                  <span className="text-sm text-foreground">
                    {tier.max_quantity 
                      ? `${tier.min_quantity.toLocaleString()} - ${tier.max_quantity.toLocaleString()}`
                      : `${tier.min_quantity.toLocaleString()}+`
                    } units
                  </span>
                  {isActive && (
                    <Badge className="text-[10px] h-4 px-1.5 bg-green-600 hover:bg-green-600">
                      Current Tier
                    </Badge>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="text-base font-bold text-primary">
                    PKR {tier.unit_price.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground">per unit</div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Show total for current quantity */}
        {activeTier && currentQuantity >= (sortedTiers[0]?.min_quantity || 1) && (
          <div className="px-4 py-2.5 bg-muted/20 border-t border-border/50">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Total for {currentQuantity.toLocaleString()} units:
              </span>
              <span className="font-bold text-primary">
                PKR {(currentQuantity * activeTier.unit_price).toLocaleString()}
              </span>
            </div>
          </div>
        )}
        
        {/* Bulk order message */}
        <div className="px-4 py-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <span>💡</span>
            <span>Order more to unlock better prices! Bulk orders save up to{' '}
            {sortedTiers.length > 1 
              ? Math.round(((sortedTiers[0].unit_price - sortedTiers[sortedTiers.length - 1].unit_price) / sortedTiers[0].unit_price) * 100)
              : 0}%</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TieredPricingDisplay;
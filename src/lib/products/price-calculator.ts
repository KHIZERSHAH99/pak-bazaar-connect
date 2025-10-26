/**
 * Centralized price calculation logic for products
 * Handles base price, variations, and tiered pricing
 */

export interface PricingTier {
  min_quantity: number;
  max_quantity: number | null;
  unit_price: number;
}

export interface VariationPriceAdjustment {
  [key: string]: number; // Variation type -> price adjustment
}

export interface PriceCalculationResult {
  unitPrice: number;
  totalPrice: number;
  appliedTier: PricingTier | null;
  savingsPercent: number;
  savings: number;
}

/**
 * Calculate final price considering base price, variations, and tiered pricing
 */
export function calculateFinalPrice(
  basePrice: number,
  quantity: number,
  variations: VariationPriceAdjustment = {},
  tiers: PricingTier[] = []
): PriceCalculationResult {
  // Validate base price
  if (basePrice <= 0) {
    return {
      unitPrice: 0,
      totalPrice: 0,
      appliedTier: null,
      savingsPercent: 0,
      savings: 0
    };
  }

  // Step 1: Apply variation adjustments to base price
  const variationAdjustment = Object.values(variations).reduce((sum, adjustment) => sum + adjustment, 0);
  let unitPrice = basePrice + variationAdjustment;

  // Ensure price doesn't go negative from variations
  unitPrice = Math.max(unitPrice, basePrice * 0.5); // Min 50% of base price

  // Step 2: Apply tier discount if available
  let appliedTier: PricingTier | null = null;
  let tierDiscount = 0;

  if (tiers && tiers.length > 0) {
    // Sort tiers by min_quantity
    const sortedTiers = [...tiers].sort((a, b) => a.min_quantity - b.min_quantity);
    
    // Find applicable tier
    for (const tier of sortedTiers) {
      if (quantity >= tier.min_quantity) {
        if (tier.max_quantity === null || quantity <= tier.max_quantity) {
          appliedTier = tier;
          // Calculate discount percentage from base
          tierDiscount = ((unitPrice - tier.unit_price) / unitPrice) * 100;
          unitPrice = tier.unit_price;
          break;
        }
      }
    }
  }

  // Step 3: Calculate total and savings
  const totalPrice = unitPrice * quantity;
  const originalTotal = (basePrice + variationAdjustment) * quantity;
  const savings = Math.max(0, originalTotal - totalPrice);
  const savingsPercent = originalTotal > 0 ? (savings / originalTotal) * 100 : 0;

  return {
    unitPrice,
    totalPrice,
    appliedTier,
    savingsPercent: Math.round(savingsPercent * 100) / 100,
    savings: Math.round(savings * 100) / 100
  };
}

/**
 * Get the next tier information for encouraging bulk purchases
 */
export function getNextTierInfo(
  currentQuantity: number,
  tiers: PricingTier[]
): { nextTier: PricingTier | null; unitsToNext: number } | null {
  if (!tiers || tiers.length === 0) {
    return null;
  }

  const sortedTiers = [...tiers].sort((a, b) => a.min_quantity - b.min_quantity);
  
  for (const tier of sortedTiers) {
    if (currentQuantity < tier.min_quantity) {
      return {
        nextTier: tier,
        unitsToNext: tier.min_quantity - currentQuantity
      };
    }
  }

  return null;
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = 'PKR'): string {
  if (price <= 0) {
    return 'Price on Request';
  }
  return `${currency} ${price.toLocaleString()}`;
}

/**
 * Validate MOQ (Minimum Order Quantity)
 */
export function validateMOQ(quantity: number, moq: number | null): { isValid: boolean; message?: string } {
  if (!moq || moq <= 0) {
    return { isValid: true };
  }

  if (quantity < moq) {
    return {
      isValid: false,
      message: `Minimum order quantity is ${moq} units`
    };
  }

  return { isValid: true };
}

/**
 * Validate stock availability
 */
export function validateStock(quantity: number, stockQuantity: number | null): { isValid: boolean; message?: string } {
  if (stockQuantity === null || stockQuantity === undefined) {
    return { isValid: true }; // No stock tracking
  }

  if (quantity > stockQuantity) {
    return {
      isValid: false,
      message: `Only ${stockQuantity} units available in stock`
    };
  }

  return { isValid: true };
}

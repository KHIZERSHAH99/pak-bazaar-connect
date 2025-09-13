import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PricingTier {
  id: string;
  product_id: string;
  min_quantity: number;
  max_quantity: number | null;
  unit_price: number;
  created_at?: string;
}

export const usePricingTiers = (productId: string | undefined) => {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setTiers([]);
      return;
    }

    const fetchTiers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error: fetchError } = await supabase
          .from('product_pricing_tiers')
          .select('*')
          .eq('product_id', productId)
          .order('min_quantity', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        setTiers(data || []);
      } catch (err) {
        console.error('Error fetching pricing tiers:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch pricing tiers');
        setTiers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTiers();
  }, [productId]);

  const createTier = async (tier: Omit<PricingTier, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('product_pricing_tiers')
        .insert(tier)
        .select()
        .single();

      if (error) throw error;
      
      setTiers(prev => [...prev, data].sort((a, b) => a.min_quantity - b.min_quantity));
      return data;
    } catch (err) {
      console.error('Error creating pricing tier:', err);
      throw err;
    }
  };

  const updateTier = async (tierId: string, updates: Partial<PricingTier>) => {
    try {
      const { data, error } = await supabase
        .from('product_pricing_tiers')
        .update(updates)
        .eq('id', tierId)
        .select()
        .single();

      if (error) throw error;
      
      setTiers(prev => 
        prev.map(t => t.id === tierId ? data : t)
          .sort((a, b) => a.min_quantity - b.min_quantity)
      );
      return data;
    } catch (err) {
      console.error('Error updating pricing tier:', err);
      throw err;
    }
  };

  const deleteTier = async (tierId: string) => {
    try {
      const { error } = await supabase
        .from('product_pricing_tiers')
        .delete()
        .eq('id', tierId);

      if (error) throw error;
      
      setTiers(prev => prev.filter(t => t.id !== tierId));
    } catch (err) {
      console.error('Error deleting pricing tier:', err);
      throw err;
    }
  };

  const calculatePrice = (quantity: number, fallbackPrice: number = 0): number => {
    // Ensure fallback price is never 0
    const validFallbackPrice = fallbackPrice > 0 ? fallbackPrice : 100;
    
    if (tiers.length === 0) return validFallbackPrice;

    // Find the applicable tier based on quantity
    let applicableTier = tiers.find(tier => 
      quantity >= tier.min_quantity && 
      (tier.max_quantity === null || quantity <= tier.max_quantity)
    );
    
    // If quantity exceeds all tiers, use the last tier
    if (!applicableTier && tiers.length > 0) {
      const lastTier = tiers[tiers.length - 1];
      if (quantity >= lastTier.min_quantity) {
        applicableTier = lastTier;
      }
    }

    // Get the price, ensuring it's never 0
    const price = applicableTier?.unit_price || tiers[0]?.unit_price || validFallbackPrice;
    return price > 0 ? price : validFallbackPrice;
  };

  return {
    tiers,
    loading,
    error,
    createTier,
    updateTier,
    deleteTier,
    calculatePrice
  };
};
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

  const calculatePrice = (quantity: number): number => {
    if (tiers.length === 0) return 0;

    const applicableTier = tiers.find(tier => 
      quantity >= tier.min_quantity && 
      (tier.max_quantity === null || quantity <= tier.max_quantity)
    );

    return applicableTier?.unit_price || tiers[0]?.unit_price || 0;
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
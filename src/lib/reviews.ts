
import { supabase } from '@/integrations/supabase/client';

export interface Review {
  id: string;
  reviewer_id: string;
  shop_id?: string;
  product_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface ShopStats {
  avg_rating: number;
  total_reviews: number;
  is_verified: boolean;
}

export interface ProductStats {
  avg_rating: number;
  total_reviews: number;
}

// Create a review for a shop
export const createShopReview = async (shopId: string, rating: number, comment?: string): Promise<Review> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('reviews')
    .insert([{
      reviewer_id: user.id,
      shop_id: shopId,
      rating,
      comment
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating shop review:', error);
    throw error;
  }

  return data as Review;
};

// Create a review for a product
export const createProductReview = async (productId: string, rating: number, comment?: string): Promise<Review> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('reviews')
    .insert([{
      reviewer_id: user.id,
      product_id: productId,
      rating,
      comment
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating product review:', error);
    throw error;
  }

  return data as Review;
};

// Get shop statistics (average rating, total reviews, verification status)
export const getShopStats = async (shopId: string): Promise<ShopStats> => {
  const { data, error } = await supabase
    .rpc('get_shop_stats', { shop_uuid: shopId });

  if (error) {
    console.error('Error fetching shop stats:', error);
    return { avg_rating: 0, total_reviews: 0, is_verified: false };
  }

  return data[0] || { avg_rating: 0, total_reviews: 0, is_verified: false };
};

// Get product statistics
export const getProductStats = async (productId: string): Promise<ProductStats> => {
  const { data, error } = await supabase
    .rpc('get_product_stats', { product_uuid: productId });

  if (error) {
    console.error('Error fetching product stats:', error);
    return { avg_rating: 0, total_reviews: 0 };
  }

  return data[0] || { avg_rating: 0, total_reviews: 0 };
};

// Get reviews for a shop
export const getShopReviews = async (shopId: string): Promise<Review[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching shop reviews:', error);
    return [];
  }

  return data as Review[];
};

// Get reviews for a product
export const getProductReviews = async (productId: string): Promise<Review[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching product reviews:', error);
    return [];
  }

  return data as Review[];
};

// Update a review
export const updateReview = async (reviewId: string, rating: number, comment?: string): Promise<Review> => {
  const { data, error } = await supabase
    .from('reviews')
    .update({ rating, comment, updated_at: new Date().toISOString() })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) {
    console.error('Error updating review:', error);
    throw error;
  }

  return data as Review;
};

// Delete a review
export const deleteReview = async (reviewId: string): Promise<void> => {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

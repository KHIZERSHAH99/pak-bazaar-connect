
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

// Create a review for a shop (using mock data for now)
export const createShopReview = async (shopId: string, rating: number, comment?: string): Promise<Review> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // For now, return mock data since reviews table might not exist yet
  const mockReview: Review = {
    id: crypto.randomUUID(),
    reviewer_id: user.id,
    shop_id: shopId,
    rating,
    comment,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log('Mock shop review created:', mockReview);
  return mockReview;
};

// Create a review for a product (using mock data for now)
export const createProductReview = async (productId: string, rating: number, comment?: string): Promise<Review> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // For now, return mock data since reviews table might not exist yet
  const mockReview: Review = {
    id: crypto.randomUUID(),
    reviewer_id: user.id,
    product_id: productId,
    rating,
    comment,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log('Mock product review created:', mockReview);
  return mockReview;
};

// Get shop statistics (mock data for now)
export const getShopStats = async (shopId: string): Promise<ShopStats> => {
  try {
    // For now, return mock data since reviews table might not exist yet
    // In a real implementation, this would query the reviews table
    const mockStats: ShopStats = {
      avg_rating: 4.2,
      total_reviews: 8,
      is_verified: true // 4+ stars with 5+ reviews
    };

    console.log('Mock shop stats for', shopId, ':', mockStats);
    return mockStats;
  } catch (error) {
    console.error('Error fetching shop stats:', error);
    return { avg_rating: 0, total_reviews: 0, is_verified: false };
  }
};

// Get product statistics (mock data for now)
export const getProductStats = async (productId: string): Promise<ProductStats> => {
  try {
    // For now, return mock data since reviews table might not exist yet
    const mockStats: ProductStats = {
      avg_rating: 4.1,
      total_reviews: 6
    };

    console.log('Mock product stats for', productId, ':', mockStats);
    return mockStats;
  } catch (error) {
    console.error('Error fetching product stats:', error);
    return { avg_rating: 0, total_reviews: 0 };
  }
};

// Get reviews for a shop (mock data for now)
export const getShopReviews = async (shopId: string): Promise<Review[]> => {
  try {
    // For now, return mock data since reviews table might not exist yet
    const mockReviews: Review[] = [
      {
        id: '1',
        reviewer_id: 'user1',
        shop_id: shopId,
        rating: 5,
        comment: 'Excellent service and quality products!',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        reviewer_id: 'user2',
        shop_id: shopId,
        rating: 4,
        comment: 'Good experience overall.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    console.log('Mock shop reviews for', shopId, ':', mockReviews);
    return mockReviews;
  } catch (error) {
    console.error('Error fetching shop reviews:', error);
    return [];
  }
};

// Get reviews for a product (mock data for now)
export const getProductReviews = async (productId: string): Promise<Review[]> => {
  try {
    // For now, return mock data since reviews table might not exist yet
    const mockReviews: Review[] = [
      {
        id: '3',
        reviewer_id: 'user3',
        product_id: productId,
        rating: 4,
        comment: 'Great product, fast delivery!',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    console.log('Mock product reviews for', productId, ':', mockReviews);
    return mockReviews;
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return [];
  }
};

// Update a review (mock implementation for now)
export const updateReview = async (reviewId: string, rating: number, comment?: string): Promise<Review> => {
  // For now, return mock data since reviews table might not exist yet
  const mockReview: Review = {
    id: reviewId,
    reviewer_id: 'current-user',
    rating,
    comment,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log('Mock review updated:', mockReview);
  return mockReview;
};

// Delete a review (mock implementation for now)
export const deleteReview = async (reviewId: string): Promise<void> => {
  console.log('Mock review deleted:', reviewId);
  // For now, just log since reviews table might not exist yet
};

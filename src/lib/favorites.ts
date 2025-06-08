
import { getCurrentUser } from '@/lib/auth';

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

// Mock storage for favorites since the table doesn't exist yet
let mockFavorites: Favorite[] = [];

export const addToFavorites = async (productId: string): Promise<Favorite> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  // Check if already exists
  const existingFavorite = mockFavorites.find(
    fav => fav.user_id === user.id && fav.product_id === productId
  );
  
  if (existingFavorite) {
    return existingFavorite;
  }

  const favorite: Favorite = {
    id: `fav_${Date.now()}`,
    user_id: user.id,
    product_id: productId,
    created_at: new Date().toISOString()
  };

  mockFavorites.push(favorite);
  
  // Store in localStorage for persistence
  localStorage.setItem('favorites', JSON.stringify(mockFavorites));
  
  return favorite;
};

export const removeFromFavorites = async (productId: string): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  mockFavorites = mockFavorites.filter(
    fav => !(fav.user_id === user.id && fav.product_id === productId)
  );
  
  // Update localStorage
  localStorage.setItem('favorites', JSON.stringify(mockFavorites));
};

export const getFavoriteProducts = async (): Promise<Favorite[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  // Load from localStorage if empty
  if (mockFavorites.length === 0) {
    const stored = localStorage.getItem('favorites');
    if (stored) {
      mockFavorites = JSON.parse(stored);
    }
  }

  return mockFavorites.filter(fav => fav.user_id === user.id);
};

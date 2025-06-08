
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { addToFavorites, removeFromFavorites, getFavoriteProducts } from '@/lib/favorites';
import { getCurrentUser } from '@/lib/auth';

interface FavoriteButtonProps {
  productId: string;
  size?: 'sm' | 'md' | 'lg';
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ productId, size = 'md' }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkFavoriteStatus();
  }, [productId]);

  const checkFavoriteStatus = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;
      
      const favorites = await getFavoriteProducts();
      setIsFavorite(favorites.some(fav => fav.product_id === productId));
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        alert('Please login to save favorites');
        return;
      }

      if (isFavorite) {
        await removeFromFavorites(productId);
        setIsFavorite(false);
      } else {
        await addToFavorites(productId);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isFavorite ? "default" : "outline"}
      size={size}
      onClick={handleToggleFavorite}
      disabled={loading}
      className={isFavorite ? "bg-red-500 hover:bg-red-600" : ""}
    >
      <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
    </Button>
  );
};

export default FavoriteButton;

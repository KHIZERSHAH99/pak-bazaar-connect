import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ShopFavoriteButtonProps {
  shopId: string;
  className?: string;
}

const ShopFavoriteButton: React.FC<ShopFavoriteButtonProps> = ({ shopId, className }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();

  const toggleFavorite = async () => {
    try {
      // For now, just toggle the state since shop favorites aren't fully implemented
      setIsFavorite(!isFavorite);
      toast({
        title: isFavorite ? "Removed from Favorites" : "Added to Favorites",
        description: `Shop has been ${isFavorite ? 'removed from' : 'added to'} your favorites.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleFavorite}
      className={cn("px-3", className)}
    >
      <Heart className={cn("w-4 h-4", isFavorite && "fill-red-500 text-red-500")} />
    </Button>
  );
};

export default ShopFavoriteButton;
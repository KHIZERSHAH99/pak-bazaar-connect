import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare } from 'lucide-react';
import { Product } from '@/lib/types';

interface ProductReviewsProps {
  productId: string;
  avgRating?: number;
  totalReviews?: number;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, avgRating, totalReviews }) => {
  // Show placeholder for reviews - can be expanded later with actual review system
  if (!avgRating || !totalReviews) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Customer Reviews</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <span className="ml-1 font-semibold">{avgRating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Reviews coming soon</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductReviews;

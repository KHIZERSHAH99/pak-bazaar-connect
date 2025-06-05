
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import StarRating from './StarRating';

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => Promise<void>;
  isLoading?: boolean;
  title?: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, isLoading = false, title = "Write a Review" }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    try {
      await onSubmit(rating, comment);
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 font-poppins">{title}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
            Rating *
          </label>
          <StarRating
            rating={rating}
            interactive
            onRatingChange={setRating}
            size="lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
            Comment (optional)
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={4}
            className="font-poppins"
          />
        </div>

        <Button
          type="submit"
          disabled={rating === 0 || isLoading}
          className="bg-pakistani_green-700 hover:bg-pakistani_green-800 font-poppins"
        >
          {isLoading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </Card>
  );
};

export default ReviewForm;

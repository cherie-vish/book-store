'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RatingStars } from '@/components/RatingStars';
import { toast } from 'sonner';
import { Star } from 'lucide-react';

export function ReviewSection({ productId, initialReviews, initialRating }: any) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleSubmit = async () => {
    if (!session) {
      toast.error('Please login to review');
      return;
    }
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, rating, comment }),
    });

    if (res.ok) {
      const newReview = await res.json();
      setReviews([newReview, ...reviews]);
      setRating(0);
      setComment('');
      setShowForm(false);
      toast.success('Review submitted!');
    } else {
      toast.error('Failed to submit review');
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-12 pt-8 border-t">
      <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="text-3xl font-bold">{avgRating.toFixed(1)}</div>
        <RatingStars rating={avgRating} readonly size={6} />
        <span className="text-gray-500">({reviews.length} reviews)</span>
      </div>

      {session && !showForm && (
        <Button onClick={() => setShowForm(true)} className="mb-6">
          Write a Review
        </Button>
      )}

      {showForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3">Write Your Review</h3>
          <div className="mb-3">
            <RatingStars rating={rating} onRatingChange={setRating} size={6} />
          </div>
          <Textarea
            placeholder="Share your experience with this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="mb-3"
          />
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review: any) => (
          <div key={review.id} className="border-b pb-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-semibold">{review.userName}</span>
                <div className="flex items-center gap-2 mt-1">
                  <RatingStars rating={review.rating} readonly size={4} />
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            {review.comment && <p className="text-gray-600 mt-2">{review.comment}</p>}
          </div>
        ))}
        
        {reviews.length === 0 && (
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
}
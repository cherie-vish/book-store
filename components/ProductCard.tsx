'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { toast } from 'sonner';

export function ProductCard({ product }: { product: any }) {
  const addItem = useCartStore((state) => state.addItem);
  const wishlist = useCartStore((state) => state.wishlist);
  const addToWishlist = useCartStore((state) => state.addToWishlist);
  const removeFromWishlist = useCartStore((state) => state.removeFromWishlist);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const isWishlisted = wishlist.includes(product.id);

  useEffect(() => {
    fetch(`/api/reviews?productId=${product.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          const sum = data.reduce((acc: number, r: any) => acc + r.rating, 0);
          setAvgRating(sum / data.length);
          setReviewCount(data.length);
        }
      });
  }, [product.id]);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          <div className="bg-gray-100 h-48 rounded mb-3 flex items-center justify-center overflow-hidden">
            {product.image ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
            ) : (
              <span className="text-gray-400 text-4xl">📚</span>
            )}
          </div>
          <h3 className="font-semibold text-lg mt-2 line-clamp-1">{product.name}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">{product.description || 'No description'}</p>
          
          {/* Rating Display */}
          <div className="flex items-center gap-2 mt-2">
            <RatingStars rating={avgRating} readonly size={4} />
            {reviewCount > 0 && (
              <span className="text-xs text-gray-500">({reviewCount})</span>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <span className="font-bold text-xl">${product.price.toFixed(2)}</span>
            <span className="text-sm text-gray-500">Stock: {product.stock}</span>
          </div>
        </Link>
        <div className="flex gap-2 mt-3">
          <Button onClick={handleAddToCart} className="flex-1" size="sm">
            <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
          </Button>
          <Button onClick={() => {
            if (isWishlisted) {
              removeFromWishlist(product.id);
              toast.info('Removed from wishlist');
            } else {
              addToWishlist(product.id);
              toast.success('Added to wishlist');
            }
          }} variant="outline" size="sm" className={isWishlisted ? 'text-red-500' : ''}>
            <Heart className="h-4 w-4" fill={isWishlisted ? 'currentColor' : 'none'} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Add RatingStars component here or import separately
function RatingStars({ rating, readonly = false, size = 5 }: any) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <div key={star} className={readonly ? 'cursor-default' : ''}>
          <Star
            className={`h-${size} w-${size} ${
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-300'
            }`}
          />
        </div>
      ))}
    </div>
  );
}
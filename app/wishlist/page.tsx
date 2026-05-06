'use client';

import { useCartStore } from '@/lib/store/cart';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { inArray } from 'drizzle-orm';
import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useCartStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlist.length > 0) {
      fetch('/api/products')
        .then(res => res.json())
        .then(data => {
          const wishlistProducts = data.filter((p: any) => wishlist.includes(p.id));
          setProducts(wishlistProducts);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [wishlist]);

  if (loading) {
    return <div className="text-center py-16">Loading...</div>;
  }

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-6">Save your favorite items here.</p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <div key={product.id} className="relative">
            <ProductCard product={product} />
            <button
              onClick={() => removeFromWishlist(product.id)}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow"
            >
              <Heart className="h-5 w-5 text-red-500 fill-red-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
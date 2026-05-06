'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image: string | null;
  category: string;
}

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const wishlist = useCartStore((state) => state.wishlist);
  const addToWishlist = useCartStore((state) => state.addToWishlist);
  const removeFromWishlist = useCartStore((state) => state.removeFromWishlist);
  
  const isWishlisted = wishlist.includes(product.id);

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

  const handleToggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast.info(`${product.name} removed from wishlist`);
    } else {
      addToWishlist(product.id);
      toast.success(`${product.name} added to wishlist`);
    }
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
          <div className="flex justify-between items-center mt-2">
            <span className="font-bold text-xl">${product.price.toFixed(2)}</span>
            <span className="text-sm text-gray-500">Stock: {product.stock}</span>
          </div>
        </Link>
        <div className="flex gap-2 mt-3">
          <Button onClick={handleAddToCart} className="flex-1" size="sm">
            <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
          </Button>
          <Button onClick={handleToggleWishlist} variant="outline" size="sm" className={isWishlisted ? 'text-red-500' : ''}>
            <Heart className="h-4 w-4" fill={isWishlisted ? 'currentColor' : 'none'} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
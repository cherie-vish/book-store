'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, User, LogOut } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { useEffect, useState } from 'react';
import { SearchBar } from './SearchBar';

export function Navbar() {
  const { data: session } = useSession();
  const totalItems = useCartStore((state) => state.totalItems());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            BookStore
          </Link>

          {/* Search Bar - Centered on desktop */}
          <div className="w-full md:w-auto md:flex-1 max-w-md">
            <SearchBar />
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Link href="/products" className="text-gray-600 hover:text-blue-600 transition-colors">
              Shop
            </Link>

            {session && (
              <Link href="/my-orders" className="text-gray-600 hover:text-blue-600 transition-colors">
                My Orders
              </Link>
            )}

            <Link href="/wishlist" className="text-gray-600 hover:text-blue-600 transition-colors">
              <Heart className="h-5 w-5" />
            </Link>

            <Link href="/cart" className="relative text-gray-600 hover:text-blue-600 transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {session ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:inline">
                  {session.user?.name}
                </span>
                {session.user?.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
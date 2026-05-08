'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Package, TrendingUp, X } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string | null;
  category: string;
}

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.length >= 2) {
      setLoading(true);
      debounceTimer.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product: Product) => {
    router.push(`/products/${product.id}`);
    setShowSuggestions(false);
    setQuery('');
    setSuggestions([]);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setLoading(false);
  };

  const handleFocus = () => {
    // Only show popular searches when query is empty
    if (query.length === 0) {
      setShowSuggestions(true);
    } else if (query.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const popularSearches = ['fiction', 'self-help', 'sci-fi', 'romance'];

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search books..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          className="pl-10 pr-10 w-full"
        />
        
        {query.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {loading && query.length >= 2 && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        )}
      </form>

      {/* Popular Searches - only when query is empty AND showSuggestions is true */}
      {showSuggestions && query.length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50">
          <div className="p-2">
            <p className="text-xs text-gray-500 px-3 py-2 border-b">Popular Searches</p>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => {
                  setQuery(term);
                  router.push(`/products?search=${encodeURIComponent(term)}`);
                  setShowSuggestions(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{term}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Search Suggestions - only when query has results */}
      {showSuggestions && query.length >= 2 && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <p className="text-xs text-gray-500 px-3 py-2 border-b">Suggestions for "{query}"</p>
            {suggestions.map((product) => (
              <button
                key={product.id}
                onClick={() => handleSuggestionClick(product)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center gap-3 transition-colors"
              >
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                  {product.image ? (
                    <img src={product.image} alt="" className="w-8 h-8 object-cover rounded" />
                  ) : (
                    <Package className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-gray-500">${product.price.toFixed(2)} • {product.category}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* No Results */}
      {showSuggestions && query.length >= 2 && suggestions.length === 0 && !loading && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50">
          <div className="p-4 text-center text-gray-500">
            <p>No products found for "{query}"</p>
            <button
              onClick={handleSearch}
              className="text-blue-600 text-sm mt-1 hover:underline"
            >
              Search all products →
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
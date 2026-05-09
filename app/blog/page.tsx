'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, Eye, Loader2 } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string | null;
  category: { name: string; slug: string } | null;
  author: string;
  views: number;
  publishedAt: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const loaderRef = useRef<HTMLDivElement>(null);
  const initialLoadDone = useRef(false);

  const limit = 9;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Reset and fetch fresh when category changes
    setPosts([]);
    setOffset(0);
    setHasMore(true);
    initialLoadDone.current = false;
    fetchPosts(0, true);
  }, [selectedCategory]);

  const fetchCategories = async () => {
    const res = await fetch('/api/blog/categories');
    const data = await res.json();
    setCategories(data);
  };

  const fetchPosts = async (newOffset: number, isReset = false) => {
    if (isReset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const url = selectedCategory 
        ? `/api/blog/posts?limit=${limit}&offset=${newOffset}&category=${selectedCategory}`
        : `/api/blog/posts?limit=${limit}&offset=${newOffset}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (isReset) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }
      
      setHasMore(data.hasMore);
      setOffset(newOffset + limit);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (loading || !hasMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          fetchPosts(offset);
        }
      },
      { threshold: 0.1 }
    );
    
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    
    return () => observer.disconnect();
  }, [loading, loadingMore, hasMore, offset, selectedCategory]);

  if (loading && posts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading articles...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">BookStore Blog</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover book recommendations, author interviews, and reading tips.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <Button
          variant={selectedCategory === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('')}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.slug ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.slug)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Blog Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">No articles found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.id}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                    {post.featuredImage ? (
                      <img 
                        src={post.featuredImage} 
                        alt={post.title} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-blue-100 to-indigo-100">
                        📚
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    {post.category && (
                      <span className="text-xs text-blue-600 font-medium">
                        {post.category.name}
                      </span>
                    )}
                    <h2 className="text-xl font-bold mt-1 mb-2 line-clamp-2">{post.title}</h2>
                    <p className="text-gray-500 text-sm line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.views}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Loading More Indicator */}
          {hasMore && (
            <div ref={loaderRef} className="flex justify-center py-8">
              {loadingMore && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading more articles...</span>
                </div>
              )}
            </div>
          )}

          {/* End of Content */}
          {!hasMore && posts.length > 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              You've reached the end of our blog feed
            </div>
          )}
        </>
      )}
    </div>
  );
}
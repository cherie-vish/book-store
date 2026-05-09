'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, User, Eye, ArrowLeft } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string | null;
  category: { name: string; slug: string } | null;
  author: string;
  views: number;
  publishedAt: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [params.slug]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/blog/posts?slug=${params.slug}`);
      if (!res.ok) {
        router.push('/blog');
        return;
      }
      const data = await res.json();
      setPost(data);
    } catch (error) {
      console.error('Failed to fetch post:', error);
      router.push('/blog');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/blog">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>
      </Link>

      {/* Header Image */}
      {post.featuredImage && (
        <div className="rounded-lg overflow-hidden mb-8">
          <img src={post.featuredImage} alt={post.title} className="w-full h-96 object-cover" />
        </div>
      )}

      {/* Title & Meta */}
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-4 border-b">
        {post.category && (
          <Link href={`/blog?category=${post.category.slug}`}>
            <span className="text-blue-600 hover:underline">{post.category.name}</span>
          </Link>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {new Date(post.publishedAt).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1">
          <User className="h-4 w-4" />
          {post.author}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          {post.views} views
        </span>
      </div>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        {post.content.split('\n').map((paragraph, idx) => (
          <p key={idx} className="mb-4 text-gray-700 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
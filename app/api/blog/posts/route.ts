import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogPosts, blogCategories, users } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

// GET /api/blog/posts - Get all published posts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const category = searchParams.get('category');
  const slug = searchParams.get('slug');

  // Get single post by slug
  if (slug) {
    const post = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .then(res => res[0]);
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Increment views
    await db.update(blogPosts)
      .set({ views: (post.views || 0) + 1 })
      .where(eq(blogPosts.id, post.id));
    
    // Get category
    const categoryData = post.categoryId 
      ? await db.select().from(blogCategories).where(eq(blogCategories.id, post.categoryId)).then(res => res[0])
      : null;
    
    // Get author
    const author = post.authorId
      ? await db.select({ name: users.name }).from(users).where(eq(users.id, post.authorId)).then(res => res[0])
      : null;
    
    return NextResponse.json({
      ...post,
      category: categoryData,
      author: author?.name || 'Admin',
    });
  }

  // Get all published posts
  let query = db.select()
    .from(blogPosts)
    .where(eq(blogPosts.status, 'published'))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit);

  if (category) {
    const categoryData = await db.select().from(blogCategories).where(eq(blogCategories.slug, category)).then(res => res[0]);
    if (categoryData) {
      query = db.select()
        .from(blogPosts)
        .where(and(eq(blogPosts.status, 'published'), eq(blogPosts.categoryId, categoryData.id)))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(limit);
    }
  }

  const posts = await query;

  // Get categories and authors for posts
  const postsWithDetails = await Promise.all(posts.map(async (post) => {
    const category = post.categoryId 
      ? await db.select().from(blogCategories).where(eq(blogCategories.id, post.categoryId)).then(res => res[0])
      : null;
    const author = post.authorId
      ? await db.select({ name: users.name }).from(users).where(eq(users.id, post.authorId)).then(res => res[0])
      : null;
    return { ...post, category, author: author?.name || 'Admin' };
  }));

  return NextResponse.json(postsWithDetails);
}

// POST /api/blog/posts - Create new post (admin only)
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, slug, excerpt, content, featuredImage, categoryId, status } = body;

  const newPost = await db.insert(blogPosts).values({
    title,
    slug,
    excerpt,
    content,
    featuredImage,
    categoryId: categoryId || null,
    authorId: parseInt(session.user.id!),
    status: status || 'draft',
    publishedAt: status === 'published' ? new Date() : null,
  }).returning();

  return NextResponse.json(newPost[0]);
}
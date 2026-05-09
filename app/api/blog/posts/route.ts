import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogPosts, blogCategories, users } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';

// GET /api/blog/posts - Get published posts with pagination
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '9');
  const offset = parseInt(searchParams.get('offset') || '0');
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

  // Get paginated published posts
  let query = db.select()
    .from(blogPosts)
    .where(eq(blogPosts.status, 'published'))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit)
    .offset(offset);

  if (category && category !== 'all') {
    const categoryData = await db.select().from(blogCategories).where(eq(blogCategories.slug, category)).then(res => res[0]);
    if (categoryData) {
      query = db.select()
        .from(blogPosts)
        .where(and(eq(blogPosts.status, 'published'), eq(blogPosts.categoryId, categoryData.id)))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(limit)
        .offset(offset);
    }
  }

  const posts = await query;

  // Get total count for pagination
  let countQuery = db.select({ count: sql<number>`count(*)` }).from(blogPosts).where(eq(blogPosts.status, 'published'));
  if (category && category !== 'all') {
    const categoryData = await db.select().from(blogCategories).where(eq(blogCategories.slug, category)).then(res => res[0]);
    if (categoryData) {
      countQuery = db.select({ count: sql<number>`count(*)` }).from(blogPosts).where(and(eq(blogPosts.status, 'published'), eq(blogPosts.categoryId, categoryData.id)));
    }
  }
  
  const totalResult = await countQuery;
  const total = totalResult[0]?.count || 0;

  // Get categories and authors for posts
  const postsWithDetails = await Promise.all(posts.map(async (post) => {
    const categoryData = post.categoryId 
      ? await db.select().from(blogCategories).where(eq(blogCategories.id, post.categoryId)).then(res => res[0])
      : null;
    const author = post.authorId
      ? await db.select({ name: users.name }).from(users).where(eq(users.id, post.authorId)).then(res => res[0])
      : null;
    return { ...post, category: categoryData, author: author?.name || 'Admin' };
  }));

  return NextResponse.json({
    posts: postsWithDetails,
    total,
    hasMore: offset + limit < total,
  });
}

// POST /api/blog/posts - Create new post (admin only)
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, slug, excerpt, content, featuredImage, categoryId, status } = body;

  const postStatus = status === 'published' ? 'published' : 'draft';

  const newPost = await db.insert(blogPosts).values({
    title,
    slug,
    excerpt,
    content,
    featuredImage,
    categoryId: categoryId ? parseInt(categoryId) : null,
    authorId: parseInt(session.user.id!),
    status: postStatus,
    publishedAt: status === 'published' ? new Date() : null,
  }).returning();

  return NextResponse.json(newPost[0]);
}

// PUT /api/blog/posts/[id] - Update post (admin only)
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
  }

  const body = await request.json();
  const { title, slug, excerpt, content, featuredImage, categoryId, status } = body;

  const postStatus = status === 'published' ? 'published' : 'draft';

  const updatedPost = await db.update(blogPosts)
    .set({
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      categoryId: categoryId ? parseInt(categoryId) : null,
      status: postStatus,
      publishedAt: status === 'published' ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, parseInt(id)))
    .returning();

  return NextResponse.json(updatedPost[0]);
}

// DELETE /api/blog/posts/[id] - Delete post (admin only)
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
  }

  await db.delete(blogPosts).where(eq(blogPosts.id, parseInt(id)));

  return NextResponse.json({ success: true });
}
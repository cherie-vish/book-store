import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reviews } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

// Get reviews for a product
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
  }

  const productReviews = await db.select()
    .from(reviews)
    .where(eq(reviews.productId, parseInt(productId)))
    .orderBy(reviews.createdAt);

  return NextResponse.json(productReviews);
}

// Add a review
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  const body = await request.json();
  const { productId, rating, comment } = body;

  if (!productId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid review data' }, { status: 400 });
  }

  const newReview = await db.insert(reviews).values({
    productId,
    userId: parseInt(session.user.id!),
    userName: session.user.name || 'Anonymous',
    rating,
    comment: comment || null,
    approved: true, // Auto-approve for now
  }).returning();

  return NextResponse.json(newReview[0]);
}
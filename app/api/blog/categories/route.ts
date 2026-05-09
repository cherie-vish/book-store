import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogCategories } from '@/lib/db/schema';
import { auth } from '@/lib/auth';

export async function GET() {
  const categories = await db.select().from(blogCategories);
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const newCategory = await db.insert(blogCategories).values(body).returning();
  return NextResponse.json(newCategory[0]);
}
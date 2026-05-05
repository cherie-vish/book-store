import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { auth } from '@/lib/auth';

export async function GET() {
  const allProducts = await db.select().from(products);
  return NextResponse.json(allProducts);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const newProduct = await db.insert(products).values(body).returning();
  return NextResponse.json(newProduct[0]);
}
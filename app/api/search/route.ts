import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { ilike, or, sql } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  
  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const searchTerm = `%${q.toLowerCase()}%`;
  
  const results = await db.select()
    .from(products)
    .where(
      or(
        ilike(products.name, searchTerm),
        ilike(products.description, searchTerm),
        ilike(products.category, searchTerm)
      )
    )
    .limit(10);

  return NextResponse.json(results);
}
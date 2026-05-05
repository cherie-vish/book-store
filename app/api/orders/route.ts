import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allOrders = await db.select().from(orders);
  return NextResponse.json(allOrders);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { order, items } = body;
  
  const newOrder = await db.insert(orders).values(order).returning();
  const orderId = newOrder[0].id;
  
  for (const item of items) {
    await db.insert(orderItems).values({ ...item, orderId });
  }
  
  return NextResponse.json(newOrder[0]);
}
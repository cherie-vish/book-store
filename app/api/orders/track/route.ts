import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  const email = searchParams.get('email');

  if (!orderId || !email) {
    return NextResponse.json({ error: 'Order ID and email required' }, { status: 400 });
  }

  const order = await db.select()
    .from(orders)
    .where(eq(orders.id, parseInt(orderId)))
    .then(res => res[0]);

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (order.customerEmail !== email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(order);
}
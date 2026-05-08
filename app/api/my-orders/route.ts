import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id!);
  
  // Get user's orders
  const userOrders = await db.select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(orders.createdAt);

  // Get order items for each order
  const ordersWithItems = await Promise.all(
    userOrders.map(async (order) => {
      const items = await db.select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));
      return { ...order, items };
    })
  );

  return NextResponse.json(ordersWithItems);
}
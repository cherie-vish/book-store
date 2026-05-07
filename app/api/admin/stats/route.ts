import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, orders, users } from '@/lib/db/schema';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const totalProducts = await db.select().from(products);
  const totalOrders = await db.select().from(orders);
  const totalUsers = await db.select().from(users);
  const totalRevenue = totalOrders.reduce((sum, order) => sum + order.total, 0);

  return NextResponse.json({
    products: totalProducts.length,
    orders: totalOrders.length,
    users: totalUsers.length,
    revenue: totalRevenue,
  });
}
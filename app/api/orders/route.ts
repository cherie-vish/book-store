import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allOrders = await db.select().from(orders);
  return NextResponse.json(allOrders);
}

export async function POST(request: Request) {
  const session = await auth();
  
  try {
    const body = await request.json();
    
    const newOrder = await db.insert(orders).values({
      userId: session?.user?.id ? parseInt(session.user.id) : null,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone || null,
      customerAddress: body.customerAddress,
      total: body.total,
      status: 'pending',
    }).returning();

    const orderId = newOrder[0].id;

    for (const item of body.items) {
      await db.insert(orderItems).values({
        orderId: orderId,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      });
    }

    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const body = await request.json();

  const updated = await db.update(orders)
    .set({ status: body.status })
    .where(eq(orders.id, parseInt(id!)))
    .returning();

  return NextResponse.json(updated[0]);
}
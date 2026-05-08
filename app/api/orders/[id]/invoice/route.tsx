import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/InvoicePDF';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;
  const orderId = parseInt(id);

  const order = await db.select().from(orders).where(eq(orders.id, orderId)).then(res => res[0]);
  
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const isAdmin = session?.user?.role === 'admin';
  const isOwner = session?.user?.id && order.userId === parseInt(session.user.id);
  
  if (!session || (!isAdmin && !isOwner)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

  const orderWithItems = {
    id: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress,
    total: order.total,
    status: order.status,
    createdAt: order.createdAt.toString(),
    items: items.map(item => ({
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
    })),
  };

  const pdfBuffer = await renderToBuffer(InvoicePDF({ order: orderWithItems }));

  // Convert Buffer to Uint8Array for NextResponse
  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${orderId}.pdf`,
    },
  });
}
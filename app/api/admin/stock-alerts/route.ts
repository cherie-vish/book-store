import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { lt, lte } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get products with low stock (stock <= lowStockThreshold)
  const lowStockProducts = await db.select()
    .from(products)
    .where(lte(products.stock, products.lowStockThreshold))
    .orderBy(products.stock);

  // Get products that are out of stock
  const outOfStockProducts = lowStockProducts.filter(p => p.stock === 0);
  const criticalStockProducts = lowStockProducts.filter(p => p.stock > 0 && p.stock <= 2);
  const lowStockProductsList = lowStockProducts.filter(p => p.stock > 2);

  return NextResponse.json({
    totalLowStock: lowStockProducts.length,
    outOfStock: outOfStockProducts.length,
    criticalStock: criticalStockProducts.length,
    lowStock: lowStockProductsList.length,
    products: lowStockProducts,
  });
}
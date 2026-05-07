import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, products } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, sql } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all orders
  const allOrders = await db.select().from(orders);
  
  // Calculate total revenue
  const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
  
  // Calculate average order value
  const avgOrderValue = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;
  
  // Count orders by status
  const ordersByStatus = allOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Monthly sales data (last 6 months)
  const monthlyData: Record<string, { month: string; sales: number; orders: number }> = {};
  
  allOrders.forEach(order => {
    const date = new Date(order.createdAt);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const monthName = date.toLocaleString('default', { month: 'short' });
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { month: monthName, sales: 0, orders: 0 };
    }
    monthlyData[monthKey].sales += order.total;
    monthlyData[monthKey].orders += 1;
  });
  
  const monthlySales = Object.values(monthlyData).slice(-6);
  
  // Top selling products
  const orderItemsList = await db.select().from(orderItems);
  const productSales: Record<number, { id: number; name: string; quantity: number; revenue: number }> = {};
  
  for (const item of orderItemsList) {
    if (!productSales[item.productId]) {
      productSales[item.productId] = {
        id: item.productId,
        name: item.productName,
        quantity: 0,
        revenue: 0,
      };
    }
    productSales[item.productId].quantity += item.quantity;
    productSales[item.productId].revenue += item.price * item.quantity;
  }
  
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
  
  // Recent orders
  const recentOrders = allOrders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);
  
  // Calculate growth (compare last 30 days with previous 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
  const sixtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
  
  const recentOrdersCount = allOrders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo).length;
  const previousOrdersCount = allOrders.filter(o => new Date(o.createdAt) >= sixtyDaysAgo && new Date(o.createdAt) < thirtyDaysAgo).length;
  const orderGrowth = previousOrdersCount > 0 
    ? ((recentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100 
    : recentOrdersCount > 0 ? 100 : 0;
  
  const recentRevenue = allOrders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo).reduce((sum, o) => sum + o.total, 0);
  const previousRevenue = allOrders.filter(o => new Date(o.createdAt) >= sixtyDaysAgo && new Date(o.createdAt) < thirtyDaysAgo).reduce((sum, o) => sum + o.total, 0);
  const revenueGrowth = previousRevenue > 0 
    ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 
    : recentRevenue > 0 ? 100 : 0;
  
  return NextResponse.json({
    summary: {
      totalRevenue,
      totalOrders: allOrders.length,
      avgOrderValue,
      orderGrowth,
      revenueGrowth,
    },
    ordersByStatus,
    monthlySales,
    topProducts,
    recentOrders,
  });
}
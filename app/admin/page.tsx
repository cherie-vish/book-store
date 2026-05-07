import { db } from '@/lib/db';
import { products, orders, users } from '@/lib/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Users, DollarSign, AlertTriangle } from 'lucide-react';
import { StockAlert } from '@/components/admin/StockAlert';

async function getStats() {
  const totalProducts = await db.select().from(products);
  const totalOrders = await db.select().from(orders);
  const totalUsers = await db.select().from(users);
  const totalRevenue = totalOrders.reduce((sum, order) => sum + order.total, 0);
  const lowStockProducts = totalProducts.filter(p => p.stock <= (p.lowStockThreshold || 5)).length;
  
  return {
    products: totalProducts.length,
    orders: totalOrders.length,
    users: totalUsers.length,
    revenue: totalRevenue,
    lowStock: lowStockProducts,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { title: 'Total Products', value: stats.products, icon: Package, color: 'bg-blue-500' },
    { title: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'bg-green-500' },
    { title: 'Total Users', value: stats.users, icon: Users, color: 'bg-purple-500' },
    { title: 'Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, color: 'bg-yellow-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Stock Alert Banner */}
      {stats.lowStock > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-800">
              {stats.lowStock} product{stats.lowStock !== 1 ? 's are' : ' is'} running low on stock.
            </p>
          </div>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{card.title}</CardTitle>
              <div className={`${card.color} p-2 rounded-full text-white`}>
                <card.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Stock Alerts Section */}
      <h2 className="text-2xl font-bold mb-4">Stock Alerts</h2>
      <StockAlert />
    </div>
  );
}
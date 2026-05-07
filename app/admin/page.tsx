'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StockAlert } from '@/components/admin/StockAlert';
import { SalesAnalytics } from '@/components/admin/SalesAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';

function StatsCards({ stats }: { stats: any }) {
  const cards = [
    { title: 'Total Products', value: stats.products, icon: Package, color: 'bg-blue-500' },
    { title: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'bg-green-500' },
    { title: 'Total Users', value: stats.users, icon: Users, color: 'bg-purple-500' },
    { title: 'Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, color: 'bg-yellow-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <StatsCards stats={stats} />
      
      <div className="mt-8">
        <Tabs defaultValue="analytics">
          <TabsList className="mb-6">
            <TabsTrigger value="analytics">Sales Analytics</TabsTrigger>
            <TabsTrigger value="stock">Stock Alerts</TabsTrigger>
          </TabsList>
          <TabsContent value="analytics">
            <SalesAnalytics />
          </TabsContent>
          <TabsContent value="stock">
            <StockAlert />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
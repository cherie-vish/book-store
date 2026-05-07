'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, PackageX, PackageOpen, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StockAlert {
  totalLowStock: number;
  outOfStock: number;
  criticalStock: number;
  lowStock: number;
  products: Array<{
    id: number;
    name: string;
    stock: number;
    lowStockThreshold: number;
    price: number;
  }>;
}

export function StockAlert() {
  const [alerts, setAlerts] = useState<StockAlert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/admin/stock-alerts');
      const data = await res.json();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-4">Loading stock alerts...</div>;
  if (!alerts || alerts.totalLowStock === 0) return <div className="text-center py-4 text-gray-500">All products have sufficient stock.</div>;

  const getStockColor = (stock: number, threshold: number) => {
    if (stock === 0) return 'bg-red-500 text-white';
    if (stock <= 2) return 'bg-orange-500 text-white';
    return 'bg-yellow-500 text-white';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-700">{alerts.outOfStock}</p>
              </div>
              <PackageX className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Critical Stock (≤2)</p>
                <p className="text-2xl font-bold text-orange-700">{alerts.criticalStock}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-700">{alerts.lowStock}</p>
              </div>
              <PackageOpen className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Alerting</p>
                <p className="text-2xl font-bold text-blue-700">{alerts.totalLowStock}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Products Needing Attention</h3>
          <div className="space-y-2">
            {alerts.products.map((product) => (
              <div key={product.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-500">Threshold: {product.lowStockThreshold}</p>
                </div>
                <Badge className={getStockColor(product.stock, product.lowStockThreshold)}>
                  Stock: {product.stock}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Package } from 'lucide-react';

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  trackingNumber: string | null;
  estimatedDelivery: string | null;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingForm, setTrackingForm] = useState({ 
    trackingNumber: '', 
    estimatedDelivery: '', 
    status: '' 
  });
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateTracking = async (orderId: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/tracking`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingForm),
      });

      if (res.ok) {
        toast.success('Tracking updated');
        fetchOrders();
        setSelectedOrderId(null);
        setTrackingForm({ trackingNumber: '', estimatedDelivery: '', status: '' });
      } else {
        toast.error('Failed to update');
      }
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const updateStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/tracking`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        toast.success('Status updated');
        fetchOrders();
      } else {
        toast.error('Failed to update');
      }
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      paid: 'bg-blue-500',
      shipped: 'bg-purple-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const openTrackingDialog = (order: Order) => {
    setSelectedOrderId(order.id);
    setTrackingForm({
      trackingNumber: order.trackingNumber || '',
      estimatedDelivery: order.estimatedDelivery?.split('T')[0] || '',
      status: order.status,
    });
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tracking</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>#{order.id}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>{order.customerEmail}</TableCell>
              <TableCell>${order.total.toFixed(2)}</TableCell>
              <TableCell>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className={`text-white rounded px-2 py-1 text-sm ${getStatusColor(order.status)}`}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </TableCell>
              <TableCell>
                {order.trackingNumber ? (
                  <span className="text-sm font-mono">{order.trackingNumber}</span>
                ) : (
                  <span className="text-gray-400 text-sm">Not set</span>
                )}
              </TableCell>
              <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => openTrackingDialog(order)}>
                  <Package className="h-4 w-4 mr-1" />
                  Tracking
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Tracking Dialog */}
      <Dialog open={selectedOrderId !== null} onOpenChange={() => setSelectedOrderId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Tracking - Order #{selectedOrderId}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tracking Number</label>
              <Input
                placeholder="e.g., USPS: 123456789"
                value={trackingForm.trackingNumber}
                onChange={(e) => setTrackingForm({ ...trackingForm, trackingNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Estimated Delivery Date</label>
              <Input
                type="date"
                value={trackingForm.estimatedDelivery}
                onChange={(e) => setTrackingForm({ ...trackingForm, estimatedDelivery: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={trackingForm.status}
                onChange={(e) => setTrackingForm({ ...trackingForm, status: e.target.value })}
                className="w-full border rounded-md p-2"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <Button onClick={() => selectedOrderId && updateTracking(selectedOrderId)} className="w-full">
              Save Tracking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
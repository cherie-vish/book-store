'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Package, Truck, CheckCircle, Clock, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const statusSteps = {
  pending: { label: 'Order Placed', icon: Clock, completed: true, current: true },
  paid: { label: 'Payment Confirmed', icon: CheckCircle, completed: true, current: false },
  shipped: { label: 'Shipped', icon: Truck, completed: false, current: false },
  delivered: { label: 'Delivered', icon: Package, completed: false, current: false },
};

const statusOrder = ['pending', 'paid', 'shipped', 'delivered'];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/orders/track?orderId=${orderId}&email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else if (res.status === 404) {
        toast.error('Order not found');
        setOrder(null);
      } else if (res.status === 401) {
        toast.error('Invalid email for this order');
        setOrder(null);
      } else {
        toast.error('Failed to track order');
        setOrder(null);
      }
    } catch (error) {
      toast.error('Something went wrong');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    return statusOrder.indexOf(order.status);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      paid: 'bg-blue-500',
      shipped: 'bg-purple-500',
      delivered: 'bg-green-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Track Your Order</h1>

      {/* Search Form */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Order ID</label>
              <Input
                placeholder="e.g., 12345"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email Address</label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Tracking...' : 'Track Order'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Order Details */}
      {searched && !loading && order && (
        <div className="space-y-6">
          {/* Status Timeline */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6">Order Status</h2>
              <div className="relative">
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
                <div 
                  className="absolute top-5 left-0 h-0.5 bg-green-500 transition-all duration-500"
                  style={{ width: `${(getCurrentStepIndex() / (statusOrder.length - 1)) * 100}%` }}
                />
                <div className="relative flex justify-between">
                  {statusOrder.map((status, idx) => {
                    const isCompleted = idx <= getCurrentStepIndex();
                    const StepIcon = statusSteps[status as keyof typeof statusSteps].icon;
                    const isCurrent = order.status === status;
                    return (
                      <div key={status} className="text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-all ${
                          isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}>
                          <StepIcon className="h-5 w-5" />
                        </div>
                        <p className={`text-sm font-medium ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                          {statusSteps[status as keyof typeof statusSteps].label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-6 text-center">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(order.status)}`}>
                  {order.status.toUpperCase()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Order Information */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Order Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Order ID:</span>
                  <span className="font-medium">#{order.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Order Date:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Total Amount:</span>
                  <span className="font-bold">${order.total.toFixed(2)}</span>
                </div>
                {order.trackingNumber && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Tracking Number:</span>
                    <span className="font-mono">{order.trackingNumber}</span>
                  </div>
                )}
                {order.estimatedDelivery && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Estimated Delivery:</span>
                    <span>{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </h2>
              <p className="text-gray-600">{order.customerAddress}</p>
              <p className="text-gray-500 mt-2">{order.customerName} | {order.customerPhone}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {searched && !loading && !order && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <p className="text-yellow-800">No order found with the provided details.</p>
            <p className="text-sm text-yellow-600 mt-2">Please check your Order ID and email and try again.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
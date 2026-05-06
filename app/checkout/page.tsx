'use client';

import { useCartStore } from '@/lib/store/cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, totalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    address: '',
  });

  // 👇 Move the redirect to useEffect
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router]);

  // Don't render anything if redirecting
  if (items.length === 0) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      customerName: form.name,
      customerEmail: form.email,
      customerPhone: form.phone,
      customerAddress: form.address,
      total: totalPrice(),
      items: items.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        clearCart();
        toast.success('Order placed successfully!');
        router.push('/');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to place order');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Billing Form */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">Billing Details</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Full Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                type="email"
                placeholder="Email *"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <Input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <Input
                placeholder="Address *"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Placing Order...' : 'Place Order'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">Your Order</h3>
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${totalPrice().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
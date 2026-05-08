'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store/cart';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

function PaymentForm({ amount, orderData, onSuccess, clientSecret }: { amount: number; orderData: any; onSuccess: () => void; clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else if (paymentIntent?.status === 'succeeded') {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        toast.success('Payment successful! Order placed.');
        onSuccess();
      } else {
        toast.error('Order failed, but payment succeeded. Contact support.');
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || loading} className="w-full">
        {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, totalPrice, clearCart } = useCartStore();
  const [clientSecret, setClientSecret] = useState('');
  const [loadingSecret, setLoadingSecret] = useState(false);
  const [form, setForm] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router]);

  useEffect(() => {
    if (items.length > 0 && totalPrice() > 0) {
      setLoadingSecret(true);
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalPrice(), orderId: Date.now().toString() }),
      })
        .then(res => res.json())
        .then(data => {
          setClientSecret(data.clientSecret);
          setLoadingSecret(false);
        })
        .catch(err => {
          console.error('Failed to get client secret:', err);
          toast.error('Payment setup failed');
          setLoadingSecret(false);
        });
    }
  }, [items.length, totalPrice]);

  if (items.length === 0) return null;

  const orderData = {
    userId: session?.user?.id ? parseInt(session.user.id) : null,
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

  const handlePaymentSuccess = () => {
    clearCart();
    router.push('/order-success');
  };

  const isFormValid = form.name && form.email && form.address;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">Billing Details</h3>
            <div className="space-y-4">
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">Payment</h3>
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="flex justify-between font-semibold">
                <span>Total Amount:</span>
                <span>${totalPrice().toFixed(2)}</span>
              </div>
            </div>

            {loadingSecret && <div className="text-center py-4">Loading payment form...</div>}

            {!loadingSecret && clientSecret && isFormValid && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm amount={totalPrice()} orderData={orderData} onSuccess={handlePaymentSuccess} clientSecret={clientSecret} />
              </Elements>
            )}

            {!loadingSecret && !clientSecret && <div className="text-center py-4 text-red-500">Failed to load payment. Refresh and try again.</div>}

            {!isFormValid && (
              <div className="text-center py-4 text-yellow-600 text-sm">Please fill all billing details to proceed with payment.</div>
            )}

            <p className="text-xs text-gray-500 mt-4 text-center">
              Test mode: Use card 4242 4242 4242 4242, any future expiry, any CVC
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
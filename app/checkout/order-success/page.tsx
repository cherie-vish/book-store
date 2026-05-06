import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h1 className="text-3xl font-bold mb-2">Order Placed!</h1>
      <p className="text-gray-600 mb-8">Thank you for your purchase. Your order has been received.</p>
      <Link href="/">
        <Button>Continue Shopping</Button>
      </Link>
    </div>
  );
}
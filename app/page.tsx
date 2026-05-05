import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">BookStore</h1>
          <p className="text-xl mb-8">Discover your next favorite book</p>
          <Link href="/products">
            <Button size="lg" variant="secondary">Shop Now</Button>
          </Link>
        </div>
      </section>

      {/* Featured Books */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Featured Books</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <div className="bg-gray-200 h-48 rounded mb-4 flex items-center justify-center">
                📚
              </div>
              <h3 className="font-semibold">Book Title {i}</h3>
              <p className="text-gray-600">$19.99</p>
              <Button className="w-full mt-2">Add to Cart</Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
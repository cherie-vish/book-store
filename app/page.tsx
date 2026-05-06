import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { ProductCard } from '@/components/ProductCard';

async function getFeaturedProducts() {
  const allProducts = await db.select().from(products).orderBy(desc(products.createdAt)).limit(4);
  return allProducts;
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

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
        {featuredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No products yet. Admin can add products from the admin panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
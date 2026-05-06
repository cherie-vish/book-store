import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { ProductCard } from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

async function getAllProducts() {
  const allProducts = await db.select().from(products);
  return allProducts;
}

export default async function ProductsPage() {
  const allProducts = await getAllProducts();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">All Books</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <Input placeholder="Search books..." className="w-full md:w-64" />
          <Button variant="outline">Filter</Button>
        </div>
      </div>

      {allProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg">
          <p className="text-gray-500">No products available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
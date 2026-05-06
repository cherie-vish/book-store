import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AddToCartButton } from '@/components/AddToCartButton';

async function getProduct(id: number) {
  const product = await db.select().from(products).where(eq(products.id, id));
  return product[0];
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(parseInt(id));

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full w-full object-cover rounded-lg" />
          ) : (
            <span className="text-gray-400 text-6xl">📚</span>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description || 'No description available.'}</p>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
            <span className="text-gray-500">Stock: {product.stock}</span>
          </div>
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}
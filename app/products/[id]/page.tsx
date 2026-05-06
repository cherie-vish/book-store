import { db } from '@/lib/db';
import { products, reviews } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { AddToCartButton } from '@/components/AddToCartButton';
import { ReviewSection } from '@/components/ReviewSection';

async function getProduct(id: number) {
  const product = await db.select().from(products).where(eq(products.id, id));
  return product[0];
}

async function getReviews(productId: number) {
  const productReviews = await db.select().from(reviews).where(eq(reviews.productId, productId));
  return productReviews;
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(parseInt(id));
  const reviews = await getReviews(parseInt(id));
  
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  if (!product) notFound();

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
      
      <ReviewSection productId={product.id} initialReviews={reviews} initialRating={avgRating} />
    </div>
  );
}
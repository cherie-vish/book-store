'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  lowStockThreshold: number;
  image: string | null;
  category: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    lowStockThreshold: '5',
    category: 'other',
    image: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      lowStockThreshold: parseInt(form.lowStockThreshold) || 5,
      category: form.category,
      image: form.image || null,
    };

    try {
      if (editing) {
        await fetch(`/api/products/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        toast.success('Product updated');
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        toast.success('Product created');
      }
      setIsOpen(false);
      setEditing(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const resetForm = () => {
    setForm({ 
      name: '', 
      description: '', 
      price: '', 
      stock: '', 
      lowStockThreshold: '5', 
      category: 'other', 
      image: '' 
    });
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      lowStockThreshold: (product.lowStockThreshold || 5).toString(),
      category: product.category,
      image: product.image || '',
    });
    setIsOpen(true);
  };

  const getStockColor = (stock: number, threshold: number) => {
    if (stock === 0) return 'text-red-600 font-bold';
    if (stock <= threshold) return 'text-orange-600 font-semibold';
    return 'text-green-600';
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => { setEditing(null); resetForm(); setIsOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div className="bg-gray-100 h-32 rounded mb-3 flex items-center justify-center">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover rounded" />
                ) : (
                  <span className="text-gray-400 text-4xl">📚</span>
                )}
              </div>
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{product.description?.slice(0, 80)}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="font-bold text-xl">${product.price.toFixed(2)}</span>
                <span className={`text-sm ${getStockColor(product.stock, product.lowStockThreshold)}`}>
                  Stock: {product.stock}
                </span>
              </div>
              {product.stock <= product.lowStockThreshold && (
                <div className="mt-1 text-xs text-orange-600">
                  ⚠️ Low stock alert (threshold: {product.lowStockThreshold})
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={() => openEdit(product)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Product' : 'New Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Product Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                step="0.01"
                placeholder="Price *"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
              <Input
                type="number"
                placeholder="Stock *"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Low Stock Threshold"
                value={form.lowStockThreshold}
                onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
              />
              <Select value={form.category} onValueChange={(value: string | null) => setForm({ ...form, category: value || 'other' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fiction">Fiction</SelectItem>
                  <SelectItem value="self-help">Self Help</SelectItem>
                  <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                  <SelectItem value="biography">Biography</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="romance">Romance</SelectItem>
                  <SelectItem value="thriller">Thriller</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Image URL"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
            <Button type="submit" className="w-full">
              {editing ? 'Update Product' : 'Create Product'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
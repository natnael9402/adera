'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { ShoppingBag, ArrowLeft, Plus, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ImageUpload from '@/components/ImageUpload';

const CATEGORIES = [
  'Laptops & Computers',
  'Smartphones & Tablets',
  'Audio & Headphones',
  'Cameras & Drones',
  'Gaming & VR',
  'Home & Kitchen',
  'Watches & Wearables',
  'Fashion & Footwear',
  'Outdoor & Sports',
  'Health & Fitness',
  'Office & Workspace',
  'Power & Tech Gear',
];

export default function NewProductPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'Laptops & Computers',
    brand: '',
    sku: '',
    source: 'Amazon Prime',
    image: '',
    stock: '999',
  });
  const [submitting, setSubmitting] = useState(false);

  if (!loading && !user) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.products.create({
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        stock: parseInt(formData.stock, 10) || 999,
      });
      router.push('/products');
    } catch (error) {
      console.error(error);
      alert('Failed to create product');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full space-y-6">
        
        <div className="flex items-center justify-between">
          <Link 
            href="/products" 
            className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Products
          </Link>

          <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-200">
            Store Catalog Module
          </span>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 bg-primary-50 border border-primary-200 rounded-2xl flex items-center justify-center text-primary-700">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Add New Store Product
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                New merchandise is immediately available in the public catalog and reseller storefronts.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="e.g., Apple MacBook Pro 16 M3 Max"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white transition-all font-medium"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Product Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe specifications, key features, hardware warranty, and dimensions..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white transition-all resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              label="Product Display Photo"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Price ($ USD) <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="149.99"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white transition-all font-mono font-bold"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Original Price ($ USD) (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="199.99"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white transition-all font-mono"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-bold focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Brand (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apple, Sony"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-primary-500"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Sourcing Channel
                </label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-bold focus:outline-none focus:border-primary-500"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                >
                  <option value="Amazon Prime">Amazon Prime</option>
                  <option value="eBay Top Rated Plus">eBay Top Rated Plus</option>
                  <option value="Verified Wholesaler">Verified Wholesaler</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md shadow-primary-600/20 hover-lift flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{submitting ? 'Creating Product...' : 'Add Product to Store'}</span>
              </button>
            </div>
          </form>

        </div>
      </main>
    </div>
  );
}

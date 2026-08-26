'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { 
  ShoppingBag, Plus, Trash2, Tag, 
  Search, ExternalLink, AlertCircle, Eye 
} from 'lucide-react';
import Navbar from '@/components/Navbar';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  sold?: number;
  image: string;
}

export default function ProductsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) loadProducts();
  }, [user, loading, router]);

  const loadProducts = () => {
    api.products.list().then(setProducts).catch(console.error);
  };

  const removeProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this merchandise product?')) return;
    setDeletingId(id);
    try {
      await api.products.remove(id);
      setProducts((p) => p.filter((prod) => prod.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-primary-600" />
              Store Merchandise Catalog
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage physical & digital inventory items sold with 100% impact proceeds.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={process.env.NEXT_PUBLIC_STORE_URL || "https://shop.aderafoundation.com"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-all border border-slate-200 text-xs shadow-xs"
            >
              <span>View Public Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <Link
              href="/products/new"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-md shadow-primary-600/20 text-xs hover-lift"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search store inventory by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white"
            />
          </div>

          <span className="text-xs font-mono font-bold text-slate-500 hidden sm:inline">
            Total Items: {filteredProducts.length}
          </span>
        </div>

        {/* Products Table Card */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 w-24">Item</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Product Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Category</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Price (USD)</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Thumbnail */}
                    <td className="px-6 py-3.5">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Tag className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-6 py-3.5">
                      <p className="font-bold text-slate-900 max-w-sm">
                        {product.name}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        ID: #{product.id}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-3.5">
                      <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg">
                        {product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-3.5">
                      <div className="font-mono">
                        <span className="font-bold text-slate-900 text-sm">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-slate-400 line-through text-xs ml-2">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3.5 text-right">
                      <button
                        disabled={deletingId === product.id}
                        onClick={() => removeProduct(product.id)}
                        title="Delete Product"
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition-all shadow-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-8 h-8 text-slate-400" />
                        <p className="font-bold text-slate-800 text-sm">No products found</p>
                        <p className="text-xs text-slate-500">Add merchandise items to populate the shop catalog.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

import TierMedal from "./TierMedal";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
}

async function getProducts(): Promise<Product[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.aderafoundation.com/api";
    const res = await fetch(`${apiUrl}/products`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function FeaturedProducts() {
  const products = await getProducts();
  const topProducts = products.slice(0, 4);

  if (topProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-20 lg:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Reseller Tiers Bar */}
        <div className="mb-10 p-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-black">
            <span className="text-[11px] uppercase tracking-wider text-emerald-100 bg-black/20 px-2.5 py-1 rounded-md">
              Reseller Program
            </span>
            <div className="flex items-center gap-1.5">
              <TierMedal tier="BRONZE" size="xs" />
              <span>Bronze (20%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TierMedal tier="SILVER" size="xs" />
              <span>Silver (25%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TierMedal tier="GOLD" size="xs" />
              <span>Gold (30%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TierMedal tier="PLATINUM" size="xs" />
              <span>Platinum (35%)</span>
            </div>
          </div>

          <a
            href={`${process.env.NEXT_PUBLIC_STORE_URL || "https://shop.aderafoundation.com"}/reseller/register`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-1.5 bg-white text-emerald-700 hover:bg-emerald-50 font-black text-xs uppercase tracking-wider rounded-full transition-colors shrink-0 shadow-xs"
          >
            Register Your Shop
          </a>
        </div>

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 pb-8 border-b border-slate-100">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider mb-3 border border-primary-200">
              <ShoppingBag className="w-3.5 h-3.5 text-primary-600" />
              Adera Official Store
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Shop With <span className="text-primary-600">Purpose</span>
            </h2>
            <p className="mt-3 text-base text-slate-600 font-normal leading-relaxed">
              100% of profit proceeds directly fund on-chain verified causes. Support global initiatives with every purchase.
            </p>
          </div>
          
          <a 
            href={process.env.NEXT_PUBLIC_STORE_URL || "https://shop.aderafoundation.com"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-primary-600/20 shrink-0 hover-lift"
          >
            Visit Full Store
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topProducts.map((product) => (
            <a 
              key={product.id} 
              href={process.env.NEXT_PUBLIC_STORE_URL || "https://shop.aderafoundation.com"} 
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col bg-white rounded-2xl border border-slate-200 hover:border-primary-500 p-4 transition-all duration-200 hover:shadow-md"
            >
              {/* Product Image Container */}
              <div className="relative aspect-square w-full bg-slate-50 rounded-xl overflow-hidden mb-4 border border-slate-100">
                <Image 
                  src={product.image && (product.image.startsWith('http') || product.image.startsWith('/')) ? product.image : '/causes/cause_water_1786200462466.jpg'} 
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="absolute top-3 left-3 bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                    Sale
                  </div>
                )}

                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center p-3">
                  <span className="w-full bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold py-2 rounded-lg text-center shadow-md flex items-center justify-center gap-1.5 transition-colors">
                    <ShoppingBag className="w-3.5 h-3.5" /> View in Store
                  </span>
                </div>
              </div>
              
              {/* Product Metadata */}
              <div className="flex flex-col flex-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {product.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-3 group-hover:text-primary-700 transition-colors">
                  {product.name}
                </h3>

                {/* Price and Impact Row */}
                <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-slate-900 font-mono">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs font-medium text-slate-400 line-through font-mono">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded border border-primary-200">
                    100% Impact
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}

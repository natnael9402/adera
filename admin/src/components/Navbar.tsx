'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, FileText, ShoppingBag, 
  Heart, Users, Wallet, LogOut, ArrowUpRight, 
  ExternalLink, ShieldCheck, Package, Activity, Mail, UserCheck 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/users', label: 'Users', icon: Users },
    { href: '/orders', label: 'Orders', icon: Package },
    { href: '/posts', label: 'Causes', icon: FileText },
    { href: '/products', label: 'Products', icon: ShoppingBag },
    { href: '/customers', label: 'Buyers & CRM', icon: UserCheck },
    { href: '/emails', label: 'Email Logs', icon: Mail },
    { href: '/donors', label: 'Leaderboard', icon: Heart },
    { href: '/payments', label: 'Wallets', icon: Wallet },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Official Brand Logo & Navigation */}
        <div className="flex items-center gap-6 xl:gap-8">
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 relative overflow-visible group-hover:scale-105 transition-transform">
              <Image 
                src="/logo.png" 
                alt="Adera Foundation Logo" 
                fill 
                sizes="40px"
                className="object-contain" 
                priority 
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xl font-bold text-slate-900 tracking-tight">Adera</span>
                <span className="text-[10px] font-bold text-primary-700 bg-primary-50 border border-primary-200 px-1.5 py-0.5 rounded uppercase tracking-wider">Admin</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-tight mt-0.5">
                Foundation Console
              </span>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <div className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Links, User Avatar & Sign Out */}
        <div className="flex items-center gap-3">
          
          {/* Quick links to Main Portal and Store */}
          <div className="hidden lg:flex items-center gap-2 border-r border-slate-200 pr-3 mr-1">
            <a 
              href={process.env.NEXT_PUBLIC_APP_URL || "https://aderafoundation.com"} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-primary-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span>Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a 
              href={process.env.NEXT_PUBLIC_STORE_URL || "https://shop.aderafoundation.com"} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-primary-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span>Shop</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {user && (
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="w-6 h-6 rounded-lg bg-primary-600 text-white flex items-center justify-center text-xs font-black uppercase">
                {user.name?.[0] || 'A'}
              </span>
              <span className="text-xs font-bold text-slate-800 hidden sm:inline">{user.name}</span>
            </div>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors border border-rose-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

      </div>

      {/* Sub Navigation Strip (Tablets & Mobile) */}
      <div className="xl:hidden flex items-center gap-1 overflow-x-auto pt-3 border-t border-slate-100 mt-2.5 no-scrollbar">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

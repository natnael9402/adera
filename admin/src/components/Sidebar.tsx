'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  Heart,
  Users,
  Wallet,
  LogOut,
  ExternalLink,
  Package,
  Mail,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
} from 'lucide-react';

const navSections = [
  {
    title: 'MAIN',
    items: [
      { name: 'Overview', href: '/', icon: LayoutDashboard },
      { name: 'Orders', href: '/orders', icon: Package },
      { name: 'Causes', href: '/posts', icon: FileText },
      { name: 'Notifications', href: '/notifications', icon: Bell },
    ],
  },
  {
    title: 'COMMUNITY',
    items: [
      { name: 'Users', href: '/users', icon: Users },
      { name: 'Donors', href: '/donors', icon: Heart },
      { name: 'Buyers & CRM', href: '/customers', icon: UserCheck },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { name: 'Products', href: '/products', icon: ShoppingBag },
      { name: 'Email Logs', href: '/emails', icon: Mail },
      { name: 'Wallets', href: '/payments', icon: Wallet },
    ],
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
}

export function SidebarMobileToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-2.5 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer border border-slate-200 flex items-center justify-center min-w-[40px] min-h-[40px] shadow-2xs"
      aria-label="Open navigation menu"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}

export default function Sidebar({
  mobileOpen = false,
  setMobileOpen,
  collapsed: controlledCollapsed,
  setCollapsed: controlledSetCollapsed,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const setIsCollapsed = controlledSetCollapsed || setInternalCollapsed;

  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobileOpen && setMobileOpen) {
      setMobileOpen(false);
    }
  }, [pathname]);

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);
  const closeMobile = () => setMobileOpen && setMobileOpen(false);

  const sidebarWidth = isCollapsed ? 'w-[72px]' : 'w-[280px]';

  const portalUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aderafoundation.com';
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || 'https://shop.aderafoundation.com';

  const renderSidebarContent = (collapsedMode: boolean, isMobile: boolean = false) => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Brand Section */}
      <div
        className={`flex items-center h-16 shrink-0 border-b border-slate-200 ${
          collapsedMode ? 'justify-center px-0' : 'justify-between px-5'
        }`}
      >
        <Link
          href="/"
          onClick={() => isMobile && closeMobile()}
          className="flex items-center gap-2.5 overflow-hidden group"
        >
          <div className="shrink-0 w-8 h-8 relative flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Adera Logo"
              width={32}
              height={32}
              className="rounded-lg object-contain group-hover:scale-105 transition-transform"
            />
          </div>
          {!collapsedMode && (
            <div className="flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-lg font-black tracking-tight text-slate-900">Adera</span>
              <span className="text-[10px] font-bold tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                ADMIN
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        {!collapsedMode && !isMobile && (
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Mobile Close Button */}
        {isMobile && (
          <button
            onClick={closeMobile}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {collapsedMode && (
        <div className="hidden lg:flex justify-center py-3 border-b border-slate-100">
          <button
            onClick={toggleCollapse}
            className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-5 custom-scrollbar">
        {navSections.map((section) => (
          <div key={section.title}>
            {collapsedMode ? (
              <div className="h-px bg-slate-200 my-3 mx-2" />
            ) : (
              <h3 className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => isMobile && closeMobile()}
                      title={collapsedMode ? item.name : undefined}
                      className={`
                        flex items-center ${
                          collapsedMode ? 'justify-center px-0' : 'justify-start px-3'
                        } py-2.5 rounded-xl group transition-all relative text-xs
                        ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80 shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
                        }
                      `}
                    >
                      {isActive && !collapsedMode && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-600 rounded-r-full" />
                      )}
                      {isActive && collapsedMode && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600 rounded-r-full" />
                      )}
                      <Icon
                        className={`shrink-0 ${
                          collapsedMode ? 'w-5 h-5' : 'w-4 h-4 mr-3'
                        } ${isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-700'}`}
                      />
                      {!collapsedMode && <span className="truncate">{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="shrink-0 border-t border-slate-200 bg-slate-50/50">
        {/* External Links */}
        <div
          className={`py-2.5 px-3 border-b border-slate-200/80 flex flex-col gap-1 ${
            collapsedMode ? 'items-center' : ''
          }`}
        >
          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={collapsedMode ? 'Open Portal' : undefined}
            className={`flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1.5 px-2 rounded-lg hover:bg-slate-100 ${
              collapsedMode ? 'justify-center' : ''
            }`}
          >
            <ExternalLink className={`shrink-0 w-3.5 h-3.5 ${collapsedMode ? '' : 'mr-2'}`} />
            {!collapsedMode && 'Public Portal'}
          </a>
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={collapsedMode ? 'Open Shop' : undefined}
            className={`flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1.5 px-2 rounded-lg hover:bg-slate-100 ${
              collapsedMode ? 'justify-center' : ''
            }`}
          >
            <ExternalLink className={`shrink-0 w-3.5 h-3.5 ${collapsedMode ? '' : 'mr-2'}`} />
            {!collapsedMode && 'Impact Store'}
          </a>
        </div>

        {/* User Info & Logout */}
        <div
          className={`p-3.5 flex items-center ${
            collapsedMode ? 'flex-col gap-2 justify-center' : 'justify-between'
          }`}
        >
          <div
            className={`flex items-center ${
              collapsedMode ? 'justify-center' : 'gap-2.5 overflow-hidden'
            }`}
          >
            <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 font-black text-xs uppercase">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            {!collapsedMode && (
              <div className="flex flex-col overflow-hidden min-w-0">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'admin@aderafoundation.com'}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            title="Sign out"
            className="shrink-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed inset-y-0 left-0 z-40 transition-[width] duration-300 ease-in-out ${sidebarWidth}`}
      >
        {renderSidebarContent(isCollapsed, false)}
      </aside>

      {/* Mobile Drawer with Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={closeMobile}
              aria-hidden="true"
            />

            {/* Slide-out drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.28 }}
              className="relative z-50 w-[280px] max-w-[85vw] h-full shadow-2xl bg-white flex flex-col"
            >
              {renderSidebarContent(false, true)}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

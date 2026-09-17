'use client';

import React, { useState } from 'react';
import Sidebar, { SidebarMobileToggle } from '@/components/Sidebar';
import Image from 'next/image';
import Link from 'next/link';

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-600 selection:text-white">
      {/* Persistent Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={desktopCollapsed}
        setCollapsed={setDesktopCollapsed}
      />

      {/* Synchronized Spacer for Desktop */}
      <div
        className={`hidden lg:block shrink-0 transition-[width] duration-300 ease-in-out ${
          desktopCollapsed ? 'w-[72px]' : 'w-[280px]'
        }`}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Mobile Header Bar - Fixed permanently at top so option/menu button never scrolls away */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3.5 sm:px-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <SidebarMobileToggle onClick={() => setMobileOpen(true)} />
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Adera Logo" width={26} height={26} className="rounded" />
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-slate-900 tracking-tight">Adera</span>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded uppercase">
                  Admin
                </span>
              </div>
            </Link>
          </div>

          <a
            href={process.env.NEXT_PUBLIC_APP_URL || 'https://aderafoundation.com'}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-bold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg transition-colors border border-slate-200"
          >
            Portal ↗
          </a>
        </header>

        {/* Mobile Header Spacer - Prevents top content from being covered by fixed navbar */}
        <div className="lg:hidden h-14 shrink-0" aria-hidden="true" />

        {/* Responsive Content Container */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 w-full max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

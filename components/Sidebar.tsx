'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  History,
  Heart,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Database,
} from 'lucide-react';
import { useSidebar } from '@/components/context/SidebarContext';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Kasir POS', path: '/kasir', icon: ShoppingCart },
  { name: 'Data Pasien', path: '/pasien', icon: Users },
  { name: 'Riwayat Kunjungan', path: '/riwayat', icon: History },
  { name: 'Katalog Terapi', path: '/terapi', icon: Heart },
  { name: 'Laporan Keuangan', path: '/laporan', icon: TrendingUp },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebar();

  return (
    <>
      {/* ── Mobile overlay backdrop ── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-30 lg:hidden"
          onClick={toggle}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ── */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen flex flex-col bg-white border-r border-slate-200/60
          transition-all duration-300 ease-in-out will-change-transform
          ${isOpen ? 'w-64 translate-x-0' : 'w-16 translate-x-0'}
          lg:relative lg:z-auto lg:translate-x-0
          ${!isOpen && '-translate-x-full lg:translate-x-0'}
        `}
        suppressHydrationWarning
      >
        {/* ── Brand / Logo ── */}
        <div
          className={`border-b border-slate-100 flex items-center shrink-0 h-16 transition-all duration-300 ${
            isOpen ? 'px-5 gap-3' : 'px-0 justify-center'
          }`}
        >
          <div className="w-10 h-10 bg-white border border-slate-150 rounded-xl flex items-center justify-center p-0.5 shadow-sm shrink-0">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>

          {/* Brand text — hidden when collapsed */}
          <div
            className={`overflow-hidden transition-all duration-250 whitespace-nowrap ${
              isOpen ? 'opacity-100 max-w-[120px]' : 'opacity-0 max-w-0'
            }`}
          >
            <h1 className="font-black text-slate-800 tracking-tight leading-none text-sm">SI-KABID</h1>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 block">
              KKN Bidan 2026
            </span>
          </div>
        </div>

        {/* ── Navigation Menu ── */}
        <nav className={`flex-1 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden ${isOpen ? 'px-3' : 'px-2'}`}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                title={!isOpen ? item.name : undefined}
                className={`
                  flex items-center rounded-lg text-xs font-bold transition-all duration-150 group relative
                  ${isOpen ? 'gap-3 px-3.5 py-2.5' : 'justify-center p-2.5'}
                  ${isActive
                    ? 'bg-[#007A64] text-white shadow-sm shadow-teal-700/15'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />

                {/* Menu label — hidden when collapsed */}
                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-250 ${
                    isOpen ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'
                  }`}
                >
                  {item.name}
                </span>

                {/* Tooltip on collapsed */}
                {!isOpen && (
                  <span className="absolute left-full ml-2.5 px-2.5 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-150 shadow-lg z-50">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── DB Status footer ── */}
        <div
          className={`border-t border-slate-100/60 py-4 shrink-0 transition-all duration-300 ${
            isOpen ? 'px-5' : 'px-2 flex justify-center'
          }`}
        >
          {isOpen ? (
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-500">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              Koneksi MySQL Aktif
            </div>
          ) : (
            <span title="Koneksi MySQL Aktif" className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          )}
        </div>

        {/* ── Collapse toggle button ── */}
        <button
          onClick={toggle}
          aria-label={isOpen ? 'Tutup Sidebar' : 'Buka Sidebar'}
          className={`
            absolute -right-3 top-[4.5rem] z-50
            w-6 h-6 rounded-full bg-white border border-slate-200 shadow-md
            flex items-center justify-center text-slate-500
            hover:text-[#007A64] hover:border-[#007A64]/30 hover:shadow-teal-100
            transition-all duration-200
          `}
        >
          {isOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </aside>
    </>
  );
}

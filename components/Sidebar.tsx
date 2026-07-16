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


        {/* ── Developer Contact Footer ── */}
        <div
          className={`border-t border-slate-100 transition-all duration-300 overflow-hidden ${
            isOpen ? 'opacity-100 max-h-40 py-3 px-3' : 'opacity-0 max-h-0 py-0 px-3'
          }`}
        >
          <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mb-2 px-1">
            Hubungi Developer
          </p>
          <a
            href="https://wa.me/6289563028673"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-emerald-50 transition-colors group w-full mb-1"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#25D366] shrink-0" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-700 group-hover:text-emerald-700 leading-none">Developer 1</p>
              <p className="text-[9px] text-slate-400 mt-0.5">0895-6302-86763</p>
            </div>
          </a>
          <a
            href="https://wa.me/6281331828851"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-emerald-50 transition-colors group w-full"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#25D366] shrink-0" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-700 group-hover:text-emerald-700 leading-none">Developer 2</p>
              <p className="text-[9px] text-slate-400 mt-0.5">0813-3182-8851</p>
            </div>
          </a>
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

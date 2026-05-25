'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Heart, 
  TrendingUp, 
  Sparkles 
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Kasir POS', path: '/kasir', icon: ShoppingCart },
    { name: 'Data Pasien', path: '/pasien', icon: Users },
    { name: 'Katalog Terapi', path: '/terapi', icon: Heart },
    { name: 'Laporan Keuangan', path: '/laporan', icon: TrendingUp },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col justify-between shrink-0" suppressHydrationWarning>
      <div>
        {/* Logo Brand */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 tracking-tight leading-none text-lg">SI-KABID</h1>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">KKN Bidan 2026</span>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            const Icon = item.icon;

            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? 'bg-teal-50 text-teal-700' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'
                }`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Info Box Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            Integrasi Sukses
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Sistem POS Kasir & Laba Rugi terhubung ke basis data local MySQL `db_kkn_bidan`.
          </p>
        </div>
      </div>
    </aside>
  );
}

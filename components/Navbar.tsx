'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, ChevronRight } from 'lucide-react';
import { useSidebar } from '@/components/context/SidebarContext';

const PAGE_MAP: Record<string, { title: string; breadcrumb: string[] }> = {
  '/dashboard': { title: 'Dashboard', breadcrumb: ['Dashboard'] },
  '/kasir': { title: 'Kasir POS', breadcrumb: ['Transaksi', 'Kasir POS'] },
  '/pasien': { title: 'Data Pasien', breadcrumb: ['Rekam Medis', 'Data Pasien'] },
  '/riwayat': { title: 'Riwayat Kunjungan', breadcrumb: ['Rekam Medis', 'Riwayat Kunjungan'] },
  '/terapi': { title: 'Katalog Terapi', breadcrumb: ['Manajemen', 'Katalog Terapi'] },
  '/laporan': { title: 'Laporan Keuangan', breadcrumb: ['Keuangan', 'Laporan'] },
};

function getPageMeta(pathname: string) {
  for (const [key, meta] of Object.entries(PAGE_MAP)) {
    if (pathname === key || pathname.startsWith(key + '/')) return meta;
  }
  return { title: 'SI-KABID', breadcrumb: ['SI-KABID'] };
}

export default function Navbar() {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebar();
  const meta = getPageMeta(pathname);

  return (
    <header
      className={`
        absolute top-4 left-4 right-4 lg:left-6 lg:right-6 z-20 h-16 shrink-0
        bg-white/35 backdrop-blur-xl
        border border-white/50
        rounded-2xl
        flex items-center justify-between
        px-6 gap-4
        shadow-[0_8px_32px_0_rgba(15,23,42,0.06)]
        transition-all duration-300
      `}
    >
      {/* ── Left side ── */}
      <div className="flex items-center gap-4 min-w-0">
        {/* Hamburger / Toggle */}
        <button
          onClick={toggle}
          aria-label={isOpen ? 'Tutup sidebar' : 'Buka sidebar'}
          className="p-2 rounded-lg text-slate-500 hover:text-[#007A64] hover:bg-[#E6F3F0]/60 transition-all duration-150 shrink-0"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>

        {/* Breadcrumb + Page title */}
        <div className="flex flex-col justify-center min-w-0">
          {/* Breadcrumb trail */}
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>SI-KABID</span>
            {meta.breadcrumb.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className={idx === meta.breadcrumb.length - 1 ? 'text-[#007A64]' : ''}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Page title */}
          <h2 className="text-base font-black text-slate-800 tracking-tight leading-tight truncate">
            {meta.title}
          </h2>
        </div>
      </div>

      {/* ── Right side ── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* ── Profile info ── */}
        <button className="flex items-center gap-3 group rounded-xl px-2 py-1.5 hover:bg-slate-50 transition-all duration-150">
          {/* Text — hidden on very small screens */}
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-800 group-hover:text-[#007A64] transition-colors leading-none">
              Bidan Lita
            </p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Admin Utama
            </p>
          </div>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-[#E6F3F0] border border-[#007A64]/10 text-[#007A64] font-black flex items-center justify-center text-xs shadow-inner group-hover:border-[#007A64]/30 group-hover:bg-[#D0EAE5] transition-all">
            BL
          </div>
        </button>
      </div>
    </header>
  );
}

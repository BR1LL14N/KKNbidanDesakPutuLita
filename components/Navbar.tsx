'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, ChevronRight, LogOut, Loader2 } from 'lucide-react';
import { useSidebar } from './context/SidebarContext';

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
  const router = useRouter();
  const { isOpen, toggle } = useSidebar();
  const meta = getPageMeta(pathname);

  const [user, setUser] = useState<{ nama: string; role: string; username: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch current logged in user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Gagal mengambil data user aktif:', err);
      }
    };
    fetchUser();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Gagal keluar:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'BL';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

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
      <div className="flex items-center gap-2 shrink-0 relative" ref={dropdownRef}>
        {/* ── Profile info button ── */}
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 group rounded-xl px-2 py-1.5 hover:bg-slate-50/80 transition-all duration-150 outline-none cursor-pointer"
        >
          {/* Text — hidden on very small screens */}
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-800 group-hover:text-[#007A64] transition-colors leading-none">
              {user?.nama || 'Memuat...'}
            </p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              {user?.role === 'BIDAN' ? 'Bidan Utama' : user?.role || 'Pengguna'}
            </p>
          </div>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-[#E6F3F0] border border-[#007A64]/10 text-[#007A64] font-black flex items-center justify-center text-xs shadow-inner group-hover:border-[#007A64]/30 group-hover:bg-[#D0EAE5] transition-all">
            {user ? getInitials(user.nama) : 'BL'}
          </div>
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 top-12 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-2 z-50 animate-fadeIn">
            {/* Header info in dropdown (mobile support) */}
            <div className="px-4 py-2 border-b border-slate-50 sm:hidden">
              <p className="text-xs font-black text-slate-800 truncate">
                {user?.nama || 'Pengguna'}
              </p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                {user?.role === 'BIDAN' ? 'Bidan Utama' : 'Staf'}
              </p>
            </div>
            
            {/* Logout Action */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loggingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span>{loggingOut ? 'Keluar...' : 'Keluar'}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

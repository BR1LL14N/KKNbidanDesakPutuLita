import React from 'react';
import Sidebar from '../../components/Sidebar';
import { Sparkles } from 'lucide-react';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 h-16 shrink-0 flex items-center justify-between px-8 z-10">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Aplikasi POS Kasir & Keuangan</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* System Status Badge */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
              Koneksi MySQL Aktif
            </div>
            
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800">Kasir Bidan</p>
              <p className="text-[10px] text-slate-400">Mode Pengembangan</p>
            </div>
          </div>
        </header>

        {/* Dynamic Page Views Content */}
        <main className="grow p-8 overflow-y-auto max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

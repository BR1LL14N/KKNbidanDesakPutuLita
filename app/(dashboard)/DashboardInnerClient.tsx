'use client';

import React from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';


export default function DashboardInnerClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Navbar */}
        <Navbar />

        {/* Page content */}
        <main className="flex-1 px-6 pb-6 pt-24 overflow-y-auto">
          <div className="max-w-[1400px] w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

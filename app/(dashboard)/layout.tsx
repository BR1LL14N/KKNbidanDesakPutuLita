'use client';

import React from 'react';
import { SidebarProvider, useSidebar } from '@/components/context/SidebarContext';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

/**
 * Inner layout — needs to live inside SidebarProvider so it can
 * read sidebar state for responsive content margin adjustment.
 */
function DashboardInner({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* ── Sidebar (fixed on mobile, static on desktop) ── */}
      <Sidebar />

      {/* ── Content area — flex-1 fills remaining space after the static sidebar ── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Sticky top navbar */}
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

/**
 * Outer layout — wraps everything with the SidebarProvider so that
 * both Sidebar and Navbar/content area share the same collapse state.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardInner>{children}</DashboardInner>
    </SidebarProvider>
  );
}

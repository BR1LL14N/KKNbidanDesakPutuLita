import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionToken } from '../../lib/auth';
import { SidebarProvider } from '../../components/context/SidebarContext';
import DashboardInnerClient from './DashboardInnerClient';


/**
 * Server-side protected dashboard layout.
 * Verifies session before rendering any children or context.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 1. Get session cookie
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;

  // 2. Verify token
  const user = sessionToken ? verifySessionToken(sessionToken) : null;

  // 3. Redirect to login if not authenticated
  if (!user) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <DashboardInnerClient>{children}</DashboardInnerClient>
    </SidebarProvider>
  );
}

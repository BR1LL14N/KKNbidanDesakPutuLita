import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Ambil respons default
  const response = NextResponse.next();

  // 2. Tentukan status lingkungan (development vs production)
  const isDev = process.env.NODE_ENV === 'development';

  // Content Security Policy (CSP)
  // Catatan: Pada mode development, Next.js membutuhkan 'unsafe-eval' untuk hot module reloading (HMR)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://www.gstatic.com;
    font-src 'self' https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  // Set Security Headers
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // 3. Proteksi Sisi API (Rute /api/*)
  if (request.nextUrl.pathname.startsWith('/api')) {
    const method = request.method;
    // Blokir request penulisan data yang tidak bertipe JSON
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
      const contentType = request.headers.get('content-type');
      if (contentType && !contentType.includes('application/json')) {
        return new NextResponse(
          JSON.stringify({ error: 'Content-Type must be application/json' }),
          { 
            status: 415, 
            headers: { 
              'Content-Type': 'application/json',
              'Content-Security-Policy': cspHeader,
              'X-Frame-Options': 'DENY',
              'X-Content-Type-Options': 'nosniff'
            } 
          }
        );
      }
    }
  }

  return response;
}

// Konfigurasi pencocokan rute agar middleware tidak memblokir aset statis internal
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

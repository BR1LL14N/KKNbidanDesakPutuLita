import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, createSessionToken } from './lib/auth';



// Durasi sesi dalam detik (untuk maxAge cookie) — 4 jam
const SESSION_DURATION_SECONDS = 4 * 60 * 60;

// Rute yang tidak memerlukan autentikasi
const PUBLIC_PATHS = ['/login', '/api/auth/login'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Tentukan status lingkungan (development vs production)
  const isDev = process.env.NODE_ENV === 'development';

  // 2. Buat response dasar
  const response = NextResponse.next();

  // ─── Security Headers ───────────────────────────────────────────────────
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

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // ────────────────────────────────────────────────────────────────────────

  // 3. Proteksi API: Blokir request POST/PUT/DELETE yang bukan JSON
  if (pathname.startsWith('/api')) {
    const method = request.method;
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
              'X-Content-Type-Options': 'nosniff',
            },
          }
        );
      }
    }
    // Rute API tidak perlu dicek sesinya, lanjutkan saja
    return response;
  }

  // 4. Jika rute publik (halaman login), tidak perlu cek sesi
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublicPath) {
    return response;
  }

  // 5. Cek dan perbarui sesi (Sliding Expiration 4 jam)
  const sessionToken = request.cookies.get('session')?.value;

  if (!sessionToken) {
    // Tidak ada sesi, redirect ke halaman login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = verifySessionToken(sessionToken);

  if (!payload) {
    // Token kedaluwarsa atau tidak valid, hapus cookie dan redirect ke login
    const loginRedirect = NextResponse.redirect(new URL('/login', request.url));
    loginRedirect.cookies.set({
      name: 'session',
      value: '',
      httpOnly: true,
      path: '/',
      secure: !isDev,
      sameSite: 'lax',
      maxAge: 0,
    });
    return loginRedirect;
  }

  // 6. Token valid → Perpanjang waktu sesi (Sliding Expiration)
  const newToken = createSessionToken({
    userId: payload.userId,
    username: payload.username,
    nama: payload.nama,
    role: payload.role,
  });

  response.cookies.set({
    name: 'session',
    value: newToken,
    httpOnly: true,
    path: '/',
    secure: !isDev,
    sameSite: 'lax',
    maxAge: SESSION_DURATION_SECONDS,
  });

  return response;
}

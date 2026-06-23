import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyPassword, createSessionToken } from '../../../../lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Cari user di database
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Username atau kata sandi salah.' },
        { status: 401 }
      );
    }

    // 2. Verifikasi password
    const isPasswordCorrect = verifyPassword(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: 'Username atau kata sandi salah.' },
        { status: 401 }
      );
    }

    // 3. Buat session token
    const token = createSessionToken({
      userId: user.id,
      username: user.username,
      nama: user.nama,
      role: user.role,
    });

    // 4. Buat response dengan session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        nama: user.nama,
        role: user.role,
      },
    });

    // Set cookie
    response.cookies.set({
      name: 'session',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Error in login API:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat login.' },
      { status: 500 }
    );
  }
}

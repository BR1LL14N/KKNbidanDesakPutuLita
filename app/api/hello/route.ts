import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'success',
    message: 'Backend API monorepo SI-KABID berjalan dengan lancar!',
    framework: 'Next.js App Router (API Routes)',
    database_driver: 'Prisma Client (MySQL ready)',
    timestamp: new Date().toISOString()
  });
}

import { NextResponse } from 'next/server';
import { getPasienStats } from '../../../../lib/controllers/pasienController';

export async function GET() {
  try {
    const data = await getPasienStats();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

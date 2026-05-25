import { NextResponse } from 'next/server';
import { getAllTransaksi, checkoutTransaksi, getRekapitulasi } from '../../../lib/controllers/transaksiController';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rekap = searchParams.get('rekap') === 'true';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    
    if (rekap) {
      const data = await getRekapitulasi(startDate, endDate);
      return NextResponse.json(data);
    } else {
      const pasienId = searchParams.get('pasienId') || '';
      const data = await getAllTransaksi({ startDate, endDate, pasienId });
      return NextResponse.json(data);
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const data = await checkoutTransaksi(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';
import { getTransaksiById } from '../../../../lib/controllers/transaksiController';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const data = await getTransaksiById(id);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}
// Catatan Keamanan: Tidak ada method PUT (Update) atau DELETE (Hapus) pada transaksi kasir!

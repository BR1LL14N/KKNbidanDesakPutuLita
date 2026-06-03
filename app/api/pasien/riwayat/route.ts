import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pasienIdStr = searchParams.get('pasienId');
    if (!pasienIdStr) {
      return NextResponse.json({ error: 'pasienId wajib diisi.' }, { status: 400 });
    }
    const pasienId = parseInt(pasienIdStr);
    const fromStr = searchParams.get('from');
    const toStr = searchParams.get('to');

    // Get patient details first
    const pasien = await prisma.pasien.findUnique({
      where: { id: pasienId }
    });

    if (!pasien) {
      return NextResponse.json({ error: 'Pasien tidak ditemukan.' }, { status: 404 });
    }

    // Build filter for transaksi
    const where: any = { pasienId };
    if (fromStr || toStr) {
      where.tanggal = {};
      if (fromStr) {
        where.tanggal.gte = new Date(fromStr);
      }
      if (toStr) {
        const end = new Date(toStr);
        end.setHours(23, 59, 59, 999);
        where.tanggal.lte = end;
      }
    }

    // Get all transactions for the patient order by tanggal ascending (so we can calculate interval since previous visit)
    const transaksiList = await prisma.transaksi.findMany({
      where,
      include: {
        metodePembayaran: true,
        detailTransaksi: {
          include: {
            terapi: true
          }
        }
      },
      orderBy: {
        tanggal: 'asc'
      }
    });

    return NextResponse.json({
      pasien,
      transaksi: transaksiList
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

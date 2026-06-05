import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

const BULAN_LABEL = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const transaksiList = await prisma.transaksi.findMany({
      where: {
        tanggal: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      include: {
        metodePembayaran: true,
        detailTransaksi: {
          include: {
            terapi: {
              include: {
                kategori: true,
              },
            },
          },
        },
      },
      orderBy: { tanggal: 'asc' },
    });

    // 1. Omzet bulanan (12 bulan)
    const omzetBulanan = BULAN_LABEL.map((bulan, idx) => {
      const txBulan = transaksiList.filter(tx => new Date(tx.tanggal).getMonth() === idx);
      const omzet = txBulan.reduce((sum, tx) => sum + tx.totalHarga, 0);
      const hpp = txBulan.reduce((sum, tx) =>
        sum + tx.detailTransaksi.reduce((s, d) => s + d.hargaPokok * d.jumlah, 0), 0
      );
      return {
        bulan,
        omzet,
        hpp,
        laba: omzet - hpp,
        jumlahTransaksi: txBulan.length,
      };
    });

    // 2. Metode pembayaran per bulan
    const metodeBulanan = BULAN_LABEL.map((bulan, idx) => {
      const txBulan = transaksiList.filter(tx => new Date(tx.tanggal).getMonth() === idx);
      const byMetode: Record<string, number> = {};
      txBulan.forEach(tx => {
        const nama = tx.metodePembayaran.nama;
        byMetode[nama] = (byMetode[nama] || 0) + 1;
      });
      return { bulan, ...byMetode };
    });

    // Kumpulkan semua nama metode unik
    const allMetode = [...new Set(transaksiList.map(tx => tx.metodePembayaran.nama))];

    // Rekap metode total per tahun (untuk donat)
    const rekapMetodeTahunan: Record<string, { jumlah: number; nominal: number }> = {};
    transaksiList.forEach(tx => {
      const nama = tx.metodePembayaran.nama;
      if (!rekapMetodeTahunan[nama]) rekapMetodeTahunan[nama] = { jumlah: 0, nominal: 0 };
      rekapMetodeTahunan[nama].jumlah += 1;
      rekapMetodeTahunan[nama].nominal += tx.totalHarga;
    });

    const metodePopuler = Object.entries(rekapMetodeTahunan)
      .map(([metode, data]) => ({ metode, ...data }))
      .sort((a, b) => b.jumlah - a.jumlah);

    // 3. Layanan terpopuler (top 10 berdasarkan frekuensi)
    const rekapLayanan: Record<string, { nama: string; kategori: string; jumlah: number; omzet: number }> = {};
    transaksiList.forEach(tx => {
      tx.detailTransaksi.forEach(d => {
        // Guard: item manual memiliki terapi = null, gunakan fallback
        const key = d.terapi ? d.terapi.id.toString() : `manual-${d.namaManual || 'Item'}`;
        if (!rekapLayanan[key]) {
          rekapLayanan[key] = {
            nama: d.terapi ? d.terapi.nama : (d.namaManual || 'Tindakan Manual'),
            kategori: (d.terapi && d.terapi.kategori) ? d.terapi.kategori.nama : 'Lainnya / Manual',
            jumlah: 0,
            omzet: 0,
          };
        }
        rekapLayanan[key].jumlah += d.jumlah;
        rekapLayanan[key].omzet += d.subtotal;
      });
    });

    const layananPopuler = Object.values(rekapLayanan)
      .sort((a, b) => b.jumlah - a.jumlah)
      .slice(0, 10);

    return NextResponse.json({
      year,
      omzetBulanan,
      metodeBulanan,
      allMetode,
      metodePopuler,
      layananPopuler,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

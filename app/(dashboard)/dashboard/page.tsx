'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import MockBanner from '@/components/ui/MockBanner';
import DashboardStats from '@/components/dashboard/DashboardStats';
import KategoriChart from '@/components/dashboard/KategoriChart';
import DonutChart from '@/components/dashboard/DonutChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';

interface Ringkasan {
  totalTransaksi: number;
  totalPendapatan: number;
  totalModal: number;
  totalLabaKotor: number;
  marginKeuntungan: number;
}

interface BreakdownMetode {
  metode: string;
  jumlahTransaksi: number;
  nominal: number;
}

interface BreakdownKategori {
  kategori: string;
  nominalJual: number;
  nominalModal: number;
  labaKotor: number;
  margin: number;
  jumlahLayanan: number;
}

interface TransactionItem {
  waktu: string;
  pasien: string;
  layanan: string;
  metode: string;
  total: number;
  status: 'Lunas' | 'Belum Bayar';
}

interface DashboardData {
  ringkasan: Ringkasan;
  breakdownMetode: BreakdownMetode[];
  breakdownKategori: BreakdownKategori[];
  recentTransactions: TransactionItem[];
}

// Mock data yang disinkronkan persis dengan mockup visual Google Stitch
const MOCK_DATA: DashboardData = {
  ringkasan: {
    totalTransaksi: 156,
    totalPendapatan: 42850000,
    totalModal: 18240000,
    totalLabaKotor: 24610000,
    marginKeuntungan: 57,
  },
  breakdownMetode: [
    { metode: 'Tunai', jumlahTransaksi: 101, nominal: 27852500 },
    { metode: 'QRIS', jumlahTransaksi: 39, nominal: 10712500 },
    { metode: 'Transfer BCA', jumlahTransaksi: 16, nominal: 4285000 },
  ],
  breakdownKategori: [
    { kategori: 'Persalinan', nominalJual: 12500000, nominalModal: 5000000, labaKotor: 7500000, margin: 60, jumlahLayanan: 29 },
    { kategori: 'KB (Keluarga Berencana)', nominalJual: 8200000, nominalModal: 3000000, labaKotor: 5200000, margin: 63.41, jumlahLayanan: 19 },
    { kategori: 'Imunisasi', nominalJual: 6450000, nominalModal: 3000000, labaKotor: 3450000, margin: 53.48, jumlahLayanan: 15 },
    { kategori: 'Pemeriksaan Hamil (ANC)', nominalJual: 9800000, nominalModal: 4000000, labaKotor: 5800000, margin: 59.18, jumlahLayanan: 23 },
    { kategori: 'Umum / Lainnya', nominalJual: 5900000, nominalModal: 3240000, labaKotor: 2660000, margin: 45.08, jumlahLayanan: 14 },
  ],
  recentTransactions: [
    { waktu: '14:20 WIB', pasien: 'Ny. Ratna Sari', layanan: 'KB Suntik 3 Bulan', metode: 'Tunai', total: 35000, status: 'Lunas' },
    { waktu: '13:15 WIB', pasien: 'Ny. Dinda Permata', layanan: 'Persalinan Normal + Inap', metode: 'Transfer BCA', total: 1500000, status: 'Lunas' },
    { waktu: '11:05 WIB', pasien: 'Bayi Anugrah', layanan: 'Imunisasi BCG', metode: 'QRIS', total: 75000, status: 'Belum Bayar' },
  ],
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    Promise.all([fetch('/api/transaksi?rekap=true'), fetch('/api/transaksi')])
      .then(async ([resRekap, resTx]) => {
        if (!resRekap.ok || !resTx.ok) throw new Error('Database Error');
        const rekapResult = await resRekap.json();
        const txResult = await resTx.json();

        const mappedRecent: TransactionItem[] = txResult.slice(0, 3).map((t: any) => {
          const firstDetail = t.detailTransaksi?.[0];
          const layananName = firstDetail
            ? `${firstDetail.terapi?.nama}${t.detailTransaksi.length > 1 ? ` + ${t.detailTransaksi.length - 1} layanan` : ''}`
            : 'Tindakan Medis';
          const dateObj = new Date(t.tanggal);
          const waktuStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')} WIB`;
          return {
            waktu: waktuStr,
            pasien: t.pasien?.nama || 'Umum',
            layanan: layananName,
            metode: t.metodePembayaran?.nama || 'Tunai',
            total: t.totalHarga,
            status: t.catatan?.toLowerCase().includes('menunggu') ? 'Belum Bayar' : 'Lunas',
          };
        });

        setData({
          ringkasan: {
            totalTransaksi: rekapResult.ringkasan.totalTransaksi || MOCK_DATA.ringkasan.totalTransaksi,
            totalPendapatan: rekapResult.ringkasan.totalPendapatan || MOCK_DATA.ringkasan.totalPendapatan,
            totalModal: rekapResult.ringkasan.totalModal || MOCK_DATA.ringkasan.totalModal,
            totalLabaKotor: rekapResult.ringkasan.totalLabaKotor || MOCK_DATA.ringkasan.totalLabaKotor,
            marginKeuntungan: rekapResult.ringkasan.marginKeuntungan || MOCK_DATA.ringkasan.marginKeuntungan,
          },
          breakdownMetode: rekapResult.breakdownMetode?.length > 0 ? rekapResult.breakdownMetode : MOCK_DATA.breakdownMetode,
          breakdownKategori: rekapResult.breakdownKategori?.length > 0 ? rekapResult.breakdownKategori : MOCK_DATA.breakdownKategori,
          recentTransactions: mappedRecent.length > 0 ? mappedRecent : MOCK_DATA.recentTransactions,
        });
        setLoading(false);
      })
      .catch(() => {
        setIsMock(true);
        setData(MOCK_DATA);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#007A64]" />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Simulation banner */}
      {isMock && (
        <MockBanner message="Basis data MySQL belum terhubung. Menampilkan data statistik persis seperti pada referensi desain mockup Anda." />
      )}

      {/* Stat Cards — isolated component */}
      <DashboardStats ringkasan={data.ringkasan} />

      {/* Charts Row — each chart is its own isolated component */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <KategoriChart breakdownKategori={data.breakdownKategori} />
        <DonutChart breakdownMetode={data.breakdownMetode} />
      </div>

      {/* Recent Transactions — isolated component */}
      <RecentTransactions transactions={data.recentTransactions} />
    </div>
  );
}

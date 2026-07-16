'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Calendar, Filter } from 'lucide-react';
import MockBanner from '@/components/ui/MockBanner';
import BracketFrame from '@/components/ui/BracketFrame';
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  const [periodMode, setPeriodMode] = useState<'harian' | 'mingguan' | 'bulanan' | 'custom'>('bulanan');
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().split('T')[0]);

  // Compute active date range
  const getActiveRange = () => {
    const now = new Date();
    if (periodMode === 'harian') {
      const todayStr = now.toISOString().split('T')[0];
      return { startDate: todayStr, endDate: todayStr, label: 'Hari Ini' };
    }
    if (periodMode === 'mingguan') {
      // Get Monday of current week — use a copy to avoid mutating `now`
      const todayForWeek = new Date();
      const day = todayForWeek.getDay();
      const diff = todayForWeek.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(todayForWeek);
      monday.setDate(diff);
      const startStr = monday.toISOString().split('T')[0];
      const endStr = new Date().toISOString().split('T')[0];
      return { startDate: startStr, endDate: endStr, label: 'Minggu Ini' };
    }
    if (periodMode === 'bulanan') {
      const startStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endStr = now.toISOString().split('T')[0];
      return { startDate: startStr, endDate: endStr, label: 'Bulan Ini' };
    }
    // custom
    return { startDate: customStart, endDate: customEnd, label: 'Kustom' };
  };

  const { startDate, endDate, label } = getActiveRange();

  // Calculate days in period
  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const diffTime = Math.abs(endD.getTime() - startD.getTime());
  const numDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

  // Format date helper
  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const periodLabel = !mounted
    ? 'Memuat...'
    : startDate === endDate 
      ? `Hari ini (${formatDateLabel(startDate)})` 
      : `${formatDateLabel(startDate)} s/d ${formatDateLabel(endDate)}`;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/transaksi?rekap=true&startDate=${startDate}&endDate=${endDate}`),
      fetch(`/api/transaksi?startDate=${startDate}&endDate=${endDate}`)
    ])
      .then(async ([resRekap, resTx]) => {
        if (!resRekap.ok || !resTx.ok) throw new Error('Database Error');
        const rekapResult = await resRekap.json();
        const txResult = await resTx.json();

        const mappedRecent: TransactionItem[] = txResult.slice(0, 3).map((t: any) => {
          const firstDetail = t.detailTransaksi?.[0];
          const layananName = firstDetail
            ? `${firstDetail.terapi?.nama || firstDetail.namaManual || 'Layanan'}${t.detailTransaksi.length > 1 ? ` + ${t.detailTransaksi.length - 1} layanan` : ''}`
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
            totalTransaksi: rekapResult.ringkasan.totalTransaksi ?? 0,
            totalPendapatan: rekapResult.ringkasan.totalPendapatan ?? 0,
            totalModal: rekapResult.ringkasan.totalModal ?? 0,
            totalLabaKotor: rekapResult.ringkasan.totalLabaKotor ?? 0,
            marginKeuntungan: rekapResult.ringkasan.marginKeuntungan ?? 0,
          },
          breakdownMetode: rekapResult.breakdownMetode ?? [],
          breakdownKategori: rekapResult.breakdownKategori ?? [],
          recentTransactions: mappedRecent,
        });
        setIsMock(false);
        setLoading(false);
      })
      .catch(() => {
        setIsMock(true);
        // Scale mock data dynamically
        const scaleFactor = numDays / 30;
        const mockRingkasan = {
          totalTransaksi: Math.max(1, Math.round(MOCK_DATA.ringkasan.totalTransaksi * scaleFactor)),
          totalPendapatan: Math.round(MOCK_DATA.ringkasan.totalPendapatan * scaleFactor),
          totalModal: Math.round(MOCK_DATA.ringkasan.totalModal * scaleFactor),
          totalLabaKotor: Math.round(MOCK_DATA.ringkasan.totalLabaKotor * scaleFactor),
          marginKeuntungan: MOCK_DATA.ringkasan.marginKeuntungan,
        };
        const mockBreakdownMetode = MOCK_DATA.breakdownMetode.map(m => ({
          ...m,
          jumlahTransaksi: Math.max(0, Math.round(m.jumlahTransaksi * scaleFactor)),
          nominal: Math.round(m.nominal * scaleFactor),
        }));
        const mockBreakdownKategori = MOCK_DATA.breakdownKategori.map(k => ({
          ...k,
          jumlahLayanan: Math.max(0, Math.round(k.jumlahLayanan * scaleFactor)),
          nominalJual: Math.round(k.nominalJual * scaleFactor),
          nominalModal: Math.round(k.nominalModal * scaleFactor),
          labaKotor: Math.round(k.labaKotor * scaleFactor),
        }));

        setData({
          ringkasan: mockRingkasan,
          breakdownMetode: mockBreakdownMetode,
          breakdownKategori: mockBreakdownKategori,
          recentTransactions: MOCK_DATA.recentTransactions,
        });
        setLoading(false);
      });
  }, [startDate, endDate]);

  if (loading || !data) {
    return (
      <div className="space-y-7 animate-pulse">
        {/* Banner skeleton */}
        <div className="h-12 bg-slate-200 rounded-md w-full" />
        
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-md p-5 border border-slate-150/60 shadow-sm space-y-3 h-28 relative">
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="h-6 bg-slate-200 rounded w-3/4 mt-2" />
              <div className="h-3 bg-slate-200 rounded w-2/3 mt-2" />
            </div>
          ))}
        </div>

        {/* Charts and lists skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-md p-6 border border-slate-150/60 shadow-sm space-y-5 h-[340px]">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2.5">
                <div className="flex justify-between">
                  <div className="h-3 bg-slate-200 rounded w-1/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/5" />
                </div>
                <div className="h-2 bg-slate-100 rounded-full w-full" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-md p-6 border border-slate-150/60 shadow-sm space-y-5 h-[340px] flex flex-col justify-between">
            <div>
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
              <div className="flex justify-center py-4">
                <div className="w-28 h-28 rounded-full border-12 border-slate-200 flex items-center justify-center animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-200 rounded w-full animate-pulse" />
              <div className="h-3 bg-slate-200 rounded w-5/6 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate rataRataHarian
  const rataRataHarian = data.ringkasan.totalTransaksi / numDays;

  return (
    <div className="space-y-7">
      {/* Simulation banner */}
      {isMock && (
        <MockBanner message="Basis data MySQL belum terhubung. Menampilkan data statistik simulasi dinamis sesuai filter periode Anda." />
      )}

      {/* Period Selector */}
      <div className="bg-white p-4 border border-slate-200/60 rounded-md shadow-sm relative flex flex-col md:flex-row justify-between items-center gap-4">
        <BracketFrame />
        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
          <Calendar className="w-4 h-4 text-[#007A64]" />
          Filter Periode Dashboard
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto text-xs">
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {(['harian', 'mingguan', 'bulanan', 'custom'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setPeriodMode(mode)}
                className={`px-3 py-1.5 rounded-md font-bold uppercase tracking-wider text-[10px] transition-all ${
                  periodMode === mode
                    ? 'bg-[#007A64] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {mode === 'harian' ? 'Hari Ini' : mode === 'mingguan' ? 'Minggu Ini' : mode === 'bulanan' ? 'Bulan Ini' : 'Kustom'}
              </button>
            ))}
          </div>

          {periodMode === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-[#007A64] text-slate-700 font-bold text-xs"
              />
              <span className="text-slate-400 font-bold text-[10px]">s/d</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-[#007A64] text-slate-700 font-bold text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards — isolated component */}
      <DashboardStats ringkasan={data.ringkasan} rataRataHarian={rataRataHarian} periodLabel={periodLabel} />

      {/* Charts Row — each chart is its own isolated component */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <KategoriChart breakdownKategori={data.breakdownKategori} />
        <DonutChart breakdownMetode={data.breakdownMetode} />
      </div>

      {/* Recent Transactions — isolated component */}
      <RecentTransactions transactions={data.recentTransactions} />

      {/* Developer Contact Card */}
      <div className="bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-emerald-600" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800">Ada Bug atau Permintaan Fitur?</h3>
            <p className="text-xs text-slate-500 mt-0.5">Hubungi tim developer kami langsung via WhatsApp untuk laporan bug, pertanyaan teknis, atau pengembangan fitur baru.</p>
          </div>
        </div>
        <div className="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
          <a
            href="https://wa.me/6289563028673"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#1ebe5a] text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white shrink-0" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Developer 1
          </a>
          <a
            href="https://wa.me/6281331828851"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#1ebe5a] text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white shrink-0" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Developer 2
          </a>
        </div>
      </div>
    </div>
  );
}

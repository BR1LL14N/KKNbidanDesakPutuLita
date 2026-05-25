'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Heart, 
  Coins, 
  AlertTriangle, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    fetch('/api/transaksi?rekap=true')
      .then(res => {
        if (!res.ok) throw new Error('DB Error');
        return res.json();
      })
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        // Fallback to beautiful Mock Data if database tables are not migrated yet
        console.warn('Using mock data for dashboard because database is not migrated.');
        setIsMock(true);
        setData({
          ringkasan: {
            totalTransaksi: 42,
            totalPendapatan: 8450000,
            totalModal: 3120000,
            totalLabaKotor: 5330000,
            marginKeuntungan: 63.08
          },
          breakdownMetode: [
            { metode: 'Tunai', jumlahTransaksi: 22, nominal: 3250000 },
            { metode: 'QRIS', jumlahTransaksi: 12, nominal: 2800000 },
            { metode: 'Transfer BCA', jumlahTransaksi: 8, nominal: 2400000 }
          ],
          breakdownKategori: [
            { kategori: 'Persalinan', nominalJual: 4500000, nominalModal: 1500000, labaKotor: 3000000, margin: 66.67, jumlahLayanan: 3 },
            { kategori: 'KB', nominalJual: 1200000, nominalModal: 450000, labaKotor: 750000, margin: 62.5, jumlahLayanan: 15 },
            { kategori: 'Imunisasi', nominalJual: 850000, nominalModal: 420000, labaKotor: 430000, margin: 50.59, jumlahLayanan: 12 },
            { kategori: 'Hamil', nominalJual: 900000, nominalModal: 300000, labaKotor: 600000, margin: 66.67, jumlahLayanan: 8 },
            { kategori: 'Umum', nominalJual: 1000000, nominalModal: 450000, labaKotor: 550000, margin: 55.0, jumlahLayanan: 4 }
          ]
        });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* DB Warning Notification if displaying simulated data */}
      {isMock && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-center">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="text-sm text-amber-700">
            <span className="font-bold">Mode Simulasi Aktif</span>: Basis data MySQL belum dimigrasi. Halaman ini saat ini menampilkan data simulasi untuk peninjauan antarmuka. Jalankan <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-800 font-bold">npx prisma migrate dev</code> untuk menghubungkan ke database riil.
          </div>
        </div>
      )}

      {/* Welcome Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Selamat Datang di Dasbor Keuangan</h2>
        <p className="text-sm text-slate-500">Rekapitulasi laba rugi dan kinerja pelayanan klinik bidan.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Total Pendapatan */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex justify-between items-start">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Pendapatan</span>
            <h3 className="text-xl font-bold text-slate-800 mt-1">{formatRupiah(data.ringkasan.totalPendapatan)}</h3>
            <p className="text-xs text-slate-500 mt-1.5">{data.ringkasan.totalTransaksi} kali transaksi kasir</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Total Modal / Pengeluaran */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex justify-between items-start">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total HPP / Modal</span>
            <h3 className="text-xl font-bold text-slate-800 mt-1">{formatRupiah(data.ringkasan.totalModal)}</h3>
            <p className="text-xs text-slate-500 mt-1.5">Harga pokok jasa (alat & obat)</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        {/* Laba Kotor */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex justify-between items-start">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Laba Kotor</span>
            <h3 className="text-xl font-bold text-teal-600 mt-1">{formatRupiah(data.ringkasan.totalLabaKotor)}</h3>
            <p className="text-xs text-teal-600 mt-1.5 font-medium">Margin Keuntungan: {data.ringkasan.marginKeuntungan}%</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Total Kunjungan */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex justify-between items-start">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Kunjungan</span>
            <h3 className="text-xl font-bold text-slate-800 mt-1">{data.ringkasan.totalTransaksi} Pasien</h3>
            <p className="text-xs text-slate-500 mt-1.5">Terlayani selama periode ini</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Main Charts & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kategori Terapi Pendapatan */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-slate-800">Rekap Kontribusi Kategori Terapi</h4>
            <span className="text-xs text-slate-400 font-semibold">Berdasarkan Nominal Omzet</span>
          </div>

          <div className="space-y-5">
            {data.breakdownKategori.map((kategori, index) => {
              const maxVal = Math.max(...data.breakdownKategori.map(k => k.nominalJual));
              const percent = (kategori.nominalJual / maxVal) * 100;
              return (
                <div key={index} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{kategori.kategori} ({kategori.jumlahLayanan} tindakan)</span>
                    <span className="text-slate-500">
                      Jual: {formatRupiah(kategori.nominalJual)} | Laba: <span className="text-teal-600 font-bold">{formatRupiah(kategori.labaKotor)}</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div className="bg-teal-500 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Metode Pembayaran */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-800 mb-6">Pembagian Metode Bayar</h4>
            <div className="space-y-4">
              {data.breakdownMetode.map((metode, index) => {
                const totalNominal = data.breakdownMetode.reduce((acc, curr) => acc + curr.nominal, 0);
                const percent = totalNominal > 0 ? ((metode.nominal / totalNominal) * 100).toFixed(0) : 0;
                return (
                  <div key={index} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-xs">
                        {percent}%
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">{metode.metode}</h5>
                        <p className="text-[10px] text-slate-400">{metode.jumlahTransaksi} transaksi</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-800">{formatRupiah(metode.nominal)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <a href="/laporan" className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700">
              Lihat Detail Laporan Keuangan
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

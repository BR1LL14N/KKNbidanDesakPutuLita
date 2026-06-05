'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, CreditCard, Calendar, Filter, FileSpreadsheet, Printer } from 'lucide-react';
import { exportLaporanToExcel } from '@/lib/exportExcel';
import MockBanner from '@/components/ui/MockBanner';
import BracketFrame from '@/components/ui/BracketFrame';
import LaporanStats from '@/components/laporan/LaporanStats';
import AuditTrailTable from '@/components/laporan/AuditTrailTable';
import MetodePembayaranTable from '@/components/laporan/MetodePembayaranTable';
import LaporanCharts from '@/components/laporan/LaporanCharts';

const MOCK_METODE = [
  { id: 1, nama: 'Tunai', aktif: true, createdAt: '2023-10-01T00:00:00.000Z' },
  { id: 2, nama: 'QRIS', aktif: true, createdAt: '2023-10-02T00:00:00.000Z' },
  { id: 3, nama: 'Transfer BCA', aktif: true, createdAt: '2023-10-03T00:00:00.000Z' },
  { id: 4, nama: 'Transfer Bank Mandiri', aktif: false, createdAt: '2023-10-04T00:00:00.000Z' },
];
const MOCK_TRANSAKSI = [
  {
    id: 1, nomorInvoice: 'INV/20231024/0001', tanggal: '2023-10-24T06:20:00.000Z', pasienId: 1,
    pasien: { nama: 'Ny. Kartini Rahayu', alamat: 'Jl. Merdeka No. 45, Jakarta' },
    totalHarga: 350000, metodePembayaranId: 2, metodePembayaran: { nama: 'QRIS ShopeePay' },
    catatan: 'Pemeriksaan kehamilan bulanan & USG penunjang.', layananSummary: 'Layanan KIA & Imunisasi',
    detailTransaksi: [{ id: 101, terapiId: 1, hargaJual: 350000, hargaPokok: 100000, jumlah: 1, subtotal: 350000, terapi: { nama: 'Layanan KIA & Imunisasi' } }],
  },
  {
    id: 2, nomorInvoice: 'INV/20231024/0002', tanggal: '2023-10-24T03:05:00.000Z', pasienId: 2,
    pasien: { nama: 'Ny. Susi Wulandari', alamat: 'Perumahan Gading Serpong, Tangerang' },
    totalHarga: 4500000, metodePembayaranId: 4, metodePembayaran: { nama: 'Transfer Bank Mandiri' },
    catatan: 'Layanan rawat inap kebidanan dan paket bersalin.', layananSummary: 'Persalinan Normal',
    detailTransaksi: [{ id: 102, terapiId: 5, hargaJual: 4500000, hargaPokok: 1800000, jumlah: 1, subtotal: 4500000, terapi: { nama: 'Persalinan Normal' } }],
  },
  {
    id: 3, nomorInvoice: 'INV/20231023/0001', tanggal: '2023-10-23T08:45:00.000Z', pasienId: 3,
    pasien: { nama: 'An. Dimas Pratama', alamat: 'Jl. Margonda Raya No. 12, Depok' },
    totalHarga: 125000, metodePembayaranId: 1, metodePembayaran: { nama: 'Tunai / Cash' },
    catatan: 'Terapi inhalasi uap (nebulizer) & Vitamin anak.', layananSummary: 'Nebulizer & Vitamin',
    detailTransaksi: [{ id: 103, terapiId: 3, hargaJual: 125000, hargaPokok: 50000, jumlah: 1, subtotal: 125000, terapi: { nama: 'Nebulizer & Vitamin' } }],
  },
];

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState<'laporan' | 'metode'>('laporan');

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [rekap, setRekap] = useState<any>(null);
  const [transaksiList, setTransaksiList] = useState<any[]>([]);
  const [metodeList, setMetodeList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRekap, resTx, resMet] = await Promise.all([
        fetch(`/api/transaksi?rekap=true&startDate=${startDate}&endDate=${endDate}`, { cache: 'no-store' }),
        fetch(`/api/transaksi?startDate=${startDate}&endDate=${endDate}`, { cache: 'no-store' }),
        fetch('/api/metode', { cache: 'no-store' }),
      ]);
      if (!resRekap.ok || !resTx.ok || !resMet.ok) throw new Error('DB Error');
      const [dataRekap, dataTx, dataMet] = await Promise.all([resRekap.json(), resTx.json(), resMet.json()]);
      setRekap(dataRekap);
      setTransaksiList(dataTx);
      setMetodeList(dataMet);
      setIsMock(false);
      setLoading(false);
    } catch {
      setIsMock(true);
      // Filter mock by date
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      const filteredTx = MOCK_TRANSAKSI.filter((tx) => {
        const d = new Date(tx.tanggal);
        return d >= start && d <= end;
      });
      // Calculate mock rekap
      let totalPendapatan = 0, totalModal = 0;
      const rekapMetode: Record<string, { jumlahTransaksi: number; nominal: number }> = {};
      filteredTx.forEach((tx) => {
        totalPendapatan += tx.totalHarga;
        const mNama = tx.metodePembayaran.nama;
        if (!rekapMetode[mNama]) rekapMetode[mNama] = { jumlahTransaksi: 0, nominal: 0 };
        rekapMetode[mNama].jumlahTransaksi += 1;
        rekapMetode[mNama].nominal += tx.totalHarga;
        tx.detailTransaksi.forEach((d) => { totalModal += d.hargaPokok * d.jumlah; });
      });
      const totalLaba = totalPendapatan - totalModal;
      const margin = totalPendapatan > 0 ? (totalLaba / totalPendapatan) * 100 : 0;
      setRekap({
        ringkasan: {
          totalTransaksi: filteredTx.length || 3,
          totalPendapatan: totalPendapatan || 45280000,
          totalModal: totalModal || 12450000,
          totalLabaKotor: totalLaba || 32830000,
          marginKeuntungan: parseFloat(margin.toFixed(2)) || 57,
        },
        breakdownMetode: Object.keys(rekapMetode).map((key) => ({ metode: key, ...rekapMetode[key] })),
      });
      setTransaksiList(filteredTx.length > 0 ? filteredTx : MOCK_TRANSAKSI);
      setMetodeList(MOCK_METODE);
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!rekap) {
      alert('Data belum tersedia. Terapkan filter terlebih dahulu.');
      return;
    }
    setIsExporting(true);
    try {
      // Ambil data lengkap dengan breakdownKategori sebelum ekspor
      let rekapFull = rekap;
      if (!isMock) {
        const res = await fetch(`/api/transaksi?rekap=true&startDate=${startDate}&endDate=${endDate}`, { cache: 'no-store' });
        if (res.ok) rekapFull = await res.json();
      }
      exportLaporanToExcel({
        rekap: rekapFull,
        transaksiList,
        startDate,
        endDate,
        isMock,
      });
    } catch (e) {
      alert('Gagal mengekspor. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => { fetchData(); }, [startDate, endDate]);

  return (
    <div className="space-y-6">
      {isMock && (
        <MockBanner message="Basis data MySQL belum terhubung. Menampilkan rekapitulasi laba rugi bulanan dan riwayat audit finansial sesuai referensi mockup." />
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs text-slate-400 font-semibold">Keuangan & Audit</p>
          <h2 className="text-lg font-black text-slate-800 tracking-tight mt-0.5">Laporan Keuangan</h2>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-slate-200 flex gap-6 text-xs">
        <button
          onClick={() => setActiveTab('laporan')}
          className={`pb-4 font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'laporan' ? 'text-[#007A64] font-black border-b-2 border-[#007A64]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Rekapitulasi Omzet & Laba
        </button>

        <button
          onClick={() => setActiveTab('metode')}
          className={`pb-4 font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'metode' ? 'text-[#007A64] font-black border-b-2 border-[#007A64]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Kelola Metode Pembayaran ({metodeList.length})
        </button>
      </div>

      {/* Tab 1: Financial Report */}
      {activeTab === 'laporan' && (
        <div className="space-y-6">
          {/* Date filter bar */}
          <div className="bg-white p-4 border border-slate-200/60 rounded-md shadow-sm relative flex flex-col md:flex-row justify-between items-center gap-4">
            <BracketFrame />
            <div className="flex items-center gap-2.5 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-[#007A64]" />
              Periode
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto text-xs">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <BracketFrame />
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="px-3.5 py-2 border border-slate-200 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#007A64] text-slate-700 font-bold w-full sm:w-auto" />
                </div>
                <span className="text-slate-400 font-bold">sampai</span>
                <div className="relative w-full sm:w-auto">
                  <BracketFrame />
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    className="px-3.5 py-2 border border-slate-200 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#007A64] text-slate-700 font-bold w-full sm:w-auto" />
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                {/* Ekspor Excel */}
                <button
                  type="button"
                  onClick={handleExportExcel}
                  disabled={isExporting || loading || !rekap}
                  className="px-4 py-2 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md font-bold transition-all flex items-center gap-1.5 relative shrink-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <BracketFrame />
                  {isExporting ? (
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-emerald-600" />
                  ) : (
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  )}
                  {isExporting ? 'Menyiapkan...' : 'Ekspor Excel'}
                </button>

                {/* Cetak PDF */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-md font-bold text-slate-700 transition-all flex items-center gap-1.5 relative shrink-0 shadow-sm"
                >
                  <BracketFrame />
                  <Printer className="w-3.5 h-3.5" />
                  Cetak PDF
                </button>

                {/* Terapkan Filter */}
                <button type="button" onClick={fetchData}
                  className="px-4 py-2 bg-[#007A64] hover:bg-[#006653] text-white rounded-md font-black uppercase tracking-wider transition-all flex items-center gap-1.5 relative shrink-0 shadow-sm">
                  <BracketFrame />
                  <Filter className="w-3.5 h-3.5" />
                  Terapkan Filter
                </button>
              </div>
            </div>
          </div>

          {/* Excel export info note */}
          {rekap && !loading && (
            <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-md px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">File Excel yang dihasilkan berisi 4 sheet terpisah:</p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                  {[
                    { icon: '📊', label: 'Ringkasan Eksekutif', desc: 'Indikator utama, rekap metode & kategori' },
                    { icon: '🧾', label: 'Riwayat Transaksi', desc: `${transaksiList.length} baris invoice` },
                    { icon: '🔍', label: 'Detail Item Tindakan', desc: 'Per baris item/tindakan dengan HPP & laba' },
                    { icon: '💳', label: 'Rekap Metode Bayar', desc: 'Persentase & nominal per metode' },
                  ].map(({ icon, label, desc }) => (
                    <span key={label} className="text-[10px] text-emerald-600 font-bold">
                      {icon} <strong>{label}</strong> — <span className="font-medium text-emerald-500">{desc}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Financial summary cards — isolated component */}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-md h-28 animate-pulse" />
              ))}
            </div>
          ) : rekap ? (
            <LaporanStats rekap={rekap} />
          ) : null}

          {/* Analytics charts — self-contained, fetches its own analytics data */}
          <LaporanCharts />

          {/* Audit trail table — manages expand/collapse state internally */}
          <AuditTrailTable transaksiList={transaksiList} loading={loading} />
        </div>
      )}

      {/* Tab 2: Kelola Metode Pembayaran */}
      {activeTab === 'metode' && (
        <MetodePembayaranTable
          metodeList={metodeList}
          loading={loading}
          isMock={isMock}
          transaksiList={transaksiList}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
}

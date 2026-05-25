'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Coins, 
  Sparkles, 
  Calendar, 
  Search, 
  CreditCard, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  X, 
  Check, 
  Plus, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Info
} from 'lucide-react';

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState('laporan'); // 'laporan' or 'metode'

  // Date Filter State (default to current month)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    // First day of current month
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    // Current date
    return new Date().toISOString().split('T')[0];
  });

  // DB Data States
  const [rekap, setRekap] = useState(null);
  const [transaksiList, setTransaksiList] = useState([]);
  const [metodeList, setMetodeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  // Expanded Invoice IDs
  const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);

  // CRUD Metode Pembayaran State
  const [showMetodeModal, setShowMetodeModal] = useState(false);
  const [editMetodeId, setEditMetodeId] = useState(null);
  const [formMetodeNama, setFormMetodeNama] = useState('');
  const [formMetodeAktif, setFormMetodeAktif] = useState(true);
  const [metodeFormError, setMetodeFormError] = useState('');

  // Notification message
  const [successMsg, setSuccessMsg] = useState('');

  // Mock Data
  const mockMetode = [
    { id: 1, nama: 'Tunai', aktif: true, createdAt: '2026-05-01T00:00:00.000Z' },
    { id: 2, nama: 'QRIS', aktif: true, createdAt: '2026-05-02T00:00:00.000Z' },
    { id: 3, nama: 'Transfer Bank BCA', aktif: true, createdAt: '2026-05-03T00:00:00.000Z' },
    { id: 4, nama: 'Transfer Bank Mandiri', aktif: false, createdAt: '2026-05-04T00:00:00.000Z' }
  ];

  const mockTransaksi = [
    {
      id: 1,
      nomorInvoice: 'INV/20260525/0001',
      tanggal: '2026-05-25T03:30:00.000Z',
      pasienId: 1,
      pasien: { nama: 'Desak Putu Lita', alamat: 'Kec. Sukawati, Gianyar, Bali' },
      totalHarga: 2000000,
      metodePembayaranId: 1,
      metodePembayaran: { nama: 'Tunai' },
      catatan: 'Persalinan berjalan lancar, kondisi ibu dan bayi sehat walafiat.',
      detailTransaksi: [
        { id: 101, terapiId: 1, hargaJual: 2000000, hargaPokok: 600000, jumlah: 1, subtotal: 2000000, terapi: { nama: 'Persalinan Normal Bidan' } }
      ]
    },
    {
      id: 2,
      nomorInvoice: 'INV/20260524/0001',
      tanggal: '2026-05-24T08:15:00.000Z',
      pasienId: 2,
      pasien: { nama: 'Ni Ketut Suwarni', alamat: 'Desa Celuk, Sukawati, Bali' },
      totalHarga: 120000,
      metodePembayaranId: 2,
      metodePembayaran: { nama: 'QRIS' },
      catatan: 'Pemberian vaksin imunisasi rutin.',
      detailTransaksi: [
        { id: 102, terapiId: 5, hargaJual: 120000, hargaPokok: 70000, jumlah: 1, subtotal: 120000, terapi: { nama: 'Imunisasi DPT-HB-HIB' } }
      ]
    },
    {
      id: 3,
      nomorInvoice: 'INV/20260523/0001',
      tanggal: '2026-05-23T10:45:00.000Z',
      pasienId: 3,
      pasien: { nama: 'Made Ariesta', alamat: 'Denpasar Timur, Bali' },
      totalHarga: 75000,
      metodePembayaranId: 3,
      metodePembayaran: { nama: 'Transfer Bank BCA' },
      catatan: 'Keluhan pegal, pijat bayi spa.',
      detailTransaksi: [
        { id: 103, terapiId: 3, hargaJual: 75000, hargaPokok: 15000, jumlah: 1, subtotal: 75000, terapi: { nama: 'Pijat Bayi Sehat' } }
      ]
    },
    {
      id: 4,
      nomorInvoice: 'INV/20260520/0001',
      tanggal: '2026-05-20T04:20:00.000Z',
      pasienId: 1,
      pasien: { nama: 'Desak Putu Lita', alamat: 'Kec. Sukawati, Gianyar, Bali' },
      totalHarga: 125000,
      metodePembayaranId: 1,
      metodePembayaran: { nama: 'Tunai' },
      catatan: 'Kontrol ANC rutin + USG dasar & vitamin kehamilan.',
      detailTransaksi: [
        { id: 104, terapiId: 4, hargaJual: 80000, hargaPokok: 30000, jumlah: 1, subtotal: 80000, terapi: { nama: 'Pemeriksaan ANC Terpadu' } },
        { id: 105, terapiId: 2, hargaJual: 45000, hargaPokok: 20000, jumlah: 1, subtotal: 45000, terapi: { nama: 'Suntik KB 3 Bulan' } }
      ]
    }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Rekapitulasi
      const resRekap = await fetch(`/api/transaksi?rekap=true&startDate=${startDate}&endDate=${endDate}`);
      if (!resRekap.ok) throw new Error('DB Error');
      const dataRekap = await resRekap.json();
      setRekap(dataRekap);

      // 2. Fetch Detailed Transaksi
      const resTx = await fetch(`/api/transaksi?startDate=${startDate}&endDate=${endDate}`);
      if (!resTx.ok) throw new Error('DB Error');
      const dataTx = await resTx.json();
      setTransaksiList(dataTx);

      // 3. Fetch Metode Pembayaran
      const resMet = await fetch('/api/metode');
      if (!resMet.ok) throw new Error('DB Error');
      const dataMet = await resMet.json();
      setMetodeList(dataMet);

      setIsMock(false);
      setLoading(false);
    } catch (err) {
      console.warn('Fallback to mock data in Laporan view.');
      setIsMock(true);

      // Filter Mock transactions locally by date for realistic feel
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const filteredTx = mockTransaksi.filter(tx => {
        const txDate = new Date(tx.tanggal);
        return txDate >= start && txDate <= end;
      });

      // Calculate mock rekap values
      let totalPendapatan = 0;
      let totalModal = 0;
      let totalTransaksi = filteredTx.length;
      const rekapMetode = {};

      filteredTx.forEach(tx => {
        totalPendapatan += tx.totalHarga;
        const mNama = tx.metodePembayaran.nama;
        if (!rekapMetode[mNama]) {
          rekapMetode[mNama] = { jumlahTransaksi: 0, nominal: 0 };
        }
        rekapMetode[mNama].jumlahTransaksi += 1;
        rekapMetode[mNama].nominal += tx.totalHarga;

        tx.detailTransaksi.forEach(det => {
          totalModal += (det.hargaPokok * det.jumlah);
        });
      });

      const totalLaba = totalPendapatan - totalModal;
      const margin = totalPendapatan > 0 ? (totalLaba / totalPendapatan) * 100 : 0;

      setRekap({
        ringkasan: {
          totalTransaksi,
          totalPendapatan,
          totalModal,
          totalLabaKotor: totalLaba,
          marginKeuntungan: parseFloat(margin.toFixed(2))
        },
        breakdownMetode: Object.keys(rekapMetode).map(key => ({
          metode: key,
          ...rekapMetode[key]
        }))
      });

      setTransaksiList(filteredTx);
      setMetodeList(mockMetode);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const triggerSuccessNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  // --- CRUD METODE PEMBAYARAN ---
  const handleMetodeSubmit = (e) => {
    e.preventDefault();
    setMetodeFormError('');

    if (!formMetodeNama.trim()) {
      setMetodeFormError('Nama metode pembayaran wajib diisi.');
      return;
    }

    const payload = {
      nama: formMetodeNama.trim(),
      aktif: formMetodeAktif
    };

    if (isMock) {
      if (editMetodeId) {
        setMetodeList(prev => prev.map(m => m.id === editMetodeId ? { ...m, ...payload } : m));
        triggerSuccessNotification('Metode pembayaran berhasil diubah (Simulasi).');
      } else {
        const newMetode = {
          id: Date.now(),
          ...payload,
          createdAt: new Date().toISOString()
        };
        setMetodeList(prev => [...prev, newMetode]);
        triggerSuccessNotification('Metode pembayaran baru berhasil ditambahkan (Simulasi).');
      }
      closeMetodeForm();
      return;
    }

    // Real API call
    const url = editMetodeId ? `/api/metode/${editMetodeId}` : '/api/metode';
    const method = editMetodeId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menyimpan metode pembayaran.');
        return data;
      })
      .then(() => {
        triggerSuccessNotification(editMetodeId ? 'Metode pembayaran diperbarui!' : 'Metode pembayaran baru terdaftar!');
        closeMetodeForm();
        fetchData();
      })
      .catch(err => {
        setMetodeFormError(err.message);
      });
  };

  const handleMetodeDelete = (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus metode pembayaran ini? Metode yang sudah memiliki riwayat transaksi keuangan hanya bisa dinonaktifkan.')) return;

    if (isMock) {
      // Simulate validation
      const inUse = transaksiList.some(tx => tx.metodePembayaranId === id);
      if (inUse) {
        alert('Gagal menghapus: Metode pembayaran sudah memiliki riwayat transaksi keuangan. Nonaktifkan saja metode ini.');
        return;
      }
      setMetodeList(prev => prev.filter(m => m.id !== id));
      alert('Metode pembayaran berhasil dihapus (Simulasi).');
      return;
    }

    fetch(`/api/metode/${id}`, { method: 'DELETE' })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menghapus.');
        return data;
      })
      .then(() => {
        alert('Metode pembayaran berhasil dihapus!');
        fetchData();
      })
      .catch(err => {
        alert(`Error: ${err.message}`);
      });
  };

  const openMetodeForm = (metode = null) => {
    setMetodeFormError('');
    if (metode) {
      setEditMetodeId(metode.id);
      setFormMetodeNama(metode.nama);
      setFormMetodeAktif(metode.aktif);
    } else {
      setEditMetodeId(null);
      setFormMetodeNama('');
      setFormMetodeAktif(true);
    }
    setShowMetodeModal(true);
  };

  const closeMetodeForm = () => {
    setShowMetodeModal(false);
    setEditMetodeId(null);
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const toggleExpandInvoice = (id) => {
    setExpandedInvoiceId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Simulation mode banner */}
      {isMock && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-center">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="text-sm text-amber-700">
            <span className="font-bold">Mode Simulasi Aktif</span>: Basis data MySQL belum dimigrasi. Data rekapitulasi keuangan dan riwayat transaksi di bawah ini disimulasikan dari memori.
          </div>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Laporan Keuangan & Akuntabilitas</h2>
          <p className="text-sm text-slate-500 font-medium">Rekap laba kotor, HPP pengeluaran modal, kontribusi metode pembayaran, dan riwayat transaksi.</p>
        </div>

        {activeTab === 'metode' && (
          <button 
            onClick={() => openMetodeForm()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Metode Pembayaran
          </button>
        )}
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Tabs Layout */}
      <div className="border-b border-slate-200 flex gap-6">
        <button
          onClick={() => setActiveTab('laporan')}
          className={`pb-4 text-sm font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'laporan' 
              ? 'text-teal-600 font-extrabold border-b-2 border-teal-500' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Rekapitulasi Omzet & Laba
        </button>
        <button
          onClick={() => setActiveTab('metode')}
          className={`pb-4 text-sm font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'metode' 
              ? 'text-indigo-600 font-extrabold border-b-2 border-indigo-500' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Kelola Metode Pembayaran ({metodeList.length})
        </button>
      </div>

      {/* Tab 1: Financial Report and Audit Trail */}
      {activeTab === 'laporan' && (
        <div className="space-y-6">
          
          {/* Date Picker Filters */}
          <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2.5 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-teal-600" />
              Periode Laporan
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 font-semibold"
              />
              <span className="text-slate-400 text-sm font-bold">s.d</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 font-semibold"
              />
            </div>
          </div>

          {/* Financial Summary Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white animate-pulse border border-slate-200 rounded-2xl h-28"></div>
              ))}
            </div>
          ) : rekap ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Omzet / Total Pendapatan */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Omzet Pendapatan</span>
                  <h3 className="text-xl font-black text-slate-800 mt-1">{formatRupiah(rekap.ringkasan.totalPendapatan)}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">{rekap.ringkasan.totalTransaksi} invoice transaksi tercatat</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              {/* Total HPP / Modal */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total HPP (Modal)</span>
                  <h3 className="text-xl font-black text-slate-800 mt-1">{formatRupiah(rekap.ringkasan.totalModal)}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">Bahan habis pakai & obat terpakai</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
              </div>

              {/* Laba Kotor */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Laba Kotor Bersih</span>
                  <h3 className="text-xl font-black text-teal-600 mt-1">{formatRupiah(rekap.ringkasan.totalLabaKotor)}</h3>
                  <p className="text-xs text-teal-600 mt-1.5 font-bold">Margin Keuntungan: {rekap.ringkasan.marginKeuntungan}%</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>

              {/* Rata-Rata Margin */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Metode Bayar Dominan</span>
                  <h3 className="text-lg font-black text-slate-800 mt-1">
                    {rekap.breakdownMetode.length > 0 
                      ? rekap.breakdownMetode.reduce((max, curr) => curr.nominal > max.nominal ? curr : max, rekap.breakdownMetode[0]).metode 
                      : 'N/A'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">
                    Kontribusi: {rekap.breakdownMetode.length > 0 
                      ? formatRupiah(rekap.breakdownMetode.reduce((max, curr) => curr.nominal > max.nominal ? curr : max, rekap.breakdownMetode[0]).nominal) 
                      : 'Rp0'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
            </div>
          ) : null}

          {/* Audit Trail Invoices Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h4 className="font-extrabold text-slate-800 text-sm">Riwayat Audit Transaksi (Non-Manipulable)</h4>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                Data terkunci secara permanen dari manipulasi update/delete
              </span>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-100">
                      <th className="py-3.5 px-6">Invoice</th>
                      <th className="py-3.5 px-6">Tanggal</th>
                      <th className="py-3.5 px-6">Pasien</th>
                      <th className="py-3.5 px-6">Metode</th>
                      <th className="py-3.5 px-6 text-right">HPP (Modal)</th>
                      <th className="py-3.5 px-6 text-right">Tarif (Omzet)</th>
                      <th className="py-3.5 px-6 text-right">Laba Kotor</th>
                      <th className="py-3.5 px-6 text-center">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {transaksiList.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-12 text-center text-slate-400 text-sm">
                          Tidak ada riwayat transaksi keuangan pada periode ini.
                        </td>
                      </tr>
                    ) : (
                      transaksiList.map((tx) => {
                        const totalHpp = tx.detailTransaksi.reduce((sum, d) => sum + (d.hargaPokok * d.jumlah), 0);
                        const labaKotor = tx.totalHarga - totalHpp;
                        const isExpanded = expandedInvoiceId === tx.id;
                        return (
                          <React.Fragment key={tx.id}>
                            <tr className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3.5 px-6 font-mono font-bold text-slate-800">{tx.nomorInvoice}</td>
                              <td className="py-3.5 px-6 text-slate-500">
                                {new Date(tx.tanggal).toLocaleDateString('id-ID')} {new Date(tx.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-3.5 px-6 font-semibold text-slate-800">{tx.pasien?.nama}</td>
                              <td className="py-3.5 px-6 font-medium text-slate-600">
                                <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                                  {tx.metodePembayaran?.nama}
                                </span>
                              </td>
                              <td className="py-3.5 px-6 text-right text-slate-500 font-medium">{formatRupiah(totalHpp)}</td>
                              <td className="py-3.5 px-6 text-right text-slate-800 font-extrabold">{formatRupiah(tx.totalHarga)}</td>
                              <td className="py-3.5 px-6 text-right text-teal-600 font-bold">{formatRupiah(labaKotor)}</td>
                              <td className="py-3.5 px-6 text-center">
                                <button
                                  onClick={() => toggleExpandInvoice(tx.id)}
                                  className="p-1 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                              </td>
                            </tr>

                            {/* Expanded Row Details */}
                            {isExpanded && (
                              <tr className="bg-slate-50/40">
                                <td colSpan="8" className="px-6 py-4 border-l-2 border-teal-500">
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-start gap-4">
                                      <div className="text-xs">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Catatan Tindakan Bidan</p>
                                        <p className="text-slate-600 mt-1 italic font-medium">
                                          &ldquo;{tx.catatan || 'Tidak ada catatan khusus.'}&rdquo;
                                        </p>
                                      </div>
                                      
                                      <div className="text-right text-[10px] text-slate-400">
                                        <p>ID Transaksi: {tx.id}</p>
                                        <p>Tgl Log: {new Date(tx.createdAt).toLocaleString('id-ID')}</p>
                                      </div>
                                    </div>

                                    {/* Items List */}
                                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                                      <table className="w-full text-left text-xs">
                                        <thead>
                                          <tr className="bg-slate-100/80 text-slate-500 text-[10px] font-bold border-b border-slate-150">
                                            <th className="py-2 px-4">Nama Item / Tindakan</th>
                                            <th className="py-2 px-4 text-right">HPP (Modal)</th>
                                            <th className="py-2 px-4 text-right">Tarif Jual</th>
                                            <th className="py-2 px-4 text-center">Qty</th>
                                            <th className="py-2 px-4 text-right">Subtotal</th>
                                            <th className="py-2 px-4 text-right">Profit</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                          {tx.detailTransaksi?.map((detail, idx) => {
                                            const detailProfit = (detail.hargaJual - detail.hargaPokok) * detail.jumlah;
                                            return (
                                              <tr key={idx} className="text-slate-600">
                                                <td className="py-2 px-4 font-bold text-slate-700">{detail.terapi?.nama}</td>
                                                <td className="py-2 px-4 text-right text-slate-400">{formatRupiah(detail.hargaPokok)}</td>
                                                <td className="py-2 px-4 text-right">{formatRupiah(detail.hargaJual)}</td>
                                                <td className="py-2 px-4 text-center font-bold text-slate-700">{detail.jumlah}</td>
                                                <td className="py-2 px-4 text-right font-bold text-slate-800">{formatRupiah(detail.subtotal)}</td>
                                                <td className="py-2 px-4 text-right font-bold text-teal-600">{formatRupiah(detailProfit)}</td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Metode Pembayaran CRUD */}
      {activeTab === 'metode' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h4 className="font-extrabold text-slate-800 text-sm">Pengaturan Pilihan Metode Pembayaran</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Kelola rekening, e-wallet, atau opsi tunai yang muncul di form POS kasir.</p>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                    <th className="py-4 px-6">Metode Pembayaran</th>
                    <th className="py-4 px-6">Tgl Ditambahkan</th>
                    <th className="py-4 px-6 text-center">Status Keaktifan</th>
                    <th className="py-4 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {metodeList.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-400">
                        Tidak ada metode pembayaran yang terdaftar.
                      </td>
                    </tr>
                  ) : (
                    metodeList.map((metode) => (
                      <tr key={metode.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-800 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-slate-400" />
                          {metode.nama}
                        </td>
                        <td className="py-4 px-6 text-slate-400 text-xs">
                          {new Date(metode.createdAt || Date.now()).toLocaleDateString('id-ID')}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {metode.aktif ? (
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              Aktif Terbaca POS
                            </span>
                          ) : (
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-400 border border-slate-200">
                              Nonaktif / Sembunyi
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right space-x-1">
                          <button
                            onClick={() => openMetodeForm(metode)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMetodeDelete(metode.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* CRUD Metode Modal */}
      {showMetodeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <h3 className="font-bold text-slate-800">
                {editMetodeId ? 'Ubah Informasi Metode Bayar' : 'Tambah Opsi Pembayaran Baru'}
              </h3>
              <button onClick={closeMetodeForm} className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleMetodeSubmit} className="p-6 space-y-4">
              {metodeFormError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  {metodeFormError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">Nama Opsi Pembayaran *</label>
                <input 
                  type="text" 
                  value={formMetodeNama}
                  onChange={(e) => setFormMetodeNama(e.target.value)}
                  placeholder="Contoh: QRIS, Transfer BCA, Tunai"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">Status Keaktifan</label>
                <div className="flex items-center h-[40px]">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formMetodeAktif}
                      onChange={(e) => setFormMetodeAktif(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    <span className="ml-3 text-sm font-semibold text-slate-700">
                      {formMetodeAktif ? 'Aktif (Muncul di POS Kasir)' : 'Nonaktif (Sembunyikan)'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button 
                  type="button" 
                  onClick={closeMetodeForm}
                  className="px-4 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
                >
                  Simpan Metode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

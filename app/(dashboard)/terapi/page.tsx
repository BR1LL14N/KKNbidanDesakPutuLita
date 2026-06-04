'use client';

import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  X, 
  Check, 
  Layers, 
  Activity,
  Info
} from 'lucide-react';
import { ToastContainer, ConfirmDialog, useToast, useConfirm } from '@/components/ui/Toast';

export default function TerapiPage() {
  const [activeTab, setActiveTab] = useState('terapi'); // 'terapi' or 'kategori'
  
  // Data State
  const [terapiList, setTerapiList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  
  // Search & Filter State
  const [searchTerapi, setSearchTerapi] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [searchKategori, setSearchKategori] = useState('');

  // Modals & Form State for Terapi
  const [showTerapiModal, setShowTerapiModal] = useState(false);
  const [editTerapiId, setEditTerapiId] = useState(null);
  const [formTerapiNama, setFormTerapiNama] = useState('');
  const [formTerapiKategoriId, setFormTerapiKategoriId] = useState('');
  const [formTerapiHarga, setFormTerapiHarga] = useState('');

  const [formTerapiDeskripsi, setFormTerapiDeskripsi] = useState('');
  const [formTerapiAktif, setFormTerapiAktif] = useState(true);
  const [terapiFormError, setTerapiFormError] = useState('');

  // Modals & Form State for Kategori
  const [showKategoriModal, setShowKategoriModal] = useState(false);
  const [editKategoriId, setEditKategoriId] = useState(null);
  const [formKategoriNama, setFormKategoriNama] = useState('');
  const [formKategoriDeskripsi, setFormKategoriDeskripsi] = useState('');
  const [kategoriFormError, setKategoriFormError] = useState('');

  // Global Notification
  const [successMsg, setSuccessMsg] = useState('');
  const toast = useToast();
  const confirmDialog = useConfirm();

  // Mock Data
  const mockKategori = [
    { id: 1, nama: 'HAMIL', deskripsi: 'Pemeriksaan rutin kehamilan dan konsultasi kandungan.' },
    { id: 2, nama: 'PERSALINAN', deskripsi: 'Proses persalinan normal dan penanganan pasca salin.' },
    { id: 3, nama: 'KB', deskripsi: 'Pelayanan kontrasepsi, suntik KB, pil, IUD, dan implan.' },
    { id: 4, nama: 'IMUNISASI', deskripsi: 'Pemberian vaksin dasar lengkap untuk bayi dan anak.' },
    { id: 5, nama: 'KOMPLEMENTER', deskripsi: 'Terapi tambahan seperti pijat bayi, spa hamil, dan herbal.' },
    { id: 6, nama: 'UMUM', deskripsi: 'Pemeriksaan kesehatan umum untuk ibu dan anak.' }
  ];

  const mockTerapi = [
    { id: 1, nama: 'Persalinan Normal Bidan', kategoriId: 2, harga: 2000000, hargaPokok: 600000, deskripsi: 'Persalinan normal oleh bidan termasuk obat standar, tindakan, dan pemantauan.', aktif: true, kategori: { id: 2, nama: 'PERSALINAN' } },
    { id: 2, nama: 'Suntik KB 3 Bulan', kategoriId: 3, harga: 45000, hargaPokok: 20000, deskripsi: 'Suntikan hormon progestin pencegah kehamilan berjangka 3 bulan.', aktif: true, kategori: { id: 3, nama: 'KB' } },
    { id: 3, nama: 'Pijat Bayi Sehat', kategoriId: 5, harga: 75000, hargaPokok: 15000, deskripsi: 'Terapi stimulasi tumbuh kembang bayi dengan pijatan aromaterapi.', aktif: true, kategori: { id: 5, nama: 'KOMPLEMENTER' } },
    { id: 4, nama: 'Pemeriksaan ANC Terpadu', kategoriId: 1, harga: 80000, hargaPokok: 30000, deskripsi: 'Antenatal Care rutin berupa tensi, timbang berat badan, USG dasar, dan vitamin.', aktif: true, kategori: { id: 1, nama: 'HAMIL' } },
    { id: 5, nama: 'Imunisasi DPT-HB-HIB', kategoriId: 4, harga: 120000, hargaPokok: 70000, deskripsi: 'Vaksinasi pencegah difteri, pertusis, tetanus, hepatitis B, dan infeksi Hib.', aktif: true, kategori: { id: 4, nama: 'IMUNISASI' } },
    { id: 6, nama: 'Konsultasi KB & Kesehatan Reproduksi', kategoriId: 3, harga: 30000, hargaPokok: 0, deskripsi: 'Konseling pemilihan alat kontrasepsi yang cocok untuk pasangan suami istri.', aktif: true, kategori: { id: 3, nama: 'KB' } }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const resKat = await fetch('/api/kategori');
      if (!resKat.ok) throw new Error('DB Error');
      const dataKat = await resKat.json();
      setKategoriList(dataKat);

      const resTer = await fetch('/api/terapi');
      if (!resTer.ok) throw new Error('DB Error');
      const dataTer = await resTer.json();
      setTerapiList(dataTer);

      setIsMock(false);
      setLoading(false);
    } catch (err) {
      console.warn('Using mock data for Terapi & Kategori because database tables are not migrated.');
      setIsMock(true);
      setKategoriList(mockKategori);
      setTerapiList(mockTerapi);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerSuccessNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
    toast.success(msg);
  };

  // --- CRUD TERAPI (TINDAKAN) ---
  const handleTerapiSubmit = (e) => {
    e.preventDefault();
    setTerapiFormError('');

    if (!formTerapiNama.trim()) {
      setTerapiFormError('Nama tindakan wajib diisi.');
      return;
    }
    if (!formTerapiKategoriId) {
      setTerapiFormError('Kategori tindakan wajib dipilih.');
      return;
    }
    if (formTerapiHarga === '' || parseInt(formTerapiHarga) < 0) {
      setTerapiFormError('Harga jual tidak boleh kosong atau negatif.');
      return;
    }

    const payload = {
      nama: formTerapiNama,
      kategoriId: parseInt(formTerapiKategoriId),
      harga: parseInt(formTerapiHarga),
      hargaPokok: 0,
      deskripsi: formTerapiDeskripsi || null,
      aktif: formTerapiAktif
    };

    if (isMock) {
      const selectedKatObj = kategoriList.find(k => k.id === parseInt(formTerapiKategoriId));
      const katSnapshot = selectedKatObj ? { id: selectedKatObj.id, nama: selectedKatObj.nama } : null;

      if (editTerapiId) {
        setTerapiList(prev => prev.map(t => t.id === editTerapiId ? { ...t, ...payload, kategori: katSnapshot } : t));
        triggerSuccessNotification('Tindakan terapi berhasil diubah (Simulasi).');
      } else {
        const newTerapi = {
          id: Date.now(),
          ...payload,
          kategori: katSnapshot,
          createdAt: new Date().toISOString()
        };
        setTerapiList(prev => [newTerapi, ...prev]);
        triggerSuccessNotification('Tindakan terapi baru berhasil ditambahkan (Simulasi).');
      }
      closeTerapiForm();
      return;
    }

    // Real API Call
    const url = editTerapiId ? `/api/terapi/${editTerapiId}` : '/api/terapi';
    const method = editTerapiId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menyimpan tindakan.');
        return data;
      })
      .then(() => {
        triggerSuccessNotification(editTerapiId ? 'Tindakan terapi berhasil diperbarui!' : 'Tindakan terapi baru berhasil didaftarkan!');
        closeTerapiForm();
        fetchData();
      })
      .catch(err => {
        setTerapiFormError(err.message);
      });
  };

  const handleTerapiDelete = async (id) => {
    const namaTerapi = terapiList.find(t => t.id === id)?.nama ?? 'tindakan ini';
    const confirmed = await confirmDialog.confirm({
      title: `Hapus "${namaTerapi}"?`,
      message: 'Tindakan dengan riwayat transaksi aktif tidak dapat dihapus secara permanen. Nonaktifkan terapi jika masih ingin mempertahankan histori datanya.',
      confirmLabel: 'Ya, Hapus Sekarang',
      cancelLabel: 'Batal',
      variant: 'danger',
    });
    if (!confirmed) return;

    if (isMock) {
      setTerapiList(prev => prev.filter(t => t.id !== id));
      toast.success('Tindakan berhasil dihapus.', 'Data tindakan telah dihapus dari daftar (mode simulasi).');
      return;
    }

    fetch(`/api/terapi/${id}`, { method: 'DELETE' })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menghapus.');
        return data;
      })
      .then(() => {
        toast.success('Tindakan Berhasil Dihapus', 'Data tindakan terapi telah dihapus secara permanen dari sistem.');
        fetchData();
      })
      .catch(err => {
        toast.error('Gagal Menghapus Tindakan', err.message);
      });
  };

  const openTerapiForm = (terapi = null) => {
    setTerapiFormError('');
    if (terapi) {
      setEditTerapiId(terapi.id);
      setFormTerapiNama(terapi.nama);
      setFormTerapiKategoriId(String(terapi.kategoriId));
      setFormTerapiHarga(String(terapi.harga));

      setFormTerapiDeskripsi(terapi.deskripsi || '');
      setFormTerapiAktif(terapi.aktif);
    } else {
      setEditTerapiId(null);
      setFormTerapiNama('');
      setFormTerapiKategoriId(kategoriList.length > 0 ? String(kategoriList[0].id) : '');
      setFormTerapiHarga('');

      setFormTerapiDeskripsi('');
      setFormTerapiAktif(true);
    }
    setShowTerapiModal(true);
  };

  const closeTerapiForm = () => {
    setShowTerapiModal(false);
    setEditTerapiId(null);
  };

  // --- CRUD KATEGORI ---
  const handleKategoriSubmit = (e) => {
    e.preventDefault();
    setKategoriFormError('');

    if (!formKategoriNama.trim()) {
      setKategoriFormError('Nama kategori wajib diisi.');
      return;
    }

    const payload = {
      nama: formKategoriNama.toUpperCase().trim(), // standardizing category codes
      deskripsi: formKategoriDeskripsi || null
    };

    if (isMock) {
      // Check duplicate
      const duplicate = kategoriList.find(k => k.nama === payload.nama && k.id !== editKategoriId);
      if (duplicate) {
        setKategoriFormError('Kategori dengan nama ini sudah ada.');
        return;
      }

      if (editKategoriId) {
        setKategoriList(prev => prev.map(k => k.id === editKategoriId ? { ...k, ...payload } : k));
        // Update kategori reference in terapiList mock
        setTerapiList(prev => prev.map(t => t.kategoriId === editKategoriId ? { ...t, kategori: { ...t.kategori, nama: payload.nama } } : t));
        triggerSuccessNotification('Kategori terapi berhasil diubah (Simulasi).');
      } else {
        const newKategori = {
          id: Date.now(),
          ...payload,
          createdAt: new Date().toISOString()
        };
        setKategoriList(prev => [...prev, newKategori]);
        triggerSuccessNotification('Kategori terapi baru berhasil ditambahkan (Simulasi).');
      }
      closeKategoriForm();
      return;
    }

    // Real API Call
    const url = editKategoriId ? `/api/kategori/${editKategoriId}` : '/api/kategori';
    const method = editKategoriId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menyimpan kategori.');
        return data;
      })
      .then(() => {
        triggerSuccessNotification(editKategoriId ? 'Kategori berhasil diperbarui!' : 'Kategori baru berhasil didaftarkan!');
        closeKategoriForm();
        fetchData();
      })
      .catch(err => {
        setKategoriFormError(err.message);
      });
  };

  const handleKategoriDelete = async (id) => {
    const namaKategori = kategoriList.find(k => k.id === id)?.nama ?? 'kategori ini';
    const countTerkait = terapiList.filter(t => t.kategoriId === id).length;

    const confirmed = await confirmDialog.confirm({
      title: `Hapus Kategori "${namaKategori}"?`,
      message: countTerkait > 0
        ? `Kategori ini masih terikat dengan ${countTerkait} tindakan aktif dan tidak dapat dihapus. Hapus atau pindahkan semua tindakan dalam kategori ini terlebih dahulu.`
        : 'Kategori yang dihapus tidak dapat dipulihkan. Pastikan tidak ada tindakan yang terhubung sebelum melanjutkan.',
      confirmLabel: countTerkait > 0 ? 'Mengerti' : 'Ya, Hapus',
      cancelLabel: 'Batal',
      variant: countTerkait > 0 ? 'warning' : 'danger',
    });
    if (!confirmed) return;

    if (isMock) {
      const inUse = terapiList.some(t => t.kategoriId === id);
      if (inUse) {
        toast.error(
          'Proteksi Data Aktif',
          `Kategori "${namaKategori}" tidak dapat dihapus karena masih digunakan oleh ${countTerkait} katalog tindakan. Hapus tindakan terkait terlebih dahulu.`
        );
        return;
      }
      setKategoriList(prev => prev.filter(k => k.id !== id));
      toast.success('Kategori Berhasil Dihapus', `Kategori "${namaKategori}" telah dihapus dari sistem (mode simulasi).`);
      return;
    }

    fetch(`/api/kategori/${id}`, { method: 'DELETE' })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menghapus.');
        return data;
      })
      .then(() => {
        toast.success('Kategori Berhasil Dihapus', `Kategori "${namaKategori}" telah dihapus secara permanen dari sistem.`);
        fetchData();
      })
      .catch(err => {
        toast.error('Proteksi Data Aktif', err.message);
      });
  };

  const openKategoriForm = (kategori = null) => {
    setKategoriFormError('');
    if (kategori) {
      setEditKategoriId(kategori.id);
      setFormKategoriNama(kategori.nama);
      setFormKategoriDeskripsi(kategori.deskripsi || '');
    } else {
      setEditKategoriId(null);
      setFormKategoriNama('');
      setFormKategoriDeskripsi('');
    }
    setShowKategoriModal(true);
  };

  const closeKategoriForm = () => {
    setShowKategoriModal(false);
    setEditKategoriId(null);
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  // Filter & Search Logic
  const filteredTerapiList = terapiList.filter(t => {
    const matchesSearch = t.nama.toLowerCase().includes(searchTerapi.toLowerCase()) || 
                          (t.deskripsi && t.deskripsi.toLowerCase().includes(searchTerapi.toLowerCase()));
    const matchesKategori = filterKategori === '' || t.kategoriId === parseInt(filterKategori);
    return matchesSearch && matchesKategori;
  });

  const filteredKategoriList = kategoriList.filter(k => {
    return k.nama.toLowerCase().includes(searchKategori.toLowerCase()) || 
           (k.deskripsi && k.deskripsi.toLowerCase().includes(searchKategori.toLowerCase()));
  });

  return (
    <div className="space-y-6">
      {/* Simulation Banner */}
      {isMock && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-center">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="text-sm text-amber-700">
            <span className="font-bold">Mode Simulasi Aktif</span>: Database belum dimigrasi. Penambahan, pengeditan, atau penghapusan item tindakan/kategori di bawah ini disimulasikan secara lokal dalam memori.
          </div>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Katalog Layanan & Kategori Terapi</h2>
          <p className="text-sm text-slate-500">Kelola tarif tindakan medis, modal obat/alat (HPP), dan klasifikasi kategori layanan.</p>
        </div>
        
        <div className="flex gap-2">
          {activeTab === 'terapi' ? (
            <button 
              onClick={() => openTerapiForm()}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Tindakan / Layanan
            </button>
          ) : (
            <button 
              onClick={() => openKategoriForm()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              Tambah Kategori Baru
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-250">
          <Check className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Tabs Menu */}
      <div className="border-b border-slate-200 flex gap-6">
        <button
          onClick={() => setActiveTab('terapi')}
          className={`pb-4 text-sm font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'terapi' 
              ? 'text-teal-600 font-extrabold border-b-2 border-teal-500' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Activity className="w-4 h-4" />
          Katalog Tindakan Terapi ({filteredTerapiList.length})
        </button>
        <button
          onClick={() => setActiveTab('kategori')}
          className={`pb-4 text-sm font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'kategori' 
              ? 'text-indigo-600 font-extrabold border-b-2 border-indigo-500' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Layers className="w-4 h-4" />
          Klasifikasi Kategori ({filteredKategoriList.length})
        </button>
      </div>

      {/* Tab 1: Katalog Terapi / Tindakan */}
      {activeTab === 'terapi' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Search, Filter Filters */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 bg-slate-50/50">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Cari tindakan terapi..." 
                value={searchTerapi}
                onChange={(e) => setSearchTerapi(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="w-full md:w-64">
              <select
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-slate-700 font-medium"
              >
                <option value="">Semua Kategori</option>
                {kategoriList.map(kat => (
                  <option key={kat.id} value={kat.id}>{kat.nama}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Terapi Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="space-y-3 animate-pulse py-2">
                <div className="grid grid-cols-7 gap-4 py-3 border-b border-slate-100">
                  {[...Array(7)].map((_, idx) => (
                    <div key={idx} className="h-3.5 bg-slate-200 rounded w-2/3" />
                  ))}
                </div>
                {[...Array(5)].map((_, rowIdx) => (
                  <div key={rowIdx} className="grid grid-cols-7 gap-4 py-3.5 items-center">
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-3 bg-slate-200 rounded w-1/2 justify-self-end" />
                    <div className="h-3 bg-slate-200 rounded w-1/2 justify-self-end" />
                    <div className="h-3 bg-slate-200 rounded w-1/2 justify-self-end" />
                    <div className="h-6 bg-slate-200 rounded-full w-14 justify-self-center" />
                    <div className="flex gap-2 justify-end">
                      <div className="w-8 h-8 bg-slate-200 rounded" />
                      <div className="w-8 h-8 bg-slate-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                    <th className="py-4 px-6">Nama Layanan / Tindakan</th>
                    <th className="py-4 px-6">Kategori</th>
                    <th className="py-4 px-6 text-right">Tarif Jual</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredTerapiList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                        Tidak ada katalog tindakan terapi yang sesuai pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredTerapiList.map((terapi) => {
                      return (
                        <tr key={terapi.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-800">
                            <div>
                              <p>{terapi.nama}</p>
                              {terapi.deskripsi && (
                                <p className="text-[11px] text-slate-400 font-normal mt-0.5 max-w-sm line-clamp-1">{terapi.deskripsi}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {terapi.kategori?.nama || 'UMUM'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-bold text-slate-800">
                            {formatRupiah(terapi.harga)}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {terapi.aktif ? (
                              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">Aktif</span>
                            ) : (
                              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-400 border border-slate-200">Nonaktif</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right space-x-1">
                            <button
                              onClick={() => openTerapiForm(terapi)}
                              className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors inline-flex"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleTerapiDelete(terapi.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Kategori Terapi */}
      {activeTab === 'kategori' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Search bar */}
          <div className="p-4 border-b border-slate-100 flex bg-slate-50/50">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Cari kategori terapi..." 
                value={searchKategori}
                onChange={(e) => setSearchKategori(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Kategori Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="space-y-3 animate-pulse py-2">
                <div className="grid grid-cols-4 gap-4 py-3 border-b border-slate-100">
                  {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="h-3.5 bg-slate-200 rounded w-2/3" />
                  ))}
                </div>
                {[...Array(4)].map((_, rowIdx) => (
                  <div key={rowIdx} className="grid grid-cols-4 gap-4 py-3.5 items-center">
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                    <div className="flex gap-2 justify-end">
                      <div className="w-8 h-8 bg-slate-200 rounded" />
                      <div className="w-8 h-8 bg-slate-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                    <th className="py-4 px-6">Nama Kategori (KODE)</th>
                    <th className="py-4 px-6">Deskripsi Kategori</th>
                    <th className="py-4 px-6">Jumlah Layanan Terkait</th>
                    <th className="py-4 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredKategoriList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400 text-sm">
                        Tidak ada kategori terapi yang sesuai pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredKategoriList.map((kategori) => {
                      const countTerapi = terapiList.filter(t => t.kategoriId === kategori.id).length;
                      return (
                        <tr key={kategori.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-800 tracking-wide">
                            <span className="font-mono text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-lg">
                              {kategori.nama}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-500 max-w-sm truncate">
                            {kategori.deskripsi || 'Tidak ada deskripsi.'}
                          </td>
                          <td className="py-4 px-6 font-medium text-slate-600">
                            {countTerapi} layanan aktif
                          </td>
                          <td className="py-4 px-6 text-right space-x-1">
                            <button
                              onClick={() => openKategoriForm(kategori)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleKategoriDelete(kategori.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modal CRUD Terapi */}
      {showTerapiModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <h3 className="font-bold text-slate-800">{editTerapiId ? 'Ubah Informasi Tindakan' : 'Daftarkan Tindakan Medis / Terapi'}</h3>
              <button onClick={closeTerapiForm} className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleTerapiSubmit} className="p-6 space-y-4">
              {terapiFormError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  {terapiFormError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">Nama Tindakan / Terapi *</label>
                <input 
                  type="text" 
                  value={formTerapiNama}
                  onChange={(e) => setFormTerapiNama(e.target.value)}
                  placeholder="Contoh: USG Hamil & Konsultasi"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Kategori Layanan *</label>
                  <select 
                    value={formTerapiKategoriId}
                    onChange={(e) => setFormTerapiKategoriId(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-slate-700 bg-white"
                  >
                    {kategoriList.map(kat => (
                      <option key={kat.id} value={kat.id}>{kat.nama}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Status Tindakan</label>
                  <div className="flex items-center h-[46px]">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formTerapiAktif}
                        onChange={(e) => setFormTerapiAktif(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      <span className="ml-3 text-sm font-semibold text-slate-700">{formTerapiAktif ? 'Aktif Melayani' : 'Nonaktif'}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">Tarif Jual Ke Pasien *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                  <input 
                    type="number" 
                    value={formTerapiHarga}
                    onChange={(e) => setFormTerapiHarga(e.target.value)}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-bold text-teal-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">Deskripsi Tindakan (Opsional)</label>
                <textarea 
                  rows={3}
                  value={formTerapiDeskripsi}
                  onChange={(e) => setFormTerapiDeskripsi(e.target.value)}
                  placeholder="Penjelasan ringkas pelayanan medis ini..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button 
                  type="button" 
                  onClick={closeTerapiForm}
                  className="px-4 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
                >
                  Simpan Layanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal CRUD Kategori */}
      {showKategoriModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <h3 className="font-bold text-slate-800">{editKategoriId ? 'Ubah Informasi Kategori' : 'Buat Kategori Layanan Baru'}</h3>
              <button onClick={closeKategoriForm} className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleKategoriSubmit} className="p-6 space-y-4">
              {kategoriFormError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  {kategoriFormError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">Nama Kategori (Gunakan Huruf Kapital) *</label>
                <input 
                  type="text" 
                  value={formKategoriNama}
                  onChange={(e) => setFormKategoriNama(e.target.value)}
                  placeholder="Contoh: IMUNISASI, HAMIL, KB"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-semibold uppercase tracking-wider text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">Deskripsi Kategori (Opsional)</label>
                <textarea 
                  rows={3}
                  value={formKategoriDeskripsi}
                  onChange={(e) => setFormKategoriDeskripsi(e.target.value)}
                  placeholder="Deskripsi singkat klasifikasi tindakan ini..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button 
                  type="button" 
                  onClick={closeKategoriForm}
                  className="px-4 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />

      {/* Confirm Dialog */}
      <ConfirmDialog
        options={confirmDialog.options}
        onConfirm={confirmDialog.handleConfirm}
        onCancel={confirmDialog.handleCancel}
      />
    </div>
  );
}

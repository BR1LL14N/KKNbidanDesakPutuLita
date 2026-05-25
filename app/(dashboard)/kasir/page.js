'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  User, 
  UserPlus, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  FileText, 
  AlertTriangle, 
  Check, 
  Activity, 
  X,
  RefreshCw
} from 'lucide-react';

export default function KasirPage() {
  // Data lists from DB/Mock
  const [terapiList, setTerapiList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [pasienList, setPasienList] = useState([]);
  const [metodeList, setMetodeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  // Search & Filter for therapy catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');

  // Cart State
  const [cart, setCart] = useState([]);
  const [catatan, setCatatan] = useState('');
  
  // Patient Selection Mode: 'existing' or 'new'
  const [patientMode, setPatientMode] = useState('existing');
  
  // Selected existing patient state
  const [selectedPasienId, setSelectedPasienId] = useState('');
  const [searchPasienQuery, setSearchPasienQuery] = useState('');
  const [filteredPasiens, setFilteredPasiens] = useState([]);
  const [showPasienDropdown, setShowPasienDropdown] = useState(false);

  // New patient registration state
  const [newPasienNama, setNewPasienNama] = useState('');
  const [newPasienTglLahir, setNewPasienTglLahir] = useState('');
  const [newPasienAlamat, setNewPasienAlamat] = useState('');

  // Payment method state
  const [selectedMetodeId, setSelectedMetodeId] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInvoice, setSuccessInvoice] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Mock data for fallback
  const mockKategori = [
    { id: 1, nama: 'HAMIL' },
    { id: 2, nama: 'PERSALINAN' },
    { id: 3, nama: 'KB' },
    { id: 4, nama: 'IMUNISASI' },
    { id: 5, nama: 'KOMPLEMENTER' },
    { id: 6, nama: 'UMUM' }
  ];

  const mockTerapi = [
    { id: 1, nama: 'Persalinan Normal Bidan', kategoriId: 2, harga: 2000000, hargaPokok: 600000, aktif: true, kategori: { id: 2, nama: 'PERSALINAN' } },
    { id: 2, nama: 'Suntik KB 3 Bulan', kategoriId: 3, harga: 45000, hargaPokok: 20000, aktif: true, kategori: { id: 3, nama: 'KB' } },
    { id: 3, nama: 'Pijat Bayi Sehat', kategoriId: 5, harga: 75000, hargaPokok: 15000, aktif: true, kategori: { id: 5, nama: 'KOMPLEMENTER' } },
    { id: 4, nama: 'Pemeriksaan ANC Terpadu', kategoriId: 1, harga: 80000, hargaPokok: 30000, aktif: true, kategori: { id: 1, nama: 'HAMIL' } },
    { id: 5, nama: 'Imunisasi DPT-HB-HIB', kategoriId: 4, harga: 120000, hargaPokok: 70000, aktif: true, kategori: { id: 4, nama: 'IMUNISASI' } },
    { id: 6, nama: 'Konsultasi KB', kategoriId: 3, harga: 30000, hargaPokok: 0, aktif: true, kategori: { id: 3, nama: 'KB' } }
  ];

  const mockPasien = [
    { id: 1, nama: 'Desak Putu Lita', tanggalLahir: '1995-06-15', alamat: 'Kec. Sukawati, Gianyar, Bali' },
    { id: 2, nama: 'Ni Ketut Suwarni', tanggalLahir: '1988-11-20', alamat: 'Desa Celuk, Sukawati, Bali' },
    { id: 3, nama: 'Made Ariesta', tanggalLahir: '2001-02-05', alamat: 'Denpasar Timur, Bali' }
  ];

  const mockMetode = [
    { id: 1, nama: 'Tunai', aktif: true },
    { id: 2, nama: 'QRIS', aktif: true },
    { id: 3, nama: 'Transfer Bank BCA', aktif: true }
  ];

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      // Fetch kategori, terapi, pasien, and metode
      const [resKat, resTer, resPas, resMet] = await Promise.all([
        fetch('/api/kategori'),
        fetch('/api/terapi?onlyActive=true'),
        fetch('/api/pasien'),
        fetch('/api/metode?onlyActive=true')
      ]);

      if (!resKat.ok || !resTer.ok || !resPas.ok || !resMet.ok) {
        throw new Error('API fetch failed');
      }

      const dataKat = await resKat.json();
      const dataTer = await resTer.json();
      const dataPas = await resPas.json();
      const dataMet = await resMet.json();

      setKategoriList(dataKat);
      setTerapiList(dataTer.filter(t => t.aktif));
      setPasienList(dataPas);
      setMetodeList(dataMet.filter(m => m.aktif));
      
      // Default selections
      if (dataMet.length > 0) {
        setSelectedMetodeId(String(dataMet[0].id));
      }
      
      setIsMock(false);
      setLoading(false);
    } catch (err) {
      console.warn('Fallback to mock data in Kasir view.');
      setIsMock(true);
      setKategoriList(mockKategori);
      setTerapiList(mockTerapi);
      setPasienList(mockPasien);
      setMetodeList(mockMetode);
      setSelectedMetodeId('1'); // Default to Tunai in Mock
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter patient search list
  useEffect(() => {
    if (!searchPasienQuery) {
      setFilteredPasiens([]);
      return;
    }
    const filtered = pasienList.filter(p => 
      p.nama.toLowerCase().includes(searchPasienQuery.toLowerCase())
    );
    setFilteredPasiens(filtered);
  }, [searchPasienQuery, pasienList]);

  // Cart operations
  const addToCart = (terapi) => {
    setCart(prev => {
      const existing = prev.find(item => item.terapi.id === terapi.id);
      if (existing) {
        return prev.map(item => 
          item.terapi.id === terapi.id ? { ...item, jumlah: item.jumlah + 1 } : item
        );
      }
      return [...prev, { terapi, jumlah: 1 }];
    });
  };

  const updateCartQty = (terapiId, delta) => {
    setCart(prev => 
      prev.map(item => {
        if (item.terapi.id === terapiId) {
          const newQty = item.jumlah + delta;
          return newQty > 0 ? { ...item, jumlah: newQty } : null;
        }
        return item;
      }).filter(Boolean)
    );
  };

  const removeFromCart = (terapiId) => {
    setCart(prev => prev.filter(item => item.terapi.id !== terapiId));
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.terapi.harga * item.jumlah), 0);
  };

  const handleSelectPasien = (pasien) => {
    setSelectedPasienId(String(pasien.id));
    setSearchPasienQuery(pasien.nama);
    setShowPasienDropdown(false);
  };

  // Submit checkout transaction
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Keranjang belanja masih kosong.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    
    let targetPasienId = selectedPasienId;

    try {
      // 1. If PatientMode is 'new', we must create/register the patient first!
      if (patientMode === 'new') {
        if (!newPasienNama.trim()) {
          throw new Error('Nama pasien baru wajib diisi untuk registrasi cepat.');
        }

        const patientPayload = {
          nama: newPasienNama.trim(),
          tanggalLahir: newPasienTglLahir || null,
          alamat: newPasienAlamat.trim() || null
        };

        if (isMock) {
          // Simulate new patient creation
          const simulatedNewId = Date.now();
          const mockNewPatientObj = { id: simulatedNewId, ...patientPayload };
          setPasienList(prev => [mockNewPatientObj, ...prev]);
          targetPasienId = String(simulatedNewId);
        } else {
          // Real API register
          const registerRes = await fetch('/api/pasien', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patientPayload)
          });
          const registerData = await registerRes.json();
          if (!registerRes.ok) {
            throw new Error(registerData.error || 'Gagal meregistrasi pasien baru.');
          }
          targetPasienId = String(registerData.id);
        }
      } else {
        // Mode 'existing' - check if valid
        if (!targetPasienId) {
          throw new Error('Pilih pasien terdaftar terlebih dahulu.');
        }
      }

      // 2. Prepare checkout payload
      const transactionPayload = {
        pasienId: parseInt(targetPasienId),
        metodePembayaranId: parseInt(selectedMetodeId),
        catatan: catatan || null,
        items: cart.map(item => ({
          terapiId: item.terapi.id,
          jumlah: item.jumlah
        }))
      };

      // 3. Post transaction
      if (isMock) {
        // Simulate invoice checkout
        const invoiceNum = `INV/${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}/${String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0')}`;
        const patientObj = pasienList.find(p => p.id === parseInt(targetPasienId)) || { nama: newPasienNama };
        const paymentObj = metodeList.find(m => m.id === parseInt(selectedMetodeId)) || { nama: 'Tunai' };

        const simulatedInvoice = {
          nomorInvoice: invoiceNum,
          tanggal: new Date().toISOString(),
          pasien: patientObj,
          metodePembayaran: paymentObj,
          totalHarga: getSubtotal(),
          catatan: catatan,
          detailTransaksi: cart.map(item => ({
            id: Math.random(),
            terapi: item.terapi,
            hargaJual: item.terapi.harga,
            jumlah: item.jumlah,
            subtotal: item.terapi.harga * item.jumlah
          }))
        };

        setSuccessInvoice(simulatedInvoice);
        // Clear forms
        setCart([]);
        setCatatan('');
        setSelectedPasienId('');
        setSearchPasienQuery('');
        setNewPasienNama('');
        setNewPasienTglLahir('');
        setNewPasienAlamat('');
      } else {
        // Real API checkout
        const checkoutRes = await fetch('/api/transaksi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transactionPayload)
        });
        const checkoutData = await checkoutRes.json();
        if (!checkoutRes.ok) {
          throw new Error(checkoutData.error || 'Gagal memproses transaksi kasir.');
        }

        setSuccessInvoice(checkoutData);
        // Clear forms and reload lists
        setCart([]);
        setCatatan('');
        setSelectedPasienId('');
        setSearchPasienQuery('');
        setNewPasienNama('');
        setNewPasienTglLahir('');
        setNewPasienAlamat('');
        fetchData(); // reload lists
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  // Filter therapies catalog
  const filteredTerapiList = terapiList.filter(t => {
    const matchesSearch = t.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.deskripsi && t.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesKategori = selectedKategori === '' || t.kategoriId === parseInt(selectedKategori);
    return matchesSearch && matchesKategori;
  });

  return (
    <div className="space-y-6">
      {/* Simulation Banner */}
      {isMock && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-center">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="text-sm text-amber-700">
            <span className="font-bold">Mode Simulasi Aktif</span>: Database belum dimigrasi. Proses checkout POS dan pencatatan kasir disimulasikan secara lokal di memori.
          </div>
        </div>
      )}

      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Kasir Point of Sale (POS)</h2>
          <p className="text-sm text-slate-500">Pencatatan langsung transaksi jasa terapi, obat, dan rekap pembayaran pasien.</p>
        </div>
        <button 
          onClick={fetchData}
          className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Grid Layout: Left (Catalog), Right (Checkout Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Catalog of Services (8 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
            
            {/* Search and Kategori Filter */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative grow">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Cari tindakan, obat, atau terapi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="w-full md:w-48 shrink-0">
                <select
                  value={selectedKategori}
                  onChange={(e) => setSelectedKategori(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-slate-700"
                >
                  <option value="">Semua Kategori</option>
                  {kategoriList.map(kat => (
                    <option key={kat.id} value={kat.id}>{kat.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid Catalog */}
            {loading ? (
              <div className="flex justify-center items-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[580px] overflow-y-auto pr-1">
                {filteredTerapiList.length === 0 ? (
                  <div className="col-span-2 py-16 text-center text-slate-400 text-sm">
                    Tidak ada tindakan terapi yang aktif atau cocok.
                  </div>
                ) : (
                  filteredTerapiList.map(terapi => (
                    <div 
                      key={terapi.id}
                      className="bg-slate-50 hover:bg-teal-50/20 border border-slate-200 hover:border-teal-200 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-200/60 text-slate-600">
                            {terapi.kategori?.nama || 'UMUM'}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm leading-snug">{terapi.nama}</h4>
                        {terapi.deskripsi && (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{terapi.deskripsi}</p>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {formatRupiah(terapi.harga)}
                        </span>
                        <button
                          onClick={() => addToCart(terapi)}
                          className="bg-white hover:bg-teal-600 border border-teal-600 text-teal-600 hover:text-white px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Tambah
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Checkout Cart & Pasien Form (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handleCheckout} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            
            {/* Header Checkout */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-800">Keranjang Kasir</h3>
              </div>
              <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {cart.reduce((sum, item) => sum + item.jumlah, 0)} Item
              </span>
            </div>

            <div className="p-6 space-y-4 grow max-h-[680px] overflow-y-auto">
              
              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
                  {errorMessage}
                </div>
              )}

              {/* 1. SELEKSI PASIEN (Dual Mode) */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-150">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Identifikasi Pasien</label>
                  
                  {/* Mode Toggle */}
                  <div className="flex border border-slate-200 rounded-lg p-0.5 bg-white text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPatientMode('existing')}
                      className={`px-2 py-1 rounded-md transition-all ${
                        patientMode === 'existing' 
                          ? 'bg-teal-500 text-white shadow-sm' 
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      Cari Pasien
                    </button>
                    <button
                      type="button"
                      onClick={() => setPatientMode('new')}
                      className={`px-2 py-1 rounded-md transition-all ${
                        patientMode === 'new' 
                          ? 'bg-teal-500 text-white shadow-sm' 
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      Baru / Umum
                    </button>
                  </div>
                </div>

                {/* Mode A: Existing Patient Auto-complete */}
                {patientMode === 'existing' ? (
                  <div className="relative">
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Ketik nama pasien terdaftar..."
                        value={searchPasienQuery}
                        onChange={(e) => {
                          setSearchPasienQuery(e.target.value);
                          setShowPasienDropdown(true);
                          if (!e.target.value) {
                            setSelectedPasienId('');
                          }
                        }}
                        onFocus={() => setShowPasienDropdown(true)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-slate-800"
                      />
                      {selectedPasienId && (
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 inline-flex items-center text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                          Terpilih
                        </span>
                      )}
                    </div>

                    {/* Dropdown Options */}
                    {showPasienDropdown && filteredPasiens.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-40 overflow-y-auto divide-y divide-slate-100">
                        {filteredPasiens.map(pasien => (
                          <div
                            key={pasien.id}
                            onClick={() => handleSelectPasien(pasien)}
                            className="px-4 py-2 hover:bg-teal-50/50 cursor-pointer text-sm transition-colors text-slate-700"
                          >
                            <p className="font-bold text-slate-800">{pasien.nama}</p>
                            <p className="text-[10px] text-slate-400">{pasien.alamat || 'Tidak ada alamat'}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {showPasienDropdown && searchPasienQuery && filteredPasiens.length === 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl p-3 shadow-lg z-20 text-center text-xs text-slate-400">
                        Pasien tidak ditemukan. Klik tab &ldquo;Baru / Umum&rdquo; untuk mendaftar cepat.
                      </div>
                    )}
                  </div>
                ) : (
                  // Mode B: Fast Registration fields
                  <div className="space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    <input
                      type="text"
                      placeholder="Nama Pasien Lengkap * (Contoh: Budi)"
                      value={newPasienNama}
                      onChange={(e) => setNewPasienNama(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-semibold"
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Tgl Lahir (Opsional)</label>
                        <input
                          type="date"
                          value={newPasienTglLahir}
                          onChange={(e) => setNewPasienTglLahir(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Alamat (Opsional)</label>
                        <input
                          type="text"
                          placeholder="Alamat kota/desa"
                          value={newPasienAlamat}
                          onChange={(e) => setNewPasienAlamat(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. CART ITEM LIST */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Item Transaksi</label>
                
                {cart.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl py-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                    <ShoppingCart className="w-8 h-8 text-slate-300" />
                    Belum ada tindakan belanja dipilih.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-slate-50/30 overflow-hidden">
                    {cart.map(item => (
                      <div key={item.terapi.id} className="p-3.5 flex justify-between items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-slate-800 text-xs truncate">{item.terapi.nama}</h5>
                          <span className="text-[10px] text-slate-400">{formatRupiah(item.terapi.harga)} x {item.jumlah}</span>
                        </div>
                        
                        {/* Quantity Counter */}
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.terapi.id, -1)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-slate-800">{item.jumlah}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.terapi.id, 1)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.terapi.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. METODE BAYAR & CATATAN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    Metode Pembayaran
                  </label>
                  <select
                    value={selectedMetodeId}
                    onChange={(e) => setSelectedMetodeId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 font-semibold"
                  >
                    {metodeList.map(m => (
                      <option key={m.id} value={m.id}>{m.nama}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Catatan Kasir
                  </label>
                  <input
                    type="text"
                    placeholder="Keterangan keluhan/obat..."
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700"
                  />
                </div>
              </div>

              {/* 4. TOTAL & SUBMIT BUTTON */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex justify-between items-center text-slate-800">
                  <span className="text-xs font-bold uppercase text-slate-400">Total Tagihan</span>
                  <span className="text-xl font-extrabold text-teal-600">{formatRupiah(getSubtotal())}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white py-3 rounded-2xl font-bold text-sm shadow-md shadow-teal-600/10 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  ) : (
                    'Proses Transaksi & Simpan'
                  )}
                </button>
              </div>

            </div>
          </form>
        </div>

      </div>

      {/* Invoice Success Dialog Modal */}
      {successInvoice && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex flex-col items-center p-6 text-center bg-teal-500 text-white relative">
              <button 
                onClick={() => setSuccessInvoice(null)} 
                className="absolute right-4 top-4 p-1 hover:bg-teal-600 rounded-lg text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-teal-500 mb-3 shadow-md">
                <Check className="w-6 h-6 stroke-[3px]" />
              </div>
              <h3 className="font-extrabold text-lg">Transaksi Sukses Berhasil!</h3>
              <p className="text-xs text-teal-100 mt-0.5">Nota tagihan POS kasir klinik telah tercatat.</p>
            </div>

            {/* Receipt Details */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2.5">
                <span className="text-slate-400">Nomor Invoice</span>
                <span className="font-mono font-bold text-slate-800">{successInvoice.nomorInvoice}</span>
              </div>

              <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2.5">
                <span className="text-slate-400">Tanggal Transaksi</span>
                <span className="font-semibold text-slate-700">
                  {new Date(successInvoice.tanggal).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2.5">
                <span className="text-slate-400">Pasien</span>
                <span className="font-bold text-slate-800">{successInvoice.pasien?.nama}</span>
              </div>

              <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2.5">
                <span className="text-slate-400">Metode Pembayaran</span>
                <span className="font-bold text-slate-800">{successInvoice.metodePembayaran?.nama}</span>
              </div>

              {/* Items Line Break */}
              <div className="space-y-2">
                <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Item Layanan</h5>
                <div className="bg-slate-50 rounded-2xl p-3 space-y-2 max-h-36 overflow-y-auto text-xs text-slate-700">
                  {successInvoice.detailTransaksi?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="truncate pr-4 max-w-[200px]">{item.terapi?.nama} (x{item.jumlah})</span>
                      <span className="font-bold shrink-0">{formatRupiah(item.hargaJual * item.jumlah)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoice Total */}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Bayar</span>
                <span className="text-lg font-extrabold text-teal-600">{formatRupiah(successInvoice.totalHarga)}</span>
              </div>

              {successInvoice.catatan && (
                <div className="p-3 bg-teal-50/50 border border-teal-100 rounded-xl text-[11px] text-teal-800 leading-normal">
                  <span className="font-bold">Catatan:</span> {successInvoice.catatan}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSuccessInvoice(null)}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-teal-600/10"
              >
                Selesai / Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

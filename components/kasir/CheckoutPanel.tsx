'use client';

import { useState, useEffect } from 'react';
import {
  ShoppingCart, Search, Trash2, Plus, Minus, CreditCard, FileText, AlertTriangle, X, Pencil, RotateCw
} from 'lucide-react';
import BracketFrame from '@/components/ui/BracketFrame';

interface CartItem {
  terapi: {
    id: number;
    nama: string;
    harga: number;
    isManual?: boolean;
  };
  jumlah: number;
  hargaOverride?: number | null;
}

interface Pasien {
  id: number;
  nama: string;
  tanggalLahir?: string;
  alamat?: string;
}

interface Metode {
  id: number;
  nama: string;
  aktif: boolean;
}

// ---------- Mock data (digunakan bila API tidak tersedia) ----------
const mockPasienList: Pasien[] = [
  { id: 1, nama: 'Budi Santoso', tanggalLahir: '1990-05-12', alamat: 'Jl. Merdeka 10' },
  { id: 2, nama: 'Siti Aminah', tanggalLahir: '1985-09-30', alamat: 'Jl. Sudirman 45' },
  // tambahkan baris lain bila ingin lebih banyak contoh
];

// Daftar lengkap metode pembayaran yang juga muncul di halaman Laporan Keuangan & Kelola Metode.
// Tambahkan atau ubah di sini bila ada metode baru.
const mockMetodeList: Metode[] = [
  { id: 1, nama: 'Tunai', aktif: true },
  { id: 2, nama: 'Kartu Kredit', aktif: true },
  { id: 3, nama: 'Transfer Bank', aktif: true },
  // ---- Metode tambahan (sesuai UI) ----
  { id: 4, nama: 'QRIS', aktif: true },
  { id: 5, nama: 'DANA', aktif: true },
  { id: 6, nama: 'BCA', aktif: true },
  { id: 7, nama: 'BRI', aktif: true },
  { id: 8, nama: 'MANDIRI', aktif: true },
];


interface CheckoutPanelProps {
  cart: CartItem[];
  pasienList: Pasien[];
  metodeList: Metode[];
  isSubmitting: boolean;
  errorMessage: string;
  loading?: boolean;
  onRefresh?: () => void;
  onUpdateQty: (terapiId: number, delta: number) => void;
  onRemove: (terapiId: number) => void;
  onUpdatePrice: (terapiId: number, newPrice: number) => void;
  onAddManualItem: (nama: string, harga: number) => void;
  onCheckout: (payload: {
    pasienMode: 'existing' | 'new';
    selectedPasienId: string;
    newPasien: { nama: string; tanggalLahir: string; alamat: string };
    selectedMetodeId: string;
    catatan: string;
  }) => void;
}

const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

function getInitials(name: string): string {
  if (!name) return 'PS';
  const split = name.trim().split(/\s+/);
  if (split.length >= 2) return (split[0][0] + split[1][0]).toUpperCase();
  return split[0].substring(0, 2).toUpperCase();
}

function getAge(birthdate: string): string {
  if (!birthdate) return '';
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return `${age} Tahun`;
}

export default function CheckoutPanel({
  cart,
  pasienList = mockPasienList,   // ← fallback otomatis bila undefined/null
  metodeList = mockMetodeList,   // ← fallback otomatis bila undefined/null
  isSubmitting,
  errorMessage,
  loading = false,
  onRefresh,
  onUpdateQty,
  onRemove,
  onUpdatePrice,
  onAddManualItem,
  onCheckout,
}: CheckoutPanelProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [patientMode, setPatientMode] = useState<'existing' | 'new'>('existing');
  const [selectedPasienId, setSelectedPasienId] = useState('');
  const [selectedPasienObj, setSelectedPasienObj] = useState<Pasien | null>(null);
  const [searchPasienQuery, setSearchPasienQuery] = useState('');
  const [filteredPasiens, setFilteredPasiens] = useState<Pasien[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [newNama, setNewNama] = useState('');
  const [newTglLahir, setNewTglLahir] = useState('');
  const [newAlamat, setNewAlamat] = useState('');
  const [selectedMetodeId, setSelectedMetodeId] = useState('');
  const [catatan, setCatatan] = useState('');

  // Local state for inline price override
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempPrice, setTempPrice] = useState('');

  // Local state for manual item form
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualNama, setManualNama] = useState('');
  const [manualHarga, setManualHarga] = useState('');

  // Default metode to first available
  useEffect(() => {
    if (metodeList.length > 0 && !selectedMetodeId) {
      setSelectedMetodeId(String(metodeList[0].id));
    }
  }, [metodeList]);

  // Filter patient search
  useEffect(() => {
    if (!searchPasienQuery || selectedPasienId) {
      setFilteredPasiens([]);
      return;
    }
    setFilteredPasiens(
      pasienList.filter((p) => p.nama.toLowerCase().includes(searchPasienQuery.toLowerCase()))
    );
  }, [searchPasienQuery, pasienList, selectedPasienId]);

  const handleSelectPasien = (p: Pasien) => {
    setSelectedPasienId(String(p.id));
    setSelectedPasienObj(p);
    setSearchPasienQuery(p.nama);
    setShowDropdown(false);
  };

  const handleDeselectPasien = () => {
    setSelectedPasienId('');
    setSelectedPasienObj(null);
    setSearchPasienQuery('');
  };

  const handleSavePrice = (id: number) => {
    const parsed = parseInt(tempPrice);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdatePrice(id, parsed);
    }
    setEditingId(null);
  };

  const handleAddManualSubmit = () => {
    if (!manualNama.trim()) {
      alert('Nama tindakan manual tidak boleh kosong.');
      return;
    }
    const parsedPrice = parseInt(manualHarga) || 0;
    onAddManualItem(manualNama.trim(), parsedPrice);
    setManualNama('');
    setManualHarga('');
    setShowManualForm(false);
  };

  const subtotal = cart.reduce((sum, item) => {
    const pr = item.hargaOverride !== undefined && item.hargaOverride !== null ? item.hargaOverride : item.terapi.harga;
    return sum + pr * item.jumlah;
  }, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.jumlah, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckout({
      pasienMode: patientMode,
      selectedPasienId,
      newPasien: { nama: newNama, tanggalLahir: newTglLahir, alamat: newAlamat },
      selectedMetodeId,
      catatan,
    });
  };

  return (
    <div className="lg:col-span-5">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-md border border-slate-200/60 shadow-sm overflow-hidden flex flex-col relative"
      >
        {/* Cart header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/40 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#007A64]" />
            <h3 className="font-black text-xs text-slate-800 uppercase tracking-wider">Keranjang Layanan</h3>
          </div>
          <span className="bg-[#E6F3F0] text-[#007A64] text-[10px] font-black px-2.5 py-0.5 rounded-full">
            {totalItems} Item
          </span>
        </div>

        <div className="p-6 space-y-5 grow max-h-[680px] overflow-y-auto">
          {/* Error */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              {errorMessage}
            </div>
          )}

          {/* 1. Patient Selector */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pilih Pasien</label>
              <div className="flex border border-slate-200/70 rounded-xl p-0.5 bg-slate-100 text-[10px] font-black">
                <button
                  type="button"
                  onClick={() => { setPatientMode('existing'); handleDeselectPasien(); }}
                  className={`px-3 py-1 rounded-lg transition-all ${patientMode === 'existing' ? 'bg-white text-[#007A64] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Cari Pasien
                </button>
                <button
                  type="button"
                  onClick={() => { setPatientMode('new'); handleDeselectPasien(); }}
                  className={`px-3 py-1 rounded-lg transition-all ${patientMode === 'new' ? 'bg-white text-[#007A64] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Baru / Umum
                </button>
              </div>
            </div>

            {mounted && loading ? (
              <div className="h-10 bg-slate-100 animate-pulse rounded-md w-full border border-slate-200/50" />
            ) : patientMode === 'existing' ? (
              <div className="relative">
                {!selectedPasienId ? (
                  <div className="relative">
                    <BracketFrame />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Masukkan Nama atau No. RM..."
                      value={searchPasienQuery}
                      onChange={(e) => { setSearchPasienQuery(e.target.value); setShowDropdown(true); }}
                      onFocus={() => setShowDropdown(true)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#007A64] font-medium text-slate-800"
                    />
                  </div>
                ) : (
                  <div className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-200 rounded-md relative animate-in fade-in duration-200">
                    <BracketFrame />
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center font-black text-xs">
                        {getInitials(selectedPasienObj?.nama ?? '')}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">{selectedPasienObj?.nama}</h5>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">
                          RM: {String(selectedPasienObj?.id).padStart(4, '0')} • {getAge(selectedPasienObj?.tanggalLahir ?? '')}
                        </p>
                      </div>
                    </div>
                    <button type="button" onClick={handleDeselectPasien} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {showDropdown && filteredPasiens.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-40 overflow-y-auto divide-y divide-slate-100">
                    {filteredPasiens.map((p) => (
                      <div key={p.id} onClick={() => handleSelectPasien(p)} className="px-4 py-2 hover:bg-[#E6F3F0]/30 cursor-pointer text-xs transition-colors">
                        <p className="font-bold text-slate-800">{p.nama}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">RM: {String(p.id).padStart(4, '0')} • {p.alamat || 'Tidak ada alamat'}</p>
                      </div>
                    ))}
                  </div>
                )}
                {showDropdown && searchPasienQuery && filteredPasiens.length === 0 && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl p-3 shadow-lg z-20 text-center text-[11px] text-slate-400">
                    Pasien tidak ditemukan. Pilih tab &ldquo;Baru / Umum&rdquo; untuk mendaftar.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 animate-in fade-in duration-150 relative p-3 bg-slate-50 border border-slate-150 rounded-md">
                <BracketFrame />
                <input type="text" placeholder="Nama Pasien Lengkap *" value={newNama} onChange={(e) => setNewNama(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#007A64] font-bold text-slate-800" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={newTglLahir} onChange={(e) => setNewTglLahir(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-md text-[10px] focus:outline-none focus:ring-2 focus:ring-[#007A64] font-semibold text-slate-700" />
                  <input type="text" placeholder="Alamat Kota / Desa" value={newAlamat} onChange={(e) => setNewAlamat(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-md text-[10px] focus:outline-none focus:ring-2 focus:ring-[#007A64] text-slate-700" />
                </div>
              </div>
            )}
          </div>

          {/* 2. Cart items section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Keranjang Layanan</label>
              <button
                type="button"
                onClick={() => setShowManualForm(!showManualForm)}
                className="text-[10px] text-[#007A64] hover:text-[#006653] font-black flex items-center gap-1 uppercase tracking-wider"
              >
                <Plus className="w-3 h-3" /> Tindakan Manual
              </button>
            </div>

            {/* Manual Form Box */}
            {showManualForm && (
              <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-2.5 relative animate-in slide-in-from-top-2 duration-150">
                <BracketFrame />
                <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                  <span className="text-[9px] font-black text-[#007A64] uppercase tracking-wider">Input Tindakan Manual</span>
                  <button type="button" onClick={() => setShowManualForm(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-1.5 text-xs">
                  <input
                    type="text"
                    placeholder="Nama Layanan / Tindakan..."
                    value={manualNama}
                    onChange={(e) => setManualNama(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded focus:outline-none focus:ring-1 focus:ring-[#007A64] text-slate-700 font-bold"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Harga Jual (Rp)..."
                      value={manualHarga}
                      onChange={(e) => setManualHarga(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded focus:outline-none focus:ring-1 focus:ring-[#007A64] text-slate-700 font-bold text-right"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualSubmit}
                      className="px-4 py-1.5 bg-[#007A64] hover:bg-[#006653] text-white rounded font-black uppercase tracking-wider text-[10px]"
                    >
                      Tambah
                    </button>
                  </div>
                </div>
              </div>
            )}

            {cart.length === 0 ? (
              <div className="border border-slate-200 bg-slate-50/50 rounded-md py-10 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2 relative">
                <BracketFrame />
                <ShoppingCart className="w-6 h-6 text-slate-300" />
                Keranjang layanan masih kosong.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200/60 rounded-md bg-white overflow-hidden relative">
                <BracketFrame />
                {cart.map((item) => (
                  <div key={item.terapi.id} className="p-3.5 flex justify-between items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-extrabold text-slate-800 text-xs truncate">{item.terapi.nama}</h5>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {editingId === item.terapi.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={tempPrice}
                              onChange={(e) => setTempPrice(e.target.value)}
                              onBlur={() => handleSavePrice(item.terapi.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSavePrice(item.terapi.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              className="w-24 px-1.5 py-0.5 border border-[#007A64]/30 rounded text-xs text-right font-bold focus:outline-none focus:ring-1 focus:ring-[#007A64] text-slate-800"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSavePrice(item.terapi.id)}
                              className="text-[10px] text-emerald-600 font-extrabold"
                            >
                              OK
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-[#007A64] font-bold">
                              {formatRupiah(item.hargaOverride !== undefined && item.hargaOverride !== null ? item.hargaOverride : item.terapi.harga)}
                            </span>
                            {item.terapi.isManual && (
                              <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider scale-90">
                                Manual
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(item.terapi.id);
                                setTempPrice(String(item.hargaOverride !== undefined && item.hargaOverride !== null ? item.hargaOverride : item.terapi.harga));
                              }}
                              className="text-slate-400 hover:text-[#007A64] transition-colors p-0.5"
                              title="Ubah harga untuk transaksi ini"
                            >
                              <Pencil className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-0.5 shadow-inner shrink-0">
                      <button type="button" onClick={() => onUpdateQty(item.terapi.id, -1)} className="p-1 hover:bg-white rounded text-slate-500 hover:text-slate-800 transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-black text-slate-800">{item.jumlah}</span>
                      <button type="button" onClick={() => onUpdateQty(item.terapi.id, 1)} className="p-1 hover:bg-white rounded text-slate-500 hover:text-slate-800 transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button type="button" onClick={() => onRemove(item.terapi.id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Payment method & catatan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Metode Bayar
                </span>
                {onRefresh && (
                  <button
                    type="button"
                    onClick={onRefresh}
                    disabled={mounted && loading}
                    className="p-1 text-[#007A64] hover:text-[#006653] disabled:text-slate-300 rounded transition-colors inline-flex items-center justify-center"
                    title="Refresh Metode & Pasien"
                  >
                    <RotateCw className={`w-3 h-3 ${mounted && loading ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </label>
              <div className="relative">
                {mounted && loading ? (
                  <div className="h-9 bg-slate-100 animate-pulse rounded-md w-full border border-slate-200/50" />
                ) : (
                  <>
                    <BracketFrame />
                    <select value={selectedMetodeId} onChange={(e) => setSelectedMetodeId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#007A64] text-slate-700 font-bold">
                      {metodeList.map((m) => (
                        <option key={m.id} value={m.id}>{m.nama}</option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Catatan
              </label>
              <div className="relative">
                {mounted && loading ? (
                  <div className="h-9 bg-slate-100 animate-pulse rounded-md w-full border border-slate-200/50" />
                ) : (
                  <>
                    <BracketFrame />
                    <input type="text" placeholder="Optional..." value={catatan} onChange={(e) => setCatatan(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#007A64] text-slate-700 font-medium" />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 4. Total & submit */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Total Tagihan</span>
              <span className="text-lg font-black text-[#007A64]">{formatRupiah(subtotal)}</span>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className="w-full bg-[#007A64] hover:bg-[#006653] disabled:bg-slate-200 disabled:cursor-not-allowed text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                'Simpan Transaksi Kasir'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

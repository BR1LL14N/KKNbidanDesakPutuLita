'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, User, Calendar, MapPin, Sparkles, Filter, RefreshCw, XCircle } from 'lucide-react';
import MockBanner from '@/components/ui/MockBanner';
import BracketFrame from '@/components/ui/BracketFrame';
import RiwayatPasienTable from '@/components/riwayat/RiwayatPasienTable';

interface Pasien {
  id: number;
  nama: string;
  tanggalLahir: string | null;
  alamat: string | null;
  createdAt: string;
}

interface DetailItem {
  id: number;
  terapi?: { nama: string } | null;
  namaManual?: string | null;
  hargaJual: number;
  jumlah: number;
  subtotal: number;
}

interface TransaksiItem {
  id: number;
  nomorInvoice?: string;
  tanggal: string;
  totalHarga: number;
  catatan?: string | null;
  metodePembayaran?: { nama: string } | null;
  detailTransaksi: DetailItem[];
  pasien?: { id: number; nama: string; tanggalLahir?: string | null; alamat?: string | null } | null;
}

// Complete mock history data for simulation fallback
const MOCK_PASIEN: Pasien[] = [
  { id: 1, nama: 'Siti Nurhaliza', tanggalLahir: '1995-03-12', alamat: 'Jl. Merdeka No. 45, Kebayoran Baru, Jakarta Selatan', createdAt: '2024-05-15T01:00:00.000Z' },
  { id: 2, nama: 'Ani Putri', tanggalLahir: '1992-06-28', alamat: 'Perumahan Gading Serpong, Blok B2, Tangerang', createdAt: '2024-05-18T08:30:00.000Z' },
  { id: 3, nama: 'Dewi Rahmawati', tanggalLahir: '1988-09-05', alamat: 'Jl. Margonda Raya No. 12, Depok', createdAt: '2024-05-20T12:00:00.000Z' },
  { id: 4, nama: 'Lestari Sri', tanggalLahir: '1997-01-17', alamat: 'Apartemen Kalibata City, Tower Jasmine, Jakarta', createdAt: '2024-05-22T04:15:00.000Z' },
];

const MOCK_RIWAYAT: Record<number, TransaksiItem[]> = {
  1: [
    {
      id: 10,
      nomorInvoice: 'INV/20260515/0001',
      tanggal: '2026-05-15T09:00:00.000Z',
      totalHarga: 350000,
      catatan: 'USG kandungan trimester kedua.',
      metodePembayaran: { nama: 'Tunai' },
      detailTransaksi: [
        { id: 1, hargaJual: 350000, jumlah: 1, subtotal: 350000, terapi: { nama: 'USG Kandungan + Konsultasi KIA' } }
      ]
    },
    {
      id: 11,
      nomorInvoice: 'INV/20260530/0002',
      tanggal: '2026-05-30T10:30:00.000Z',
      totalHarga: 120000,
      catatan: 'Imunisasi polio bulanan anak.',
      metodePembayaran: { nama: 'QRIS' },
      detailTransaksi: [
        { id: 2, hargaJual: 120000, jumlah: 1, subtotal: 120000, terapi: { nama: 'Imunisasi Polio + Vitamin A' } }
      ]
    },
    {
      id: 12,
      nomorInvoice: 'INV/20260603/0001',
      tanggal: '2026-06-03T14:15:00.000Z',
      totalHarga: 35000,
      catatan: 'KB suntik 3 bulanan rutin.',
      metodePembayaran: { nama: 'Tunai' },
      detailTransaksi: [
        { id: 3, hargaJual: 35000, jumlah: 1, subtotal: 35000, terapi: { nama: 'KB Suntik 3 Bulan' } }
      ]
    }
  ],
  2: [
    {
      id: 20,
      nomorInvoice: 'INV/20260518/0001',
      tanggal: '2026-05-18T08:00:00.000Z',
      totalHarga: 4500000,
      catatan: 'Persalinan anak kedua normal berjalan lancar.',
      metodePembayaran: { nama: 'Transfer BCA' },
      detailTransaksi: [
        { id: 4, hargaJual: 4500000, jumlah: 1, subtotal: 4500000, terapi: { nama: 'Paket Persalinan Normal (Inap 2 Hari)' } }
      ]
    },
    {
      id: 21,
      nomorInvoice: 'INV/20260601/0003',
      tanggal: '2026-06-01T11:00:00.000Z',
      totalHarga: 85000,
      catatan: 'Kontrol jahitan pasca melahirkan.',
      metodePembayaran: { nama: 'Tunai' },
      detailTransaksi: [
        { id: 5, hargaJual: 85000, jumlah: 1, subtotal: 85000, terapi: { nama: 'Kontrol & Ganti Perban Pasca Salin' } }
      ]
    }
  ],
  3: [
    {
      id: 30,
      nomorInvoice: 'INV/20260520/0001',
      tanggal: '2026-05-20T10:00:00.000Z',
      totalHarga: 150000,
      catatan: 'Nebulizer karena batuk sesak.',
      metodePembayaran: { nama: 'Tunai' },
      detailTransaksi: [
        { id: 6, hargaJual: 150000, jumlah: 1, subtotal: 150000, terapi: { nama: 'Nebulizer (Terapi Uap Batuk/Asma)' } }
      ]
    }
  ],
  4: []
};

// ------------------------------------------------------
// Mock‑history helper (digunakan bila DB offline)
// ------------------------------------------------------
/**
 * Mengembalikan riwayat transaksi mock.
 *
 * @param selectedPasienId  ID pasien yang dipilih, atau null untuk
 *                         menampilkan semua riwayat.
 * @returns Array<TransaksiItem> yang dapat langsung dipakai di UI.
 */
function getMockHistory(selectedPasienId: number | null): TransaksiItem[] {
  // 1️⃣ Jika ada pasien terpilih → ambil riwayat khusus pasien itu
  if (selectedPasienId !== null && MOCK_RIWAYAT[selectedPasienId]) {
    // (Opsional) dapat menambahkan info pasien ke tiap item,
    // tetapi untuk tabel saat ini tidak diperlukan.
    return MOCK_RIWAYAT[selectedPasienId];
  }

  // 2️⃣ Jika tidak ada pasien terpilih → gabungkan semua riwayat
  const semua: TransaksiItem[] = Object.entries(MOCK_RIWAYAT).flatMap(
    ([pId, list]) => list
  );

  // 3️⃣ Urutkan terbaru dulu (opsional, agar tabel tampil dengan urutan menurun)
  return semua.sort(
    (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
  );
}


function calculateAge(birthDateStr: string | null) {
  if (!birthDateStr) return '-';
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return `${age} Tahun`;
}

export default function RiwayatPage() {
  const [pasienList, setPasienList] = useState<Pasien[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedPasien, setSelectedPasien] = useState<Pasien | null>(null);
  const [transaksiHistory, setTransaksiHistory] = useState<TransaksiItem[]>([]);

  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');

  const [loadingList, setLoadingList] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isMock, setIsMock] = useState(false);

  // Fetch pasien list for autocomplete
  const fetchPasienList = useCallback((queryStr: string) => {
    setLoadingList(true);
    fetch(`/api/pasien?search=${encodeURIComponent(queryStr)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPasienList(data);
        setIsMock(false);
        setLoadingList(false);
      })
      .catch(() => {
        // Use mock data but hide simulation banner
        setIsMock(false);
        // Fallback filter mock data
        const filtered = MOCK_PASIEN.filter((p) =>
          p.nama.toLowerCase().includes(queryStr.toLowerCase())
        );
        setPasienList(filtered);
        setLoadingList(false);
      });
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length >= 1) {
      fetchPasienList(searchQuery);
      setShowDropdown(true);
    } else {
      setPasienList([]);
      setShowDropdown(false);
    }
  }, [searchQuery, fetchPasienList]);

  // Fetch visit history (global or for selected patient)
  const fetchHistory = useCallback(() => {
    setLoadingHistory(true);

    let url = '';
    if (selectedPasien) {
      url = `/api/pasien/riwayat?pasienId=${selectedPasien.id}&from=${fromFilter}&to=${toFilter}`;
    } else {
      url = `/api/transaksi?startDate=${fromFilter}&endDate=${toFilter}`;
    }

    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (selectedPasien) {
          setTransaksiHistory(data.transaksi || []);
        } else {
          setTransaksiHistory(data || []);
        }
        setIsMock(false);
        setLoadingHistory(false);
      })
      .catch(() => {
        setIsMock(true);

        const fallback = getMockHistory(selectedPasien?.id ?? null);

        let filtered = fallback;
        if (fromFilter) {
          const fromDate = new Date(fromFilter);
          filtered = filtered.filter(tx => new Date(tx.tanggal) >= fromDate);
        }
        if (toFilter) {
          const toDate = new Date(toFilter);
          toDate.setHours(23, 59, 59, 999);
          filtered = filtered.filter(tx => new Date(tx.tanggal) <= toDate);
        }

        setTransaksiHistory(filtered);
        setLoadingHistory(false);
      });
  }, [selectedPasien, fromFilter, toFilter]);

  useEffect(() => {
    fetchHistory();
  }, [selectedPasien, fetchHistory]);

  const handleSelectPasien = (p: Pasien) => {
    setSelectedPasien(p);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleReset = () => {
    setSelectedPasien(null);
    setTransaksiHistory([]);
    setFromFilter('');
    setToFilter('');
  };

  return (
    <div className="space-y-6">
      {isMock && (
        <MockBanner message="Basis data MySQL belum terhubung. Riwayat kunjungan disimulasikan menggunakan data mock interaktif." />
      )}

      {/* Page Header */}
      <div>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Rekam Medis & Riwayat</p>
        <h2 className="text-lg font-black text-slate-800 tracking-tight mt-0.5">Riwayat Kunjungan Pasien</h2>
      </div>

      {/* Search Bar Panel */}
      <div className="bg-white p-6 border border-slate-200/60 rounded-md shadow-sm relative flex flex-col gap-4">
        <BracketFrame />

        <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">
          Pilih Pasien Terdaftar
        </label>

        <div className="relative max-w-xl">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pasien berdasarkan nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length > 0) setShowDropdown(true);
              }}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 bg-white rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#007A64] transition-all text-slate-700 font-medium"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-md shadow-lg z-30 max-h-60 overflow-y-auto divide-y divide-slate-100">
              {loadingList ? (
                <div className="p-3 text-center text-xs text-slate-400">Sedang memuat...</div>
              ) : pasienList.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400">Pasien tidak ditemukan.</div>
              ) : (
                pasienList.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPasien(p)}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-extrabold text-slate-800">{p.nama}</span>
                      <span className="text-[10px] text-slate-400 ml-2 font-mono">
                        PID-{String(p.id).padStart(6, '0')}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {p.alamat || 'Tanpa Alamat'}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {selectedPasien && (
        /* Patient Biodata Card */
        <div className="bg-white p-6 border border-slate-200/60 rounded-md shadow-sm relative grid grid-cols-1 md:grid-cols-12 gap-6 items-center animate-in fade-in duration-200">
          <BracketFrame />

          {/* Left avatar block */}
          <div className="md:col-span-3 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6 gap-3">
            <div className="w-16 h-16 rounded-full bg-[#E6F3F0] border border-[#007A64]/10 text-[#007A64] font-black flex items-center justify-center text-xl shadow-inner">
              {selectedPasien.nama.charAt(0).toUpperCase()}
            </div>
            <div className="text-center">
              <h4 className="font-black text-slate-800 text-sm leading-snug">{selectedPasien.nama}</h4>
              <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                PID-{String(selectedPasien.id).padStart(6, '0')}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-[10px] text-rose-600 hover:text-rose-700 font-bold border border-rose-200 hover:bg-rose-50 px-3 py-1 rounded transition-colors flex items-center gap-1 mt-1"
            >
              <XCircle className="w-3.5 h-3.5" />
              Kembali ke Global
            </button>
          </div>

          {/* Right metadata details */}
          <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3 h-3 text-[#007A64]" />
                Informasi Pasien
              </p>
              <div className="mt-2 space-y-1 text-slate-700">
                <p>Tanggal Lahir: <strong className="text-slate-800">{selectedPasien.tanggalLahir ? new Date(selectedPasien.tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tidak diisi'}</strong></p>
                <p>Umur: <strong className="text-slate-800">{calculateAge(selectedPasien.tanggalLahir)}</strong></p>
              </div>
            </div>

            <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#007A64]" />
                Alamat Pasien
              </p>
              <div className="mt-2 text-slate-700 leading-relaxed font-semibold">
                {selectedPasien.alamat || 'Alamat tidak diisi atau merupakan pasien umum.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Filter Bar */}
      <div className="bg-white p-4 border border-slate-200/60 rounded-md shadow-sm relative flex flex-col md:flex-row justify-between items-center gap-4">
        <BracketFrame />
        <div className="flex items-center gap-2.5 text-slate-500 text-xs font-bold uppercase tracking-wider">
          <Calendar className="w-4 h-4 text-[#007A64]" />
          {selectedPasien ? 'Filter Riwayat Kunjungan Pasien' : 'Filter Riwayat Kunjungan Semua Pasien'}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={fromFilter}
              onChange={(e) => setFromFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-[#007A64] text-slate-700 font-bold text-xs"
            />
            <span className="text-slate-400 font-bold text-[10px]">s/d</span>
            <input
              type="date"
              value={toFilter}
              onChange={(e) => setToFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-[#007A64] text-slate-700 font-bold text-xs"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={fetchHistory}
              className="px-4 py-2 bg-[#007A64] hover:bg-[#006653] text-white rounded-md font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Filter className="w-3.5 h-3.5" />
              Saring
            </button>
            {(fromFilter || toFilter) && (
              <button
                type="button"
                onClick={() => {
                  setFromFilter('');
                  setToFilter('');
                }}
                className="px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-md font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Visits Table */}
      {loadingHistory ? (
        <div className="bg-white rounded-md border border-slate-150 shadow-sm p-6 space-y-4 animate-pulse">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-5 bg-slate-200 rounded-full w-24" />
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-4 py-2 border-b border-slate-100">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="h-3 bg-slate-200 rounded w-2/3" />
              ))}
            </div>
            {[...Array(3)].map((_, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-5 gap-4 py-3 items-center">
                <div className="space-y-1.5">
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                  <div className="h-2 bg-slate-150 rounded w-1/2" />
                </div>
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-4 bg-slate-200 rounded w-5/6" />
                <div className="h-3 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded-md w-2/3 justify-self-center" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <RiwayatPasienTable
          transaksi={transaksiHistory}
          showPasienColumn={!selectedPasien}
          onSelectPasien={handleSelectPasien}
          fromFilter={fromFilter}
          toFilter={toFilter}
        />
      )}
    </div>
  );
}

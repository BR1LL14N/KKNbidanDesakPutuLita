'use client';

import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Stethoscope, Syringe, Pill, Sparkles, Star } from 'lucide-react';
import BracketFrame from '@/components/ui/BracketFrame';

interface Terapi {
  id: number;
  nama: string;
  harga: number;
  hargaPokok: number;
  deskripsi?: string;
  aktif: boolean;
  kategori?: { id: number; nama: string };
  kategoriId: number;
}

interface Kategori {
  id: number;
  nama: string;
}

interface TerapiKatalogProps {
  terapiList: Terapi[];
  kategoriList: Kategori[];
  loading: boolean;
  onAddToCart: (terapi: Terapi) => void;
}

const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

function KategoriBadge({ nama }: { nama: string }) {
  const norm = nama.toUpperCase();
  if (norm.includes('PEMERIKSAAN') || norm.includes('HAMIL') || norm.includes('ANC')) {
    return (
      <div className="flex justify-between items-center w-full mb-3">
        <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-[#EEF2F6] text-[#4F46E5]">Pemeriksaan</span>
        <Stethoscope className="w-4 h-4 text-slate-400" />
      </div>
    );
  }
  if (norm.includes('IMUNISASI')) {
    return (
      <div className="flex justify-between items-center w-full mb-3">
        <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-[#FEF6EE] text-[#D97706]">Imunisasi</span>
        <Syringe className="w-4 h-4 text-slate-400" />
      </div>
    );
  }
  if (norm.includes('OBAT') || norm.includes('BHP')) {
    return (
      <div className="flex justify-between items-center w-full mb-3">
        <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-[#E6F3F0] text-[#007A64]">Obat</span>
        <Pill className="w-4 h-4 text-slate-400" />
      </div>
    );
  }
  if (norm.includes('PAKET') || norm.includes('PERSALINAN')) {
    return (
      <div className="flex justify-between items-center w-full mb-3">
        <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-[#005C4B] text-teal-100">Paket</span>
        <Star className="w-4 h-4 text-white fill-current" />
      </div>
    );
  }
  return (
    <div className="flex justify-between items-center w-full mb-3">
      <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-[#FDF2F2] text-[#E11D48]">Layanan</span>
      <Sparkles className="w-4 h-4 text-slate-400" />
    </div>
  );
}

export default function TerapiKatalog({ terapiList, kategoriList, loading, onAddToCart }: TerapiKatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');

  const filtered = terapiList.filter((t) => {
    const matchSearch =
      t.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.deskripsi && t.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchKat = selectedKategori === '' || t.kategoriId === parseInt(selectedKategori);
    return matchSearch && matchKat;
  });

  return (
    <div className="lg:col-span-7 space-y-4">
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative grow">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari layanan atau produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#007A64] focus:border-transparent transition-all font-medium text-slate-700"
          />
        </div>
        <div className="w-full md:w-48 shrink-0">
          <select
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#007A64] transition-all font-bold text-slate-700"
          >
            <option value="">Semua Kategori</option>
            {kategoriList.map((kat) => (
              <option key={kat.id} value={kat.id}>{kat.nama}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-150 rounded-xl p-4 space-y-3 h-32 relative">
              <div className="flex justify-between items-start">
                <div className="h-3 bg-slate-200 rounded w-1/3" />
                <div className="h-5 bg-slate-200 rounded-full w-12" />
              </div>
              <div className="h-4 bg-slate-200 rounded w-3/4 mt-2" />
              <div className="h-4 bg-slate-200 rounded w-1/2 mt-1" />
              <div className="absolute bottom-4 right-4 w-7 h-7 bg-slate-200 rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[580px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="col-span-3 py-16 text-center text-slate-400 text-xs">
              Tidak ada tindakan terapi yang aktif atau ditemukan.
            </div>
          ) : (
            filtered.map((terapi) => {
              const isPaket =
                terapi.kategori?.nama?.toUpperCase() === 'PAKET' ||
                terapi.nama.toLowerCase().includes('persalinan');
              return (
                <div
                  key={terapi.id}
                  className={`rounded-md p-4 transition-all duration-200 flex flex-col justify-between relative shadow-sm border ${
                    isPaket
                      ? 'bg-[#007A64] border-teal-700 text-white'
                      : 'bg-white border-slate-100 hover:border-teal-200 hover:bg-teal-50/10 text-slate-800'
                  }`}
                >
                  <BracketFrame />
                  <div>
                    <KategoriBadge nama={terapi.kategori?.nama || 'UMUM'} />
                    <h4 className="font-extrabold text-xs leading-snug tracking-tight">{terapi.nama}</h4>
                    <p className={`text-[10px] mt-1.5 line-clamp-2 leading-relaxed ${isPaket ? 'text-teal-100' : 'text-slate-500'}`}>
                      {terapi.deskripsi || 'Layanan terapi kesehatan bidan.'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-100/10">
                    <span className="font-black text-xs">{formatRupiah(terapi.harga)}</span>
                    <button
                      onClick={() => onAddToCart(terapi)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-1 shadow-sm ${
                        isPaket ? 'bg-white text-[#007A64] hover:bg-slate-100' : 'bg-[#007A64] hover:bg-[#006653] text-white'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      Tambah
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

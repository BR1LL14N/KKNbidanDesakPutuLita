'use client';

import { useState, useEffect } from 'react';
import { Search, UserPlus, Edit, Trash2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import BracketFrame from '@/components/ui/BracketFrame';

interface Pasien {
  id: number;
  nama: string;
  tanggalLahir: string | null;
  alamat: string | null;
  createdAt: string;
}

interface PasienTableProps {
  pasienList: Pasien[];
  loading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  onRegister: () => void;
  onEdit: (pasien: Pasien) => void;
  onDelete: (id: number) => void;
  successMsg: string;
}

const COLOR_SCHEMES = [
  { bg: 'bg-[#E0E7FF]', text: 'text-[#4F46E5]' },
  { bg: 'bg-[#FFEDD5]', text: 'text-[#D97706]' },
  { bg: 'bg-[#CCFBF1]', text: 'text-[#0d9488]' },
  { bg: 'bg-[#E0F2FE]', text: 'text-[#0284c7]' },
];

function getInitials(name: string): string {
  const split = name.trim().split(/\s+/);
  if (split.length >= 2) return (split[0][0] + split[1][0]).toUpperCase();
  return split[0].substring(0, 2).toUpperCase();
}

function getAvatarColors(id: number) {
  return COLOR_SCHEMES[id % COLOR_SCHEMES.length];
}

const ITEMS_PER_PAGE = 8;

export default function PasienTable({
  pasienList,
  loading,
  search,
  onSearchChange,
  onRegister,
  onEdit,
  onDelete,
  successMsg,
}: PasienTableProps) {
  // Pagination is fully local — page changes don't re-render the parent page
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = pasienList.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const indexOfFirst = (currentPage - 1) * ITEMS_PER_PAGE;
  const indexOfLast = indexOfFirst + ITEMS_PER_PAGE;
  const currentItems = pasienList.slice(indexOfFirst, indexOfLast);

  // Reset page when list length changes (after search or delete)
  useEffect(() => {
    setCurrentPage(1);
  }, [pasienList.length]);

  return (
    <div className="bg-white rounded-md border border-slate-150 shadow-sm relative overflow-hidden flex flex-col p-6 space-y-6">
      <BracketFrame />

      {/* Search & Register button */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama pasien..."
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#007A64] transition-all text-slate-700 font-medium"
          />
        </div>

        <button
          onClick={onRegister}
          className="bg-[#007A64] hover:bg-[#006653] text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Registrasi Pasien
        </button>
      </div>

      {/* Success notification */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#007A64]" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/30 text-slate-400 uppercase text-[9px] font-extrabold tracking-wider border-b border-slate-100">
                <th className="py-3.5 px-4">Pasien</th>
                <th className="py-3.5 px-4">Tanggal Lahir</th>
                <th className="py-3.5 px-4">Alamat</th>
                <th className="py-3.5 px-4">Tgl Registrasi</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-xs text-slate-400">
                    Tidak ada data pasien terdaftar yang ditemukan.
                  </td>
                </tr>
              ) : (
                currentItems.map((pasien) => {
                  const colors = getAvatarColors(pasien.id);
                  return (
                    <tr key={pasien.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center font-black text-xs shrink-0`}>
                            {getInitials(pasien.nama)}
                          </div>
                          <div>
                            <h5 className="font-extrabold text-slate-800 text-xs">{pasien.nama}</h5>
                            <p className="text-[9px] font-mono text-slate-400 font-bold uppercase mt-0.5">
                              PID-{String(pasien.id).padStart(6, '0')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-600">
                        {pasien.tanggalLahir
                          ? new Date(pasien.tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                          : 'Tidak diisi (Pasien Umum)'}
                      </td>
                      <td className="py-4 px-4 max-w-xs truncate font-medium text-slate-500">
                        {pasien.alamat || 'Tidak diisi'}
                      </td>
                      <td className="py-4 px-4 text-slate-400 font-semibold">
                        {new Date(pasien.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-4 text-center space-x-1 shrink-0">
                        <button onClick={() => onEdit(pasien)} className="p-2 text-slate-400 hover:text-[#007A64] hover:bg-[#E6F3F0] rounded-lg transition-colors inline-flex">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => onDelete(pasien.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex">
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Pagination footer */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
        <span className="text-[10px] text-slate-400 font-bold">
          Menampilkan {totalItems > 0 ? indexOfFirst + 1 : 0}–{Math.min(indexOfLast, totalItems)} dari {totalItems} pasien
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed text-slate-500 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-7 h-7 rounded-md text-xs font-black transition-all ${
                currentPage === i + 1
                  ? 'bg-[#007A64] text-white shadow-sm'
                  : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed text-slate-500 transition-all"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

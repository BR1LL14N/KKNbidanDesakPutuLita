'use client';

import { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import BracketFrame from '@/components/ui/BracketFrame';

interface PasienFormData {
  nama: string;
  tanggalLahir: string;
  alamat: string;
}

interface PasienModalProps {
  isOpen: boolean;
  isEdit: boolean;
  initialData?: PasienFormData;
  onClose: () => void;
  onSubmit: (data: PasienFormData) => Promise<void>;
}

export default function PasienModal({ isOpen, isEdit, initialData, onClose, onSubmit }: PasienModalProps) {
  const [nama, setNama] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [alamat, setAlamat] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync form state whenever modal opens or initial data changes
  useEffect(() => {
    if (isOpen && initialData) {
      setNama(initialData.nama);
      setTanggalLahir(initialData.tanggalLahir);
      setAlamat(initialData.alamat);
    } else if (isOpen && !initialData) {
      setNama('');
      setTanggalLahir('');
      setAlamat('');
    }
    setError('');
  }, [isOpen, initialData?.nama]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nama.trim()) {
      setError('Nama pasien wajib diisi.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ nama, tanggalLahir, alamat });
    } catch (err: any) {
      setError(err.message ?? 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-md max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200 relative">
        <BracketFrame />

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <h3 className="font-black text-xs uppercase tracking-wider text-slate-800">
            {isEdit ? 'Edit Biodata Pasien' : 'Registrasi Pasien Baru'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
              Nama Lengkap Pasien *
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Ny. Yuliana Safitri"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007A64] transition-all font-bold text-slate-800"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
              Tanggal Lahir (Opsional)
            </label>
            <input
              type="date"
              value={tanggalLahir}
              onChange={(e) => setTanggalLahir(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007A64] transition-all font-semibold text-slate-700"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
              Alamat Rumah (Opsional)
            </label>
            <textarea
              rows={3}
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Kec. Sukawati, Gianyar, Bali"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007A64] transition-all resize-none text-slate-700"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-md font-bold transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-[#007A64] hover:bg-[#006653] disabled:opacity-60 text-white rounded-md font-black uppercase tracking-wider shadow-sm transition-all"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2, CreditCard, AlertTriangle, X, Check, Plus } from 'lucide-react';
import BracketFrame from '@/components/ui/BracketFrame';
import { ConfirmDialog, useToast, useConfirm } from '@/components/ui/Toast';

interface Metode {
  id: number;
  nama: string;
  aktif: boolean;
  createdAt?: string;
}

interface MetodePembayaranTableProps {
  metodeList: Metode[];
  loading: boolean;
  isMock: boolean;
  transaksiList: any[];
  onRefresh: () => void;
}

export default function MetodePembayaranTable({
  metodeList,
  loading,
  isMock,
  transaksiList,
  onRefresh,
}: MetodePembayaranTableProps) {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formNama, setFormNama] = useState('');
  const [formAktif, setFormAktif] = useState(true);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [localMetode, setLocalMetode] = useState<Metode[]>(metodeList);
  const [isSaving, setIsSaving] = useState(false);

  // Toast & Confirm Dialog
  const toast = useToast();
  const confirmDialog = useConfirm();

  // Sync when parent metodeList changes
  useEffect(() => {
    setLocalMetode(metodeList);
  }, [metodeList]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const openForm = (metode: Metode | null = null) => {
    setFormError('');
    if (metode) {
      setEditId(metode.id);
      setFormNama(metode.nama);
      setFormAktif(metode.aktif);
    } else {
      setEditId(null);
      setFormNama('');
      setFormAktif(true);
    }
    setShowModal(true);
  };

  const closeForm = () => { setShowModal(false); setEditId(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formNama.trim()) { setFormError('Nama metode pembayaran wajib diisi.'); return; }

    const payload = { nama: formNama.trim(), aktif: formAktif };

    if (isMock) {
      if (editId) {
        setLocalMetode((prev) => prev.map((m) => (m.id === editId ? { ...m, ...payload } : m)));
        showSuccess('Metode pembayaran berhasil diubah (Simulasi).');
      } else {
        setLocalMetode((prev) => [...prev, { id: Date.now(), ...payload, createdAt: new Date().toISOString() }]);
        showSuccess('Metode pembayaran baru berhasil ditambahkan (Simulasi).');
      }
      closeForm();
      return;
    }

    const url = editId ? `/api/metode/${editId}` : '/api/metode';
    const method = editId ? 'PUT' : 'POST';
    setIsSaving(true);
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan metode pembayaran.');
      showSuccess(editId ? 'Metode pembayaran diperbarui!' : 'Metode pembayaran baru terdaftar!');
      closeForm();
      onRefresh();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const namaMetode = localMetode.find((m) => m.id === id)?.nama ?? 'metode ini';
    const confirmed = await confirmDialog.confirm({
      title: `Hapus "${namaMetode}"?`,
      message: 'Metode pembayaran yang masih memiliki riwayat transaksi tidak dapat dihapus. Nonaktifkan saja jika ingin menyembunyikannya dari daftar pilihan kasir.',
      confirmLabel: 'Ya, Hapus',
      cancelLabel: 'Batal',
      variant: 'danger',
    });
    if (!confirmed) return;

    if (isMock) {
      const inUse = transaksiList.some((tx) => tx.metodePembayaranId === id);
      if (inUse) {
        toast.warning('Tidak bisa dihapus', 'Metode sudah memiliki riwayat transaksi. Nonaktifkan saja.');
        return;
      }
      setLocalMetode((prev) => prev.filter((m) => m.id !== id));
      toast.success('Berhasil dihapus', 'Metode pembayaran telah dihapus (mode simulasi).');
      return;
    }
    fetch(`/api/metode/${id}`, { method: 'DELETE' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menghapus.');
        onRefresh();
      })
      .catch((err) => toast.error('Gagal menghapus', err.message));
  };

  return (
    <div className="space-y-4">
      {/* Tab header action row */}
      <div className="flex justify-between items-center">
        <div />
        <button
          onClick={() => openForm()}
          className="bg-[#007A64] hover:bg-[#006653] text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Metode
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      <div className="bg-white rounded-md border border-slate-150 shadow-sm relative overflow-hidden flex flex-col p-6 space-y-4">
        <BracketFrame />
        <div>
          <h4 className="font-extrabold text-sm text-slate-800">Pengaturan Pilihan Metode Pembayaran</h4>
          <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">
            Kelola opsi tunai, bank transfer, atau e-wallet untuk POS Kasir.
          </p>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-3 animate-pulse py-2">
              <div className="grid grid-cols-4 gap-4 py-2.5 border-b border-slate-100">
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="h-3 bg-slate-200 rounded w-2/3" />
                ))}
              </div>
              {[...Array(4)].map((_, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-4 gap-4 py-3 items-center">
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                  <div className="h-6 bg-slate-200 rounded-full w-16 justify-self-center" />
                  <div className="flex gap-2 justify-center">
                    <div className="w-16 h-8 bg-slate-200 rounded" />
                    <div className="w-16 h-8 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/30 text-slate-400 uppercase text-[9px] font-extrabold tracking-wider border-b border-slate-100">
                  <th className="py-3.5 px-4">Metode Pembayaran</th>
                  <th className="py-3.5 px-4">Tgl Ditambahkan</th>
                  <th className="py-3.5 px-4 text-center">Status Keaktifan</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {localMetode.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">Tidak ada metode pembayaran yang terdaftar.</td>
                  </tr>
                ) : (
                  localMetode.map((metode) => (
                    <tr key={metode.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-800 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        {metode.nama}
                      </td>
                      <td className="py-4 px-4 text-slate-400 font-semibold">
                        {new Date(metode.createdAt || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {metode.aktif ? (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Aktif Terbaca POS
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-400 border border-slate-200">
                            Nonaktif / Sembunyi
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center space-x-1 shrink-0">
                        <button onClick={() => openForm(metode)} className="p-1.5 text-slate-400 hover:text-[#007A64] hover:bg-[#E6F3F0] rounded-lg transition-colors inline-flex">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(metode.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex">
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200 relative">
            <BracketFrame />
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-800">
                {editId ? 'Ubah Informasi Metode Bayar' : 'Tambah Opsi Pembayaran Baru'}
              </h3>
              <button onClick={closeForm} className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-550 uppercase tracking-wider block">
                  Nama Metode Pembayaran *
                </label>
                <input
                  type="text"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Contoh: QRIS, Transfer BCA, Dana"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007A64] transition-all font-bold text-slate-800"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formAktif} onChange={(e) => setFormAktif(e.target.checked)} className="sr-only peer" />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#007A64]" />
                  <span className="ml-2.5 text-[11px] font-bold text-slate-700">{formAktif ? 'Aktif & Terbaca POS' : 'Nonaktif / Disembunyikan'}</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button type="button" onClick={closeForm} disabled={isSaving} className="px-4 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-md font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  Batal
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-[#007A64] hover:bg-[#006653] text-white rounded-md font-black uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isSaving && <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />}
                  {isSaving ? 'Menyimpan...' : 'Simpan Metode'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        options={confirmDialog.options}
        onConfirm={confirmDialog.handleConfirm}
        onCancel={confirmDialog.handleCancel}
      />
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import MockBanner from '@/components/ui/MockBanner';
import PasienStats from '@/components/pasien/PasienStats';
import PasienTable from '@/components/pasien/PasienTable';
import PasienModal from '@/components/pasien/PasienModal';
import { ToastContainer, ConfirmDialog, useToast, useConfirm } from '@/components/ui/Toast';

interface Pasien {
  id: number;
  nama: string;
  tanggalLahir: string | null;
  alamat: string | null;
  createdAt: string;
}

const MOCK_PASIEN: Pasien[] = [
  { id: 1, nama: 'Siti Nurhaliza', tanggalLahir: '1995-03-12', alamat: 'Jl. Merdeka No. 45, Kebayoran Baru, Jakarta Selatan', createdAt: '2024-05-15T01:00:00.000Z' },
  { id: 2, nama: 'Ani Putri', tanggalLahir: '1992-06-28', alamat: 'Perumahan Gading Serpong, Blok B2, Tangerang', createdAt: '2024-05-18T08:30:00.000Z' },
  { id: 3, nama: 'Dewi Rahmawati', tanggalLahir: '1988-09-05', alamat: 'Jl. Margonda Raya No. 12, Depok', createdAt: '2024-05-20T12:00:00.000Z' },
  { id: 4, nama: 'Lestari Sri', tanggalLahir: '1997-01-17', alamat: 'Apartemen Kalibata City, Tower Jasmine, Jakarta', createdAt: '2024-05-22T04:15:00.000Z' },
];

export default function PasienPage() {
  const [pasienList, setPasienList] = useState<Pasien[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const [stats, setStats] = useState({
    totalPasien: 0,
    pasienHariIni: 0,
    pasienBaruBulanIni: 0,
  });

  // Toast & Confirm Dialog
  const toast = useToast();
  const confirmDialog = useConfirm();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Pasien | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchPasien = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/pasien?search=${encodeURIComponent(search)}`),
      fetch(`/api/pasien/stats`)
    ])
      .then(async ([resList, resStats]) => {
        if (!resList.ok || !resStats.ok) throw new Error('DB Error');
        const listData = await resList.json();
        const statsData = await resStats.json();
        setPasienList(listData);
        setStats(statsData);
        setIsMock(false);
        setLoading(false);
      })
      .catch(() => {
        setIsMock(true);
        const filtered = MOCK_PASIEN.filter((p) =>
          p.nama.toLowerCase().includes(search.toLowerCase())
        );
        setPasienList(filtered);
        setStats({
          totalPasien: 1284,
          pasienHariIni: 24,
          pasienBaruBulanIni: 48,
        });
        setLoading(false);
      });
  }, [search]);

  useEffect(() => {
    fetchPasien();
  }, [fetchPasien]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const openRegister = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = (pasien: Pasien) => {
    setEditTarget(pasien);
    setModalOpen(true);
  };

  const handleSubmit = async (formData: { nama: string; tanggalLahir: string; alamat: string }) => {
    const payload = {
      nama: formData.nama,
      tanggalLahir: formData.tanggalLahir ? new Date(formData.tanggalLahir).toISOString() : null,
      alamat: formData.alamat || null,
    };

    if (isMock) {
      if (editTarget) {
        setPasienList((prev) => prev.map((p) => (p.id === editTarget.id ? { ...p, ...payload } : p)));
        showSuccess('Data pasien berhasil diubah (Simulasi).');
      } else {
        const newP: Pasien = {
          id: Date.now(),
          ...payload,
          tanggalLahir: payload.tanggalLahir,
          alamat: payload.alamat,
          createdAt: new Date().toISOString(),
        };
        setPasienList((prev) => [newP, ...prev]);
        showSuccess('Pasien baru berhasil ditambahkan (Simulasi).');
      }
      setModalOpen(false);
      return;
    }

    const url = editTarget ? `/api/pasien/${editTarget.id}` : '/api/pasien';
    const method = editTarget ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.');
    showSuccess(editTarget ? 'Pasien berhasil diperbarui!' : 'Pasien baru berhasil terdaftar!');
    setModalOpen(false);
    fetchPasien();
  };

  const handleDelete = async (id: number) => {
    const namaPasien = pasienList.find((p) => p.id === id)?.nama ?? 'pasien ini';
    const confirmed = await confirmDialog.confirm({
      title: `Hapus Data "${namaPasien}"?`,
      message: 'Data pasien yang sudah dihapus tidak dapat dipulihkan. Pastikan tidak ada riwayat transaksi yang masih aktif terkait pasien ini.',
      confirmLabel: 'Ya, Hapus Data',
      cancelLabel: 'Batal',
      variant: 'danger',
    });
    if (!confirmed) return;

    if (isMock) {
      setPasienList((prev) => prev.filter((p) => p.id !== id));
      toast.success('Berhasil dihapus', 'Data pasien telah dihapus dari daftar (mode simulasi).');
      return;
    }
    fetch(`/api/pasien/${id}`, { method: 'DELETE' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menghapus.');
        fetchPasien();
      })
      .catch((err) => toast.error('Gagal menghapus', err.message));
  };

  return (
    <div className="space-y-7">
      {/* Simulation banner — only re-renders when isMock changes */}
      {isMock && (
        <MockBanner message="Basis data MySQL belum terhubung. Manajemen pasien disimulasikan menggunakan data mock visual." />
      )}

      {/* Stats cards */}
      <PasienStats 
        totalPasien={stats.totalPasien} 
        pasienHariIni={stats.pasienHariIni} 
        pasienBaruBulanIni={stats.pasienBaruBulanIni} 
      />

      {/* Data Table — fully isolated, manages its own pagination */}
      <PasienTable
        pasienList={pasienList}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        onRegister={openRegister}
        onEdit={openEdit}
        onDelete={handleDelete}
        successMsg={successMsg}
      />

      {/* Registration / Edit Modal — renders only when open */}
      <PasienModal
        isOpen={modalOpen}
        isEdit={!!editTarget}
        initialData={
          editTarget
            ? {
                nama: editTarget.nama,
                tanggalLahir: editTarget.tanggalLahir?.substring(0, 10) ?? '',
                alamat: editTarget.alamat ?? '',
              }
            : undefined
        }
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* Confirm Dialog & Toast */}
      <ConfirmDialog
        options={confirmDialog.options}
        onConfirm={confirmDialog.handleConfirm}
        onCancel={confirmDialog.handleCancel}
      />
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />
    </div>
  );
}

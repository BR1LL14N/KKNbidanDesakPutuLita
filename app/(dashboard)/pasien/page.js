'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  UserPlus,
  X,
  Check
} from 'lucide-react';

export default function PasienPage() {
  const [pasienList, setPasienList] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  
  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formNama, setFormNama] = useState('');
  const [formTglLahir, setFormTglLahir] = useState('');
  const [formAlamat, setFormAlamat] = useState('');
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const mockPasien = [
    { id: 1, nama: 'Desak Putu Lita', tanggalLahir: '1995-06-15', alamat: 'Kec. Sukawati, Gianyar, Bali', createdAt: '2026-05-23T01:00:00.000Z' },
    { id: 2, nama: 'Ni Ketut Suwarni', tanggalLahir: '1988-11-20', alamat: 'Desa Celuk, Sukawati, Bali', createdAt: '2026-05-22T08:30:00.000Z' },
    { id: 3, nama: 'Made Ariesta', tanggalLahir: '2001-02-05', alamat: 'Denpasar Timur, Bali', createdAt: '2026-05-21T12:00:00.000Z' },
    { id: 4, nama: 'I Gusti Ayu Agung', tanggalLahir: '1992-07-30', alamat: 'Kec. Ubud, Gianyar, Bali', createdAt: '2026-05-20T04:15:00.000Z' }
  ];

  const fetchPasien = () => {
    setLoading(true);
    fetch(`/api/pasien?search=${search}`)
      .then(res => {
        if (!res.ok) throw new Error('DB Error');
        return res.json();
      })
      .then(result => {
        setPasienList(result);
        setIsMock(false);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Using mock data for Pasien because database tables are not migrated.');
        setIsMock(true);
        // Filter mock locally for simulation
        const filteredMock = mockPasien.filter(p => 
          p.nama.toLowerCase().includes(search.toLowerCase())
        );
        setPasienList(filteredMock);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPasien();
  }, [search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (!formNama.trim()) {
      setFormError('Nama pasien wajib diisi.');
      return;
    }

    const payload = {
      nama: formNama,
      tanggalLahir: formTglLahir || null,
      alamat: formAlamat || null
    };

    if (isMock) {
      // Simulate CRUD locally
      if (editId) {
        setPasienList(prev => prev.map(p => p.id === editId ? { ...p, ...payload } : p));
        setSuccessMsg('Data pasien berhasil diubah (Simulasi).');
      } else {
        const newPasien = {
          id: Date.now(),
          ...payload,
          createdAt: new Date().toISOString()
        };
        setPasienList(prev => [newPasien, ...prev]);
        setSuccessMsg('Pasien baru berhasil ditambahkan (Simulasi).');
      }
      closeForm();
      return;
    }

    // Real API Call
    const url = editId ? `/api/pasien/${editId}` : '/api/pasien';
    const method = editId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.');
        return data;
      })
      .then(() => {
        setSuccessMsg(editId ? 'Pasien berhasil diperbarui!' : 'Pasien baru berhasil terdaftar!');
        closeForm();
        fetchPasien();
      })
      .catch(err => {
        setFormError(err.message);
      });
  };

  const handleDelete = (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data pasien ini?')) return;

    if (isMock) {
      setPasienList(prev => prev.filter(p => p.id !== id));
      alert('Pasien berhasil dihapus (Simulasi).');
      return;
    }

    fetch(`/api/pasien/${id}`, { method: 'DELETE' })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menghapus.');
        return data;
      })
      .then(() => {
        alert('Data pasien berhasil dihapus!');
        fetchPasien();
      })
      .catch(err => {
        alert(`Error: ${err.message}`);
      });
  };

  const openForm = (pasien = null) => {
    setFormError('');
    if (pasien) {
      setEditId(pasien.id);
      setFormNama(pasien.nama);
      setFormTglLahir(pasien.tanggalLahir ? pasien.tanggalLahir.substring(0, 10) : '');
      setFormAlamat(pasien.alamat || '');
    } else {
      setEditId(null);
      setFormNama('');
      setFormTglLahir('');
      setFormAlamat('');
    }
    setShowModal(true);
  };

  const closeForm = () => {
    setShowModal(false);
    setEditId(null);
  };

  return (
    <div className="space-y-6">
      {/* DB Warning banner */}
      {isMock && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-center">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="text-sm text-amber-700">
            <span className="font-bold">Mode Simulasi Aktif</span>: Database belum dimigrasi. Penambahan, pengeditan, atau penghapusan pasien di bawah ini hanya disimulasikan di memori browser.
          </div>
        </div>
      )}

      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Pasien</h2>
          <p className="text-sm text-slate-500">Daftar registrasi biodata pasien klinik bidan.</p>
        </div>
        <button 
          onClick={() => openForm()}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm shadow-teal-600/10 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Registrasi Pasien
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Search and Table Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cari pasien berdasarkan nama..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6">Nama Pasien</th>
                  <th className="py-4 px-6">Tanggal Lahir</th>
                  <th className="py-4 px-6">Alamat</th>
                  <th className="py-4 px-6">Tgl Terdaftar</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pasienList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-sm text-slate-400">
                      Tidak ada data pasien yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  pasienList.map((pasien) => (
                    <tr key={pasien.id} className="hover:bg-slate-50/50 text-sm text-slate-700 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-800">{pasien.nama}</td>
                      <td className="py-4 px-6 text-slate-500">
                        {pasien.tanggalLahir 
                          ? new Date(pasien.tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                          : 'Tidak diisi (Pasien Umum)'}
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate text-slate-500">{pasien.alamat || 'Tidak diisi'}</td>
                      <td className="py-4 px-6 text-slate-400 text-xs">
                        {new Date(pasien.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-4 px-6 text-right space-x-1.5 shrink-0">
                        <button 
                          onClick={() => openForm(pasien)}
                          className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors inline-flex"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(pasien.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex"
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

      {/* Register/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <h3 className="font-bold text-slate-800">{editId ? 'Edit Biodata Pasien' : 'Registrasi Pasien Baru'}</h3>
              <button onClick={closeForm} className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-2.5 rounded-xl text-xs font-semibold">
                  {formError}
                </div>
              )}

              {/* Nama */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">Nama Lengkap Pasien *</label>
                <input 
                  type="text" 
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Contoh: Desak Putu Lita"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                />
              </div>

              {/* Tgl Lahir */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">Tanggal Lahir (Opsional)</label>
                <input 
                  type="date" 
                  value={formTglLahir}
                  onChange={(e) => setFormTglLahir(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                />
              </div>

              {/* Alamat */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">Alamat Rumah (Opsional)</label>
                <textarea 
                  rows="3"
                  value={formAlamat}
                  onChange={(e) => setFormAlamat(e.target.value)}
                  placeholder="Contoh: Desa Batubulan, Kec. Sukawati, Gianyar"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button 
                  type="button" 
                  onClick={closeForm}
                  className="px-4 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

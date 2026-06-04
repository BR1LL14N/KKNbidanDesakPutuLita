'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Calendar, 
  Activity, 
  Clock, 
  FileText,
  AlertTriangle,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import Link from 'next/link';

export default function PasienDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [pasien, setPasien] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    
    const fetchPasien = async () => {
      try {
        const res = await fetch(`/api/pasien/${id}?includeHistory=true`);
        if (!res.ok) throw new Error('Gagal mengambil data pasien');
        const data = await res.json();
        setPasien(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPasien();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error || !pasien) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
        <AlertTriangle className="w-10 h-10 text-rose-500" />
        <div>
          <h3 className="font-bold text-lg">Pasien Tidak Ditemukan</h3>
          <p className="text-sm text-rose-600 mt-1">{error || 'Data pasien tidak tersedia atau telah dihapus.'}</p>
        </div>
        <button 
          onClick={() => router.push('/pasien')}
          className="mt-2 px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-xl text-sm font-semibold hover:bg-rose-100 transition-colors"
        >
          Kembali ke Daftar Pasien
        </button>
      </div>
    );
  }

  // Calculate Intervals
  const riwayat = pasien.transaksi || [];
  
  let averageInterval = 0;
  let daysSinceLastVisit = 0;
  
  if (riwayat.length > 0) {
    const today = new Date();
    const lastVisit = new Date(riwayat[0].tanggal);
    const diffTimeLastVisit = Math.abs(today.getTime() - lastVisit.getTime());
    daysSinceLastVisit = Math.ceil(diffTimeLastVisit / (1000 * 60 * 60 * 24));
    
    if (riwayat.length > 1) {
      let totalIntervalDays = 0;
      for (let i = 0; i < riwayat.length - 1; i++) {
        const newerDate = new Date(riwayat[i].tanggal);
        const olderDate = new Date(riwayat[i+1].tanggal);
        const diffTime = Math.abs(newerDate.getTime() - olderDate.getTime());
        totalIntervalDays += Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      averageInterval = Math.round(totalIntervalDays / (riwayat.length - 1));
    }
  }

  const hitungUmur = (tglLahir: string) => {
    if (!tglLahir) return 'Umur tidak diketahui';
    const birthDate = new Date(tglLahir);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} Tahun`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link 
          href="/pasien"
          className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-teal-600 transition-all text-slate-500 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Rekam Medis & Riwayat Pasien
          </h2>
          <p className="text-sm text-slate-500 font-medium">Detail biodata dan rekam jejak kunjungan pasien.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Biodata & Stats */}
        <div className="space-y-6">
          {/* Biodata Card */}
          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 shadow-md text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <User className="w-32 h-32" />
            </div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-white/20">
                <User className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-1">{pasien.nama}</h3>
              <p className="text-teal-100 font-medium text-sm mb-6 bg-white/10 inline-block px-3 py-1 rounded-full border border-white/10">ID Pasien: #{pasien.id}</p>
              
              <div className="space-y-4 bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 mt-0.5 text-teal-200 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-teal-200 tracking-wider">Tanggal Lahir & Umur</p>
                    <p className="font-semibold text-sm">
                      {pasien.tanggalLahir ? new Date(pasien.tanggalLahir).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                      <span className="opacity-75 font-normal"> ({hitungUmur(pasien.tanggalLahir)})</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 text-teal-200 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-teal-200 tracking-wider">Alamat</p>
                    <p className="font-semibold text-sm leading-snug">{pasien.alamat || 'Tidak ada alamat'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interval & Stats Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              Statistik Kunjungan
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Kunjungan</p>
                <p className="text-2xl font-black text-slate-700">{riwayat.length} <span className="text-xs font-semibold text-slate-400">kali</span></p>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Rata-rata Interval</p>
                <p className="text-2xl font-black text-indigo-700">{averageInterval} <span className="text-xs font-semibold text-indigo-500">hari</span></p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-start gap-3">
              <Clock className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Kunjungan Terakhir</p>
                <p className="font-bold text-rose-700 text-sm mt-0.5">
                  {riwayat.length > 0 
                    ? `${daysSinceLastVisit} hari yang lalu` 
                    : 'Belum pernah berkunjung'}
                </p>
                {riwayat.length > 0 && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">
                    ({new Date(riwayat[0].tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })})
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Timeline Riwayat */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-teal-600" />
              Riwayat Tindakan & Terapi
            </h3>
            <span className="bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full border border-teal-200">
              {riwayat.length} Transaksi
            </span>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto bg-slate-50/30">
            {riwayat.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                <FileText className="w-12 h-12 mb-3 text-slate-200" />
                <p className="font-medium">Belum ada riwayat transaksi/tindakan.</p>
                <p className="text-sm mt-1">Layanan yang diberikan ke pasien akan otomatis tampil di sini.</p>
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {riwayat.map((tx: any, idx: number) => {
                  
                  // Calculate interval with previous visit (which is next in array since it's desc)
                  let intervalLabel = null;
                  if (idx < riwayat.length - 1) {
                    const currentVisit = new Date(tx.tanggal);
                    const prevVisit = new Date(riwayat[idx+1].tanggal);
                    const diff = Math.ceil(Math.abs(currentVisit.getTime() - prevVisit.getTime()) / (1000 * 60 * 60 * 24));
                    intervalLabel = `+${diff} hari dari kunjungan sebelumnya`;
                  }

                  return (
                    <div key={tx.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      
                      {/* Timeline Dot */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-teal-500 text-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <CheckIcon className="w-4 h-4" />
                      </div>
                      
                      {/* Content Card */}
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full mb-2 inline-block">
                              {new Date(tx.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <h4 className="font-bold text-slate-800 text-sm mb-1">{tx.nomorInvoice || `INV-${tx.id}`}</h4>
                          </div>
                          <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg border border-teal-100">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tx.totalHarga)}
                          </span>
                        </div>
                        
                        {intervalLabel && (
                          <p className="text-[10px] font-semibold text-indigo-500 mb-3 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {intervalLabel}
                          </p>
                        )}
                        
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                          <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Tindakan / Terapi Diberikan:</p>
                          {tx.detailTransaksi && tx.detailTransaksi.map((dt: any, dtIdx: number) => (
                            <div key={dt.id || dtIdx} className="flex justify-between items-start text-sm">
                              <div className="flex items-start gap-2">
                                <span className="text-teal-500 font-bold mt-0.5">•</span>
                                <div>
                                  <span className="font-semibold text-slate-700 block leading-tight">{dt.terapi?.nama || 'Layanan'}</span>
                                  {dt.jumlah > 1 && <span className="text-xs text-slate-400 font-medium">Qty: {dt.jumlah}x</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {tx.catatan && (
                          <p className="mt-3 text-xs text-slate-500 bg-amber-50 p-2.5 rounded-lg border border-amber-100 flex gap-2 items-start">
                            <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>{tx.catatan}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Check Icon for Timeline
function CheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

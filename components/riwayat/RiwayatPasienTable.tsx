'use client';

import React, { useState } from 'react';
import { Calendar, CreditCard, Receipt, Activity, ChevronDown, ChevronUp, User, FileSpreadsheet, Printer } from 'lucide-react';
import BracketFrame from '@/components/ui/BracketFrame';
import * as XLSX from 'xlsx';

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

interface RiwayatPasienTableProps {
  transaksi: TransaksiItem[];
  showPasienColumn?: boolean;
  onSelectPasien?: (pasien: any) => void;
  fromFilter?: string;
  toFilter?: string;
}

const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

const calculateAge = (birthDateStr?: string | null) => {
  if (!birthDateStr) return '-';
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return `${age} Tahun`;
};

export default function RiwayatPasienTable({
  transaksi,
  showPasienColumn = false,
  onSelectPasien,
  fromFilter,
  toFilter
}: RiwayatPasienTableProps) {
  const [expandedPasienIds, setExpandedPasienIds] = useState<Record<number, boolean>>({});

  // Calculate intervals grouped by patient
  const intervals: Record<number, string> = {};
  const txByPatient: Record<number, typeof transaksi> = {};

  transaksi.forEach((tx) => {
    const pId = tx.pasien?.id || 0;
    if (!txByPatient[pId]) {
      txByPatient[pId] = [];
    }
    txByPatient[pId].push(tx);
  });

  Object.values(txByPatient).forEach((patientTxList) => {
    const sortedPatientTx = [...patientTxList].sort(
      (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
    );
    sortedPatientTx.forEach((tx, idx) => {
      if (idx === 0) {
        intervals[tx.id] = 'Kunjungan Awal';
      } else {
        const prevDate = new Date(sortedPatientTx[idx - 1].tanggal);
        const currDate = new Date(tx.tanggal);
        const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          intervals[tx.id] = 'Hari yang sama';
        } else {
          intervals[tx.id] = `${diffDays} hari`;
        }
      }
    });
  });

  const toggleExpand = (pId: number) => {
    setExpandedPasienIds((prev) => ({
      ...prev,
      [pId]: !prev[pId],
    }));
  };

  // Group transactions by patient when showPasienColumn is true
  const patientGroupsMap: Record<number, {
    pasien: { id: number; nama: string; tanggalLahir?: string | null; alamat?: string | null };
    transaksiList: TransaksiItem[];
    totalHarga: number;
    terakhir: string;
  }> = {};

  transaksi.forEach((tx) => {
    const pId = tx.pasien?.id || 0;
    if (!patientGroupsMap[pId]) {
      patientGroupsMap[pId] = {
        pasien: tx.pasien || { id: 0, nama: 'Umum', tanggalLahir: null, alamat: 'Pasien Non-Register / Umum' },
        transaksiList: [],
        totalHarga: 0,
        terakhir: tx.tanggal,
      };
    }
    patientGroupsMap[pId].transaksiList.push(tx);
    patientGroupsMap[pId].totalHarga += tx.totalHarga;
    if (new Date(tx.tanggal) > new Date(patientGroupsMap[pId].terakhir)) {
      patientGroupsMap[pId].terakhir = tx.tanggal;
    }
  });

  const sortedGroups = Object.values(patientGroupsMap).sort(
    (a, b) => new Date(b.terakhir).getTime() - new Date(a.terakhir).getTime()
  );

  const toggleAll = (expand: boolean) => {
    const next: Record<number, boolean> = {};
    if (expand) {
      sortedGroups.forEach((g) => {
        next[g.pasien.id] = true;
      });
    }
    setExpandedPasienIds(next);
  };

  // Default display logic for single patient (flat list, sorted descending by date)
  const displayTx = [...transaksi].sort(
    (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
  );

  const selectedPasienInfo = !showPasienColumn && transaksi.length > 0 ? transaksi[0].pasien : null;

  // Function to export currently filtered visit history to excel
  const exportToExcel = () => {
    // 1. Sheet 1: Ringkasan Pasien
    const patientGroupsExcel: Record<number, {
      id: number;
      nama: string;
      alamat: string;
      tanggalLahir: string;
      totalKunjungan: number;
      kunjunganTerakhir: string;
      totalPengeluaran: number;
    }> = {};

    transaksi.forEach((tx) => {
      const p = tx.pasien || { id: 0, nama: 'Umum', alamat: 'Pasien Non-Register / Umum', tanggalLahir: null };
      const pId = p.id;
      if (!patientGroupsExcel[pId]) {
        patientGroupsExcel[pId] = {
          id: pId,
          nama: p.nama,
          alamat: p.alamat || '-',
          tanggalLahir: p.tanggalLahir || '-',
          totalKunjungan: 0,
          kunjunganTerakhir: tx.tanggal,
          totalPengeluaran: 0,
        };
      }
      patientGroupsExcel[pId].totalKunjungan += 1;
      patientGroupsExcel[pId].totalPengeluaran += tx.totalHarga;
      if (new Date(tx.tanggal) > new Date(patientGroupsExcel[pId].kunjunganTerakhir)) {
        patientGroupsExcel[pId].kunjunganTerakhir = tx.tanggal;
      }
    });

    // Urutkan berdasarkan totalKunjungan terbanyak untuk analisis loyalitas pasien
    const sortedPatients = Object.values(patientGroupsExcel).sort((a, b) => b.totalKunjungan - a.totalKunjungan);

    const sheet1Data = sortedPatients.map((p, idx) => ({
      'No': idx + 1,
      'ID Pasien': p.id > 0 ? `PID-${String(p.id).padStart(6, '0')}` : 'UMUM',
      'Nama Pasien': p.nama,
      'Alamat': p.alamat,
      'Umur': calculateAge(p.tanggalLahir),
      'Total Kunjungan': p.totalKunjungan,
      'Kunjungan Terakhir': new Date(p.kunjunganTerakhir).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) + ' ' + new Date(p.kunjunganTerakhir).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      'Total Pengeluaran (Rp)': p.totalPengeluaran
    }));

    // 2. Sheet 2: Log Kunjungan Rinci
    const sortedTxExcel = [...transaksi].sort(
      (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
    );

    const sheet2Data = sortedTxExcel.map((tx, idx) => {
      const listTindakan = tx.detailTransaksi.map(
        (d) => d.terapi?.nama || d.namaManual || 'Tindakan Medis'
      ).join(', ');

      return {
        'No': idx + 1,
        'Tanggal Kunjungan': new Date(tx.tanggal).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        'Waktu': new Date(tx.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        'No. Invoice': tx.nomorInvoice || `INV/TX-${tx.id}`,
        'ID Pasien': tx.pasien?.id ? `PID-${String(tx.pasien.id).padStart(6, '0')}` : 'UMUM',
        'Nama Pasien': tx.pasien?.nama || 'Umum',
        'Tindakan Medis / Layanan': listTindakan,
        'Total Biaya (Rp)': tx.totalHarga,
        'Metode Pembayaran': tx.metodePembayaran?.nama || 'Tunai',
        'Interval Kunjungan': intervals[tx.id] || 'Kunjungan Awal',
        'Catatan': tx.catatan || '-'
      };
    });

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(sheet1Data);
    const ws2 = XLSX.utils.json_to_sheet(sheet2Data);

    // Apply column widths to make Excel look clean and professional
    ws1['!cols'] = [
      { wch: 6 },   // No
      { wch: 15 },  // ID Pasien
      { wch: 25 },  // Nama Pasien
      { wch: 35 },  // Alamat
      { wch: 12 },  // Umur
      { wch: 15 },  // Total Kunjungan
      { wch: 25 },  // Kunjungan Terakhir
      { wch: 22 }   // Total Pengeluaran (Rp)
    ];

    ws2['!cols'] = [
      { wch: 6 },   // No
      { wch: 20 },  // Tanggal Kunjungan
      { wch: 10 },  // Waktu
      { wch: 22 },  // No. Invoice
      { wch: 15 },  // ID Pasien
      { wch: 25 },  // Nama Pasien
      { wch: 45 },  // Tindakan Medis / Layanan
      { wch: 18 },  // Total Biaya (Rp)
      { wch: 18 },  // Metode Pembayaran
      { wch: 20 },  // Interval Kunjungan
      { wch: 30 }   // Catatan
    ];

    XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan Pasien');
    XLSX.utils.book_append_sheet(wb, ws2, 'Log Kunjungan Rinci');

    const rangeStr = fromFilter && toFilter ? `${fromFilter}_s_d_${toFilter}` : 'Semua_Periode';
    const nameSuffix = selectedPasienInfo ? `_${selectedPasienInfo.nama.replace(/\s+/g, '_')}` : '_Semua_Pasien';
    XLSX.writeFile(wb, `Laporan_Riwayat_Kunjungan_${rangeStr}${nameSuffix}.xlsx`);
  };

  const renderPrintHeader = () => {
    const totalOmzet = transaksi.reduce((acc, curr) => acc + curr.totalHarga, 0);
    const dateNowStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    return (
      <div className="hidden print:block mb-8 border-b-4 border-slate-800 pb-4 w-full">
        {/* Kop Surat Bidan */}
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-3">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">SI-KABID (Sistem Informasi KIA Kasir Bidan)</h1>
            <p className="text-xs text-slate-600 font-bold mt-1">Klinik Bidan Mandiri Desak Putu Lita, S.Tr.Keb</p>
            <p className="text-[10px] text-slate-500 font-semibold">Pelayanan KIA, KB, Imunisasi & Persalinan 24 Jam • Jl. Kertajaya No. 12, Surabaya</p>
          </div>
          <div className="text-right text-[9px] text-slate-550 font-mono font-bold leading-normal">
            <p>Tanggal Cetak: {dateNowStr} WIB</p>
            <p>Dokumen: Laporan Riwayat Pasien</p>
            <p>Status: Resmi / Terverifikasi</p>
          </div>
        </div>

        {/* Laporan Metadata & Statistik Ringkas */}
        <div className="mt-4 grid grid-cols-2 gap-6 text-xs bg-slate-50 p-4 rounded border border-slate-200">
          <div className="space-y-1.5">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Kriteria & Filter Laporan</p>
            <p><span className="font-semibold text-slate-500">Periode Laporan:</span> <strong className="text-slate-800">{fromFilter ? formatDate(fromFilter) : 'Semua Periode'} s.d. {toFilter ? formatDate(toFilter) : 'Hari Ini'}</strong></p>
            <p>
              <span className="font-semibold text-slate-500">Pasien Terfilter:</span>{' '}
              <strong className="text-slate-800">
                {selectedPasienInfo
                  ? `${selectedPasienInfo.nama} (PID-${String(selectedPasienInfo.id).padStart(6, '0')})`
                  : 'Semua Pasien Terdaftar'}
              </strong>
            </p>
            {selectedPasienInfo?.alamat && (
              <p><span className="font-semibold text-slate-500">Alamat Pasien:</span> <span className="text-slate-700 italic">{selectedPasienInfo.alamat}</span></p>
            )}
          </div>
          <div className="space-y-1.5 text-right flex flex-col justify-between items-end">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Ringkasan Statistik</p>
              <p><span className="font-semibold text-slate-500">Total Kunjungan:</span> <strong className="text-slate-800">{transaksi.length} Kunjungan</strong></p>
              <p><span className="font-semibold text-slate-500">Total Pasien Unik:</span> <strong className="text-slate-800">{Object.keys(txByPatient).length} Pasien</strong></p>
              <p><span className="font-semibold text-slate-500">Total Pengeluaran / Omzet:</span> <strong className="text-slate-850 font-black">{formatRupiah(totalOmzet)}</strong></p>
            </div>
          </div>
        </div>

        <h3 className="text-center font-black text-xs text-slate-800 uppercase tracking-wider mt-6">
          {showPasienColumn ? 'Tabel Ringkasan Kunjungan per Pasien' : 'Tabel Log Riwayat Kunjungan Pasien'}
        </h3>
      </div>
    );
  };

  // If showPasienColumn is true (Global View), we render the grouped patient log
  if (showPasienColumn) {
    return (
      <div className="bg-white rounded-md border border-slate-150 shadow-sm relative overflow-hidden flex flex-col p-6 space-y-4 print:border-none print:shadow-none print:p-0">
        {renderPrintHeader()}
        <BracketFrame />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3 print:hidden">
          <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#007A64]" />
            Log Riwayat Kunjungan Pasien
          </h4>
          <div className="flex items-center gap-3 flex-wrap">
            {sortedGroups.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => toggleAll(true)}
                  className="text-[10px] font-bold text-[#007A64] hover:underline cursor-pointer"
                >
                  Buka Semua
                </button>
                <span className="text-slate-350 text-[10px]">|</span>
                <button
                  onClick={() => toggleAll(false)}
                  className="text-[10px] font-bold text-slate-500 hover:underline cursor-pointer"
                >
                  Tutup Semua
                </button>
              </div>
            )}
            <span className="text-[10px] bg-[#E6F3F0] text-[#007A64] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
              {sortedGroups.length} Pasien ({transaksi.length} Kunjungan)
            </span>
            <button
              onClick={exportToExcel}
              disabled={transaksi.length === 0}
              className="px-3 py-1.5 bg-[#107C41] hover:bg-[#0d6233] disabled:opacity-50 text-white rounded-md font-black text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Ekspor Excel
            </button>
            <button
              onClick={() => window.print()}
              disabled={transaksi.length === 0}
              className="px-3 py-1.5 bg-[#007A64] hover:bg-[#006653] disabled:opacity-50 text-white rounded-md font-black text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 uppercase text-[9px] font-extrabold tracking-wider border-b border-slate-100">
                <th className="py-3 px-4">Nama Pasien</th>
                <th className="py-3 px-4">Jumlah Kunjungan</th>
                <th className="py-3 px-4">Kunjungan Terakhir</th>
                <th className="py-3 px-4">Total Pengeluaran</th>
                <th className="py-3 px-4 text-center no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sortedGroups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    Tidak ada riwayat kunjungan dalam rentang filter ini.
                  </td>
                </tr>
              ) : (
                sortedGroups.map((group) => {
                  const isExpanded = !!expandedPasienIds[group.pasien.id];
                  const sortedTxList = [...group.transaksiList].sort(
                    (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
                  );

                  return (
                    <React.Fragment key={group.pasien.id}>
                      <tr className="hover:bg-slate-50/20 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#E6F3F0] text-[#007A64] font-black flex items-center justify-center text-sm shadow-inner shrink-0 print:hidden">
                              {group.pasien.nama.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-800 text-xs flex items-center gap-2">
                                {group.pasien.nama}
                                {group.pasien.id > 0 && (
                                  <span className="text-[9px] font-mono text-slate-405 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                                    PID-{String(group.pasien.id).padStart(6, '0')}
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate max-w-[200px] sm:max-w-xs mt-0.5 print:max-w-none print:whitespace-normal">
                                {group.pasien.alamat || 'Alamat tidak diisi'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-block bg-[#EEF2F6] text-[#4F46E5] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider print:bg-transparent print:p-0 print:text-xs">
                            {group.transaksiList.length}x Kunjungan
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-slate-700">
                          {formatDate(group.terakhir)}
                          <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                            {formatTime(group.terakhir)} WIB
                          </span>
                        </td>
                        <td className="py-4 px-4 font-black text-slate-850">
                          {formatRupiah(group.totalHarga)}
                        </td>
                        <td className="py-4 px-4 text-center no-print">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => toggleExpand(group.pasien.id)}
                              className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-md font-bold text-[10px] transition-all flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                            >
                              <span>{isExpanded ? 'Tutup' : 'Detail Kunjungan'}</span>
                              <ChevronDown className={`w-3.5 h-3.5 text-[#007A64] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            {group.pasien.id > 0 && onSelectPasien && (
                              <button
                                onClick={() => onSelectPasien(group.pasien)}
                                className="px-3 py-1.5 bg-[#007A64] hover:bg-[#006653] text-white rounded-md font-black text-[10px] uppercase tracking-wider transition-all shadow-sm shrink-0 cursor-pointer"
                              >
                                Pilih Pasien
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      <tr className={`bg-slate-50/45 transition-all duration-300 ease-in-out ${isExpanded ? 'border-t border-slate-100' : 'border-t-0 border-transparent pointer-events-none print:hidden'}`}>
                        <td colSpan={5} className="p-0">
                          <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden min-h-0">
                              <div className="bg-white rounded-md border border-slate-200/60 p-4 shadow-sm space-y-3 m-4 print:m-0 print:border-none print:p-0">
                                <div className="text-[10px] font-extrabold text-[#007A64] uppercase tracking-wider border-b border-slate-100 pb-2 print:hidden">
                                  Rincian Kunjungan - {group.pasien.nama}
                                </div>

                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border-collapse text-[11px]">
                                    <thead>
                                      <tr className="text-slate-400 uppercase text-[8px] font-extrabold tracking-wider border-b border-slate-100 pb-1.5">
                                        <th className="py-2 px-3">Tanggal & Jam</th>
                                        <th className="py-2 px-3">No. Invoice</th>
                                        <th className="py-2 px-3">Tindakan Medis / Item</th>
                                        <th className="py-2 px-3 text-right">Biaya</th>
                                        <th className="py-2 px-3">Metode Bayar</th>
                                        <th className="py-2 px-3 text-center">Interval</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-slate-700">
                                      {sortedTxList.map((tx) => {
                                        const listTindakan = tx.detailTransaksi.map(
                                          (d) => d.terapi?.nama || d.namaManual || 'Tindakan Medis'
                                        );
                                        return (
                                          <tr key={tx.id} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="py-2 px-3">
                                              <p className="font-bold text-slate-800">{formatDate(tx.tanggal)}</p>
                                              <p className="text-[9px] text-slate-400 font-semibold">
                                                {formatTime(tx.tanggal)} WIB
                                              </p>
                                            </td>
                                            <td className="py-2 px-3 font-mono font-bold text-slate-500 uppercase tracking-tight">
                                              {tx.nomorInvoice || `INV/TX-${tx.id}`}
                                            </td>
                                            <td className="py-2 px-3">
                                              <div className="flex flex-wrap gap-1 max-w-xs sm:max-w-sm print:max-w-none">
                                                {listTindakan.map((tindakan, i) => (
                                                  <span
                                                    key={i}
                                                    className="inline-block bg-[#E6F3F0]/65 text-[#007A64] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#007A64]/10 print:border-none print:bg-transparent print:p-0 print:text-xs print:mr-2"
                                                  >
                                                    {tindakan}
                                                  </span>
                                                ))}
                                              </div>
                                            </td>
                                            <td className="py-2 px-3 text-right font-black text-slate-800">
                                              {formatRupiah(tx.totalHarga)}
                                            </td>
                                            <td className="py-2 px-3">
                                              <div className="flex items-center gap-1 font-bold text-slate-500">
                                                <CreditCard className="w-3 h-3 text-slate-400 print:hidden" />
                                                {tx.metodePembayaran?.nama || 'Tunai'}
                                              </div>
                                            </td>
                                            <td className="py-2 px-3 text-center">
                                              <span
                                                className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full print:bg-transparent print:p-0 print:text-xs ${
                                                  intervals[tx.id] === 'Kunjungan Awal'
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-150 print:border-none'
                                                    : 'bg-amber-50 text-amber-700 border border-amber-150 print:border-none'
                                                }`}
                                              >
                                                {intervals[tx.id]}
                                              </span>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Otherwise (Single Patient View), show the detailed chronological log table
  return (
    <div className="bg-white rounded-md border border-slate-150 shadow-sm relative overflow-hidden flex flex-col p-6 space-y-4 print:border-none print:shadow-none print:p-0">
      {renderPrintHeader()}
      <BracketFrame />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3 print:hidden">
        <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#007A64]" />
          Log Riwayat Kunjungan
        </h4>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] bg-[#E6F3F0] text-[#007A64] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            {transaksi.length} Kunjungan
          </span>
          <button
            onClick={exportToExcel}
            disabled={transaksi.length === 0}
            className="px-3 py-1.5 bg-[#107C41] hover:bg-[#0d6233] disabled:opacity-50 text-white rounded-md font-black text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Ekspor Excel
          </button>
          <button
            onClick={() => window.print()}
            disabled={transaksi.length === 0}
            className="px-3 py-1.5 bg-[#007A64] hover:bg-[#006653] disabled:opacity-50 text-white rounded-md font-black text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 uppercase text-[9px] font-extrabold tracking-wider border-b border-slate-100">
              <th className="py-3 px-4">Tanggal & Jam</th>
              <th className="py-3 px-4">No. Invoice</th>
              <th className="py-3 px-4">Tindakan Medis / Item</th>
              <th className="py-3 px-4 text-right">Total Biaya</th>
              <th className="py-3 px-4">Metode Bayar</th>
              <th className="py-3 px-4 text-center">Interval Kunjungan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {displayTx.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                  Tidak ada riwayat kunjungan dalam rentang filter ini.
                </td>
              </tr>
            ) : (
              displayTx.map((tx) => {
                const listTindakan = tx.detailTransaksi.map(
                  (d) => d.terapi?.nama || d.namaManual || 'Tindakan Medis'
                );

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 print:hidden" />
                        <div>
                          <p className="font-bold text-slate-800">{formatDate(tx.tanggal)}</p>
                          <p className="text-[9px] text-slate-400 font-semibold">
                            {formatTime(tx.tanggal)} WIB
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-500 uppercase tracking-tight">
                      {tx.nomorInvoice || `INV/TX-${tx.id}`}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-sm print:max-w-none">
                        {listTindakan.map((tindakan, i) => (
                          <span
                            key={i}
                            className="inline-block bg-[#E6F3F0]/65 text-[#007A64] text-[10px] font-bold px-2 py-0.5 rounded border border-[#007A64]/10 print:border-none print:bg-transparent print:p-0 print:text-xs print:mr-2"
                          >
                            {tindakan}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-800">
                      {formatRupiah(tx.totalHarga)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-500">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400 print:hidden" />
                        {tx.metodePembayaran?.nama || 'Tunai'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full print:bg-transparent print:p-0 print:text-xs ${
                          intervals[tx.id] === 'Kunjungan Awal'
                            ? 'bg-blue-50 text-blue-700 border border-blue-150 print:border-none'
                            : 'bg-amber-50 text-amber-700 border border-amber-150 print:border-none'
                        }`}
                      >
                        {intervals[tx.id]}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

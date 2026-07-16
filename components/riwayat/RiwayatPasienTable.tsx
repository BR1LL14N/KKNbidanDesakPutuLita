'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, CreditCard, Activity, ChevronDown, FileSpreadsheet, Printer } from 'lucide-react';
import BracketFrame from '@/components/ui/BracketFrame';
import * as XLSX from 'xlsx';
import { useReactToPrint } from 'react-to-print';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const totalOmzet = transaksi.reduce((acc, curr) => acc + curr.totalHarga, 0);
  const totalKunjungan = transaksi.length;
  const totalPasienUnik = Object.keys(txByPatient).length;
  const periodeStr = `${fromFilter ? formatDate(fromFilter) : 'Semua Periode'} s.d. ${toFilter ? formatDate(toFilter) : 'Hari Ini'}`;
  const pasienStr = selectedPasienInfo
    ? `${selectedPasienInfo.nama} (PID-${String(selectedPasienInfo.id).padStart(6, '0')})`
    : 'Semua Pasien Terdaftar';
  const judulTabel = showPasienColumn
    ? 'Tabel Ringkasan Kunjungan per Pasien'
    : 'Tabel Log Riwayat Kunjungan Pasien';

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Laporan Riwayat Kunjungan',
  });

  // If showPasienColumn is true (Global View), we render the grouped patient log
  if (showPasienColumn) {
    return (
      <div className="bg-white rounded-md border border-slate-150 shadow-sm relative overflow-hidden flex flex-col p-6 space-y-4">
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
              onClick={() => handlePrint()}
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
                                        <th className="py-2.5 px-3">Tanggal & Jam</th>
                                        <th className="py-2.5 px-3">No. Invoice</th>
                                        <th className="py-2.5 px-3">Tindakan Medis / Item</th>
                                        <th className="py-2.5 px-3 text-right">Biaya</th>
                                        <th className="py-2.5 px-3">Metode Bayar</th>
                                        <th className="py-2.5 px-3 text-center">Interval</th>
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

        {/* Printable Content for react-to-print */}
        {mounted && (
          <div className="hidden print:block font-sans p-6 text-slate-800 bg-white" ref={printRef}>
            {/* Kop Surat */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-3 mb-4">
              <div>
                <h1 className="text-base font-extrabold text-slate-900 leading-tight">SI-KABID — Sistem Informasi KIA &amp; Kasir Bidan</h1>
                <p className="text-xs text-slate-600 mt-0.5">Klinik Bidan Mandiri Desak Putu Lita, S.Tr.Keb</p>
                <p className="text-xs text-slate-600">Pelayanan KIA, KB, Imunisasi &amp; Persalinan 24 Jam &bull; Jl. Kertajaya No. 12, Surabaya</p>
              </div>
              <div className="text-right text-[10px] text-slate-500 font-mono leading-relaxed">
                <p>Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}, {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</p>
                <p>Dokumen: Laporan Riwayat Kunjungan</p>
                <p>Status: Resmi / Terverifikasi</p>
              </div>
            </div>

            <h2 className="text-center text-xs font-black uppercase tracking-wider my-3 text-slate-700">{judulTabel}</h2>

            {/* Info Box */}
            <div className="grid grid-cols-2 border border-slate-200 rounded overflow-hidden mb-3 text-xs">
              <div className="p-3 bg-slate-50/50 space-y-1">
                <p><span className="text-slate-400">Periode:</span> <strong>{periodeStr}</strong></p>
                <p><span className="text-slate-400">Pasien Terfilter:</span> <strong>{pasienStr}</strong></p>
                {selectedPasienInfo?.alamat && <p><span className="text-slate-400">Alamat:</span> {selectedPasienInfo.alamat}</p>}
              </div>
              <div className="p-3 bg-slate-50/50 text-right border-l border-slate-200 space-y-1">
                <p><span className="text-slate-400">Total Kunjungan:</span> <strong>{totalKunjungan} kunjungan</strong></p>
                <p><span className="text-slate-400">Total Pasien Unik:</span> <strong>{totalPasienUnik} pasien</strong></p>
                <p><span className="text-slate-400">Total Omzet:</span> <strong className="text-[#007A64]">{formatRupiah(totalOmzet)}</strong></p>
              </div>
            </div>

            {/* Tabel Data */}
            <table className="w-full border-collapse border border-slate-200 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[10px] uppercase tracking-wider">
                  <th className="p-2 border border-slate-200 text-center w-8">No.</th>
                  <th className="p-2 border border-slate-200 text-left">Nama Pasien</th>
                  <th className="p-2 border border-slate-200 text-center">Jml. Kunjungan</th>
                  <th className="p-2 border border-slate-200 text-left">Kunjungan Terakhir</th>
                  <th className="p-2 border border-slate-200 text-right">Total Omzet (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {sortedGroups.map((g, idx) => (
                  <tr key={g.pasien.id} className="border-b border-slate-200 bg-white odd:bg-slate-50/30">
                    <td className="p-2 border border-slate-200 text-center text-slate-400">{idx + 1}</td>
                    <td className="p-2 border border-slate-200">
                      <strong className="text-slate-800">{g.pasien.nama}</strong>
                      <div className="text-[10px] text-slate-400 mt-0.5">{g.pasien.alamat || '-'}</div>
                    </td>
                    <td className="p-2 border border-slate-200 text-center font-bold">{g.transaksiList.length} kunjungan</td>
                    <td className="p-2 border border-slate-200">{formatDate(g.terakhir)}</td>
                    <td className="p-2 border border-slate-200 text-right font-bold">{formatRupiah(g.totalHarga)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={4} className="p-2 border border-slate-200 text-right text-[10px] uppercase tracking-wider">
                    Total {sortedGroups.length} Pasien
                  </td>
                  <td className="p-2 border border-slate-200 text-right text-sm text-[#007A64] font-black">{formatRupiah(totalOmzet)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="mt-6 pt-2 border-t border-slate-200 text-center text-[10px] text-slate-400">
              Dicetak dari Sistem SI-KABID &bull; Dokumen ini digenerate secara otomatis &bull; {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Otherwise (Single Patient View), show the detailed chronological log table
  return (
    <div className="bg-white rounded-md border border-slate-150 shadow-sm relative overflow-hidden flex flex-col p-6 space-y-4">
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
            onClick={() => handlePrint()}
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
              <th className="py-3 px-4 hidden md:table-cell">No. Invoice</th>
              <th className="py-3 px-4">Tindakan Medis / Item</th>
              <th className="py-3 px-4 text-right">Total Biaya</th>
              <th className="py-3 px-4 hidden md:table-cell">Metode Bayar</th>
              <th className="py-3 px-4 text-center hidden md:table-cell">Interval Kunjungan</th>
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
                    <td className="py-3 px-4 font-mono font-bold text-slate-500 uppercase tracking-tight hidden md:table-cell">
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
                    <td className="py-3 px-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 font-bold text-slate-500">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400 print:hidden" />
                        {tx.metodePembayaran?.nama || 'Tunai'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center hidden md:table-cell">
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

      {/* Printable Content for react-to-print */}
      {mounted && (
        <div className="hidden print:block font-sans p-6 text-slate-800 bg-white" ref={printRef}>
          {/* Kop Surat */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-3 mb-4">
            <div>
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">SI-KABID — Sistem Informasi KIA &amp; Kasir Bidan</h1>
              <p className="text-xs text-slate-600 mt-0.5">Klinik Bidan Mandiri Desak Putu Lita, S.Tr.Keb</p>
              <p className="text-xs text-slate-600">Pelayanan KIA, KB, Imunisasi &amp; Persalinan 24 Jam &bull; Jl. Kertajaya No. 12, Surabaya</p>
            </div>
            <div className="text-right text-[10px] text-slate-500 font-mono leading-relaxed">
              <p>Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}, {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</p>
              <p>Dokumen: Laporan Riwayat Kunjungan</p>
              <p>Status: Resmi / Terverifikasi</p>
            </div>
          </div>

          <h2 className="text-center text-xs font-black uppercase tracking-wider my-3 text-slate-700">{judulTabel}</h2>

          {/* Info Box */}
          <div className="grid grid-cols-2 border border-slate-200 rounded overflow-hidden mb-3 text-xs">
            <div className="p-3 bg-slate-50/50 space-y-1">
              <p><span className="text-slate-400">Periode:</span> <strong>{periodeStr}</strong></p>
              <p><span className="text-slate-400">Pasien Terfilter:</span> <strong>{pasienStr}</strong></p>
              {selectedPasienInfo?.alamat && <p><span className="text-slate-400">Alamat:</span> {selectedPasienInfo.alamat}</p>}
            </div>
            <div className="p-3 bg-slate-50/50 text-right border-l border-slate-200 space-y-1">
              <p><span className="text-slate-400">Total Kunjungan:</span> <strong>{totalKunjungan} kunjungan</strong></p>
              <p><span className="text-slate-400">Total Pasien Unik:</span> <strong>{totalPasienUnik} pasien</strong></p>
              <p><span className="text-slate-400">Total Omzet:</span> <strong className="text-[#007A64]">{formatRupiah(totalOmzet)}</strong></p>
            </div>
          </div>

          {/* Tabel Data */}
          <table className="w-full border-collapse border border-slate-200 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[10px] uppercase tracking-wider">
                <th className="p-2 border border-slate-200 text-center w-8">No.</th>
                <th className="p-2 border border-slate-200 text-left w-36">Tanggal &amp; Jam</th>
                <th className="p-2 border border-slate-200 text-left">Layanan / Tindakan</th>
                <th className="p-2 border border-slate-200 text-left">Metode Bayar</th>
                <th className="p-2 border border-slate-200 text-center w-24">Interval</th>
                <th className="p-2 border border-slate-200 text-right w-32">Biaya (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {displayTx.map((tx, idx) => {
                const layanan = tx.detailTransaksi?.[0]?.terapi?.nama || tx.detailTransaksi?.[0]?.namaManual || 'Layanan Medis';
                const allLayanan = tx.detailTransaksi.length > 1
                  ? `${layanan} & ${tx.detailTransaksi.length - 1} tindakan lain`
                  : layanan;
                const interval = intervals[tx.id] || '-';
                return (
                  <tr key={tx.id} className="border-b border-slate-200 bg-white odd:bg-slate-50/30">
                    <td className="p-2 border border-slate-200 text-center text-slate-400">{idx + 1}</td>
                    <td className="p-2 border border-slate-200">
                      <strong className="text-slate-800">{formatDate(tx.tanggal)}</strong>
                      <div className="text-[10px] text-slate-400 mt-0.5">{formatTime(tx.tanggal)} WIB</div>
                    </td>
                    <td className="p-2 border border-slate-200">{allLayanan}</td>
                    <td className="p-2 border border-slate-200">{tx.metodePembayaran?.nama || '-'}</td>
                    <td className="p-2 border border-slate-200 text-center text-slate-500">{interval}</td>
                    <td className="p-2 border border-slate-200 text-right font-bold">{formatRupiah(tx.totalHarga)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold">
                <td colSpan={5} className="p-2 border border-slate-200 text-right text-[10px] uppercase tracking-wider">
                  Total {totalKunjungan} Kunjungan
                </td>
                <td className="p-2 border border-slate-200 text-right text-sm text-[#007A64] font-black">{formatRupiah(totalOmzet)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-6 pt-2 border-t border-slate-200 text-center text-[10px] text-slate-400">
            Dicetak dari Sistem SI-KABID &bull; Dokumen ini digenerate secara otomatis &bull; {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, FileSpreadsheet, Receipt, Printer } from 'lucide-react';
import BracketFrame from '@/components/ui/BracketFrame';
import * as XLSX from 'xlsx';
import { useReactToPrint } from 'react-to-print';

interface DetailItem {
  id: number;
  terapi?: { nama: string };
  namaManual?: string | null;
  hargaJual: number;
  hargaPokok: number;
  jumlah: number;
  subtotal: number;
}

interface TransaksiItem {
  id: number;
  nomorInvoice?: string;
  tanggal: string;
  createdAt?: string;
  pasien?: { nama: string };
  metodePembayaran?: { nama: string };
  totalHarga: number;
  catatan?: string;
  layananSummary?: string;
  detailTransaksi: DetailItem[];
}

interface AuditTrailTableProps {
  transaksiList: TransaksiItem[];
  loading: boolean;
  startDate?: string;
  endDate?: string;
  rekap?: any;
}

const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

const tglId = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

const jamId = (iso: string) =>
  new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

const formatDateLabel = (dateStr?: string) => {
  if (!dateStr) return 'Semua Periode';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

// ─── Export satu struk transaksi sebagai sheet Excel ─────────────────────────
function exportSingleTransaksi(tx: TransaksiItem) {
  const rows: (string | number)[][] = [
    ['STRUK / RINCIAN TRANSAKSI'],
    ['SI-KABID — Sistem Informasi Kasir & Keuangan Bidan'],
    [],
    ['No. Invoice', tx.nomorInvoice || '-'],
    ['Tanggal', `${tglId(tx.tanggal)}, ${jamId(tx.tanggal)}`],
    ['Nama Pasien', tx.pasien?.nama || '-'],
    ['Metode Pembayaran', tx.metodePembayaran?.nama || '-'],
    ['Catatan Kasir', tx.catatan || 'Tidak ada catatan.'],
    [],
    ['RINCIAN TINDAKAN / ITEM LAYANAN'],
    ['Nama Item / Tindakan', 'Tarif Jual / Unit (Rp)', 'Qty', 'Subtotal Jual (Rp)'],
  ];
  tx.detailTransaksi.forEach(d => {
    rows.push([d.terapi?.nama || 'Layanan Tidak Diketahui', d.hargaJual, d.jumlah, d.subtotal]);
  });
  rows.push([]);
  rows.push(['REKAP FINANSIAL INVOICE']);
  rows.push(['Total Omzet (Harga Jual)', tx.totalHarga]);
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 35 }, { wch: 22 }, { wch: 6 }, { wch: 20 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Struk Transaksi');
  const invoiceSlug = (tx.nomorInvoice || `TX-${tx.id}`).replace(/\//g, '-');
  XLSX.writeFile(wb, `Struk_${invoiceSlug}.xlsx`);
}

// ─── Export semua transaksi audit sebagai Excel ───────────────────────────────
function exportAllAudit(transaksiList: TransaksiItem[]) {
  const headers = [
    'No.', 'No. Invoice', 'Tanggal', 'Jam', 'Nama Pasien',
    'Layanan (Ringkasan)', 'Metode Bayar', 'Status', 'Total Omzet (Rp)', 'Catatan Kasir',
  ];
  const dataRows = transaksiList.map((tx, idx) => {
    const status = tx.catatan?.toLowerCase().includes('menunggu') ? 'BELUM BAYAR' : 'LUNAS';
    const firstItem = tx.detailTransaksi?.[0]?.terapi?.nama || 'Layanan Medis';
    const layananSummary = tx.layananSummary || (tx.detailTransaksi.length > 1 ? `${firstItem} & ${tx.detailTransaksi.length - 1} tindakan lain` : firstItem);
    return [idx + 1, tx.nomorInvoice || '-', tglId(tx.tanggal), jamId(tx.tanggal), tx.pasien?.nama || '-', layananSummary, tx.metodePembayaran?.nama || '-', status, tx.totalHarga, tx.catatan || '-'];
  });
  const detailHeaders = ['No. Invoice', 'Tanggal', 'Nama Pasien', 'Nama Item / Tindakan', 'Jual/Unit (Rp)', 'Qty', 'Subtotal Jual (Rp)'];
  const detailRows: (string | number)[][] = [];
  transaksiList.forEach(tx => {
    tx.detailTransaksi.forEach(d => {
      detailRows.push([tx.nomorInvoice || '-', tglId(tx.tanggal), tx.pasien?.nama || '-', d.terapi?.nama || '-', d.hargaJual, d.jumlah, d.subtotal]);
    });
  });
  const ws1 = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
  ws1['!cols'] = [{ wch: 5 }, { wch: 22 }, { wch: 20 }, { wch: 8 }, { wch: 28 }, { wch: 35 }, { wch: 22 }, { wch: 12 }, { wch: 20 }, { wch: 40 }];
  const ws2 = XLSX.utils.aoa_to_sheet([detailHeaders, ...detailRows]);
  ws2['!cols'] = [{ wch: 22 }, { wch: 20 }, { wch: 28 }, { wch: 35 }, { wch: 18 }, { wch: 6 }, { wch: 20 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, '🧾 Audit Trail');
  XLSX.utils.book_append_sheet(wb, ws2, '🔍 Detail Item');
  const today = new Date().toISOString().split('T')[0].replaceAll('-', '');
  XLSX.writeFile(wb, `Audit_Trail_${today}.xlsx`);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AuditTrailTable({ transaksiList, loading, startDate, endDate, rekap }: AuditTrailTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const toggle = (id: number) => setExpandedId((prev) => (prev === id ? null : id));

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalOmzet = transaksiList.reduce((sum, tx) => sum + tx.totalHarga, 0);
  const totalModal = transaksiList.reduce(
    (sum, tx) => sum + tx.detailTransaksi.reduce((s, d) => s + d.hargaPokok * d.jumlah, 0), 0
  );
  const totalLaba = totalOmzet - totalModal;
  const margin = totalOmzet > 0 ? ((totalLaba / totalOmzet) * 100).toFixed(1) : '0';

  const rekapMetode: Record<string, { jumlah: number; nominal: number }> = {};
  transaksiList.forEach(tx => {
    const nama = tx.metodePembayaran?.nama || 'Lainnya';
    if (!rekapMetode[nama]) rekapMetode[nama] = { jumlah: 0, nominal: 0 };
    rekapMetode[nama].jumlah += 1;
    rekapMetode[nama].nominal += tx.totalHarga;
  });

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Laporan Audit Keuangan',
  });

  return (
    <div className="bg-white rounded-md border border-slate-150 shadow-sm relative overflow-hidden flex flex-col p-6 space-y-4">
      <BracketFrame />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h4 className="font-extrabold text-sm text-slate-800">Audit Transaksi Terkini</h4>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
            {transaksiList.length > 0
              ? `${transaksiList.length} transaksi pada periode ini · Klik ↓ untuk lihat rincian per invoice`
              : 'Belum ada transaksi pada periode ini'}
          </p>
        </div>

        {transaksiList.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            {/* Cetak PDF */}
            <button
              onClick={() => handlePrint()}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak PDF
            </button>
            {/* Ekspor Excel */}
            <button
              onClick={() => exportAllAudit(transaksiList)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Ekspor Excel
            </button>
          </div>
        )}
      </div>

      {/* Keterangan legenda */}
      {transaksiList.length > 0 && !loading && (
        <div className="flex flex-wrap gap-3 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 text-[9px] text-slate-400 font-bold">
          <span>🟢 <strong className="text-slate-500">LUNAS</strong> = transaksi telah dibayar penuh</span>
          <span>🔴 <strong className="text-slate-500">BELUM BAYAR</strong> = catatan mengandung kata &ldquo;menunggu&rdquo;</span>
          <span>▾ <strong className="text-slate-500">Ikon panah</strong> = klik untuk lihat & ekspor rincian item per invoice</span>
        </div>
      )}

      {/* Tabel */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="space-y-3 animate-pulse py-2">
            <div className="grid grid-cols-6 gap-4 py-2.5 border-b border-slate-100">
              {[...Array(6)].map((_, idx) => (<div key={idx} className="h-3 bg-slate-200 rounded w-2/3" />))}
            </div>
            {[...Array(5)].map((_, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-6 gap-4 py-3 items-center">
                <div className="space-y-1.5"><div className="h-3 bg-slate-200 rounded w-3/4" /><div className="h-2 bg-slate-150 rounded w-1/2" /></div>
                <div className="space-y-1.5"><div className="h-3 bg-slate-200 rounded w-3/4" /><div className="h-2 bg-slate-150 rounded w-1/2" /></div>
                <div className="h-6 bg-slate-200 rounded-full w-14 justify-self-start" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-200 rounded w-1/2 justify-self-end" />
                <div className="h-6 bg-slate-200 rounded-md w-12 justify-self-center" />
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 uppercase text-[9px] font-extrabold tracking-wider border-b border-slate-100">
                <th className="py-3 px-4">Tanggal & Jam</th>
                <th className="py-3 px-4">Pasien & Layanan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 hidden md:table-cell">Metode</th>
                <th className="py-3 px-4 text-right">Omzet (Rp)</th>
                <th className="py-3 px-4 text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {transaksiList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    Tidak ada riwayat transaksi keuangan pada periode ini.
                  </td>
                </tr>
              ) : (
                transaksiList.map((tx) => {
                  const isExpanded = expandedId === tx.id;
                  const isBelumBayar = tx.catatan?.toLowerCase().includes('menunggu');
                  const firstItemName = tx.detailTransaksi?.[0]?.terapi?.nama || tx.detailTransaksi?.[0]?.namaManual || 'Layanan Medis';
                  const subLayananText = tx.layananSummary || (tx.detailTransaksi.length > 1 ? `${firstItemName} & ${tx.detailTransaksi.length - 1} tindakan` : firstItemName);

                  return (
                    <React.Fragment key={tx.id}>
                      <tr className="hover:bg-slate-50/40 transition-colors">
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-700">{tglId(tx.tanggal)}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{jamId(tx.tanggal)}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <h5 className="font-extrabold text-slate-800">{tx.pasien?.nama}</h5>
                            <p className="text-[10px] text-slate-400 font-medium">{subLayananText}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold border ${!isBelumBayar ? 'bg-emerald-50 text-emerald-700 border-emerald-200/40' : 'bg-rose-50 text-rose-700 border-rose-200/40'}`}>
                            {!isBelumBayar ? 'LUNAS' : 'BELUM BAYAR'}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-500 hidden md:table-cell">{tx.metodePembayaran?.nama}</td>
                        <td className="py-4 px-4 text-right text-slate-800 font-black">{formatRupiah(tx.totalHarga)}</td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => toggle(tx.id)}
                            title="Lihat & ekspor rincian invoice"
                            className="p-1.5 text-slate-400 hover:text-[#007A64] hover:bg-[#E6F3F0] rounded transition-colors cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-50/40">
                          <td colSpan={6} className="px-6 py-4 border-l-2 border-[#007A64]">
                            <div className="space-y-4">
                              <div className="flex justify-between items-start gap-4 flex-wrap">
                                <div>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Catatan Kasir</p>
                                  <p className="text-slate-600 mt-1 italic font-semibold text-xs leading-relaxed">
                                    &ldquo;{tx.catatan || 'Tidak ada catatan khusus.'}&rdquo;
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => exportSingleTransaksi(tx)} className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer">
                                    <Receipt className="w-3 h-3" />
                                    Ekspor Struk (.xlsx)
                                  </button>
                                  <div className="text-right text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                    <p>No Invoice: <span className="text-slate-600">{tx.nomorInvoice}</span></p>
                                    {tx.createdAt && (<p className="mt-0.5">Input: {new Date(tx.createdAt).toLocaleString('id-ID')}</p>)}
                                  </div>
                                </div>
                              </div>

                              <div className="border border-slate-200/70 rounded-md overflow-hidden bg-white relative">
                                <BracketFrame />
                                <table className="w-full text-left text-xs">
                                  <thead>
                                    <tr className="bg-slate-100/70 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-150">
                                      <th className="py-2.5 px-4">Nama Item / Tindakan</th>
                                      <th className="py-2.5 px-4 text-right">Tarif Jual / Unit</th>
                                      <th className="py-2.5 px-4 text-center">Qty</th>
                                      <th className="py-2.5 px-4 text-right">Subtotal Jual</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 font-medium">
                                    {tx.detailTransaksi?.map((detail, idx) => (
                                      <tr key={idx}>
                                        <td className="py-2.5 px-4 font-bold text-slate-800">
                                          {detail.terapi?.nama || detail.namaManual || 'Tindakan Manual'}
                                        </td>
                                        <td className="py-2.5 px-4 text-right">{formatRupiah(detail.hargaJual)}</td>
                                        <td className="py-2.5 px-4 text-center font-bold text-slate-800">{detail.jumlah}</td>
                                        <td className="py-2.5 px-4 text-right font-bold text-slate-800">{formatRupiah(detail.subtotal)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              <div className="bg-slate-100/40 p-3 rounded-lg border border-slate-200/50 flex justify-between items-center gap-2 text-xs font-bold">
                                <span className="text-slate-500 uppercase text-[9px] font-bold tracking-wider">Rekap Finansial Invoice</span>
                                <span className="text-slate-500">Omzet: <strong className="text-slate-800">{formatRupiah(tx.totalHarga)}</strong></span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        )}
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
              <p>Dokumen: Laporan Audit Keuangan</p>
              <p>Status: Resmi / Terverifikasi</p>
            </div>
          </div>

          <h2 className="text-center text-xs font-black uppercase tracking-wider my-3 text-slate-700">Laporan Audit Transaksi Keuangan</h2>

          {/* Info Box */}
          <div className="grid grid-cols-2 border border-slate-200 rounded overflow-hidden mb-3 text-xs">
            <div className="p-3 bg-slate-50/50 space-y-1">
              <p><span className="text-slate-400">Periode Laporan:</span> <strong>{formatDateLabel(startDate)} s.d. {formatDateLabel(endDate)}</strong></p>
              <p><span className="text-slate-400">Jumlah Transaksi:</span> <strong>{transaksiList.length} transaksi</strong></p>
              <p><span className="text-slate-400">Jumlah Pasien Unik:</span> <strong>{new Set(transaksiList.map(tx => tx.pasien?.nama)).size} pasien</strong></p>
            </div>
            <div className="p-3 bg-slate-50/50 text-right border-l border-slate-200 space-y-1">
              <p><span className="text-slate-400">Total Omzet:</span> <strong>{formatRupiah(totalOmzet)}</strong></p>
              <p><span className="text-slate-400">Total Laba Kotor:</span> <strong>{formatRupiah(totalLaba)}</strong></p>
              <p><span className="text-slate-400">Margin Keuntungan:</span> <strong>{margin}%</strong></p>
            </div>
          </div>

          {/* Rekap per Metode Pembayaran */}
          {Object.keys(rekapMetode).length > 0 && (
            <div className="mb-3 border border-slate-200 rounded overflow-hidden text-xs">
              <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-600 text-[10px] uppercase tracking-wider border-b border-slate-200">
                Rekap per Metode Pembayaran
              </div>
              <div className="flex divide-x divide-slate-200">
                {Object.entries(rekapMetode).map(([nama, d]) => (
                  <div key={nama} className="flex-1 p-3 text-center bg-slate-50/30">
                    <div className="font-extrabold text-sm text-[#007A64]">{formatRupiah(d.nominal)}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{nama} &bull; {d.jumlah} transaksi</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabel Audit */}
          <table className="w-full border-collapse border border-slate-200 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[10px] uppercase tracking-wider">
                <th className="p-2 border border-slate-200 text-center w-8">No.</th>
                <th className="p-2 border border-slate-200 text-left w-36">Tanggal &amp; Jam</th>
                <th className="p-2 border border-slate-200 text-left">Pasien &amp; Layanan</th>
                <th className="p-2 border border-slate-200 text-center w-24">Status</th>
                <th className="p-2 border border-slate-200 text-left w-32">Metode Bayar</th>
                <th className="p-2 border border-slate-200 text-right w-32">Omzet (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {transaksiList.map((tx, idx) => {
                const isBelumBayar = tx.catatan?.toLowerCase().includes('menunggu');
                const firstItemName = tx.detailTransaksi?.[0]?.terapi?.nama || tx.detailTransaksi?.[0]?.namaManual || 'Layanan Medis';
                const layanan = tx.layananSummary || (tx.detailTransaksi.length > 1 ? `${firstItemName} & ${tx.detailTransaksi.length - 1} tindakan` : firstItemName);
                return (
                  <tr key={tx.id} className="border-b border-slate-200 bg-white odd:bg-slate-50/30">
                    <td className="p-2 border border-slate-200 text-center text-slate-400">{idx + 1}</td>
                    <td className="p-2 border border-slate-200">
                      <strong className="text-slate-800">{tglId(tx.tanggal)}</strong>
                      <div className="text-[10px] text-slate-400 mt-0.5">{jamId(tx.tanggal)} WIB</div>
                    </td>
                    <td className="p-2 border border-slate-200">
                      <strong className="text-slate-800">{tx.pasien?.nama || '-'}</strong>
                      <div className="text-[10px] text-slate-400 mt-0.5">{layanan}</div>
                    </td>
                    <td className="p-2 border border-slate-200 text-center">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${!isBelumBayar ? 'bg-emerald-50 text-emerald-700 border-emerald-200/40' : 'bg-rose-50 text-rose-700 border-rose-200/40'}`}>
                        {!isBelumBayar ? 'LUNAS' : 'BELUM BAYAR'}
                      </span>
                    </td>
                    <td className="p-2 border border-slate-200">{tx.metodePembayaran?.nama || '-'}</td>
                    <td className="p-2 border border-slate-200 text-right font-bold">{formatRupiah(tx.totalHarga)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold">
                <td colSpan={5} className="p-2 border border-slate-200 text-right text-[10px] uppercase tracking-wider">
                  Total {transaksiList.length} Transaksi
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

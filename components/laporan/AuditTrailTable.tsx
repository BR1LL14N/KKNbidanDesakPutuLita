'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileSpreadsheet, Receipt } from 'lucide-react';
import BracketFrame from '@/components/ui/BracketFrame';
import * as XLSX from 'xlsx';

interface DetailItem {
  id: number;
  terapi?: { nama: string };
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
}

const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

const tglId = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

const jamId = (iso: string) =>
  new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

// ─── Export satu struk transaksi sebagai sheet Excel ─────────────────────────
function exportSingleTransaksi(tx: TransaksiItem) {
  const totalHpp = tx.detailTransaksi.reduce((s, d) => s + d.hargaPokok * d.jumlah, 0);
  const labaKotor = tx.totalHarga - totalHpp;
  const margin = tx.totalHarga > 0 ? ((labaKotor / tx.totalHarga) * 100).toFixed(1) : '0.0';

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
    ['Nama Item / Tindakan', 'HPP / Unit (Rp)', 'Tarif Jual / Unit (Rp)', 'Qty', 'Subtotal Jual (Rp)', 'Subtotal HPP (Rp)', 'Laba Baris (Rp)'],
  ];

  tx.detailTransaksi.forEach(d => {
    const subtotalHpp = d.hargaPokok * d.jumlah;
    const labaItem = (d.hargaJual - d.hargaPokok) * d.jumlah;
    rows.push([
      d.terapi?.nama || 'Layanan Tidak Diketahui',
      d.hargaPokok,
      d.hargaJual,
      d.jumlah,
      d.subtotal,
      subtotalHpp,
      labaItem,
    ]);
  });

  rows.push([]);
  rows.push(['REKAP FINANSIAL INVOICE']);
  rows.push(['Total Omzet (Harga Jual)', tx.totalHarga]);
  rows.push(['Total HPP (Modal)', totalHpp]);
  rows.push(['Laba Kotor', labaKotor]);
  rows.push(['Margin Keuntungan', `${margin}%`]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 35 }, { wch: 20 }, { wch: 22 }, { wch: 6 }, { wch: 20 }, { wch: 20 }, { wch: 18 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Struk Transaksi');

  const invoiceSlug = (tx.nomorInvoice || `TX-${tx.id}`).replace(/\//g, '-');
  XLSX.writeFile(wb, `Struk_${invoiceSlug}.xlsx`);
}

// ─── Export semua transaksi audit sebagai Excel ringkas ───────────────────────
function exportAllAudit(transaksiList: TransaksiItem[]) {
  const headers = [
    'No.',
    'No. Invoice',
    'Tanggal',
    'Jam',
    'Nama Pasien',
    'Layanan (Ringkasan)',
    'Metode Bayar',
    'Status',
    'Total Omzet (Rp)',
    'Total HPP (Rp)',
    'Laba Kotor (Rp)',
    'Margin (%)',
    'Catatan Kasir',
  ];

  const dataRows = transaksiList.map((tx, idx) => {
    const totalHpp = tx.detailTransaksi.reduce((s, d) => s + d.hargaPokok * d.jumlah, 0);
    const labaKotor = tx.totalHarga - totalHpp;
    const margin = tx.totalHarga > 0 ? ((labaKotor / tx.totalHarga) * 100).toFixed(1) : '0.0';
    const status = tx.catatan?.toLowerCase().includes('menunggu') ? 'BELUM BAYAR' : 'LUNAS';
    const firstItem = tx.detailTransaksi?.[0]?.terapi?.nama || 'Layanan Medis';
    const layananSummary =
      tx.layananSummary ||
      (tx.detailTransaksi.length > 1
        ? `${firstItem} & ${tx.detailTransaksi.length - 1} tindakan lain`
        : firstItem);

    return [
      idx + 1,
      tx.nomorInvoice || '-',
      tglId(tx.tanggal),
      jamId(tx.tanggal),
      tx.pasien?.nama || '-',
      layananSummary,
      tx.metodePembayaran?.nama || '-',
      status,
      tx.totalHarga,
      totalHpp,
      labaKotor,
      `${margin}%`,
      tx.catatan || '-',
    ];
  });

  // Sheet 1: Audit Trail
  const ws1 = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
  ws1['!cols'] = [
    { wch: 5 }, { wch: 22 }, { wch: 20 }, { wch: 8 }, { wch: 28 },
    { wch: 35 }, { wch: 22 }, { wch: 12 }, { wch: 20 }, { wch: 18 },
    { wch: 18 }, { wch: 12 }, { wch: 40 },
  ];

  // Sheet 2: Detail per item
  const detailHeaders = [
    'No. Invoice', 'Tanggal', 'Nama Pasien',
    'Nama Item / Tindakan', 'HPP/Unit (Rp)', 'Jual/Unit (Rp)',
    'Qty', 'Subtotal Jual (Rp)', 'Subtotal HPP (Rp)', 'Laba Baris (Rp)',
  ];
  const detailRows: (string | number)[][] = [];
  transaksiList.forEach(tx => {
    tx.detailTransaksi.forEach(d => {
      const subtotalHpp = d.hargaPokok * d.jumlah;
      const laba = (d.hargaJual - d.hargaPokok) * d.jumlah;
      detailRows.push([
        tx.nomorInvoice || '-',
        tglId(tx.tanggal),
        tx.pasien?.nama || '-',
        d.terapi?.nama || '-',
        d.hargaPokok,
        d.hargaJual,
        d.jumlah,
        d.subtotal,
        subtotalHpp,
        laba,
      ]);
    });
  });
  const ws2 = XLSX.utils.aoa_to_sheet([detailHeaders, ...detailRows]);
  ws2['!cols'] = [
    { wch: 22 }, { wch: 20 }, { wch: 28 }, { wch: 35 },
    { wch: 18 }, { wch: 18 }, { wch: 6 }, { wch: 20 }, { wch: 18 }, { wch: 18 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, '🧾 Audit Trail');
  XLSX.utils.book_append_sheet(wb, ws2, '🔍 Detail Item');

  const today = new Date().toISOString().split('T')[0].replaceAll('-', '');
  XLSX.writeFile(wb, `Audit_Trail_${today}.xlsx`);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AuditTrailTable({ transaksiList, loading }: AuditTrailTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const toggle = (id: number) => setExpandedId((prev) => (prev === id ? null : id));

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

        {/* Tombol ekspor semua */}
        {transaksiList.length > 0 && (
          <button
            onClick={() => exportAllAudit(transaksiList)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Ekspor Tabel Ini (.xlsx)
          </button>
        )}
      </div>

      {/* Keterangan kolom */}
      {transaksiList.length > 0 && !loading && (
        <div className="flex flex-wrap gap-3 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 text-[9px] text-slate-400 font-bold">
          <span>🟢 <strong className="text-slate-500">LUNAS</strong> = transaksi telah dibayar penuh</span>
          <span>🔴 <strong className="text-slate-500">BELUM BAYAR</strong> = catatan mengandung kata "menunggu"</span>
          <span>▾ <strong className="text-slate-500">Ikon panah</strong> = klik untuk lihat & ekspor rincian item + HPP per invoice</span>
        </div>
      )}

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#007A64]" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 uppercase text-[9px] font-extrabold tracking-wider border-b border-slate-100">
                <th className="py-3 px-4">Tanggal & Jam</th>
                <th className="py-3 px-4">Pasien & Layanan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4 text-right">Omzet (Rp)</th>
                <th className="py-3 px-4 text-right">HPP (Rp)</th>
                <th className="py-3 px-4 text-right">Laba (Rp)</th>
                <th className="py-3 px-4 text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {transaksiList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    Tidak ada riwayat transaksi keuangan pada periode ini.
                  </td>
                </tr>
              ) : (
                transaksiList.map((tx) => {
                  const totalHpp = tx.detailTransaksi.reduce((sum, d) => sum + d.hargaPokok * d.jumlah, 0);
                  const labaKotor = tx.totalHarga - totalHpp;
                  const isExpanded = expandedId === tx.id;
                  const isBelumBayar = tx.catatan?.toLowerCase().includes('menunggu');

                  const firstItemName = tx.detailTransaksi?.[0]?.terapi?.nama || 'Layanan Medis';
                  const subLayananText =
                    tx.layananSummary ||
                    (tx.detailTransaksi.length > 1
                      ? `${firstItemName} & ${tx.detailTransaksi.length - 1} tindakan`
                      : firstItemName);

                  const dateFormatted = tglId(tx.tanggal);
                  const timeFormatted = jamId(tx.tanggal);

                  return (
                    <React.Fragment key={tx.id}>
                      <tr className="hover:bg-slate-50/40 transition-colors">
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-700">{dateFormatted}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{timeFormatted}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <h5 className="font-extrabold text-slate-800">{tx.pasien?.nama}</h5>
                            <p className="text-[10px] text-slate-400 font-medium">{subLayananText}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                            !isBelumBayar
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/40'
                              : 'bg-rose-50 text-rose-700 border-rose-200/40'
                          }`}>
                            {!isBelumBayar ? 'LUNAS' : 'BELUM BAYAR'}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-500">{tx.metodePembayaran?.nama}</td>
                        <td className="py-4 px-4 text-right text-slate-800 font-black">{formatRupiah(tx.totalHarga)}</td>
                        <td className="py-4 px-4 text-right text-slate-400 font-semibold">{formatRupiah(totalHpp)}</td>
                        <td className="py-4 px-4 text-right font-black text-teal-600">{formatRupiah(labaKotor)}</td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => toggle(tx.id)}
                            title="Lihat & ekspor rincian invoice"
                            className="p-1.5 text-slate-400 hover:text-[#007A64] hover:bg-[#E6F3F0] rounded transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable detail row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/40">
                          <td colSpan={8} className="px-6 py-4 border-l-2 border-[#007A64]">
                            <div className="space-y-4">
                              {/* Invoice meta */}
                              <div className="flex justify-between items-start gap-4 flex-wrap">
                                <div>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Catatan Kasir</p>
                                  <p className="text-slate-600 mt-1 italic font-semibold text-xs leading-relaxed">
                                    &ldquo;{tx.catatan || 'Tidak ada catatan khusus.'}&rdquo;
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {/* Ekspor struk satu transaksi */}
                                  <button
                                    onClick={() => exportSingleTransaksi(tx)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                                  >
                                    <Receipt className="w-3 h-3" />
                                    Ekspor Struk (.xlsx)
                                  </button>
                                  <div className="text-right text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                    <p>No Invoice: <span className="text-slate-600">{tx.nomorInvoice}</span></p>
                                    {tx.createdAt && (
                                      <p className="mt-0.5">Input: {new Date(tx.createdAt).toLocaleString('id-ID')}</p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Detail item table */}
                              <div className="border border-slate-200/70 rounded-md overflow-hidden bg-white relative">
                                <BracketFrame />
                                <table className="w-full text-left text-xs">
                                  <thead>
                                    <tr className="bg-slate-100/70 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-150">
                                      <th className="py-2.5 px-4">Nama Item / Tindakan</th>
                                      <th className="py-2.5 px-4 text-right">HPP / Unit</th>
                                      <th className="py-2.5 px-4 text-right">Tarif Jual / Unit</th>
                                      <th className="py-2.5 px-4 text-center">Qty</th>
                                      <th className="py-2.5 px-4 text-right">Subtotal Jual</th>
                                      <th className="py-2.5 px-4 text-right">Subtotal HPP</th>
                                      <th className="py-2.5 px-4 text-right">Laba Baris</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 font-medium">
                                    {tx.detailTransaksi?.map((detail, idx) => {
                                      const subtotalHpp = detail.hargaPokok * detail.jumlah;
                                      const detailProfit = (detail.hargaJual - detail.hargaPokok) * detail.jumlah;
                                      return (
                                        <tr key={idx}>
                                          <td className="py-2.5 px-4 font-bold text-slate-800">{detail.terapi?.nama}</td>
                                          <td className="py-2.5 px-4 text-right text-slate-400">{formatRupiah(detail.hargaPokok)}</td>
                                          <td className="py-2.5 px-4 text-right">{formatRupiah(detail.hargaJual)}</td>
                                          <td className="py-2.5 px-4 text-center font-bold text-slate-800">{detail.jumlah}</td>
                                          <td className="py-2.5 px-4 text-right font-bold text-slate-800">{formatRupiah(detail.subtotal)}</td>
                                          <td className="py-2.5 px-4 text-right text-slate-400">{formatRupiah(subtotalHpp)}</td>
                                          <td className="py-2.5 px-4 text-right font-bold text-teal-600">{formatRupiah(detailProfit)}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              {/* Rekap finansial invoice */}
                              <div className="bg-slate-100/40 p-3 rounded-lg border border-slate-200/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-bold">
                                <span className="text-slate-500 uppercase text-[9px] font-bold tracking-wider">Rekap Finansial Invoice</span>
                                <div className="flex flex-wrap gap-4">
                                  <span className="text-slate-500">HPP Total: <strong className="text-slate-700">{formatRupiah(totalHpp)}</strong></span>
                                  <span className="text-slate-500">Omzet: <strong className="text-slate-800">{formatRupiah(tx.totalHarga)}</strong></span>
                                  <span className="text-teal-700">Laba Kotor: <strong>{formatRupiah(labaKotor)}</strong></span>
                                  <span className="text-indigo-600">
                                    Margin:{' '}
                                    <strong>
                                      {tx.totalHarga > 0 ? ((labaKotor / tx.totalHarga) * 100).toFixed(1) : '0.0'}%
                                    </strong>
                                  </span>
                                </div>
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
    </div>
  );
}

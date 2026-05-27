'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import BracketFrame from '@/components/ui/BracketFrame';

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
  detailTransaksi: Array<{
    id: number;
    terapi?: { nama: string };
    hargaJual: number;
    hargaPokok: number;
    jumlah: number;
    subtotal: number;
  }>;
}

interface AuditTrailTableProps {
  transaksiList: TransaksiItem[];
  loading: boolean;
}

const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

export default function AuditTrailTable({ transaksiList, loading }: AuditTrailTableProps) {
  // Expand/collapse state is local — only this component re-renders on toggle
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggle = (id: number) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="bg-white rounded-md border border-slate-150 shadow-sm relative overflow-hidden flex flex-col p-6 space-y-4">
      <BracketFrame />

      <div className="flex justify-between items-center">
        <h4 className="font-extrabold text-sm text-slate-800">Audit Transaksi Terkini</h4>
        <span className="text-[10px] text-slate-400 font-bold">Menampilkan {transaksiList.length} transaksi terakhir</span>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#007A64]" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 uppercase text-[9px] font-extrabold tracking-wider border-b border-slate-100">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Pasien</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4 text-right">Total (Rp)</th>
                <th className="py-3 px-4 text-center" />
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

                  const dateFormatted = new Date(tx.tanggal).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  });
                  const timeFormatted = new Date(tx.tanggal).toLocaleTimeString('id-ID', {
                    hour: '2-digit', minute: '2-digit',
                  });

                  return (
                    <React.Fragment key={tx.id}>
                      <tr className="hover:bg-slate-50/40 transition-colors">
                        <td className="py-4 px-4 text-slate-400 font-semibold">{dateFormatted}, {timeFormatted}</td>
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
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => toggle(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-[#007A64] hover:bg-[#E6F3F0] rounded transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable detail row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/40">
                          <td colSpan={6} className="px-6 py-4 border-l-2 border-[#007A64]">
                            <div className="space-y-4">
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Catatan Kasir</p>
                                  <p className="text-slate-600 mt-1 italic font-semibold text-xs leading-relaxed">
                                    &ldquo;{tx.catatan || 'Tidak ada catatan khusus.'}&rdquo;
                                  </p>
                                </div>
                                <div className="text-right text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                  <p>No Invoice: {tx.nomorInvoice}</p>
                                  {tx.createdAt && (
                                    <p className="mt-0.5">Tgl Input: {new Date(tx.createdAt).toLocaleString('id-ID')}</p>
                                  )}
                                </div>
                              </div>

                              <div className="border border-slate-200/70 rounded-md overflow-hidden bg-white relative">
                                <BracketFrame />
                                <table className="w-full text-left text-xs">
                                  <thead>
                                    <tr className="bg-slate-100/70 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-150">
                                      <th className="py-2.5 px-4">Nama Item / Tindakan</th>
                                      <th className="py-2.5 px-4 text-right">HPP (Modal)</th>
                                      <th className="py-2.5 px-4 text-right">Tarif Jual</th>
                                      <th className="py-2.5 px-4 text-center">Qty</th>
                                      <th className="py-2.5 px-4 text-right">Subtotal</th>
                                      <th className="py-2.5 px-4 text-right">Laba</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 font-medium">
                                    {tx.detailTransaksi?.map((detail, idx) => {
                                      const detailProfit = (detail.hargaJual - detail.hargaPokok) * detail.jumlah;
                                      return (
                                        <tr key={idx}>
                                          <td className="py-2.5 px-4 font-bold text-slate-800">{detail.terapi?.nama}</td>
                                          <td className="py-2.5 px-4 text-right text-slate-400">{formatRupiah(detail.hargaPokok)}</td>
                                          <td className="py-2.5 px-4 text-right">{formatRupiah(detail.hargaJual)}</td>
                                          <td className="py-2.5 px-4 text-center font-bold text-slate-800">{detail.jumlah}</td>
                                          <td className="py-2.5 px-4 text-right font-bold text-slate-800">{formatRupiah(detail.subtotal)}</td>
                                          <td className="py-2.5 px-4 text-right font-bold text-teal-600">{formatRupiah(detailProfit)}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              <div className="bg-slate-100/40 p-3 rounded-lg flex justify-between items-center text-xs font-bold border border-slate-200/50">
                                <span className="text-slate-500 uppercase text-[9px] font-bold tracking-wider">Rekap Finansial Invoice</span>
                                <div className="flex gap-4">
                                  <span className="text-slate-500">HPP: <strong className="text-slate-700">{formatRupiah(totalHpp)}</strong></span>
                                  <span className="text-slate-500">Omzet: <strong className="text-slate-800">{formatRupiah(tx.totalHarga)}</strong></span>
                                  <span className="text-teal-700">Laba Kotor: <strong>{formatRupiah(labaKotor)}</strong></span>
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

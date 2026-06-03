'use client';

import React from 'react';
import { Calendar, CreditCard, Receipt, Activity } from 'lucide-react';
import BracketFrame from '@/components/ui/BracketFrame';

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
  pasien?: { id: number; nama: string } | null;
}

interface RiwayatPasienTableProps {
  transaksi: TransaksiItem[];
  showPasienColumn?: boolean;
}

const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

export default function RiwayatPasienTable({ transaksi, showPasienColumn = false }: RiwayatPasienTableProps) {
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

  // Display newest first (descending)
  const displayTx = [...transaksi].sort(
    (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
  );

  return (
    <div className="bg-white rounded-md border border-slate-150 shadow-sm relative overflow-hidden flex flex-col p-6 space-y-4">
      <BracketFrame />
      
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#007A64]" />
          Log Riwayat Kunjungan
        </h4>
        <span className="text-[10px] bg-[#E6F3F0] text-[#007A64] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
          {transaksi.length} Kunjungan
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 uppercase text-[9px] font-extrabold tracking-wider border-b border-slate-100">
              <th className="py-3 px-4">Tanggal & Jam</th>
              {showPasienColumn && <th className="py-3 px-4">Nama Pasien</th>}
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
                <td colSpan={showPasienColumn ? 7 : 6} className="py-12 text-center text-slate-400 text-xs">
                  Tidak ada riwayat kunjungan dalam rentang filter ini.
                </td>
              </tr>
            ) : (
              displayTx.map((tx) => {
                const listTindakan = tx.detailTransaksi.map(
                  (d) => d.terapi?.nama || d.namaManual || 'Tindakan Manual'
                );

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <div>
                          <p className="font-bold text-slate-800">{formatDate(tx.tanggal)}</p>
                          <p className="text-[9px] text-slate-400 font-semibold">{formatTime(tx.tanggal)} WIB</p>
                        </div>
                      </div>
                    </td>
                    {showPasienColumn && (
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {tx.pasien?.nama || 'Umum'}
                      </td>
                    )}
                    <td className="py-3 px-4 font-mono font-bold text-slate-500 uppercase tracking-tight">
                      {tx.nomorInvoice || `INV/TX-${tx.id}`}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-sm">
                        {listTindakan.map((tindakan, i) => (
                          <span
                            key={i}
                            className="inline-block bg-[#E6F3F0]/65 text-[#007A64] text-[10px] font-bold px-2 py-0.5 rounded border border-[#007A64]/10"
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
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        {tx.metodePembayaran?.nama || 'Tunai'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                        intervals[tx.id] === 'Kunjungan Awal'
                          ? 'bg-blue-50 text-blue-700 border border-blue-150'
                          : 'bg-amber-50 text-amber-700 border border-amber-150'
                      }`}>
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

'use client';

import Link from 'next/link';
import BracketFrame from '@/components/ui/BracketFrame';

interface TransactionItem {
  waktu: string;
  pasien: string;
  layanan: string;
  metode: string;
  total: number;
  status: 'Lunas' | 'Belum Bayar';
}

interface RecentTransactionsProps {
  transactions: TransactionItem[];
}

const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="bg-white p-6 shadow-sm border border-slate-150 rounded-md relative space-y-4">
      <BracketFrame />

      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <h4 className="font-extrabold text-sm text-slate-800">Transaksi Terakhir</h4>
        <Link
          href="/laporan"
          className="border border-dashed border-[#007A64] hover:bg-teal-50/50 text-[#007A64] font-bold px-4 py-1.5 rounded-full transition-all text-[11px] inline-flex items-center"
        >
          Lihat Semua
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 uppercase text-[9px] font-extrabold tracking-wider border-b border-slate-100">
              <th className="py-3.5 px-4">Waktu</th>
              <th className="py-3.5 px-4">Pasien</th>
              <th className="py-3.5 px-4">Layanan</th>
              <th className="py-3.5 px-4">Metode</th>
              <th className="py-3.5 px-4 text-right">Total</th>
              <th className="py-3.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx, idx) => (
              <tr key={idx} className="hover:bg-slate-50/40 text-slate-700 transition-colors">
                <td className="py-4 px-4 font-semibold text-slate-400">{tx.waktu}</td>
                <td className="py-4 px-4 font-bold text-slate-800">{tx.pasien}</td>
                <td className="py-4 px-4 font-semibold text-slate-600">{tx.layanan}</td>
                <td className="py-4 px-4 font-bold text-slate-500">{tx.metode}</td>
                <td className="py-4 px-4 text-right font-extrabold text-slate-800">{formatRupiah(tx.total)}</td>
                <td className="py-4 px-4 text-center">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                      tx.status === 'Lunas'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/30'
                        : 'bg-rose-50 text-rose-700 border-rose-200/30'
                    }`}
                  >
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import { Check, X } from 'lucide-react';
import BracketFrame from '@/components/ui/BracketFrame';

interface InvoiceData {
  nomorInvoice: string;
  tanggal: string;
  pasien?: { nama: string };
  metodePembayaran?: { nama: string };
  totalHarga: number;
  catatan?: string;
  detailTransaksi?: Array<{
    terapi?: { nama: string };
    hargaJual: number;
    jumlah: number;
  }>;
}

interface InvoiceModalProps {
  invoice: InvoiceData | null;
  onClose: () => void;
}

const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

export default function InvoiceModal({ invoice, onClose }: InvoiceModalProps) {
  if (!invoice) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200 relative">
        <BracketFrame />

        {/* Header */}
        <div className="flex flex-col items-center p-6 text-center bg-[#007A64] text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 hover:bg-[#006653] rounded-lg text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-[#007A64] mb-3 shadow">
            <Check className="w-5 h-5 stroke-[3px]" />
          </div>
          <h3 className="font-black text-sm uppercase tracking-wider">Transaksi Sukses!</h3>
          <p className="text-[10px] text-teal-100 mt-0.5">Nota pembayaran POS kasir telah tersimpan.</p>
        </div>

        {/* Receipt details */}
        <div className="p-6 space-y-3.5 text-xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-slate-400 font-semibold">Nomor Invoice</span>
            <span className="font-mono font-bold text-slate-800">{invoice.nomorInvoice}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-slate-400 font-semibold">Tanggal</span>
            <span className="font-bold text-slate-700">{new Date(invoice.tanggal).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-slate-400 font-semibold">Pasien</span>
            <span className="font-black text-slate-800">{invoice.pasien?.nama}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-slate-400 font-semibold">Metode Bayar</span>
            <span className="font-bold text-slate-800">{invoice.metodePembayaran?.nama}</span>
          </div>

          {/* Items list */}
          <div className="space-y-1.5">
            <h5 className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Layanan Terapi</h5>
            <div className="bg-slate-50 border border-slate-150 rounded-md p-3 space-y-2 max-h-32 overflow-y-auto text-[11px] text-slate-700">
              {invoice.detailTransaksi?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center font-medium">
                  <span className="truncate pr-4">
                    {item.terapi?.nama} (x{item.jumlah})
                  </span>
                  <span className="font-bold shrink-0">{formatRupiah(item.hargaJual * item.jumlah)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase">Total Bayar</span>
            <span className="text-base font-black text-[#007A64]">{formatRupiah(invoice.totalHarga)}</span>
          </div>

          {invoice.catatan && (
            <div className="p-2.5 bg-teal-50/50 border border-teal-100 rounded-lg text-[10px] text-teal-800 leading-normal">
              <span className="font-bold">Catatan:</span> {invoice.catatan}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#007A64] hover:bg-[#006653] text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
          >
            Transaksi Baru
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Filter, ChevronRight } from 'lucide-react';
import BracketFrame from '@/components/ui/BracketFrame';

interface BreakdownKategori {
  kategori: string;
  nominalJual: number;
  nominalModal: number;
  labaKotor: number;
  margin: number;
  jumlahLayanan: number;
}

interface KategoriChartProps {
  breakdownKategori: BreakdownKategori[];
}

const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

function getBarColor(kategori: string): string {
  const norm = kategori.toUpperCase();
  if (norm.includes('IMUNISASI')) return 'bg-[#5D6B82]';
  if (norm.includes('HAMIL') || norm.includes('ANC')) return 'bg-[#9A6E3B]';
  if (norm.includes('UMUM') || norm.includes('LAINNYA')) return 'bg-[#828C96]';
  return 'bg-[#007A64]';
}

export default function KategoriChart({ breakdownKategori }: KategoriChartProps) {
  const totalOmzet = breakdownKategori.reduce((acc, curr) => acc + curr.nominalJual, 0);
  const maxVal = Math.max(...breakdownKategori.map((k) => k.nominalJual));

  return (
    <div className="lg:col-span-8 bg-white p-6 shadow-sm border border-slate-150 rounded-md relative flex flex-col justify-between min-h-[400px]">
      <BracketFrame />
      <div>
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-extrabold text-sm text-slate-800">Rekap Kontribusi Kategori Terapi</h4>
          <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 font-bold px-2.5 py-1 border border-slate-200 rounded-md transition-all">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
        </div>

        <div className="space-y-5">
          {breakdownKategori.map((k, idx) => {
            const percentBar = maxVal > 0 ? (k.nominalJual / maxVal) * 100 : 0;
            const percentContribution = totalOmzet > 0 ? Math.round((k.nominalJual / totalOmzet) * 100) : 0;
            const barColor = getBarColor(k.kategori);

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>{k.kategori}</span>
                  <span className="text-slate-800">
                    {formatRupiah(k.nominalJual)} ({percentContribution}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`${barColor} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${percentBar}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/laporan"
          className="bg-[#005C4B] hover:bg-[#004D3F] transition-all text-white text-xs font-bold px-6 py-2.5 rounded-full inline-flex items-center gap-2 shadow-sm"
        >
          Lihat Detail Laporan Keuangan
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

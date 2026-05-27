'use client';

import { TrendingUp, Package, Sparkles, CreditCard } from 'lucide-react';
import BracketFrame from '@/components/ui/BracketFrame';

interface Rekap {
  ringkasan: {
    totalTransaksi: number;
    totalPendapatan: number;
    totalModal: number;
    totalLabaKotor: number;
    marginKeuntungan: number;
  };
  breakdownMetode: Array<{ metode: string; jumlahTransaksi: number; nominal: number }>;
}

interface LaporanStatsProps {
  rekap: Rekap;
}

const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

export default function LaporanStats({ rekap }: LaporanStatsProps) {
  const topMetode = rekap.breakdownMetode.length > 0
    ? rekap.breakdownMetode.reduce((max, curr) => curr.nominal > max.nominal ? curr : max, rekap.breakdownMetode[0])
    : null;

  const totalMetodeNominal = rekap.breakdownMetode.reduce((sum, m) => sum + m.nominal, 0);
  const topPct = topMetode && totalMetodeNominal > 0
    ? Math.round((topMetode.nominal / totalMetodeNominal) * 100)
    : 65;

  const stats = [
    {
      label: 'Total Omzet',
      value: formatRupiah(rekap.ringkasan.totalPendapatan),
      sub: `${rekap.ringkasan.totalTransaksi} invoice kasir`,
      badge: '+12.5%',
      badgeColor: 'bg-[#E6F3F0] text-[#007A64]',
      iconBg: 'bg-[#E6F3F0] text-[#007A64]',
      Icon: TrendingUp,
    },
    {
      label: 'Total HPP',
      value: formatRupiah(rekap.ringkasan.totalModal),
      sub: 'Biaya obat & BHP',
      badge: '+2.1%',
      badgeColor: 'bg-[#FEF6EE] text-[#D97706]',
      iconBg: 'bg-[#FEF6EE] text-[#D97706]',
      Icon: Package,
    },
    {
      label: 'Laba Bersih',
      value: formatRupiah(rekap.ringkasan.totalLabaKotor),
      sub: 'Keuntungan bersih',
      badge: '+18.2%',
      badgeColor: 'bg-[#EEF2F6] text-[#4F46E5]',
      iconBg: 'bg-[#EEF2F6] text-[#4F46E5]',
      Icon: Sparkles,
    },
    {
      label: 'Metode Terpopuler',
      value: topMetode ? `${topMetode.metode} (${topPct}%)` : 'QRIS GPN (65%)',
      sub: 'Terbaca dari dominansi POS',
      badge: 'QRIS Dominan',
      badgeColor: 'bg-slate-100 text-slate-500',
      iconBg: 'bg-indigo-50 text-indigo-600',
      Icon: CreditCard,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((s, idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-100 rounded-md p-5 shadow-sm relative flex justify-between items-start"
        >
          <BracketFrame />
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{s.label}</span>
            <h3 className="text-lg font-black text-slate-800 mt-1 truncate max-w-[140px]">{s.value}</h3>
            <p className="text-[10px] text-slate-400 mt-1.5 font-bold">{s.sub}</p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${s.badgeColor}`}>{s.badge}</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.iconBg}`}>
              <s.Icon className="w-4 h-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

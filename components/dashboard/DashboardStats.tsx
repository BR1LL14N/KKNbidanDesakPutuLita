'use client';

import { TrendingUp, Users, Coins, Calendar } from 'lucide-react';
import BracketFrame from '@/components/ui/BracketFrame';

interface DashboardStatsProps {
  ringkasan: {
    totalTransaksi: number;
    totalPendapatan: number;
    totalLabaKotor: number;
    marginKeuntungan: number;
  };
  rataRataHarian: number;
  periodLabel: string;
}

const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

export default function DashboardStats({ ringkasan, rataRataHarian, periodLabel }: DashboardStatsProps) {
  const stats = [
    {
      label: 'Total Pendapatan',
      value: formatRupiah(ringkasan.totalPendapatan),
      sub: periodLabel,
      iconBg: 'bg-[#E6F3F0] text-[#007A64]',
      Icon: TrendingUp,
    },
    {
      label: 'Laba Kotor',
      value: formatRupiah(ringkasan.totalLabaKotor),
      valueColor: 'text-[#007A64]',
      sub: `Margin Keuntungan ${ringkasan.marginKeuntungan.toFixed(1)}%`,
      iconBg: 'bg-[#FEF6EE] text-[#D97706]',
      Icon: Coins,
    },
    {
      label: 'Jumlah Kunjungan',
      value: `${ringkasan.totalTransaksi} Pasien`,
      sub: 'Total kunjungan dalam periode',
      iconBg: 'bg-[#EEF2F6] text-[#4F46E5]',
      Icon: Users,
    },
    {
      label: 'Rata-rata / Hari',
      value: `${rataRataHarian.toFixed(1)} Kunjungan`,
      valueColor: 'text-slate-800',
      sub: 'Rata-rata kunjungan harian',
      iconBg: 'bg-[#FDF2F2] text-[#E11D48]',
      Icon: Calendar,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((s, idx) => (
        <div
          key={idx}
          className="bg-white rounded-md p-5 shadow-sm border border-slate-100/50 relative flex justify-between items-start"
        >
          <BracketFrame />
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">{s.label}</span>
            <h3 className={`text-xl font-black tracking-tight ${s.valueColor ?? 'text-slate-800'}`}>{s.value}</h3>
            <p className="text-[11px] text-slate-400 font-medium">{s.sub}</p>
          </div>
          <div className="flex flex-col items-end justify-center shrink-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.iconBg}`}>
              <s.Icon className="w-4 h-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

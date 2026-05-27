'use client';

import { TrendingUp, Users, Coins, Package } from 'lucide-react';
import BracketFrame from '@/components/ui/BracketFrame';

interface Ringkasan {
  totalTransaksi: number;
  totalPendapatan: number;
  totalModal: number;
  totalLabaKotor: number;
  marginKeuntungan: number;
}

interface DashboardStatsProps {
  ringkasan: Ringkasan;
}

const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

export default function DashboardStats({ ringkasan }: DashboardStatsProps) {
  const stats = [
    {
      label: 'Total Pendapatan',
      value: formatRupiah(ringkasan.totalPendapatan),
      sub: 'Bulan ini (Mar 2024)',
      badge: '+12.5%',
      badgeColor: 'bg-[#E6F3F0] text-[#007A64]',
      iconBg: 'bg-[#E6F3F0] text-[#007A64]',
      Icon: TrendingUp,
    },
    {
      label: 'Total HPP',
      value: formatRupiah(ringkasan.totalModal),
      sub: 'Biaya obat & BHP',
      badge: '+2.1%',
      badgeColor: 'bg-[#EEF2F6] text-[#4F46E5]',
      iconBg: 'bg-[#EEF2F6] text-[#4F46E5]',
      Icon: Package,
    },
    {
      label: 'Laba Kotor',
      value: formatRupiah(ringkasan.totalLabaKotor),
      valueColor: 'text-[#007A64]',
      sub: 'Keuntungan bersih operasional',
      badge: `Margin ${ringkasan.marginKeuntungan}%`,
      badgeColor: 'bg-[#FEF6EE] text-[#D97706]',
      iconBg: 'bg-[#FEF6EE] text-[#D97706]',
      Icon: Coins,
    },
    {
      label: 'Total Kunjungan',
      value: `${ringkasan.totalTransaksi} Pasien`,
      sub: 'Rata-rata 5 pasien/hari',
      badge: '+8 Pasien',
      badgeColor: 'bg-[#FDF2F2] text-[#E11D48]',
      iconBg: 'bg-[#FDF2F2] text-[#E11D48]',
      Icon: Users,
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
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.badgeColor}`}>{s.badge}</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.iconBg}`}>
              <s.Icon className="w-4 h-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

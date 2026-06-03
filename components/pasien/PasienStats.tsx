'use client';

import { Users, Calendar, UserPlus } from 'lucide-react';
import BracketFrame from '@/components/ui/BracketFrame';

interface PasienStatsProps {
  totalPasien: number;
  pasienHariIni: number;
  pasienBaruBulanIni: number;
}

export default function PasienStats({ totalPasien, pasienHariIni, pasienBaruBulanIni }: PasienStatsProps) {
  const stats = [
    {
      label: 'Total Pasien',
      value: totalPasien.toLocaleString('id-ID'),
      sub: '↗ +12% bulan ini',
      subColor: 'text-[#007A64]',
      iconBg: 'bg-[#E6F3F0] text-[#007A64]',
      Icon: Users,
    },
    {
      label: 'Pasien Hari Ini',
      value: pasienHariIni.toLocaleString('id-ID'),
      sub: 'Semua jadwal terpenuhi',
      subColor: 'text-slate-400',
      iconBg: 'bg-[#FEF6EE] text-[#D97706]',
      Icon: Calendar,
    },
    {
      label: 'Pasien Baru Bulan Ini',
      value: pasienBaruBulanIni.toLocaleString('id-ID'),
      sub: 'Pertumbuhan bulanan',
      subColor: 'text-[#007A64]',
      iconBg: 'bg-[#E6F3F0] text-[#007A64]',
      Icon: UserPlus,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((s, idx) => (
        <div
          key={idx}
          className="bg-white rounded-md p-5 border border-slate-100/50 shadow-sm relative flex justify-between items-start"
        >
          <BracketFrame />
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">{s.label}</span>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">{s.value}</h3>
            <p className={`text-[10px] font-bold ${s.subColor}`}>{s.sub}</p>
          </div>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.iconBg}`}>
            <s.Icon className="w-4 h-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

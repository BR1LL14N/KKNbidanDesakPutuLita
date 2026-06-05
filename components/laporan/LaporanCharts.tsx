'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, CreditCard, Star, ChevronDown } from 'lucide-react';
import BracketFrame from '@/components/ui/BracketFrame';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ─── Types ───────────────────────────────────────────────────────────────────

interface OmzetBulanan {
  bulan: string;
  omzet: number;
  hpp: number;
  laba: number;
  jumlahTransaksi: number;
}

interface MetodePopuler {
  metode: string;
  jumlah: number;
  nominal: number;
}

interface LayananPopuler {
  nama: string;
  kategori: string;
  jumlah: number;
  omzet: number;
}

interface AnalyticsData {
  year: number;
  omzetBulanan: OmzetBulanan[];
  metodePopuler: MetodePopuler[];
  layananPopuler: LayananPopuler[];
  allMetode: string[];
  metodeBulanan: Array<Record<string, unknown>>;
}

// ─── Mock Data (fallback) ────────────────────────────────────────────────────

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

function generateMockData(year: number): AnalyticsData {
  const omzetBulanan: OmzetBulanan[] = BULAN.map((bulan, i) => {
    const base = 8000000 + Math.sin(i * 0.7) * 4000000 + i * 300000;
    const omzet = Math.round(base);
    const hpp = Math.round(omzet * 0.38);
    return { bulan, omzet, hpp, laba: omzet - hpp, jumlahTransaksi: Math.round(8 + i * 1.5) };
  });

  const metodePopuler: MetodePopuler[] = [
    { metode: 'Tunai / Cash', jumlah: 48, nominal: 12400000 },
    { metode: 'QRIS', jumlah: 31, nominal: 8900000 },
    { metode: 'Transfer BCA', jumlah: 14, nominal: 4200000 },
    { metode: 'Transfer Mandiri', jumlah: 7, nominal: 2100000 },
  ];

  const layananPopuler: LayananPopuler[] = [
    { nama: 'Persalinan Normal Bidan', kategori: 'Paket', jumlah: 12, omzet: 42000000 },
    { nama: 'ANC (Antenatal Care)', kategori: 'Pemeriksaan', jumlah: 28, omzet: 8400000 },
    { nama: 'KB Suntik 3 Bulan', kategori: 'KB', jumlah: 24, omzet: 3600000 },
    { nama: 'Imunisasi DPT', kategori: 'Imunisasi', jumlah: 19, omzet: 2850000 },
    { nama: 'Perawatan Luka', kategori: 'Tindakan', jumlah: 16, omzet: 2400000 },
    { nama: 'Nebulizer', kategori: 'Tindakan', jumlah: 13, omzet: 1950000 },
    { nama: 'Cek Gula Darah', kategori: 'Pemeriksaan', jumlah: 11, omzet: 1100000 },
    { nama: 'Vitamin Kehamilan', kategori: 'Obat', jumlah: 9, omzet: 900000 },
  ];

  return {
    year,
    omzetBulanan,
    metodePopuler,
    layananPopuler,
    allMetode: metodePopuler.map(m => m.metode),
    metodeBulanan: BULAN.map(b => ({ bulan: b })),
  };
}

// ─── Color palette ───────────────────────────────────────────────────────────

const PALETTE = {
  teal:   { solid: '#007A64', light: 'rgba(0,122,100,0.15)', border: '#007A64' },
  amber:  { solid: '#D97706', light: 'rgba(217,119,6,0.15)',  border: '#D97706' },
  indigo: { solid: '#6366F1', light: 'rgba(99,102,241,0.15)', border: '#6366F1' },
  rose:   { solid: '#F43F5E', light: 'rgba(244,63,94,0.15)',  border: '#F43F5E' },
  sky:    { solid: '#0EA5E9', light: 'rgba(14,165,233,0.15)', border: '#0EA5E9' },
  violet: { solid: '#8B5CF6', light: 'rgba(139,92,246,0.15)', border: '#8B5CF6' },
};

const METODE_COLORS = [PALETTE.teal, PALETTE.indigo, PALETTE.amber, PALETTE.rose, PALETTE.sky];

const KATEGORI_COLOR: Record<string, string> = {
  'Paket': PALETTE.teal.solid,
  'Pemeriksaan': PALETTE.indigo.solid,
  'KB': PALETTE.amber.solid,
  'Imunisasi': PALETTE.rose.solid,
  'Tindakan': PALETTE.sky.solid,
  'Obat': PALETTE.violet.solid,
};

const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

const formatShort = (val: number) => {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}jt`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}rb`;
  return val.toString();
};

// ─── Chart Options (shared) ──────────────────────────────────────────────────

const baseLineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: { font: { size: 11, weight: 'bold' as const }, boxWidth: 12, padding: 16 },
    },
    tooltip: {
      backgroundColor: '#1E293B',
      titleFont: { size: 12 },
      bodyFont: { size: 11 },
      padding: 12,
      callbacks: {
        label: (ctx: any) => ` ${ctx.dataset.label}: ${formatRupiah(ctx.raw)}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 10, weight: 'bold' as const }, color: '#94A3B8' },
    },
    y: {
      grid: { color: 'rgba(148,163,184,0.1)' },
      ticks: {
        font: { size: 10 },
        color: '#94A3B8',
        callback: (val: any) => formatShort(val),
      },
    },
  },
};

const baseBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: { font: { size: 11, weight: 'bold' as const }, boxWidth: 12, padding: 16 },
    },
    tooltip: {
      backgroundColor: '#1E293B',
      titleFont: { size: 12 },
      bodyFont: { size: 11 },
      padding: 12,
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' as const }, color: '#94A3B8' } },
    y: {
      grid: { color: 'rgba(148,163,184,0.1)' },
      ticks: { font: { size: 10 }, color: '#94A3B8' },
    },
  },
};

// ─── Sub-charts ───────────────────────────────────────────────────────────────

function OmzetChart({ data }: { data: OmzetBulanan[] }) {
  const chartData = {
    labels: data.map(d => d.bulan),
    datasets: [
      {
        label: 'Omzet',
        data: data.map(d => d.omzet),
        borderColor: PALETTE.teal.solid,
        backgroundColor: PALETTE.teal.light,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: PALETTE.teal.solid,
        pointRadius: 4,
        pointHoverRadius: 7,
      },
    ],
  };

  // Summary strip
  const totalOmzet = data.reduce((s, d) => s + d.omzet, 0);
  const bestMonth = data.reduce((best, d) => d.omzet > best.omzet ? d : best, data[0]);

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="bg-[#E6F3F0] rounded-xl p-4 text-center max-w-md mx-auto border border-[#007A64]/10 shadow-sm">
        <p className="text-[10px] text-[#007A64] font-extrabold uppercase tracking-wider">Total Omzet Pendapatan</p>
        <p className="text-2xl font-black text-[#007A64] mt-1">{formatRupiah(totalOmzet)}</p>
      </div>

      {/* Bulan terbaik badge */}
      {bestMonth && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#007A64]/5 border border-[#007A64]/20 rounded-lg w-fit text-xs text-[#007A64] font-bold mx-auto">
          <Star className="w-3.5 h-3.5" />
          Bulan terbaik: <span className="font-black">{bestMonth.bulan}</span> — {formatRupiah(bestMonth.omzet)}
        </div>
      )}
      <div className="h-[280px]">
        <Line data={chartData} options={baseLineOptions} />
      </div>
    </div>
  );
}

function MetodeChart({ data, metodeBulanan, allMetode }: { data: MetodePopuler[]; metodeBulanan: Array<Record<string, unknown>>; allMetode: string[] }) {
  const [subView, setSubView] = useState<'bar' | 'donut'>('donut');

  const donutData = {
    labels: data.map(d => d.metode),
    datasets: [{
      data: data.map(d => d.jumlah),
      backgroundColor: METODE_COLORS.slice(0, data.length).map(c => c.solid),
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverOffset: 8,
    }],
  };

  const barData = {
    labels: BULAN,
    datasets: allMetode.map((metode, idx) => ({
      label: metode,
      data: metodeBulanan.map(b => (b[metode] as number) || 0),
      backgroundColor: METODE_COLORS[idx % METODE_COLORS.length].solid,
      borderRadius: 4,
    })),
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1E293B',
        callbacks: {
          label: (ctx: any) => ` ${ctx.label}: ${ctx.raw} transaksi`,
        },
      },
    },
    cutout: '65%',
  };

  const totalTx = data.reduce((s, d) => s + d.jumlah, 0);

  return (
    <div className="space-y-4">
      {/* Sub-view toggle */}
      <div className="flex gap-2">
        {[{ key: 'donut', label: 'Distribusi Donat' }, { key: 'bar', label: 'Tren Bulanan' }].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSubView(key as 'bar' | 'donut')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              subView === key
                ? 'bg-[#007A64] text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {subView === 'donut' ? (
        <div className="flex items-center justify-center gap-12 py-4">
          <div className="relative h-[220px] w-[220px] shrink-0">
            <Doughnut data={donutData} options={donutOptions} />
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-800">{totalTx}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">transaksi</span>
            </div>
          </div>
          {/* Stats list */}
          <div className="space-y-3 min-w-[180px]">
            {data.map((d, idx) => (
              <div key={d.metode} className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: METODE_COLORS[idx % METODE_COLORS.length].solid }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-slate-700 truncate">{d.metode}</p>
                  <p className="text-[9px] text-slate-400 font-bold">{d.jumlah} tx · {formatShort(d.nominal)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-[280px]">
          <Bar data={barData} options={{ ...baseBarOptions, scales: { ...baseBarOptions.scales, x: { ...baseBarOptions.scales.x, stacked: true }, y: { ...baseBarOptions.scales.y, stacked: true } } }} />
        </div>
      )}
    </div>
  );
}

function LayananChart({ data }: { data: LayananPopuler[] }) {
  const maxJumlah = Math.max(...data.map(d => d.jumlah), 1);

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top {data.length} Layanan / Tindakan Terpopuler Tahun Ini</p>
      <div className="h-[280px] overflow-y-auto pr-4 space-y-2.5">
        {data.map((item, idx) => {
          const color = KATEGORI_COLOR[item.kategori] || PALETTE.sky.solid;
          const pct = (item.jumlah / maxJumlah) * 100;
          return (
            <div key={idx} className="group">
              <div className="flex items-center justify-between mb-1 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-md text-white text-[9px] font-black flex items-center justify-center shrink-0" style={{ backgroundColor: color }}>
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-700 truncate">{item.nama}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white" style={{ backgroundColor: color }}>
                    {item.kategori}
                  </span>
                  <span className="text-[10px] font-black text-slate-500 min-w-[36px] text-right">{item.jumlah}×</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
              <p className="text-[9px] text-slate-400 font-bold mt-0.5 text-right">{formatRupiah(item.omzet)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type ChartTab = 'omzet' | 'metode' | 'layanan';

const TABS: { key: ChartTab; label: string; Icon: React.ElementType }[] = [
  { key: 'omzet',   label: 'Tren Omzet',         Icon: TrendingUp },
  { key: 'metode',  label: 'Metode Pembayaran',          Icon: CreditCard },
  { key: 'layanan', label: 'Layanan Terpopuler',         Icon: Star },
];

export default function LaporanCharts() {
  const [mounted, setMounted] = useState(false);
  const [currentYear, setCurrentYear] = useState(2026); // SSR-safe fallback

  useEffect(() => {
    const y = new Date().getFullYear();
    setCurrentYear(y);
    setMounted(true);
  }, []);

  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  const [activeTab, setActiveTab] = useState<ChartTab>('omzet');
  const [selectedYear, setSelectedYear] = useState(0); // will be set after mount
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  // Sync selectedYear after mount so it uses real current year
  useEffect(() => {
    if (mounted && selectedYear === 0) {
      setSelectedYear(currentYear);
    }
  }, [mounted, currentYear]);

  useEffect(() => {
    if (!selectedYear) return; // wait until mounted & year is set
    setLoading(true);
    fetch(`/api/transaksi/analytics?year=${selectedYear}`, { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error('DB error');
        return res.json();
      })
      .then((json: AnalyticsData) => {
        setData(json);
        setIsMock(false);
        setLoading(false);
      })
      .catch(() => {
        setData(generateMockData(selectedYear));
        setIsMock(true);
        setLoading(false);
      });
  }, [selectedYear]);

  const activeTabMeta = TABS.find(t => t.key === activeTab)!;

  return (
    <div className="bg-white rounded-md border border-slate-150 shadow-sm relative overflow-hidden flex flex-col p-6 space-y-5">
      <BracketFrame />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h4 className="font-extrabold text-sm text-slate-800">Analytics Visual</h4>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
            Visualisasi data keuangan & layanan klinik per tahun
            {isMock && <span className="ml-2 px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded font-bold text-[9px]">SIMULASI</span>}
          </p>
        </div>

        {/* Year picker */}
        <div className="relative">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value))}
            className="appearance-none pl-3 pr-8 py-2 border border-slate-200 bg-white rounded-lg text-xs font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#007A64] cursor-pointer"
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>Tahun {y}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Tab pills */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              activeTab === key
                ? 'bg-[#007A64] text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Chart content */}
      {loading ? (
        <div className="space-y-3">
          <div className="h-8 bg-slate-100 rounded-lg animate-pulse w-1/3" />
          <div className="h-[280px] bg-slate-50 rounded-xl animate-pulse" />
        </div>
      ) : data ? (
        <div>
          {activeTab === 'omzet' && <OmzetChart data={data.omzetBulanan} />}
          {activeTab === 'metode' && (
            <MetodeChart
              data={data.metodePopuler}
              metodeBulanan={data.metodeBulanan}
              allMetode={data.allMetode}
            />
          )}
          {activeTab === 'layanan' && <LayananChart data={data.layananPopuler} />}
        </div>
      ) : null}
    </div>
  );
}

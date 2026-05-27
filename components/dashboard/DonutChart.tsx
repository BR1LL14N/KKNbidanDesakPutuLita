'use client';

import BracketFrame from '@/components/ui/BracketFrame';

interface BreakdownMetode {
  metode: string;
  jumlahTransaksi: number;
  nominal: number;
}

interface DonutChartProps {
  breakdownMetode: BreakdownMetode[];
}

// Circumference of circle r=38: 2 * PI * 38 ≈ 238.76
const CIRC = 238.76;

function getMetodeColor(metode: string): string {
  const norm = metode.toUpperCase();
  if (norm.includes('QRIS')) return '#9A6E3B';
  if (norm.includes('BCA') || norm.includes('TRANSFER')) return '#5D6B82';
  return '#007A64';
}

function getDotColor(metode: string): string {
  const norm = metode.toUpperCase();
  if (norm.includes('QRIS')) return 'bg-[#9A6E3B]';
  if (norm.includes('BCA') || norm.includes('TRANSFER')) return 'bg-[#5D6B82]';
  return 'bg-[#007A64]';
}

export default function DonutChart({ breakdownMetode }: DonutChartProps) {
  const totalNominal = breakdownMetode.reduce((acc, curr) => acc + curr.nominal, 0);

  let accumulatedOffset = 0;

  return (
    <div className="lg:col-span-4 bg-white p-6 shadow-sm border border-slate-150 rounded-md relative flex flex-col justify-between min-h-[400px]">
      <BracketFrame />
      <div>
        <h4 className="font-extrabold text-sm text-slate-800 mb-6">Pembagian Metode Bayar</h4>

        {/* SVG Donut Chart */}
        <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background track */}
            <circle cx="50" cy="50" r="38" className="stroke-slate-100" strokeWidth="11" fill="transparent" />

            {breakdownMetode.map((m, idx) => {
              const percent = totalNominal > 0 ? m.nominal / totalNominal : 0;
              const strokeLength = percent * CIRC;
              const strokeOffset = accumulatedOffset;
              accumulatedOffset -= strokeLength;

              return (
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r="38"
                  stroke={getMetodeColor(m.metode)}
                  strokeWidth="11"
                  strokeDasharray={`${strokeLength} ${CIRC}`}
                  strokeDashoffset={strokeOffset}
                  fill="transparent"
                  strokeLinecap="butt"
                  className="transition-all duration-500 hover:stroke-[13px] cursor-pointer"
                />
              );
            })}
          </svg>

          {/* Central Text */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
            <span className="text-base font-black text-slate-800 leading-none mt-0.5">100%</span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 space-y-2.5">
          {breakdownMetode.map((m, idx) => {
            const percent = totalNominal > 0 ? Math.round((m.nominal / totalNominal) * 100) : 0;
            return (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${getDotColor(m.metode)}`} />
                  <span className="font-bold text-slate-700">{m.metode}</span>
                </div>
                <span className="font-extrabold text-slate-800">{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

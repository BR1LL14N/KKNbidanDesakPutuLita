import { AlertTriangle } from 'lucide-react';

interface MockBannerProps {
  message?: string;
}

export default function MockBanner({ message }: MockBannerProps) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-center">
      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
      <div className="text-sm text-amber-700">
        <span className="font-bold">Mode Simulasi Aktif</span>
        {message ? `: ${message}` : ': Basis data MySQL belum terhubung. Menampilkan data simulasi.'}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Eye, EyeOff, Heart, Loader2, AlertCircle, Sparkles, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
import BracketFrame from '../../components/ui/BracketFrame';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Username dan kata sandi tidak boleh kosong.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login gagal.');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-gradient-to-br from-slate-50 via-[#FFFBF9] to-[#FFF5F2] font-sans selection:bg-[#F4511E]/20 selection:text-[#F4511E] overflow-hidden">
      
      {/* ── LEFT PANEL: BRANDING & ILLUST (Hidden on Mobile/Tablet) ── */}
      <div className="hidden lg:flex lg:col-span-7 bg-gradient-to-br from-[#D84315] via-[#E64A19] to-[#FF7043] relative p-12 flex-col justify-between overflow-hidden shadow-2xl">
        {/* Dynamic Pattern & Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FFB74D]/10 rounded-full blur-[150px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#FF8A65]/10 rounded-full blur-[150px]" />

        {/* Top Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center p-1 shadow-lg">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-wider uppercase leading-none">SI-KABID</h1>
            <span className="text-[9px] text-orange-200 font-bold uppercase tracking-widest mt-1 block">KKN Bidan Desak Putu Lita</span>
          </div>
        </div>

        {/* Midwife Maternal Value Branding */}
        <div className="max-w-xl my-auto space-y-8 relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold text-orange-50 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              <span>Sistem Kasir & Rekam Medis Terpadu</span>
            </div>
            <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Melayani Ibu & Buah Hati <br className="hidden xl:inline" />
              dengan Sentuhan Kasih Sayang.
            </h2>
            <p className="text-sm text-orange-55 leading-relaxed font-medium">
              SI-KABID membantu mengelola administrasi kasir POS, data pelayanan rekam medis, 
              dan laporan keuangan klinik kebidanan secara digital, akurat, dan aman.
            </p>
          </div>

          {/* Quick Glassmorphic Feature Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-white">Administrasi Cepat</h4>
                <p className="text-[10px] text-orange-100/70 font-semibold mt-1">Registrasi pasien & cetak struk kasir kurang dari 1 menit.</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-white">Data Terproteksi</h4>
                <p className="text-[10px] text-orange-100/70 font-semibold mt-1">Sistem rekam medis & data pasien tersimpan aman di basis data.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-center text-[10px] font-bold text-orange-200/60 uppercase tracking-wider relative z-10">
          <span>&copy; 2026 KKN Bidan &bull; All Rights Reserved</span>
          <span className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-amber-300" /> Server MySQL Aktif</span>
        </div>
      </div>

      {/* ── RIGHT PANEL: LOGIN FORM (Full Screen on Mobile) ── */}
      <div className="col-span-1 lg:col-span-5 flex items-center justify-center p-6 sm:p-12 md:p-16 relative">
        {/* Glow behind mobile view */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px] lg:hidden -z-10" />

        <div className="w-full max-w-md space-y-10">
          
          {/* Header Mobile Logo */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 p-1 flex items-center justify-center shadow-sm lg:hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Selamat Datang di SI-KABID</h2>
              <p className="text-sm text-slate-400 font-semibold">Silakan masuk menggunakan kredensial Anda.</p>
            </div>
          </div>

          {/* Form Area */}
          <div className="bg-white border border-slate-100 shadow-[0_20px_50px_rgba(244,81,30,0.04)] rounded-3xl p-8 sm:p-10 relative">
            <BracketFrame />

            {/* Error Notification Alert */}
            {error && (
              <div className="mb-6 flex items-start gap-2.5 bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl text-xs font-semibold animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#F4511E] transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    placeholder="Contoh: bidanlita"
                    className="w-full text-sm font-bold text-slate-700 placeholder-slate-400/65 bg-slate-50/50 border border-slate-200/80 rounded-2xl py-4 pl-12 pr-5 outline-none focus:bg-white focus:border-[#F4511E] focus:ring-2 focus:ring-[#F4511E]/10 transition-all duration-150"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Silakan hubungi Bidan Utama atau developer untuk mereset kata sandi.')}
                    className="text-xs text-slate-400 hover:text-[#F4511E] font-bold transition-colors outline-none cursor-pointer"
                  >
                    Lupa Sandi?
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#F4511E] transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="Masukkan kata sandi"
                    className="w-full text-sm font-bold text-slate-700 placeholder-slate-400/65 bg-slate-50/50 border border-slate-200/80 rounded-2xl py-4 pl-12 pr-12 outline-none focus:bg-white focus:border-[#F4511E] focus:ring-2 focus:ring-[#F4511E]/10 transition-all duration-150"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Option */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="w-5 h-5 rounded border-slate-300 text-[#F4511E] focus:ring-[#F4511E] cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2.5 text-xs text-slate-400 font-bold uppercase tracking-wider cursor-pointer"
                >
                  Ingat Saya
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F4511E] hover:bg-[#D84315] text-white py-4 rounded-2xl text-sm font-black uppercase tracking-wider transition-all duration-150 shadow-md shadow-orange-700/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Masuk Ke Dashboard</span>
                )}
              </button>
            </form>
          </div>

          {/* Footer Info (Mobile) */}
          <div className="text-center space-y-1 block lg:hidden">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Klinik Bidan Mandiri Desak Putu Lita
            </p>
            <p className="text-[9px] text-slate-300 font-semibold">
              SI-KABID &bull; Versi 1.0 &bull; KKN 2026
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

import React from 'react';
import { 
  CheckCircle2, 
  FolderOpen, 
  Layers, 
  Package, 
  Terminal, 
  Settings, 
  Activity, 
  ArrowRight, 
  FileCode,
  Sparkles,
  Database,
  Globe,
  Lock
} from 'lucide-react';

export default function Home() {
  const folders = [
    { name: 'app/', desc: 'Folder utama Next.js App Router berisi routing halaman dan API.' },
    { name: 'app/api/', desc: 'Folder untuk mendefinisikan backend API (Server-side routes).' },
    { name: 'components/', desc: 'Tempat komponen UI yang reusable (Button, Sidebar, Table, dll).' },
    { name: 'lib/', desc: 'Tempat berkas helper, fungsi utilitas, dan instance Prisma Client.' },
    { name: 'prisma/', desc: 'Tempat skema database (schema.prisma) dan berkas migrasi sql.' },
    { name: 'public/', desc: 'Penyimpanan asset statis (logo, gambar, favicon, dll).' },
  ];

  const techStack = [
    { name: 'Next.js', version: 'v16.2', type: 'Full-Stack Framework', desc: 'Menyatukan UI React dan API route backend secara native.' },
    { name: 'React JS', version: 'v19.2', type: 'Frontend Library', desc: 'Membangun antarmuka dinamis berbasis komponen terstruktur.' },
    { name: 'Tailwind CSS', version: 'v4.0', type: 'Utility-First Styling', desc: 'Framework CSS bawaan Next.js untuk mempercepat pembuatan desain UI premium.' },
    { name: 'Prisma ORM', version: 'v7.8', type: 'Database ORM', desc: 'Penghubung database MySQL dengan pembuat skema tabel otomatis.' },
    { name: 'Lucide React', version: 'v1.16', type: 'Icon Pack', desc: 'Ratusan ikon SVG modern yang ringan dan konsisten.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col justify-between">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-200/30 blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-pink-200/20 blur-3xl animate-pulse-slow"></div>

      {/* Main Content Wrapper */}
      <div className="container mx-auto px-4 py-12 max-w-5xl z-10 grow">
        
        {/* Header Section */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm" suppressHydrationWarning>
            <Sparkles className="w-3.5 h-3.5 text-teal-500 animate-[spin_3s_linear_infinite]" suppressHydrationWarning />
            Full-Stack Next.js & MySQL Blueprint
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Sistem Informasi <span className="gradient-text">Kasir & Keuangan Bidan</span>
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            Kerangka Full-Stack monorepo telah terkonfigurasi menggunakan Next.js App Router, Tailwind CSS v4, dan Prisma ORM dengan MySQL Database driver.
          </p>
        </header>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Card 1: Next.js Status */}
          <div className="glass-card rounded-2xl p-6 shadow-sm border border-slate-200/50 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600 mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Next.js Full-Stack</h3>
            <p className="text-slate-500 text-sm mb-3">Server routing dan API backend berada dalam satu lingkungan port.</p>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
              API & Frontend Aktif
            </span>
          </div>

          {/* Card 2: MySQL Prisma Ready */}
          <div className="glass-card rounded-2xl p-6 shadow-sm border border-slate-200/50 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 mb-4">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Prisma (MySQL)</h3>
            <p className="text-slate-500 text-sm mb-3">Driver MySQL dan Prisma client singleton siap digunakan.</p>
            <span className="inline-flex items-center text-xs font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
              schema.prisma MySQL Set
            </span>
          </div>

          {/* Card 3: Tailwind Config */}
          <div className="glass-card rounded-2xl p-6 shadow-sm border border-slate-200/50 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-600 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Tailwind CSS v4</h3>
            <p className="text-slate-500 text-sm mb-3">Native Tailwind CSS v4 dengan performa tinggi & compiler cepat.</p>
            <span className="inline-flex items-center text-xs font-medium text-pink-700 bg-pink-50 px-2.5 py-1 rounded-full">
              Engine Tailwind v4 Aktif
            </span>
          </div>

        </div>

        {/* Blueprint Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* Left Column: Blueprint Folder Structure */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <FolderOpen className="w-5 h-5 text-teal-600" />
              <h2 className="text-xl font-bold text-slate-800">Folder Blueprint Monorepo</h2>
            </div>
            
            <div className="space-y-4">
              {folders.map((folder, index) => (
                <div key={index} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-800 font-mono">{folder.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{folder.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Monorepo Dependencies */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <Package className="w-5 h-5 text-pink-600" />
              <h2 className="text-xl font-bold text-slate-800">Daftar Dependency Full-Stack</h2>
            </div>

            <div className="space-y-4">
              {techStack.map((tech, index) => (
                <div key={index} className="flex items-start justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-800">{tech.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{tech.desc}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {tech.version}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase">{tech.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Database & Environment variables note */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-12">
          <div className="flex gap-3">
            <Lock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-800 mb-1">Penyimpanan Rahasia (Environment Variables)</h4>
              <p className="text-sm text-amber-700 leading-relaxed">
                Koneksi database MySQL diletakkan pada berkas <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-800">.env</code> pada variabel <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-800">DATABASE_URL</code>. Berkas <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-800">.env</code> ini sudah dimasukkan ke dalam <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-800">.gitignore</code> agar aman dan tidak ter-upload secara tidak sengaja ke repositori publik Git Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Development Quickstart */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-slate-800">Cara Memulai Pengembangan Server & Database</h2>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto shadow-inner leading-relaxed space-y-4">
            <div>
              <p className="text-slate-500"># 1. Jalankan development server Next.js</p>
              <p><span className="text-teal-400">npm</span> run dev</p>
            </div>
            <div>
              <p className="text-slate-500"># 2. Ketika tim Anda siap membuat tabel, edit file `prisma/schema.prisma` lalu jalankan migrasi database MySQL</p>
              <p><span className="text-teal-400">npx</span> prisma migrate dev --name init_tables</p>
            </div>
            <div>
              <p className="text-slate-500"># 3. Buka Prisma Studio (GUI database bawaan Prisma) untuk melihat isi data MySQL Anda di browser</p>
              <p><span className="text-teal-400">npx</span> prisma studio</p>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Section */}
      <footer className="w-full text-center py-6 border-t border-slate-200/50 bg-white/50 backdrop-blur">
        <p className="text-xs text-slate-500">
          Proyek KKN Bidan 2026 • SI-KABID (Sistem Informasi Kasir & Keuangan Bidan)
        </p>
      </footer>

    </div>
  );
}

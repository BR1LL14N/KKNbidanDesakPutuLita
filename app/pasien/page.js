import prisma from '../../lib/prisma';
import Link from 'next/link';

export default async function PagePasien() {
  const listPasien = await prisma.pasien.findMany();

  return (
    // bg-emerald-50 adalah warna latar belakang halaman (bisa diubah sesuai selera)
    <div className="min-h-screen bg-emerald-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Klinik */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-emerald-900 tracking-tight">Klinik Bidan Putu Lita</h1>
            <p className="text-emerald-600 font-medium">Surabaya - Pelayanan Kesehatan Ibu & Anak</p>
          </div>
          <Link 
            href="/pasien/tambah" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all"
          >
            + Tambah Pasien Baru
          </Link>
        </div>

        {/* Tabel Data Pasien */}
        <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-8 py-5 text-emerald-700 font-semibold uppercase text-xs tracking-wider">ID</th>
                <th className="px-8 py-5 text-emerald-700 font-semibold uppercase text-xs tracking-wider">Nama Pasien</th>
                <th className="px-8 py-5 text-emerald-700 font-semibold uppercase text-xs tracking-wider">Alamat</th>
                <th className="px-8 py-5 text-emerald-700 font-semibold uppercase text-xs tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {listPasien.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-10 text-center text-emerald-600 italic">Belum ada data pasien terdaftar.</td>
                </tr>
              ) : (
                listPasien.map((item) => (
                  <tr key={item.id} className="hover:bg-emerald-50/50 transition-colors">
                    <td className="px-8 py-6 font-mono text-emerald-400">#{item.id}</td>
                    <td className="px-8 py-6 font-bold text-emerald-900">{item.nama}</td>
                    <td className="px-8 py-6 text-emerald-700">{item.alamat}</td>
                    <td className="px-8 py-6 text-center">
                      <Link 
                        href={`/transaksi/tambah?pasienId=${item.id}`}
                        className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all"
                      >
                        + Transaksi
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <p className="text-center text-emerald-600/60 text-sm mt-8">
          Sistem Informasi Klinik Bidan Putu Lita © 2026
        </p>
      </div>
    </div>
  );
}
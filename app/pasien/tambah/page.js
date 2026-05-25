import prisma from '../../../lib/prisma';
import { redirect } from 'next/navigation';

export default function TambahPasien() {
  async function simpanPasien(formData) {
    'use server';
    await prisma.pasien.create({
      data: { 
        nama: formData.get('nama'),
        tanggalLahir: formData.get('tanggalLahir'),
        alamat: formData.get('alamat') 
      }
    });
    redirect('/pasien');
  }

  return (
    <div className="p-12 max-w-lg mx-auto bg-white rounded-2xl shadow-sm border mt-10">
      <h1 className="text-2xl font-bold mb-6 text-teal-700">Tambah Pasien Baru</h1>
      <form action={simpanPasien} className="flex flex-col gap-4">
        <input name="nama" placeholder="Nama Lengkap" className="border p-3 rounded-xl w-full" required />
        <input name="tanggalLahir" type="date" className="border p-3 rounded-xl w-full" required />
        <input name="alamat" placeholder="Alamat" className="border p-3 rounded-xl w-full" required />
        <button type="submit" className="bg-teal-600 text-white p-3 rounded-xl font-bold hover:bg-teal-700">Simpan Pasien</button>
      </form>
    </div>
  );
}
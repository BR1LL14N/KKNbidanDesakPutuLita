import prisma from '../../../lib/prisma';
import { redirect } from 'next/navigation';

export default async function PageTambahTransaksi() {
  const listPasien = await prisma.pasien.findMany();

  async function simpanTransaksi(formData) {
    'use server';
    
    const pasienId = parseInt(formData.get('pasienId'));
    const terapi = formData.get('terapi');
    const pembayaran = formData.get('pembayaran');
    const totalHarga = parseFloat(formData.get('totalHarga'));

    await prisma.transaksi.create({
      data: { pasienId, terapi, pembayaran, totalHarga }
    });
    
    redirect('/transaksi'); // Nanti kita buat halaman daftar transaksi
  }

  return (
    <div className="p-8 max-w-lg mx-auto bg-white rounded-2xl shadow-sm border">
      <h1 className="text-2xl font-bold mb-6 text-teal-700">Input Transaksi</h1>
      <form action={simpanTransaksi} className="flex flex-col gap-4">
        <select name="pasienId" className="border p-2 rounded-lg" required>
          <option value="">-- Pilih Pasien --</option>
          {listPasien.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
        </select>
        
        <select name="terapi" className="border p-2 rounded-lg" required>
          <option value="Hamil">Hamil</option>
          <option value="Persalinan">Persalinan</option>
          <option value="KB">KB</option>
          <option value="Imunisasi">Imunisasi</option>
        </select>

        <select name="pembayaran" className="border p-2 rounded-lg" required>
          <option value="Tunai">Tunai</option>
          <option value="QRIS">QRIS</option>
          <option value="Transfer">Transfer</option>
        </select>

        <input name="totalHarga" type="number" placeholder="Total Harga (Rp)" className="border p-2 rounded-lg" required />
        
        <button type="submit" className="bg-teal-600 text-white p-3 rounded-lg font-bold">Simpan Transaksi</button>
      </form>
    </div>
  );
}
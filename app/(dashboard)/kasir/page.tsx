'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import MockBanner from '@/components/ui/MockBanner';
import TerapiKatalog from '@/components/kasir/TerapiKatalog';
import CheckoutPanel from '@/components/kasir/CheckoutPanel';
import InvoiceModal from '@/components/kasir/InvoiceModal';

interface CartItem {
  terapi: { id: number; nama: string; harga: number; hargaPokok: number };
  jumlah: number;
}

const MOCK_KATEGORI = [
  { id: 1, nama: 'PEMERIKSAAN' }, { id: 2, nama: 'IMUNISASI' },
  { id: 3, nama: 'OBAT' }, { id: 4, nama: 'LAYANAN' }, { id: 5, nama: 'PAKET' },
];
const MOCK_TERAPI = [
  { id: 1, nama: 'ANC Terpadu', kategoriId: 1, harga: 75000, hargaPokok: 30000, aktif: true, kategori: { id: 1, nama: 'PEMERIKSAAN' }, deskripsi: 'Pemeriksaan kehamilan rutin lengkap dengan konsultasi.' },
  { id: 2, nama: 'Vaksin BCG', kategoriId: 2, harga: 120000, hargaPokok: 60000, aktif: true, kategori: { id: 2, nama: 'IMUNISASI' }, deskripsi: 'Pemberian vaksin BCG untuk bayi usia 0-1 bulan.' },
  { id: 3, nama: 'Asam Folat (30)', kategoriId: 3, harga: 45000, hargaPokok: 20000, aktif: true, kategori: { id: 3, nama: 'OBAT' }, deskripsi: 'Suplemen asam folat untuk nutrisi ibu hamil.' },
  { id: 4, nama: 'Cek HB Sahli', kategoriId: 1, harga: 35000, hargaPokok: 15000, aktif: true, kategori: { id: 1, nama: 'PEMERIKSAAN' }, deskripsi: 'Pemeriksaan kadar hemoglobin darah ibu hamil.' },
  { id: 5, nama: 'Pijat Bayi', kategoriId: 4, harga: 60000, hargaPokok: 20000, aktif: true, kategori: { id: 4, nama: 'LAYANAN' }, deskripsi: 'Layanan relaksasi untuk bayi usia 1-12 bulan.' },
  { id: 6, nama: 'Persalinan Normal', kategoriId: 5, harga: 1500000, hargaPokok: 600000, aktif: true, kategori: { id: 5, nama: 'PAKET' }, deskripsi: 'Paket persalinan lengkap termasuk rawat inap 1 hari.' },
];
const MOCK_PASIEN = [
  { id: 1, nama: 'Ny. Yuliana Safitri', tanggalLahir: '1998-05-12', alamat: 'Kec. Sukawati, Gianyar, Bali' },
  { id: 2, nama: 'Ny. Kartini Rahayu', tanggalLahir: '1995-03-12', alamat: 'Jl. Merdeka No. 45, Kebayoran Baru' },
  { id: 3, nama: 'Ny. Susi Wulandari', tanggalLahir: '1992-06-28', alamat: 'Perumahan Gading Serpong, Tangerang' },
];
const MOCK_METODE = [
  { id: 1, nama: 'Tunai', aktif: true },
  { id: 2, nama: 'QRIS', aktif: true },
  { id: 3, nama: 'Transfer BCA', aktif: true },
];

export default function KasirPage() {
  const [terapiList, setTerapiList] = useState<any[]>([]);
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [pasienList, setPasienList] = useState<any[]>([]);
  const [metodeList, setMetodeList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  // Cart state — lives here so both Katalog and CheckoutPanel can share
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInvoice, setSuccessInvoice] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const [resKat, resTer, resPas, resMet] = await Promise.all([
        fetch('/api/kategori'),
        fetch('/api/terapi?onlyActive=true'),
        fetch('/api/pasien'),
        fetch('/api/metode?onlyActive=true'),
      ]);
      if (!resKat.ok || !resTer.ok || !resPas.ok || !resMet.ok) throw new Error('API fetch failed');
      const [dataKat, dataTer, dataPas, dataMet] = await Promise.all([
        resKat.json(), resTer.json(), resPas.json(), resMet.json(),
      ]);
      setKategoriList(dataKat);
      setTerapiList(dataTer.filter((t: any) => t.aktif));
      setPasienList(dataPas);
      setMetodeList(dataMet.filter((m: any) => m.aktif));
      setIsMock(false);
      setLoading(false);
    } catch {
      setIsMock(true);
      setKategoriList(MOCK_KATEGORI);
      setTerapiList(MOCK_TERAPI);
      setPasienList(MOCK_PASIEN);
      setMetodeList(MOCK_METODE);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Cart operations
  const addToCart = (terapi: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.terapi.id === terapi.id);
      if (existing) return prev.map((item) => item.terapi.id === terapi.id ? { ...item, jumlah: item.jumlah + 1 } : item);
      return [...prev, { terapi, jumlah: 1 }];
    });
  };

  const updateCartQty = (terapiId: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.terapi.id !== terapiId) return item;
        const newQty = item.jumlah + delta;
        return newQty > 0 ? { ...item, jumlah: newQty } : null;
      }).filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (terapiId: number) => {
    setCart((prev) => prev.filter((item) => item.terapi.id !== terapiId));
  };

  const handleCheckout = async (payload: {
    pasienMode: 'existing' | 'new';
    selectedPasienId: string;
    newPasien: { nama: string; tanggalLahir: string; alamat: string };
    selectedMetodeId: string;
    catatan: string;
  }) => {
    if (cart.length === 0) { alert('Keranjang belanja masih kosong.'); return; }
    setIsSubmitting(true);
    setErrorMessage('');

    let targetPasienId = payload.selectedPasienId;

    try {
      if (payload.pasienMode === 'new') {
        if (!payload.newPasien.nama.trim()) throw new Error('Nama pasien baru wajib diisi untuk registrasi cepat.');
        const patientPayload = {
          nama: payload.newPasien.nama.trim(),
          tanggalLahir: payload.newPasien.tanggalLahir ? new Date(payload.newPasien.tanggalLahir).toISOString() : null,
          alamat: payload.newPasien.alamat.trim() || null,
        };
        if (isMock) {
          const simulatedId = Date.now();
          setPasienList((prev) => [{ id: simulatedId, ...patientPayload }, ...prev]);
          targetPasienId = String(simulatedId);
        } else {
          const res = await fetch('/api/pasien', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patientPayload) });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Gagal meregistrasi pasien baru.');
          targetPasienId = String(data.id);
        }
      } else {
        if (!targetPasienId) throw new Error('Pilih pasien terdaftar terlebih dahulu.');
      }

      const transactionPayload = {
        pasienId: parseInt(targetPasienId),
        metodePembayaranId: parseInt(payload.selectedMetodeId),
        catatan: payload.catatan || null,
        items: cart.map((item) => ({ terapiId: item.terapi.id, jumlah: item.jumlah })),
      };

      if (isMock) {
        const invoiceNum = `INV/${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}/${String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0')}`;
        const patientObj = pasienList.find((p) => p.id === parseInt(targetPasienId)) || { nama: payload.newPasien.nama };
        const paymentObj = metodeList.find((m) => m.id === parseInt(payload.selectedMetodeId)) || { nama: 'Tunai' };
        setSuccessInvoice({
          nomorInvoice: invoiceNum,
          tanggal: new Date().toISOString(),
          pasien: patientObj,
          metodePembayaran: paymentObj,
          totalHarga: cart.reduce((sum, item) => sum + item.terapi.harga * item.jumlah, 0),
          catatan: payload.catatan,
          detailTransaksi: cart.map((item) => ({ terapi: item.terapi, hargaJual: item.terapi.harga, jumlah: item.jumlah })),
        });
      } else {
        const res = await fetch('/api/transaksi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(transactionPayload) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal memproses transaksi kasir.');
        setSuccessInvoice(data);
        fetchData();
      }

      setCart([]);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation banner */}
      {isMock && (
        <MockBanner message="Basis data MySQL belum terhubung. Penjualan jasa terapi menggunakan katalog data mock visual presisi." />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-400 font-semibold">Point of Sale (POS)</p>
          <h2 className="text-lg font-black text-slate-800 tracking-tight mt-0.5">Kasir Point of Sale</h2>
        </div>
        <button
          onClick={fetchData}
          className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Two-column POS layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Katalog — manages its own search/filter state internally */}
        <TerapiKatalog
          terapiList={terapiList}
          kategoriList={kategoriList}
          loading={loading}
          onAddToCart={addToCart}
        />

        {/* Checkout panel — manages its own patient/payment form state */}
        <CheckoutPanel
          cart={cart}
          pasienList={pasienList}
          metodeList={metodeList}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          onUpdateQty={updateCartQty}
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
        />
      </div>

      {/* Invoice modal — only mounts on success */}
      <InvoiceModal invoice={successInvoice} onClose={() => setSuccessInvoice(null)} />
    </div>
  );
}

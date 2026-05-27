const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

// 1. Membaca variabel DATABASE_URL dari berkas .env secara manual
let databaseUrl = '';
try {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/^DATABASE_URL\s*=\s*["']?([^"\n\r#]+)["']?/m);
    if (match) {
      databaseUrl = match[1].trim();
    }
  }
} catch (err) {
  console.warn('Gagal memuat variabel .env secara manual:', err);
}

const dbUrl = databaseUrl || process.env.DATABASE_URL || 'mysql://root:@localhost:3306/db_kkn_bidan';

// 2. Parse komponen URL koneksi
let host = 'localhost';
let port = 3306;
let user = 'root';
let password = '';
let database = 'db_kkn_bidan';

try {
  const url = new URL(dbUrl);
  host = url.hostname || 'localhost';
  port = url.port ? parseInt(url.port) : 3306;
  user = url.username || 'root';
  password = url.password ? decodeURIComponent(url.password) : '';
  database = url.pathname.replace(/^\//, '') || 'db_kkn_bidan';
} catch (err) {
  console.warn('Peringatan: Format URL database tidak valid, menggunakan kredensial default.', err);
}

// 3. Inisialisasi Prisma Client dengan Adapter MariaDB (Prisma v7 standard)
const adapter = new PrismaMariaDb({
  host,
  port,
  user,
  password,
  database,
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Memulai seeding data dengan adapter MariaDB...');

  // Bersihkan data lama
  await prisma.detailTransaksi.deleteMany({});
  await prisma.transaksi.deleteMany({});
  await prisma.terapi.deleteMany({});
  await prisma.kategoriTerapi.deleteMany({});
  await prisma.pasien.deleteMany({});
  await prisma.metodePembayaran.deleteMany({});

  console.log('Database telah dibersihkan.');

  // Seed Metode Pembayaran
  const tunai = await prisma.metodePembayaran.create({
    data: { nama: 'Tunai', aktif: true }
  });
  const qris = await prisma.metodePembayaran.create({
    data: { nama: 'QRIS', aktif: true }
  });
  const bca = await prisma.metodePembayaran.create({
    data: { nama: 'Transfer BCA', aktif: true }
  });

  console.log('Metode pembayaran berhasil di-seed.');

  // Seed Kategori Terapi
  const pemeriksaan = await prisma.kategoriTerapi.create({
    data: { nama: 'PEMERIKSAAN', deskripsi: 'Pemeriksaan umum dan antenatal care' }
  });
  const imunisasi = await prisma.kategoriTerapi.create({
    data: { nama: 'IMUNISASI', deskripsi: 'Pemberian vaksin dan imunisasi bayi/anak' }
  });
  const obat = await prisma.kategoriTerapi.create({
    data: { nama: 'OBAT', deskripsi: 'Penjualan obat habis pakai dan vitamin' }
  });
  const layanan = await prisma.kategoriTerapi.create({
    data: { nama: 'LAYANAN', deskripsi: 'Layanan terapi relaksasi dan penunjang' }
  });
  const paket = await prisma.kategoriTerapi.create({
    data: { nama: 'PAKET', deskripsi: 'Paket persalinan terpadu rawat inap' }
  });

  console.log('Kategori terapi berhasil di-seed.');

  // Seed Terapi (Katalog)
  const anc = await prisma.terapi.create({
    data: {
      nama: 'ANC Terpadu',
      kategoriId: pemeriksaan.id,
      harga: 75000,
      hargaPokok: 30000,
      deskripsi: 'Pemeriksaan kehamilan rutin lengkap dengan konsultasi.',
      aktif: true
    }
  });

  const bcg = await prisma.terapi.create({
    data: {
      nama: 'Vaksin BCG',
      kategoriId: imunisasi.id,
      harga: 120000,
      hargaPokok: 60000,
      deskripsi: 'Pemberian vaksin BCG untuk bayi usia 0-1 bulan.',
      aktif: true
    }
  });

  const asamFolat = await prisma.terapi.create({
    data: {
      nama: 'Asam Folat (30)',
      kategoriId: obat.id,
      harga: 45000,
      hargaPokok: 20000,
      deskripsi: 'Suplemen asam folat untuk nutrisi ibu hamil.',
      aktif: true
    }
  });

  const hbSahli = await prisma.terapi.create({
    data: {
      nama: 'Cek HB Sahli',
      kategoriId: pemeriksaan.id,
      harga: 35000,
      hargaPokok: 15000,
      deskripsi: 'Pemeriksaan kadar hemoglobin darah ibu hamil.',
      aktif: true
    }
  });

  const pijatBayi = await prisma.terapi.create({
    data: {
      nama: 'Pijat Bayi',
      kategoriId: layanan.id,
      harga: 60000,
      hargaPokok: 20000,
      deskripsi: 'Layanan relaksasi untuk bayi usia 1-12 bulan.',
      aktif: true
    }
  });

  const persalinanNormal = await prisma.terapi.create({
    data: {
      nama: 'Persalinan Normal',
      kategoriId: paket.id,
      harga: 1500000,
      hargaPokok: 600000,
      deskripsi: 'Paket persalinan lengkap termasuk rawat inap 1 hari.',
      aktif: true
    }
  });

  console.log('Katalog terapi/layanan berhasil di-seed.');

  // Seed Pasien
  const yuliana = await prisma.pasien.create({
    data: { nama: 'Ny. Yuliana Safitri', tanggalLahir: new Date('1998-05-12'), alamat: 'Kec. Sukawati, Gianyar, Bali' }
  });
  const kartini = await prisma.pasien.create({
    data: { nama: 'Ny. Kartini Rahayu', tanggalLahir: new Date('1995-03-12'), alamat: 'Jl. Merdeka No. 45, Kebayoran Baru, Jakarta Selatan' }
  });
  const susi = await prisma.pasien.create({
    data: { nama: 'Ny. Susi Wulandari', tanggalLahir: new Date('1992-06-28'), alamat: 'Perumahan Gading Serpong, Blok B2, Tangerang' }
  });
  const dimas = await prisma.pasien.create({
    data: { nama: 'An. Dimas Pratama', tanggalLahir: new Date('2018-09-05'), alamat: 'Jl. Margonda Raya No. 12, Depok' }
  });
  const lestari = await prisma.pasien.create({
    data: { nama: 'Lestari Sri', tanggalLahir: new Date('1997-01-17'), alamat: 'Apartemen Kalibata City, Tower Jasmine, Jakarta' }
  });
  const ratna = await prisma.pasien.create({
    data: { nama: 'Ny. Ratna Sari', tanggalLahir: new Date('1994-08-11'), alamat: 'Kec. Ubud, Gianyar, Bali' }
  });
  const dinda = await prisma.pasien.create({
    data: { nama: 'Ny. Dinda Permata', tanggalLahir: new Date('1991-12-03'), alamat: 'Desa Celuk, Sukawati, Bali' }
  });
  const anugrah = await prisma.pasien.create({
    data: { nama: 'Bayi Anugrah', tanggalLahir: new Date('2024-02-14'), alamat: 'Denpasar Timur, Bali' }
  });

  console.log('Pasien berhasil di-seed.');

  // Seed Transaksi untuk mencocokkan total angka mockup:
  // Target Pendapatan: Rp 42.850.000, HPP: Rp 18.240.000, Total Transaksi: 156
  // Sisa Target untuk 153 transaksi:
  // Total Pendapatan sisa = 42.850.000 - 75.000 - 1.500.000 - 35.000 = 41.240.000
  // Total HPP sisa = 18.240.000 - 30.000 - 600.000 - 15.000 = 17.595.000
  
  console.log('Menghasilkan 153 transaksi rekapitulasi...');
  
  const pasiens = [yuliana, kartini, susi, dimas, lestari, ratna, dinda, anugrah];
  
  let currentPendapatan = 0;
  let currentHpp = 0;
  let count = 0;

  for (let i = 0; i < 153; i++) {
    const pasienIdx = i % pasiens.length;
    const pasienObj = pasiens[pasienIdx];
    
    // Tentukan metode bayar secara proporsional (Tunai ~65%, QRIS ~25%, BCA ~10%)
    let metodeObj = tunai;
    if (i >= 100 && i < 138) {
      metodeObj = qris;
    } else if (i >= 138) {
      metodeObj = bca;
    }

    // Tentukan item transaksi agar total omzet & HPP mendekati target
    let terapiObj = anc;
    let qty = 1;

    if (i < 20) {
      terapiObj = persalinanNormal; // HPP: 600k, Harga: 1.500k
    } else if (i >= 20 && i < 40) {
      terapiObj = bcg; // HPP: 60k, Harga: 120k
      qty = 2;
    } else if (i >= 40 && i < 90) {
      terapiObj = asamFolat; // HPP: 20k, Harga: 45k
      qty = 3;
    } else if (i >= 90 && i < 120) {
      terapiObj = pijatBayi; // HPP: 20k, Harga: 60k
      qty = 1;
    } else {
      terapiObj = hbSahli; // HPP: 15k, Harga: 35k
      qty = 2;
    }

    const price = terapiObj.harga * qty;
    const cost = terapiObj.hargaPokok * qty;

    currentPendapatan += price;
    currentHpp += cost;
    count++;

    const invNum = `INV/202603${String(Math.floor(i / 30) + 1).padStart(2, '0')}/${String(i + 1).padStart(4, '0')}`;
    
    const date = new Date();
    date.setDate(date.getDate() - (153 - i));

    const tx = await prisma.transaksi.create({
      data: {
        nomorInvoice: invNum,
        tanggal: date,
        pasienId: pasienObj.id,
        metodePembayaranId: metodeObj.id,
        totalHarga: price,
        catatan: `Rekap transaksi penunjang pelayanan.`
      }
    });

    await prisma.detailTransaksi.create({
      data: {
        transaksiId: tx.id,
        terapiId: terapiObj.id,
        hargaJual: terapiObj.harga,
        hargaPokok: terapiObj.hargaPokok,
        jumlah: qty,
        subtotal: price
      }
    });
  }

  // Sekarang buat 3 transaksi persis seperti di mockup
  // Transaksi 154 (Terakhir 3): Bayi Anugrah, Imunisasi BCG, QRIS, Rp 75.000, Belum Bayar
  const date3 = new Date();
  date3.setDate(date3.getDate());
  date3.setHours(11, 5, 0);
  const tx3 = await prisma.transaksi.create({
    data: {
      nomorInvoice: 'INV/20260527/0154',
      tanggal: date3,
      pasienId: anugrah.id,
      metodePembayaranId: qris.id,
      totalHarga: 75000,
      catatan: 'Vaksin BCG rutin. Menunggu konfirmasi pembayaran QRIS.'
    }
  });
  await prisma.detailTransaksi.create({
    data: {
      transaksiId: tx3.id,
      terapiId: bcg.id,
      hargaJual: 75000, // custom price snap
      hargaPokok: 30000,
      jumlah: 1,
      subtotal: 75000
    }
  });

  // Transaksi 155 (Terakhir 2): Ny. Dinda Permata, Persalinan Normal, Transfer BCA, Rp 1.500.000, Lunas
  const date2 = new Date();
  date2.setDate(date2.getDate());
  date2.setHours(13, 15, 0);
  const tx2 = await prisma.transaksi.create({
    data: {
      nomorInvoice: 'INV/20260527/0155',
      tanggal: date2,
      pasienId: dinda.id,
      metodePembayaranId: bca.id,
      totalHarga: 1500000,
      catatan: 'Persalinan normal berjalan lancar, ibu dan bayi sehat.'
    }
  });
  await prisma.detailTransaksi.create({
    data: {
      transaksiId: tx2.id,
      terapiId: persalinanNormal.id,
      hargaJual: 1500000,
      hargaPokok: 600000,
      jumlah: 1,
      subtotal: 1500000
    }
  });

  // Transaksi 156 (Terakhir 1): Ny. Ratna Sari, Cek HB Sahli, Tunai, Rp 35.000, Lunas
  const date1 = new Date();
  date1.setDate(date1.getDate());
  date1.setHours(14, 20, 0);
  const tx1 = await prisma.transaksi.create({
    data: {
      nomorInvoice: 'INV/20260527/0156',
      tanggal: date1,
      pasienId: ratna.id,
      metodePembayaranId: tunai.id,
      totalHarga: 35000,
      catatan: 'Kontrol pemeriksaan kadar hemoglobin.'
    }
  });
  await prisma.detailTransaksi.create({
    data: {
      transaksiId: tx1.id,
      terapiId: hbSahli.id,
      hargaJual: 35000,
      hargaPokok: 15000,
      jumlah: 1,
      subtotal: 35000
    }
  });

  // Kalkulasi akhir
  const finalCount = await prisma.transaksi.count();
  const sumTx = await prisma.transaksi.aggregate({
    _sum: { totalHarga: true }
  });
  const sumDetail = await prisma.detailTransaksi.findMany({});
  let finalHpp = 0;
  sumDetail.forEach(d => {
    finalHpp += d.hargaPokok * d.jumlah;
  });

  console.log('--- SEEDING SELESAI ---');
  console.log(`Jumlah Transaksi ter-seed: ${finalCount}`);
  console.log(`Total Pendapatan (Omzet) di DB: Rp ${sumTx._sum.totalHarga}`);
  console.log(`Total HPP di DB: Rp ${finalHpp}`);
  console.log(`Laba Kotor di DB: Rp ${sumTx._sum.totalHarga - finalHpp}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

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

  console.log('--- SEEDING SELESAI ---');
  console.log('Data master (Pasien, Metode Pembayaran, Kategori Terapi, Katalog Terapi) berhasil di-seed (Tanpa Transaksi).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

# SI-KABID | Sistem Informasi Kasir & Keuangan Bidan (Next.js Full-Stack)

Aplikasi berbasis web monorepo yang dirancang khusus untuk mempermudah kasir dan manajemen keuangan pada klinik kebidanan. Proyek ini dibangun menggunakan **Next.js (App Router)**, **Tailwind CSS (v4)**, dan **Prisma ORM (dengan driver MySQL)** untuk pelaksanaan KKN Bidan 2026.

---

## 🛠️ Prasyarat (Prerequisites)

Sebelum menjalankan proyek ini, pastikan Anda telah memasang:
- **Node.js** (Versi 18.x atau lebih baru recommended)
- **NPM** (Bawaan dari instalasi Node.js)
- **MySQL Database Server** (Misal menggunakan XAMPP, Laragon, Docker, atau MySQL Server lokal)

---

## 🚀 Langkah Setup & Cara Menjalankan Proyek

Ikuti langkah-langkah berikut untuk memasang proyek di komputer lokal tim pengembang Anda:

1. **Unduh/Clone Proyek**
   Buka terminal di direktori proyek:
   ```bash
   cd KKNbidan
   ```

2. **Pasang Dependensi (Install Dependencies)**
   Jalankan perintah berikut untuk menginstal semua library dasar (Next.js, React, Tailwind, Lucide Icons, Prisma):
   ```bash
   npm install
   ```

3. **Konfigurasi Database MySQL**
   - Di root folder proyek, temukan berkas bernama `.env`.
   - Pastikan variabel `DATABASE_URL` sudah mengarah ke database `db_kkn_bidan` lokal Anda:
     ```env
     DATABASE_URL="mysql://root:@localhost:3306/db_kkn_bidan"
     ```
     *Catatan: Anda dapat menyesuaikan port, username (`root`), dan password jika setelan MySQL lokal Anda berbeda dari bawaan standard XAMPP.*

4. **Jalankan Development Server**
   Mulai server pengembangan lokal:
   ```bash
   npm run dev
   ```

5. **Akses Aplikasi**
   Buka browser Anda dan akses alamat berikut:
   - **Frontend (Tampilan Welcome Screen)**: `http://localhost:3000`
   - **Backend API (Contoh Endpoint JSON)**: `http://localhost:3000/api/hello`

---

## 🗄️ Cetak Biru Database & Langkah Migrasi (Database & Migrations)

Proyek ini telah dilengkapi dengan rancangan **6 tabel relasional** berbasis **MySQL** di dalam berkas [prisma/schema.prisma](file:///d:/Kuliah/semester6/KKNbidan/prisma/schema.prisma) yang mendukung sistem Point of Sale (POS) kasir, keluwesan kategori tindakan, serta penghitungan Harga Pokok Jasa (HPP/HPJ) untuk pelaporan laba rugi.

### 1. Struktur Tabel yang Tersedia:
- **`Pasien`**: Menyimpan biodata pasien. Kolom `tanggalLahir` dan `alamat` disetel *nullable* (opsional) agar mempermudah kasir menginput data secara cepat (*Skenario Pasien Umum/Anonim*).
- **`KategoriTerapi`**: Tabel dinamis kategori tindakan medis (misal: Hamil, Persalinan, KB). Bidan dapat melakukan CRUD penuh untuk menambah kategori baru langsung melalui aplikasi tanpa perlu coding ulang.
- **`Terapi`**: Katalog master layanan/tindakan medis. Dilengkapi kolom `harga` (harga jual) dan `hargaPokok` (modal pengeluaran layanan/HPP) untuk pelaporan keuangan.
- **`MetodePembayaran`**: Tabel dinamis metode pembayaran (misal: Tunai, QRIS, Transfer BCA). Mendukung CRUD penuh.
- **`Transaksi`**: Invoice POS Header. Dirancang **hanya mendukung Create & Read** (tanpa Update/Delete) untuk mencegah manipulasi keuangan/fraud.
- **`DetailTransaksi`**: Rincian transaksi (*line items*). Menyimpan *snapshot* `hargaJual` dan `hargaPokok` historis saat transaksi terjadi agar pelaporan keuntungan tetap konsisten di masa depan.

### 2. Cara Melakukan Migrasi ke Database Lokal:
Setelah Anda membuat database kosong bernama `db_kkn_bidan` di phpMyAdmin, jalankan perintah di bawah ini pada terminal proyek untuk membuat seluruh tabel dan relasinya secara otomatis:
```bash
npx prisma migrate dev --name inisialisasi_tabel_sikabid
```

### 3. Cara Mengakses Data secara Visual (Prisma Studio)
Untuk melihat, memasukkan, atau mengedit data tabel database (seperti Pasien, Terapi, KategoriTerapi) secara langsung melalui antarmuka web GUI, jalankan:
```bash
npx prisma studio
```
*Atau Anda juga bisa membukanya secara normal seperti biasa melalui **phpMyAdmin**.*

---

## 📂 Struktur Folder Blueprint

Folder proyek telah diatur menggunakan struktur standar Next.js App Router:

- **`app/`**: Folder utama navigasi halaman (routing) dan API backend.
  - **`app/page.js`**: Halaman utama / dashboard *welcome screen*.
  - **`app/layout.js`**: Pembungkus layout global (font Outfit & setelan HTML).
  - **`app/api/`**: Tempat mendefinisikan API Routes (misal: `app/api/hello/route.js`).
- **`components/`**: Komponen UI kustom yang dapat digunakan kembali oleh tim.
- **`lib/`**: Berkas helper, berisi file `prisma.js` (singleton instance untuk database).
- **`prisma/`**: Berkas konfigurasi skema Prisma (`schema.prisma`) dan folder pelacak migrasi SQL.
- **`public/`**: Tempat menyimpan aset statis seperti gambar, ikon, atau logo.
- **`.env`**: Konfigurasi variabel lingkungan untuk menyimpan kredensial database (ter-ignore dari git).

---

## 📦 Pustaka Utama Terinstal

- **Next.js** (v16.2) - Framework Full-stack React
- **React JS** (v19.2) - Library UI
- **Tailwind CSS** (v4.0) - Framework CSS bawaan Next.js
- **Prisma ORM** (v7.8) - Database client & tool migrasi MySQL
- **Lucide React** (v1.16) - Koleksi ikon SVG modern

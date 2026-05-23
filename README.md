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
   - Ubah nilai variabel `DATABASE_URL` dengan informasi kredensial MySQL lokal Anda. Contoh formatnya:
     ```env
     DATABASE_URL="mysql://[username]:[password]@localhost:3306/[nama_database]"
     ```
     *Ganti `[username]`, `[password]`, dan `[nama_database]` dengan setelan MySQL Anda (default XAMPP biasanya `root` tanpa password).*

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

## 🗄️ Langkah Migrasi Database (Database Migrations)

Proyek ini telah dilengkapi dengan **Prisma ORM** yang dikonfigurasikan menggunakan MySQL. Karena rancangan tabel database Anda belum dibuat, ikuti panduan berikut saat tim Anda siap merancang basis data:

1. **Definisikan Skema Tabel (Models)**
   Buka berkas [prisma/schema.prisma](file:///d:/Kuliah/semester6/KKNbidan/prisma/schema.prisma). Tambahkan model tabel Anda di bagian bawah. Contoh menambahkan tabel Transaksi:
   ```prisma
   model Transaksi {
     id        Int      @id @default(autoincrement())
     tanggal   DateTime @default(now())
     jumlah    Float
     keterangan String?
   }
   ```

2. **Jalankan Perintah Migrasi**
   Buka terminal dan jalankan perintah berikut untuk membuat migrasi SQL dan menyinkronkan tabel secara otomatis ke MySQL:
   ```bash
   npx prisma migrate dev --name nama_migrasi_anda
   ```

3. **Gunakan Prisma Client di Server API**
   Untuk melakukan query ke database MySQL dari API Next.js, impor file `lib/prisma.js`. Contoh penggunaan di API route:
   ```javascript
   import prisma from '@/lib/prisma';
   
   export async function GET() {
     const data = await prisma.transaksi.findMany();
     return Response.json(data);
   }
   ```

4. **Buka Prisma Studio (Database GUI)**
   Gunakan GUI database bawaan Prisma untuk mengelola isi data MySQL secara visual melalui browser:
   ```bash
   npx prisma studio
   ```

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

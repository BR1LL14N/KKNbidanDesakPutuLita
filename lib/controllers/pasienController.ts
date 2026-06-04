import prisma from '../prisma';

export interface PasienInput {
  nama: string;
  tanggalLahir?: string | Date | null;
  alamat?: string | null;
}

export async function getAllPasien(search: string = '') {
  try {
    return await prisma.pasien.findMany({
      where: search ? {
        nama: {
          contains: search,
        }
      } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error: any) {
    console.error('Error in getAllPasien:', error);
    throw new Error('Gagal mengambil data pasien.');
  }
}

export async function getPasienById(id: string | number, includeHistory: boolean = false) {
  try {
    const targetId = typeof id === 'string' ? parseInt(id) : id;
    const includeOptions = includeHistory ? {
      transaksi: {
        orderBy: {
          tanggal: 'desc',
        },
        include: {
          detailTransaksi: {
            include: {
              terapi: true,
            }
          }
        }
      }
    } as const : undefined;

    const pasien = await prisma.pasien.findUnique({
      where: { id: targetId },
      include: includeOptions,
    });
    if (!pasien) {
      throw new Error('Pasien tidak ditemukan.');
    }
    return pasien;
  } catch (error: any) {
    console.error('Error in getPasienById:', error);
    throw error;
  }
}

export async function createPasien(data: PasienInput) {
  try {
    if (!data.nama || data.nama.trim() === '') {
      throw new Error('Nama pasien wajib diisi.');
    }
    return await prisma.pasien.create({
      data: {
        nama: data.nama,
        tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : null,
        alamat: data.alamat || null,
      },
    });
  } catch (error: any) {
    console.error('Error in createPasien:', error);
    throw error;
  }
}

export async function updatePasien(id: string | number, data: PasienInput) {
  try {
    if (!data.nama || data.nama.trim() === '') {
      throw new Error('Nama pasien wajib diisi.');
    }
    return await prisma.pasien.update({
      where: { id: typeof id === 'string' ? parseInt(id) : id },
      data: {
        nama: data.nama,
        tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : null,
        alamat: data.alamat || null,
      },
    });
  } catch (error: any) {
    console.error('Error in updatePasien:', error);
    throw error;
  }
}

export async function deletePasien(id: string | number) {
  try {
    const targetId = typeof id === 'string' ? parseInt(id) : id;
    
    // Validasi: Cek apakah pasien memiliki transaksi historis
    const transaksiExist = await prisma.transaksi.findFirst({
      where: { pasienId: targetId },
    });
    
    if (transaksiExist) {
      throw new Error('Pasien tidak dapat dihapus karena memiliki riwayat transaksi aktif.');
    }

    return await prisma.pasien.delete({
      where: { id: targetId },
    });
  } catch (error: any) {
    console.error('Error in deletePasien:', error);
    throw error;
  }
}

export async function getPasienStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. Total Pasien (Semua pasien di DB)
    const totalPasien = await prisma.pasien.count();

    // 2. Pasien Hari Ini: Pasien yang terdaftar hari ini ATAU melakukan transaksi hari ini
    const daftarHariIni = await prisma.pasien.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: { id: true },
    });
    const daftarHariIniIds = daftarHariIni.map((p) => p.id);

    const transaksiHariIni = await prisma.transaksi.findMany({
      where: {
        tanggal: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: { pasienId: true },
    });
    const transaksiHariIniIds = transaksiHariIni.map((t) => t.pasienId);

    // Gabungkan ID unik untuk pasien hari ini
    const pasienHariIniSet = new Set([...daftarHariIniIds, ...transaksiHariIniIds]);
    const pasienHariIni = pasienHariIniSet.size;

    // 3. Pasien Baru Bulan Ini: Pasien yang terdaftar sejak awal bulan ini
    const pasienBaruBulanIni = await prisma.pasien.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    return {
      totalPasien,
      pasienHariIni,
      pasienBaruBulanIni,
    };
  } catch (error: any) {
    console.error('Error in getPasienStats:', error);
    throw new Error('Gagal mengambil statistik data pasien.');
  }
}


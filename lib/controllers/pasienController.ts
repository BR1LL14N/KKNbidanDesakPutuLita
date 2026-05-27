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

export async function getPasienById(id: string | number) {
  try {
    const pasien = await prisma.pasien.findUnique({
      where: { id: typeof id === 'string' ? parseInt(id) : id },
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

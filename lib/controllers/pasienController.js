import prisma from '../prisma';

export async function getAllPasien(search = '') {
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
  } catch (error) {
    console.error('Error in getAllPasien:', error);
    throw new Error('Gagal mengambil data pasien.');
  }
}

export async function getPasienById(id) {
  try {
    const pasien = await prisma.pasien.findUnique({
      where: { id: parseInt(id) },
    });
    if (!pasien) {
      throw new Error('Pasien tidak ditemukan.');
    }
    return pasien;
  } catch (error) {
    console.error('Error in getPasienById:', error);
    throw error;
  }
}

export async function createPasien(data) {
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
  } catch (error) {
    console.error('Error in createPasien:', error);
    throw error;
  }
}

export async function updatePasien(id, data) {
  try {
    if (!data.nama || data.nama.trim() === '') {
      throw new Error('Nama pasien wajib diisi.');
    }
    return await prisma.pasien.update({
      where: { id: parseInt(id) },
      data: {
        nama: data.nama,
        tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : null,
        alamat: data.alamat || null,
      },
    });
  } catch (error) {
    console.error('Error in updatePasien:', error);
    throw error;
  }
}

export async function deletePasien(id) {
  try {
    const targetId = parseInt(id);
    
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
  } catch (error) {
    console.error('Error in deletePasien:', error);
    throw error;
  }
}

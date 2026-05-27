import prisma from '../prisma';

export interface MetodeInput {
  nama: string;
  aktif?: boolean;
}

export async function getAllMetode(onlyActive: boolean = false) {
  try {
    return await prisma.metodePembayaran.findMany({
      where: onlyActive ? { aktif: true } : undefined,
      orderBy: {
        nama: 'asc',
      },
    });
  } catch (error: any) {
    console.error('Error in getAllMetode:', error);
    throw new Error('Gagal mengambil data metode pembayaran.');
  }
}

export async function getMetodeById(id: string | number) {
  try {
    const targetId = typeof id === 'string' ? parseInt(id) : id;
    const metode = await prisma.metodePembayaran.findUnique({
      where: { id: targetId },
    });
    if (!metode) {
      throw new Error('Metode pembayaran tidak ditemukan.');
    }
    return metode;
  } catch (error: any) {
    console.error('Error in getMetodeById:', error);
    throw error;
  }
}

export async function createMetode(data: MetodeInput) {
  try {
    if (!data.nama || data.nama.trim() === '') {
      throw new Error('Nama metode pembayaran wajib diisi.');
    }
    return await prisma.metodePembayaran.create({
      data: {
        nama: data.nama,
        aktif: data.aktif !== undefined ? Boolean(data.aktif) : true,
      },
    });
  } catch (error: any) {
    console.error('Error in createMetode:', error);
    throw error;
  }
}

export async function updateMetode(id: string | number, data: MetodeInput) {
  try {
    const targetId = typeof id === 'string' ? parseInt(id) : id;
    if (!data.nama || data.nama.trim() === '') {
      throw new Error('Nama metode pembayaran wajib diisi.');
    }
    return await prisma.metodePembayaran.update({
      where: { id: targetId },
      data: {
        nama: data.nama,
        aktif: data.aktif !== undefined ? Boolean(data.aktif) : true,
      },
    });
  } catch (error: any) {
    console.error('Error in updateMetode:', error);
    throw error;
  }
}

export async function deleteMetode(id: string | number) {
  try {
    const targetId = typeof id === 'string' ? parseInt(id) : id;

    // Validasi: Cek apakah metode ini pernah dipakai untuk transaksi
    const transaksiExist = await prisma.transaksi.findFirst({
      where: { metodePembayaranId: targetId },
    });

    if (transaksiExist) {
      throw new Error('Metode pembayaran tidak dapat dihapus karena sudah memiliki riwayat transaksi keuangan. Nonaktifkan saja metode ini.');
    }

    return await prisma.metodePembayaran.delete({
      where: { id: targetId },
    });
  } catch (error: any) {
    console.error('Error in deleteMetode:', error);
    throw error;
  }
}

import prisma from '../prisma';

export interface TerapiInput {
  nama: string;
  kategoriId: string | number;
  harga: string | number;
  hargaPokok: string | number;
  deskripsi?: string | null;
  aktif?: boolean;
}

export async function getAllTerapi(onlyActive: boolean = false) {
  try {
    return await prisma.terapi.findMany({
      where: onlyActive ? { aktif: true } : undefined,
      include: {
        kategori: true,
      },
      orderBy: {
        nama: 'asc',
      },
    });
  } catch (error: any) {
    console.error('Error in getAllTerapi:', error);
    throw new Error('Gagal mengambil data tindakan/terapi.');
  }
}

export async function getTerapiById(id: string | number) {
  try {
    const targetId = typeof id === 'string' ? parseInt(id) : id;
    const terapi = await prisma.terapi.findUnique({
      where: { id: targetId },
      include: {
        kategori: true,
      },
    });
    if (!terapi) {
      throw new Error('Tindakan/terapi tidak ditemukan.');
    }
    return terapi;
  } catch (error: any) {
    console.error('Error in getTerapiById:', error);
    throw error;
  }
}

export async function createTerapi(data: TerapiInput) {
  try {
    if (!data.nama || data.nama.trim() === '') throw new Error('Nama tindakan wajib diisi.');
    if (!data.kategoriId) throw new Error('Kategori tindakan wajib ditentukan.');
    if (data.harga === undefined || Number(data.harga) < 0) throw new Error('Harga jual tidak valid.');
    if (data.hargaPokok === undefined || Number(data.hargaPokok) < 0) throw new Error('Harga modal (HPP) tidak valid.');

    return await prisma.terapi.create({
      data: {
        nama: data.nama,
        kategoriId: typeof data.kategoriId === 'string' ? parseInt(data.kategoriId) : data.kategoriId,
        harga: typeof data.harga === 'string' ? parseInt(data.harga) : data.harga,
        hargaPokok: typeof data.hargaPokok === 'string' ? parseInt(data.hargaPokok) : data.hargaPokok,
        deskripsi: data.deskripsi || null,
        aktif: data.aktif !== undefined ? Boolean(data.aktif) : true,
      },
    });
  } catch (error: any) {
    console.error('Error in createTerapi:', error);
    throw error;
  }
}

export async function updateTerapi(id: string | number, data: TerapiInput) {
  try {
    const targetId = typeof id === 'string' ? parseInt(id) : id;
    if (!data.nama || data.nama.trim() === '') throw new Error('Nama tindakan wajib diisi.');
    if (!data.kategoriId) throw new Error('Kategori tindakan wajib ditentukan.');
    if (data.harga === undefined || Number(data.harga) < 0) throw new Error('Harga jual tidak valid.');
    if (data.hargaPokok === undefined || Number(data.hargaPokok) < 0) throw new Error('Harga modal (HPP) tidak valid.');

    return await prisma.terapi.update({
      where: { id: targetId },
      data: {
        nama: data.nama,
        kategoriId: typeof data.kategoriId === 'string' ? parseInt(data.kategoriId) : data.kategoriId,
        harga: typeof data.harga === 'string' ? parseInt(data.harga) : data.harga,
        hargaPokok: typeof data.hargaPokok === 'string' ? parseInt(data.hargaPokok) : data.hargaPokok,
        deskripsi: data.deskripsi || null,
        aktif: data.aktif !== undefined ? Boolean(data.aktif) : true,
      },
    });
  } catch (error: any) {
    console.error('Error in updateTerapi:', error);
    throw error;
  }
}

export async function deleteTerapi(id: string | number) {
  try {
    const targetId = typeof id === 'string' ? parseInt(id) : id;

    // Validasi: Cek apakah tindakan ini sudah pernah dicatat di transaksi
    const detailExist = await prisma.detailTransaksi.findFirst({
      where: { terapiId: targetId },
    });

    if (detailExist) {
      throw new Error('Tindakan tidak dapat dihapus karena memiliki riwayat transaksi keuangan. Nonaktifkan saja tindakan ini.');
    }

    return await prisma.terapi.delete({
      where: { id: targetId },
    });
  } catch (error: any) {
    console.error('Error in deleteTerapi:', error);
    throw error;
  }
}

import prisma from '../prisma';

export async function getAllTerapi(onlyActive = false) {
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
  } catch (error) {
    console.error('Error in getAllTerapi:', error);
    throw new Error('Gagal mengambil data tindakan/terapi.');
  }
}

export async function getTerapiById(id) {
  try {
    const terapi = await prisma.terapi.findUnique({
      where: { id: parseInt(id) },
      include: {
        kategori: true,
      },
    });
    if (!terapi) {
      throw new Error('Tindakan/terapi tidak ditemukan.');
    }
    return terapi;
  } catch (error) {
    console.error('Error in getTerapiById:', error);
    throw error;
  }
}

export async function createTerapi(data) {
  try {
    if (!data.nama || data.nama.trim() === '') throw new Error('Nama tindakan wajib diisi.');
    if (!data.kategoriId) throw new Error('Kategori tindakan wajib ditentukan.');
    if (data.harga === undefined || data.harga < 0) throw new Error('Harga jual tidak valid.');
    if (data.hargaPokok === undefined || data.hargaPokok < 0) throw new Error('Harga modal (HPP) tidak valid.');

    return await prisma.terapi.create({
      data: {
        nama: data.nama,
        kategoriId: parseInt(data.kategoriId),
        harga: parseInt(data.harga),
        hargaPokok: parseInt(data.hargaPokok),
        deskripsi: data.deskripsi || null,
        aktif: data.aktif !== undefined ? Boolean(data.aktif) : true,
      },
    });
  } catch (error) {
    console.error('Error in createTerapi:', error);
    throw error;
  }
}

export async function updateTerapi(id, data) {
  try {
    if (!data.nama || data.nama.trim() === '') throw new Error('Nama tindakan wajib diisi.');
    if (!data.kategoriId) throw new Error('Kategori tindakan wajib ditentukan.');
    if (data.harga === undefined || data.harga < 0) throw new Error('Harga jual tidak valid.');
    if (data.hargaPokok === undefined || data.hargaPokok < 0) throw new Error('Harga modal (HPP) tidak valid.');

    return await prisma.terapi.update({
      where: { id: parseInt(id) },
      data: {
        nama: data.nama,
        kategoriId: parseInt(data.kategoriId),
        harga: parseInt(data.harga),
        hargaPokok: parseInt(data.hargaPokok),
        deskripsi: data.deskripsi || null,
        aktif: data.aktif !== undefined ? Boolean(data.aktif) : true,
      },
    });
  } catch (error) {
    console.error('Error in updateTerapi:', error);
    throw error;
  }
}

export async function deleteTerapi(id) {
  try {
    const targetId = parseInt(id);

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
  } catch (error) {
    console.error('Error in deleteTerapi:', error);
    throw error;
  }
}

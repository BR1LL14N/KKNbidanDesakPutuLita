import prisma from '../prisma';

export async function getAllKategori() {
  try {
    return await prisma.kategoriTerapi.findMany({
      orderBy: {
        nama: 'asc',
      },
    });
  } catch (error) {
    console.error('Error in getAllKategori:', error);
    throw new Error('Gagal mengambil data kategori terapi.');
  }
}

export async function getKategoriById(id) {
  try {
    const kategori = await prisma.kategoriTerapi.findUnique({
      where: { id: parseInt(id) },
    });
    if (!kategori) {
      throw new Error('Kategori tidak ditemukan.');
    }
    return kategori;
  } catch (error) {
    console.error('Error in getKategoriById:', error);
    throw error;
  }
}

export async function createKategori(data) {
  try {
    if (!data.nama || data.nama.trim() === '') {
      throw new Error('Nama kategori wajib diisi.');
    }
    return await prisma.kategoriTerapi.create({
      data: {
        nama: data.nama,
        deskripsi: data.deskripsi || null,
      },
    });
  } catch (error) {
    console.error('Error in createKategori:', error);
    throw error;
  }
}

export async function updateKategori(id, data) {
  try {
    if (!data.nama || data.nama.trim() === '') {
      throw new Error('Nama kategori wajib diisi.');
    }
    return await prisma.kategoriTerapi.update({
      where: { id: parseInt(id) },
      data: {
        nama: data.nama,
        deskripsi: data.deskripsi || null,
      },
    });
  } catch (error) {
    console.error('Error in updateKategori:', error);
    throw error;
  }
}

export async function deleteKategori(id) {
  try {
    const targetId = parseInt(id);
    
    // Validasi: Cek apakah ada layanan terapi yang menggunakan kategori ini
    const terapiExist = await prisma.terapi.findFirst({
      where: { kategoriId: targetId },
    });
    
    if (terapiExist) {
      throw new Error('Kategori tidak dapat dihapus karena masih digunakan oleh beberapa katalog tindakan.');
    }

    return await prisma.kategoriTerapi.delete({
      where: { id: targetId },
    });
  } catch (error) {
    console.error('Error in deleteKategori:', error);
    throw error;
  }
}

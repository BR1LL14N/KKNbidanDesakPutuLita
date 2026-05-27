import prisma from '../prisma';

export interface KategoriInput {
  nama: string;
  deskripsi?: string | null;
}

export async function getAllKategori() {
  try {
    return await prisma.kategoriTerapi.findMany({
      orderBy: {
        nama: 'asc',
      },
    });
  } catch (error: any) {
    console.error('Error in getAllKategori:', error);
    throw new Error('Gagal mengambil data kategori terapi.');
  }
}

export async function getKategoriById(id: string | number) {
  try {
    const targetId = typeof id === 'string' ? parseInt(id) : id;
    const kategori = await prisma.kategoriTerapi.findUnique({
      where: { id: targetId },
    });
    if (!kategori) {
      throw new Error('Kategori tidak ditemukan.');
    }
    return kategori;
  } catch (error: any) {
    console.error('Error in getKategoriById:', error);
    throw error;
  }
}

export async function createKategori(data: KategoriInput) {
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
  } catch (error: any) {
    console.error('Error in createKategori:', error);
    throw error;
  }
}

export async function updateKategori(id: string | number, data: KategoriInput) {
  try {
    const targetId = typeof id === 'string' ? parseInt(id) : id;
    if (!data.nama || data.nama.trim() === '') {
      throw new Error('Nama kategori wajib diisi.');
    }
    return await prisma.kategoriTerapi.update({
      where: { id: targetId },
      data: {
        nama: data.nama,
        deskripsi: data.deskripsi || null,
      },
    });
  } catch (error: any) {
    console.error('Error in updateKategori:', error);
    throw error;
  }
}

export async function deleteKategori(id: string | number) {
  try {
    const targetId = typeof id === 'string' ? parseInt(id) : id;
    
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
  } catch (error: any) {
    console.error('Error in deleteKategori:', error);
    throw error;
  }
}

import prisma from '../prisma';

export async function getAllTransaksi(filters = {}) {
  try {
    const { startDate, endDate, pasienId } = filters;
    
    const where = {};
    
    if (pasienId) {
      where.pasienId = parseInt(pasienId);
    }
    
    if (startDate || endDate) {
      where.tanggal = {};
      if (startDate) {
        where.tanggal.gte = new Date(startDate);
      }
      if (endDate) {
        // Set to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.tanggal.lte = end;
      }
    }

    return await prisma.transaksi.findMany({
      where,
      include: {
        pasien: true,
        metodePembayaran: true,
        detailTransaksi: {
          include: {
            terapi: true,
          }
        }
      },
      orderBy: {
        tanggal: 'desc',
      }
    });
  } catch (error) {
    console.error('Error in getAllTransaksi:', error);
    throw new Error('Gagal mengambil riwayat transaksi.');
  }
}

export async function getTransaksiById(id) {
  try {
    const transaksi = await prisma.transaksi.findUnique({
      where: { id: parseInt(id) },
      include: {
        pasien: true,
        metodePembayaran: true,
        detailTransaksi: {
          include: {
            terapi: {
              include: {
                kategori: true
              }
            }
          }
        }
      }
    });
    
    if (!transaksi) {
      throw new Error('Transaksi tidak ditemukan.');
    }
    
    return transaksi;
  } catch (error) {
    console.error('Error in getTransaksiById:', error);
    throw error;
  }
}

export async function checkoutTransaksi(data) {
  try {
    const { pasienId, metodePembayaranId, items, catatan } = data;
    
    if (!pasienId) throw new Error('Pasien harus ditentukan.');
    if (!metodePembayaranId) throw new Error('Metode pembayaran harus ditentukan.');
    if (!items || items.length === 0) throw new Error('Item belanja/tindakan kasir tidak boleh kosong.');

    // 1. Validasi keberadaan Pasien & Metode Pembayaran
    const pasien = await prisma.pasien.findUnique({ where: { id: parseInt(pasienId) } });
    if (!pasien) throw new Error('Pasien tidak valid.');

    const metode = await prisma.metodePembayaran.findUnique({ where: { id: parseInt(metodePembayaranId) } });
    if (!metode || !metode.aktif) throw new Error('Metode pembayaran tidak valid atau tidak aktif.');

    // 2. Buat Nomor Invoice Otomatis (INV/YYYYMMDD/XXXX)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const countToday = await prisma.transaksi.count({
      where: {
        tanggal: {
          gte: today,
          lt: tomorrow,
        }
      }
    });

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const date = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${date}`;
    const sequence = String(countToday + 1).padStart(4, '0');
    const nomorInvoice = `INV/${dateStr}/${sequence}`;

    // 3. Hitung detail item dan total harga
    let totalHarga = 0;
    const detailItems = [];

    for (const item of items) {
      const terapi = await prisma.terapi.findUnique({ 
        where: { id: parseInt(item.terapiId) },
        include: { kategori: true }
      });
      
      if (!terapi || !terapi.aktif) {
        throw new Error(`Tindakan terapi ID ${item.terapiId} tidak valid atau sudah nonaktif.`);
      }

      const jumlah = parseInt(item.jumlah) || 1;
      const subtotal = terapi.harga * jumlah;
      totalHarga += subtotal;

      detailItems.push({
        terapiId: terapi.id,
        hargaJual: terapi.harga,
        hargaPokok: terapi.hargaPokok,
        jumlah,
        subtotal
      });
    }

    // 4. Jalankan transaksi database (Atomik)
    return await prisma.$transaction(async (tx) => {
      const transaksi = await tx.transaksi.create({
        data: {
          nomorInvoice,
          pasienId: parseInt(pasienId),
          metodePembayaranId: parseInt(metodePembayaranId),
          totalHarga,
          catatan: catatan || null,
          detailTransaksi: {
            create: detailItems.map(item => ({
              terapiId: item.terapiId,
              hargaJual: item.hargaJual,
              hargaPokok: item.hargaPokok,
              jumlah: item.jumlah,
              subtotal: item.subtotal
            }))
          }
        },
        include: {
          pasien: true,
          metodePembayaran: true,
          detailTransaksi: true
        }
      });

      return transaksi;
    });

  } catch (error) {
    console.error('Error in checkoutTransaksi:', error);
    throw error;
  }
}

export async function getRekapitulasi(startDate, endDate) {
  try {
    const where = {};
    if (startDate || endDate) {
      where.tanggal = {};
      if (startDate) {
        where.tanggal.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.tanggal.lte = end;
      }
    }

    const transaksiList = await prisma.transaksi.findMany({
      where,
      include: {
        metodePembayaran: true,
        detailTransaksi: {
          include: {
            terapi: {
              include: {
                kategori: true
              }
            }
          }
        }
      }
    });

    let totalPendapatan = 0;
    let totalModal = 0;
    let totalTransaksi = transaksiList.length;

    const rekapMetode = {};
    const rekapKategori = {};

    transaksiList.forEach(tx => {
      totalPendapatan += tx.totalHarga;
      
      // Hitung Rekap per Metode Pembayaran
      const namaMetode = tx.metodePembayaran.nama;
      if (!rekapMetode[namaMetode]) {
        rekapMetode[namaMetode] = { jumlahTransaksi: 0, nominal: 0 };
      }
      rekapMetode[namaMetode].jumlahTransaksi += 1;
      rekapMetode[namaMetode].nominal += tx.totalHarga;

      tx.detailTransaksi.forEach(detail => {
        const cost = detail.hargaPokok * detail.jumlah;
        totalModal += cost;

        // Hitung Rekap per Kategori Terapi
        const namaKategori = detail.terapi.kategori.nama;
        if (!rekapKategori[namaKategori]) {
          rekapKategori[namaKategori] = { nominalJual: 0, nominalModal: 0, jumlahLayanan: 0 };
        }
        rekapKategori[namaKategori].nominalJual += detail.subtotal;
        rekapKategori[namaKategori].nominalModal += cost;
        rekapKategori[namaKategori].jumlahLayanan += detail.jumlah;
      });
    });

    const totalLabaKotor = totalPendapatan - totalModal;
    const marginKeuntungan = totalPendapatan > 0 ? (totalLabaKotor / totalPendapatan) * 100 : 0;

    return {
      periode: {
        startDate: startDate || null,
        endDate: endDate || null
      },
      ringkasan: {
        totalTransaksi,
        totalPendapatan,
        totalModal,
        totalLabaKotor,
        marginKeuntungan: parseFloat(marginKeuntungan.toFixed(2))
      },
      breakdownMetode: Object.keys(rekapMetode).map(key => ({
        metode: key,
        ...rekapMetode[key]
      })),
      breakdownKategori: Object.keys(rekapKategori).map(key => {
        const laba = rekapKategori[key].nominalJual - rekapKategori[key].nominalModal;
        const margin = rekapKategori[key].nominalJual > 0 ? (laba / rekapKategori[key].nominalJual) * 100 : 0;
        return {
          kategori: key,
          nominalJual: rekapKategori[key].nominalJual,
          nominalModal: rekapKategori[key].nominalModal,
          labaKotor: laba,
          margin: parseFloat(margin.toFixed(2)),
          jumlahLayanan: rekapKategori[key].jumlahLayanan
        };
      })
    };

  } catch (error) {
    console.error('Error in getRekapitulasi:', error);
    throw new Error('Gagal menyusun rekapitulasi keuangan.');
  }
}

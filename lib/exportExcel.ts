/**
 * exportExcel.ts
 * Utility fungsi untuk mengekspor data laporan keuangan klinik bidan ke file .xlsx
 * Menghasilkan workbook multi-sheet yang informatif dengan styling ringkas.
 */

import * as XLSX from 'xlsx';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DetailItem {
  terapi?: { nama: string };
  hargaJual: number;
  hargaPokok: number;
  jumlah: number;
  subtotal: number;
}

interface TransaksiItem {
  id: number;
  nomorInvoice?: string;
  tanggal: string;
  createdAt?: string;
  pasien?: { nama: string; alamat?: string | null };
  metodePembayaran?: { nama: string };
  totalHarga: number;
  catatan?: string;
  layananSummary?: string;
  detailTransaksi: DetailItem[];
}

interface RingkasanRekap {
  totalTransaksi: number;
  totalPendapatan: number;
  totalModal: number;
  totalLabaKotor: number;
  marginKeuntungan: number;
}

interface BreakdownMetode {
  metode: string;
  jumlahTransaksi: number;
  nominal: number;
}

interface BreakdownKategori {
  kategori: string;
  nominalJual: number;
  nominalModal: number;
  labaKotor: number;
  margin: number;
  jumlahLayanan: number;
}

interface RekapData {
  ringkasan: RingkasanRekap;
  breakdownMetode: BreakdownMetode[];
  breakdownKategori?: BreakdownKategori[];
}

// ─── Formatter Helpers ────────────────────────────────────────────────────────

const rp = (val: number): string =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

const pct = (val: number): string => `${val.toFixed(2)}%`;

const tglId = (iso: string): string =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

const jamId = (iso: string): string =>
  new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

// ─── Sheet Builders ───────────────────────────────────────────────────────────

/**
 * Sheet 1: RINGKASAN EKSEKUTIF
 * Berisi semua angka utama dalam satu tampilan ringkas
 */
function buildRingkasanSheet(
  rekap: RekapData,
  startDate: string,
  endDate: string,
  isMock: boolean
): XLSX.WorkSheet {
  const { ringkasan, breakdownMetode, breakdownKategori } = rekap;

  const rows: (string | number)[][] = [];

  // ── Header klinik ──
  rows.push(['LAPORAN KEUANGAN KLINIK BIDAN']);
  rows.push(['Sistem Informasi Kasir & Keuangan Bidan (SI-KABID)']);
  rows.push([isMock ? '⚠ DATA SIMULASI — Basis data belum terhubung' : '✓ Data Real dari Basis Data MySQL']);
  rows.push([]);

  // ── Periode ──
  rows.push(['PERIODE LAPORAN']);
  rows.push(['Dari Tanggal', tglId(startDate)]);
  rows.push(['Sampai Tanggal', tglId(endDate)]);
  rows.push(['Dicetak Pada', new Date().toLocaleString('id-ID')]);
  rows.push([]);

  // ── Ringkasan Keuangan ──
  rows.push(['RINGKASAN KEUANGAN']);
  rows.push(['Indikator', 'Nilai', 'Keterangan']);
  rows.push(['Total Transaksi', ringkasan.totalTransaksi, 'Jumlah invoice kasir periode ini']);
  rows.push(['Total Omzet (Pendapatan)', ringkasan.totalPendapatan, 'Penjualan kotor seluruh layanan']);
  rows.push(['Total HPP (Modal)', ringkasan.totalModal, 'Harga Pokok Penjualan / biaya layanan']);
  rows.push(['Laba Kotor', ringkasan.totalLabaKotor, 'Omzet dikurangi HPP']);
  rows.push(['Margin Keuntungan', `${ringkasan.marginKeuntungan}%`, 'Persentase laba dari omzet']);
  rows.push([]);

  // ── Format rupiah untuk ringkasan ──
  rows.push(['RINGKASAN (Format Rupiah)']);
  rows.push(['Total Omzet', rp(ringkasan.totalPendapatan)]);
  rows.push(['Total HPP', rp(ringkasan.totalModal)]);
  rows.push(['Laba Kotor', rp(ringkasan.totalLabaKotor)]);
  rows.push(['Margin', pct(ringkasan.marginKeuntungan)]);
  rows.push([]);

  // ── Breakdown Metode Pembayaran ──
  rows.push(['REKAP PER METODE PEMBAYARAN']);
  rows.push(['Metode Pembayaran', 'Jumlah Transaksi', 'Total Nominal (Rp)', 'Persentase dari Omzet']);
  const totalNominalMetode = breakdownMetode.reduce((s, m) => s + m.nominal, 0) || 1;
  breakdownMetode.forEach(m => {
    rows.push([
      m.metode,
      m.jumlahTransaksi,
      m.nominal,
      pct((m.nominal / totalNominalMetode) * 100),
    ]);
  });
  rows.push([]);

  // ── Breakdown Kategori (jika tersedia) ──
  if (breakdownKategori && breakdownKategori.length > 0) {
    rows.push(['REKAP PER KATEGORI LAYANAN']);
    rows.push(['Kategori', 'Jumlah Tindakan', 'Total Jual (Rp)', 'Total HPP (Rp)', 'Laba Kotor (Rp)', 'Margin (%)']);
    breakdownKategori.forEach(k => {
      rows.push([
        k.kategori,
        k.jumlahLayanan,
        k.nominalJual,
        k.nominalModal,
        k.labaKotor,
        `${k.margin}%`,
      ]);
    });
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Lebar kolom
  ws['!cols'] = [
    { wch: 35 }, // A
    { wch: 25 }, // B
    { wch: 35 }, // C
    { wch: 22 }, // D
  ];

  return ws;
}

/**
 * Sheet 2: RIWAYAT TRANSAKSI (AUDIT TRAIL)
 * Setiap baris = 1 transaksi dengan semua field penting
 */
function buildTransaksiSheet(transaksiList: TransaksiItem[]): XLSX.WorkSheet {
  const headers = [
    'No.',
    'No. Invoice',
    'Tanggal',
    'Jam',
    'Nama Pasien',
    'Layanan (Ringkasan)',
    'Metode Bayar',
    'Status',
    'Total Omzet (Rp)',
    'Total HPP (Rp)',
    'Laba Kotor (Rp)',
    'Margin (%)',
    'Catatan Kasir',
  ];

  const dataRows = transaksiList.map((tx, idx) => {
    const totalHpp = tx.detailTransaksi.reduce((s, d) => s + d.hargaPokok * d.jumlah, 0);
    const labaKotor = tx.totalHarga - totalHpp;
    const margin = tx.totalHarga > 0 ? ((labaKotor / tx.totalHarga) * 100).toFixed(1) : '0.0';
    const status = tx.catatan?.toLowerCase().includes('menunggu') ? 'BELUM BAYAR' : 'LUNAS';

    const firstItem = tx.detailTransaksi?.[0]?.terapi?.nama || 'Layanan Medis';
    const layananSummary =
      tx.layananSummary ||
      (tx.detailTransaksi.length > 1
        ? `${firstItem} & ${tx.detailTransaksi.length - 1} tindakan lain`
        : firstItem);

    return [
      idx + 1,
      tx.nomorInvoice || '-',
      tglId(tx.tanggal),
      jamId(tx.tanggal),
      tx.pasien?.nama || '-',
      layananSummary,
      tx.metodePembayaran?.nama || '-',
      status,
      tx.totalHarga,
      totalHpp,
      labaKotor,
      `${margin}%`,
      tx.catatan || '-',
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

  // Lebar kolom
  ws['!cols'] = [
    { wch: 5 },   // No.
    { wch: 22 },  // Invoice
    { wch: 20 },  // Tanggal
    { wch: 8 },   // Jam
    { wch: 28 },  // Pasien
    { wch: 35 },  // Layanan
    { wch: 22 },  // Metode
    { wch: 12 },  // Status
    { wch: 20 },  // Omzet
    { wch: 18 },  // HPP
    { wch: 18 },  // Laba
    { wch: 12 },  // Margin
    { wch: 40 },  // Catatan
  ];

  return ws;
}

/**
 * Sheet 3: DETAIL ITEM PER TRANSAKSI
 * Satu baris per item/tindakan — cocok untuk analisis mendalam
 */
function buildDetailItemSheet(transaksiList: TransaksiItem[]): XLSX.WorkSheet {
  const headers = [
    'No. Invoice',
    'Tanggal',
    'Nama Pasien',
    'Nama Item / Tindakan',
    'HPP per Unit (Rp)',
    'Tarif Jual per Unit (Rp)',
    'Qty',
    'Subtotal Jual (Rp)',
    'Subtotal HPP (Rp)',
    'Laba per Baris (Rp)',
  ];

  const dataRows: (string | number)[][] = [];

  transaksiList.forEach(tx => {
    tx.detailTransaksi.forEach(detail => {
      const subtotalHpp = detail.hargaPokok * detail.jumlah;
      const laba = (detail.hargaJual - detail.hargaPokok) * detail.jumlah;
      dataRows.push([
        tx.nomorInvoice || '-',
        tglId(tx.tanggal),
        tx.pasien?.nama || '-',
        detail.terapi?.nama || 'Layanan Tidak Diketahui',
        detail.hargaPokok,
        detail.hargaJual,
        detail.jumlah,
        detail.subtotal,
        subtotalHpp,
        laba,
      ]);
    });
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

  ws['!cols'] = [
    { wch: 22 },  // Invoice
    { wch: 20 },  // Tanggal
    { wch: 28 },  // Pasien
    { wch: 35 },  // Item
    { wch: 20 },  // HPP/unit
    { wch: 22 },  // Jual/unit
    { wch: 6 },   // Qty
    { wch: 20 },  // Subtotal jual
    { wch: 18 },  // Subtotal HPP
    { wch: 18 },  // Laba
  ];

  return ws;
}

/**
 * Sheet 4: REKAP METODE PEMBAYARAN
 * Tabel ringkas per metode bayar dengan persentase
 */
function buildMetodeSheet(rekap: RekapData): XLSX.WorkSheet {
  const { breakdownMetode, ringkasan } = rekap;

  const headers = ['Metode Pembayaran', 'Jumlah Transaksi', 'Total Nominal (Rp)', '% dari Omzet', '% dari Jumlah Transaksi'];

  const totalNominal = breakdownMetode.reduce((s, m) => s + m.nominal, 0) || 1;
  const totalTx = ringkasan.totalTransaksi || 1;

  const dataRows = breakdownMetode.map(m => [
    m.metode,
    m.jumlahTransaksi,
    m.nominal,
    pct((m.nominal / totalNominal) * 100),
    pct((m.jumlahTransaksi / totalTx) * 100),
  ]);

  // Baris total
  dataRows.push([
    'TOTAL',
    ringkasan.totalTransaksi,
    ringkasan.totalPendapatan,
    '100%',
    '100%',
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

  ws['!cols'] = [
    { wch: 30 },
    { wch: 20 },
    { wch: 22 },
    { wch: 18 },
    { wch: 22 },
  ];

  return ws;
}

// ─── Main Export Function ─────────────────────────────────────────────────────

export interface ExportLaporanParams {
  rekap: RekapData;
  transaksiList: TransaksiItem[];
  startDate: string;
  endDate: string;
  isMock: boolean;
}

export function exportLaporanToExcel({
  rekap,
  transaksiList,
  startDate,
  endDate,
  isMock,
}: ExportLaporanParams): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Ringkasan Eksekutif
  const wsRingkasan = buildRingkasanSheet(rekap, startDate, endDate, isMock);
  XLSX.utils.book_append_sheet(wb, wsRingkasan, '📊 Ringkasan Eksekutif');

  // Sheet 2: Riwayat Transaksi
  const wsTransaksi = buildTransaksiSheet(transaksiList);
  XLSX.utils.book_append_sheet(wb, wsTransaksi, '🧾 Riwayat Transaksi');

  // Sheet 3: Detail Item
  const wsDetail = buildDetailItemSheet(transaksiList);
  XLSX.utils.book_append_sheet(wb, wsDetail, '🔍 Detail Item Tindakan');

  // Sheet 4: Rekap Metode
  const wsMetode = buildMetodeSheet(rekap);
  XLSX.utils.book_append_sheet(wb, wsMetode, '💳 Rekap Metode Bayar');

  // Nama file
  const fromStr = startDate.replaceAll('-', '');
  const toStr = endDate.replaceAll('-', '');
  const fileName = `Laporan_Keuangan_${fromStr}_sd_${toStr}${isMock ? '_SIMULASI' : ''}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

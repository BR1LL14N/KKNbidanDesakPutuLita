import prisma from '../../lib/prisma';

export default async function PageTransaksi() {
  // Mengambil semua data transaksi
  const listTransaksi = await prisma.transaksi.findMany();

  return (
    <div style={{ padding: '20px' }}>
      <h1>Data Transaksi</h1>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tanggal</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {listTransaksi.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.tanggal?.toString()}</td>
              <td>{item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
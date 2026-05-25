import { NextResponse } from 'next/server';
import { getKategoriById, updateKategori, deleteKategori } from '../../../../lib/controllers/kategoriController';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const data = await getKategoriById(id);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await updateKategori(id, body);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const data = await deleteKategori(id);
    return NextResponse.json({ message: 'Kategori berhasil dihapus.', data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

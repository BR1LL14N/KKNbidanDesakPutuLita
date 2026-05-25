import { NextResponse } from 'next/server';
import { getMetodeById, updateMetode, deleteMetode } from '../../../../lib/controllers/metodeController';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const data = await getMetodeById(id);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await updateMetode(id, body);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const data = await deleteMetode(id);
    return NextResponse.json({ message: 'Metode pembayaran berhasil dihapus.', data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';
import { getTerapiById, updateTerapi, deleteTerapi } from '../../../../lib/controllers/terapiController';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const data = await getTerapiById(id);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await updateTerapi(id, body);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const data = await deleteTerapi(id);
    return NextResponse.json({ message: 'Tindakan terapi berhasil dihapus.', data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';
import { getPasienById, updatePasien, deletePasien } from '../../../../lib/controllers/pasienController';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const data = await getPasienById(id);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await updatePasien(id, body);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const data = await deletePasien(id);
    return NextResponse.json({ message: 'Data pasien berhasil dihapus.', data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

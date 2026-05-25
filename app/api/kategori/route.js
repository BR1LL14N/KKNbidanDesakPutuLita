import { NextResponse } from 'next/server';
import { getAllKategori, createKategori } from '../../../lib/controllers/kategoriController';

export async function GET() {
  try {
    const data = await getAllKategori();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const data = await createKategori(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

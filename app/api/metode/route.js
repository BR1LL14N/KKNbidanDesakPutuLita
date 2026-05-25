import { NextResponse } from 'next/server';
import { getAllMetode, createMetode } from '../../../lib/controllers/metodeController';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const onlyActive = searchParams.get('aktif') === 'true';
    const data = await getAllMetode(onlyActive);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const data = await createMetode(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

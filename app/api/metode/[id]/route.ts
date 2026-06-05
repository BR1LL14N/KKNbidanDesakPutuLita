import { NextResponse } from 'next/server';
import { getMetodeById, updateMetode, deleteMetode } from '../../../../lib/controllers/metodeController';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const data = await getMetodeById(id);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await updateMetode(id, body);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const data = await deleteMetode(id);
    return NextResponse.json({ message: 'Metode pembayaran berhasil dihapus.', data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

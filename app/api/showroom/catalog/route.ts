import { NextResponse } from 'next/server';
import { getShowroomCatalog } from '@/app/lib/showroom-catalog';

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    return NextResponse.json({ variants: await getShowroomCatalog() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Catalog unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}

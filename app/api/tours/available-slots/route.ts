import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api-client';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { success: false, message: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const backendRes = await fetch(`${API_BASE_URL}/tours/available-slots?date=${encodeURIComponent(date)}`, {
      cache: 'no-store'
    });

    if (!backendRes.ok) {
      return NextResponse.json(
        { success: false, message: `Backend error ${backendRes.status}` },
        { status: backendRes.status }
      );
    }

    const json = await backendRes.json();
    return NextResponse.json(json);
  } catch (err: any) {
    console.error('[api/tours/available-slots] Error fetching slots:', err?.message);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
}

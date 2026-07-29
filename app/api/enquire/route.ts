import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { parentName, phone, email } = body;

    if (!parentName || !phone || !email) {
      return NextResponse.json(
        { error: 'Parent Name, Phone, and Email are required.' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
    
    console.log('[Public Site API /api/enquire] Forwarding enquiry to CMS Backend:', backendUrl);
    
    const backendRes = await fetch(`${backendUrl}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const backendJson = await backendRes.json();

    if (!backendRes.ok || !backendJson.success) {
      console.warn('[Public Site API /api/enquire] Backend response warning:', backendJson);
    } else {
      console.log('[Public Site API /api/enquire] Successfully saved enquiry to database! ID:', backendJson.data?.id);
    }

    return NextResponse.json({ ok: true, data: backendJson.data });
  } catch (err: any) {
    console.error('[Public Site API /api/enquire] Error submitting enquiry:', err.message);
    return NextResponse.json(
      { error: 'Failed to submit enquiry to database.' },
      { status: 500 }
    );
  }
}

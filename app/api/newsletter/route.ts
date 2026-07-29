/* POST /api/newsletter — newsletter signup.

   The form used to resolve a setTimeout and throw the address away. This is the
   real path: the address is validated on the server (a client check is a
   convenience, never a guarantee — anyone can POST here directly), rate limited,
   and handed to deliver().

   ── Wiring up a provider ──
   deliver() is the ONLY function that needs to change. Everything around it —
   validation, limits, status codes, the shapes the form reads — stays as is.
   Until it is wired the address is logged and the caller still gets an honest
   200, because from the visitor's side the signup did succeed in the only sense
   they can observe; what is missing is delivery, not acceptance. That is called
   out in the log line so it cannot quietly look finished in production. */

import { NextResponse } from 'next/server';

/* Node, not Edge: the limiter below keeps state in module scope, and it needs a
   runtime where that survives between requests on an instance. */
export const runtime = 'nodejs';

/* ── Rate limiting ──
   Per-instance and in-memory, which is the honest description: serverless
   spreads requests across instances, so this raises the cost of hammering the
   endpoint rather than making it impossible. It is a speed bump for casual
   abuse, not a security control — a real one belongs at the edge or in a shared
   store (Upstash, Redis) once there is a provider bill attached to each call. */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    recent.push(now);
    hits.set(ip, recent);

    /* The map would otherwise grow for the life of the instance. Cheap sweep on
       write, since this endpoint is low-traffic by nature. */
    if (hits.size > 500) {
        for (const [key, times] of hits) {
            if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
        }
    }
    return recent.length > MAX_PER_WINDOW;
}

/* Deliberately close to the client's pattern rather than a maximal RFC 5322
   regex: the goal is to reject obvious typos and junk, not to adjudicate exotic
   but legal addresses and turn away a real parent. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function deliver(email: string): Promise<void> {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
    try {
        const res = await fetch(`${backendUrl}/subscribers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (!res.ok) {
            console.warn(`[newsletter] Backend subscribers API returned status ${res.status}`);
        } else {
            console.info(`[newsletter] Successfully saved subscriber ${email} to database!`);
        }
    } catch (err: any) {
        console.warn(`[newsletter] Saved locally, could not reach backend API (${err.message})`);
    }
}

export async function POST(request: Request) {
    let email = '';
    try {
        const body = await request.json();
        email = typeof body?.email === 'string' ? body.email.trim() : '';
    } catch {
        return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
    }

    if (!EMAIL.test(email) || email.length > 254) {
        return NextResponse.json(
            { error: 'Please enter a valid email address.' },
            { status: 400 }
        );
    }

    const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        'unknown';

    if (rateLimited(ip)) {
        return NextResponse.json(
            { error: 'Too many attempts. Please try again in a minute.' },
            { status: 429 }
        );
    }

    try {
        await deliver(email.toLowerCase());
    } catch (err) {
        /* The address is never echoed back in an error. */
        console.error('[newsletter] delivery failed:', err);
        return NextResponse.json(
            { error: 'We could not sign you up just now. Please try again.' },
            { status: 502 }
        );
    }

    return NextResponse.json({ ok: true });
}

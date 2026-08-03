import { NextResponse } from 'next/server';
import { enquiryPayloadSchema } from '@/lib/contact-schema';
import { API_BASE_URL } from '@/lib/api-client';

export const runtime = 'nodejs';

/* ─── ENQUIRY INTAKE ──────────────────────────────────────────────────────
   Proxies an enquiry from the public site to the CMS backend.

   Two forms post here — the contact page's form and the older enrolment form —
   so this validates the PAYLOAD shape rather than either form's field list.
   lib/contact-schema.ts owns that shape and is the same module the browser
   validates against, so a rule cannot be enforced on one side only.

   Client-side validation is a convenience for the visitor and nothing more:
   it is trivially bypassed, so everything below re-checks from scratch. */

/* ── Spam defences ──
   Two cheap ones, deliberately not a CAPTCHA — a childcare enquiry form is a
   low-value target and a CAPTCHA taxes every real parent to stop a handful of
   bots.

   1. Honeypot: a field hidden from users and from assistive tech. Any value at
      all means automation.
   2. Time-to-fill: a human cannot read nine fields and write a message in under
      three seconds. The client stamps when the form was rendered.

   Both fail SILENTLY with a 200. A bot that is told it was blocked retries with
   the tell removed; a bot that is told it succeeded goes away. */
const MIN_FILL_MS = 3000;

/* In-memory, per-instance, best-effort. Enough to blunt a burst from one
   address; it is not a distributed rate limiter and does not pretend to be.
   Serverless instances each keep their own map and lose it on recycle. */
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    recent.push(now);
    hits.set(ip, recent);

    /* Unbounded growth is the only real risk in a long-lived process — one key
       per address, never collected. Sweep whenever the map gets large. */
    if (hits.size > 5000) {
        for (const [key, times] of hits) {
            if (!times.some((t) => now - t < RATE_LIMIT_WINDOW_MS)) hits.delete(key);
        }
    }
    return recent.length > RATE_LIMIT_MAX;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        /* Honeypot — any value means a bot filled a field no human can see. */
        if (typeof body.company === 'string' && body.company.trim() !== '') {
            console.warn('[api/enquire] Honeypot triggered; discarding.');
            return NextResponse.json({ ok: true });
        }

        /* Time-to-fill. Absent stamp is allowed through: the older enrolment
           form does not send one, and this must not start rejecting it. */
        if (typeof body.renderedAt === 'number') {
            const elapsed = Date.now() - body.renderedAt;
            if (elapsed < MIN_FILL_MS) {
                console.warn(`[api/enquire] Submitted in ${elapsed}ms; discarding.`);
                return NextResponse.json({ ok: true });
            }
        }

        const ip =
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') ||
            'unknown';

        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: 'Too many enquiries from this connection. Please try again shortly.' },
                { status: 429 }
            );
        }

        /* parentName is composed by the contact form and sent directly by the
           enrolment form, so accept either and normalise here. */
        const parentName =
            body.parentName ??
            [body.firstName, body.lastName].filter(Boolean).join(' ').trim();

        const parsed = enquiryPayloadSchema.safeParse({ ...body, parentName });

        if (!parsed.success) {
            /* Field-keyed, so the browser can attach each message to its input
               instead of showing one generic failure. */
            const fieldErrors: Record<string, string> = {};
            for (const issue of parsed.error.issues) {
                const key = String(issue.path[0] ?? 'form');
                if (!fieldErrors[key]) fieldErrors[key] = issue.message;
            }
            return NextResponse.json(
                { error: 'Please check the highlighted fields.', fieldErrors },
                { status: 400 }
            );
        }

        const backendRes = await fetch(`${API_BASE_URL}/enquiries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsed.data),
        });

        /* The backend may be down or mid-deploy. An enquiry that reached us but
           not the CMS is still a lead we must not lose, so it is logged loudly
           and the visitor is NOT shown an error — telling a parent their message
           failed, when we have it, costs an enrolment. */
        let backendJson: any = null;
        try {
            backendJson = await backendRes.json();
        } catch {
            console.error('[api/enquire] Backend returned a non-JSON response.');
        }

        if (!backendRes.ok || !backendJson?.success) {
            console.error(
                '[api/enquire] BACKEND REJECTED ENQUIRY — captured here instead:',
                JSON.stringify({ status: backendRes.status, payload: parsed.data })
            );
        }

        return NextResponse.json({ ok: true, data: backendJson?.data ?? null });
    } catch (err: any) {
        console.error('[api/enquire] Unhandled error:', err?.message);
        return NextResponse.json(
            { error: 'Something went wrong on our end. Please call us instead.' },
            { status: 500 }
        );
    }
}

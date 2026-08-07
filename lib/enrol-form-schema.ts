/* ─── ENROL / BOOK-A-TOUR FORM ────────────────────────────────────────────
   The option lists and the validation schema for the form that IS the /enroll
   page. Kept beside lib/contact-schema.ts rather than inside it: that module is
   the contract with the API route and the CMS backend, and this one describes a
   BROWSER form that happens to post into it. Mixing the two would make it
   unclear which fields the backend actually stores.

   The division of labour:
     · this schema  — everything the visitor fills in, validated in the browser
     · enquiryPayloadSchema (contact-schema.ts) — what the server accepts and
       stores, re-checked from scratch on every request

   Fields the payload schema has no column for (enquiry type, tour date/time,
   start timing, referral) are composed into `message` by the form before it
   posts, so nothing a parent tells us is silently dropped. See
   buildEnquiryMessage() below — it is the single place that composition lives,
   so the summary the team reads always matches the fields on screen. */

import { z } from 'zod';
import { isValidPhone } from '@/lib/contact-schema';

/* ── What the visitor is here to do ──
   Two intents, because they need different things from us: one wants a date in
   the diary, the other wants a place. A radio group rather than a select — two
   options are worth showing at once, and the choice drives which fields the
   form reveals.

   A third "ask a question" option was dropped: it duplicated /contact and gave
   people a way to land on the enrolment form without ever entering the funnel
   they pressed "Enroll Now" for. General questions still have a home — the
   message field below, and the phone number in the form's footer. */
export const ENQUIRY_TYPES = [
    {
        value: 'tour',
        label: 'Book a tour',
        icon: 'map-pin',
        blurb: 'Walk the rooms, meet the educators, ask us anything.',
    },
    {
        value: 'enrol',
        label: 'Start enrolment',
        icon: 'clipboard-check',
        blurb: 'Check room availability and secure a place.',
    },
] as const;

export type EnquiryTypeValue = (typeof ENQUIRY_TYPES)[number]['value'];

/* Tours run inside the center's own opening hours (Mon–Fri, 6:30am–6:30pm) and
   deliberately avoid rest time in the middle of the day. */
export const TOUR_TIMES = [
    'Morning · 9:30am – 11:00am',
    'Midday · 11:30am – 12:30pm',
    'Afternoon · 3:30pm – 5:00pm',
    "I'm flexible — suggest a time",
] as const;

export const START_TIMING = [
    'As soon as a place is available',
    'Within the next 1–3 months',
    'In 3–6 months',
    'Next year',
    'Still planning ahead',
] as const;

export const REFERRAL_OPTIONS = [
    'Google search',
    'Facebook or Instagram',
    'A friend or family member',
    'Drove or walked past the center',
    'A local community group',
    'Other',
] as const;

/* ── Dates ──
   Parsed field-by-field rather than handed to `new Date(string)`. A bare
   "2026-08-14" is read as UTC midnight, which in Australia is the PREVIOUS day
   local time — so a tour booked for today would validate as being in the past.
   Building the date from its parts keeps it local, which is the only timezone
   this form cares about. */
export function parseISODate(value: string): Date | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return Number.isNaN(d.getTime()) ? null : d;
}

/* Local midnight today — the floor a requested tour date has to clear. */
export function startOfToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/* The value an <input type="date"> min/max attribute wants. */
export function toISODate(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatLongDate(value: string): string {
    const d = parseISODate(value);
    if (!d) return value;
    return d.toLocaleDateString('en-AU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

const trimmed = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) => trimmed(max).optional().or(z.literal(''));

export const enrolEnquirySchema = z
    .object({
        enquiryType: z.enum(['tour', 'enrol']),

        firstName: trimmed(60).min(2, 'Please enter your first name.'),
        lastName: trimmed(60).min(2, 'Please enter your last name.'),

        email: trimmed(180)
            .min(1, 'Please enter your email address.')
            .pipe(z.email('That does not look like a valid email address.')),

        phone: trimmed(30)
            .min(1, 'Please enter a phone number.')
            .refine(isValidPhone, 'Please enter a valid phone number.'),

        childName: optionalText(80),
        childAge: optionalText(40),

        room: optionalText(80),
        days: optionalText(80),
        startTiming: optionalText(80),

        tourDate: optionalText(10),
        tourTime: optionalText(80),

        referral: optionalText(80),

        message: optionalText(2000),

        consent: z.literal(true, {
            error: 'Please agree to the Privacy Policy so we can reply to you.',
        }),

        /* Honeypot — hidden from people and from assistive tech, so any value
           here means automation. Mirrors the contact form's field name because
           the API route checks for exactly this key. */
        company: z.literal('', { error: 'Rejected.' }).optional(),
    })
    /* Cross-field rules. superRefine rather than per-field refinements: whether
       a tour date is required depends on ANOTHER field's value, which a field
       validator cannot see. */
    .superRefine((values, ctx) => {
        if (values.enquiryType !== 'tour') return;

        if (!values.tourDate) {
            ctx.addIssue({
                code: 'custom',
                path: ['tourDate'],
                message: 'Please choose a day you would like to visit.',
            });
            return;
        }

        const picked = parseISODate(values.tourDate);
        if (!picked) {
            ctx.addIssue({
                code: 'custom',
                path: ['tourDate'],
                message: 'Please choose a valid date.',
            });
            return;
        }

        if (picked < startOfToday()) {
            ctx.addIssue({
                code: 'custom',
                path: ['tourDate'],
                message: 'Please choose today or a date in the future.',
            });
            return;
        }

        /* The center is closed at weekends, so a Saturday tour is a booking we
           would only have to write back and undo. */
        const day = picked.getDay();
        if (day === 0 || day === 6) {
            ctx.addIssue({
                code: 'custom',
                path: ['tourDate'],
                message: 'Tours run Monday to Friday. Please choose a weekday.',
            });
        }
    });

export type EnrolEnquiry = z.infer<typeof enrolEnquirySchema>;

/* ── The message the team actually reads ──
   Everything the payload schema has no column for is folded in here as a short
   labelled block, with the parent's own words last so they are never buried
   under our summary. */
export function buildEnquiryMessage(values: EnrolEnquiry): string {
    const typeLabel =
        ENQUIRY_TYPES.find((t) => t.value === values.enquiryType)?.label ?? 'Enquiry';

    const lines: string[] = [`Enquiry type: ${typeLabel}`];

    if (values.enquiryType === 'tour' && values.tourDate) {
        lines.push(`Preferred tour date: ${formatLongDate(values.tourDate)}`);
        if (values.tourTime) lines.push(`Preferred time: ${values.tourTime}`);
    }
    if (values.startTiming) lines.push(`Looking to start: ${values.startTiming}`);
    if (values.referral) lines.push(`Heard about us via: ${values.referral}`);

    const note = values.message?.trim();
    if (note) lines.push('', 'Message from the parent:', note);

    return lines.join('\n');
}

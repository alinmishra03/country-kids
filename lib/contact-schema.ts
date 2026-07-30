/* ─── CONTACT ENQUIRY SCHEMA ──────────────────────────────────────────────
   ONE schema, imported by both the browser form and the API route, so client
   and server can never disagree about what a valid enquiry is. Loosening a
   rule here loosens it in exactly one place.

   Deliberately a SUPERSET of what the older enrolment form sends. That form
   (components/shared/EnrollForm.tsx) posts parentName / phone / email / childAge
   / room / days / message to the same endpoint, so every field it does not send
   is optional here and the route keeps accepting it unchanged. */

import { z } from 'zod';

export const PROGRAM_OPTIONS = [
    'Long Day Care',
    'Funded 3-Year-Old Kinder',
    'Funded 4-Year-Old Kinder',
    'Before & After Kinder Care',
    'School Holiday Program',
    'Not sure yet — please advise',
] as const;

export const CENTRE_OPTIONS = ['Ravenhall VIC 3023'] as const;

/* ── Australian phone numbers ──
   Accepts the shapes a parent actually types: 0412 345 678, (03) 9123 4567,
   +61 412 345 678, 1300 025 520, 13 12 34. Spaces, dashes, dots and brackets
   are ignored rather than rejected — punctuation is not the visitor's problem.

   Normalised to the leading-zero national form first, so +61 / 61 / 0 prefixes
   all collapse to one thing and there are three patterns to check instead of
   nine. */
export function normaliseAuPhone(raw: string): string {
    const cleaned = raw.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+61')) return `0${cleaned.slice(3)}`;
    if (cleaned.startsWith('61') && cleaned.length === 11) return `0${cleaned.slice(2)}`;
    return cleaned;
}

export function isValidAuPhone(raw: string): boolean {
    const n = normaliseAuPhone(raw);
    return (
        /^0[2-478]\d{8}$/.test(n) ||   /* landline + mobile: 03…, 04…, 07…, 08… */
        /^1[38]00\d{6}$/.test(n) ||    /* 1300 / 1800                            */
        /^13\d{4}$/.test(n)            /* 13 xx xx                               */
    );
}

const trimmed = (max: number) => z.string().trim().max(max);

export const contactEnquirySchema = z.object({
    firstName: trimmed(60).min(2, 'Please enter your first name.'),
    lastName: trimmed(60).min(2, 'Please enter your last name.'),

    email: trimmed(180)
        .min(1, 'Please enter your email address.')
        .pipe(z.email('That does not look like a valid email address.')),

    phone: trimmed(30)
        .min(1, 'Please enter a phone number.')
        .refine(isValidAuPhone, 'Please enter a valid Australian phone number.'),

    childName: trimmed(80).optional().or(z.literal('')),
    childAge: trimmed(40).optional().or(z.literal('')),

    program: trimmed(80).optional().or(z.literal('')),
    centre: trimmed(80).optional().or(z.literal('')),

    message: trimmed(2000)
        .min(10, 'Please tell us a little more — at least 10 characters.'),

    consent: z.literal(true, {
        error: 'Please agree to the Privacy Policy so we can reply to you.',
    }),

    /* ── Honeypot ──
       Hidden from real users and from screen readers. Bots fill every field
       they find, so anything here at all means the submission is automated.
       Named for something a bot WANTS to fill rather than something obviously
       decoy-shaped. */
    company: z.literal('', { error: 'Rejected.' }).optional(),
});

export type ContactEnquiry = z.infer<typeof contactEnquirySchema>;

/* What the API actually stores. The older enrolment form's payload is the
   loose half of this; the contact form fills all of it. parentName is composed
   rather than collected so both forms hand the backend the same field. */
export const enquiryPayloadSchema = z.object({
    parentName: z
        .string()
        .trim()
        .min(2, 'Please enter your name.')
        .max(140, 'That name is too long.'),
    email: z
        .string()
        .trim()
        .pipe(z.email('That does not look like a valid email address.')),
    phone: z
        .string()
        .trim()
        .refine(isValidAuPhone, 'Please enter a valid Australian phone number.'),
    childName: z.string().trim().max(80).optional(),
    childAge: z.string().trim().max(40).optional(),
    program: z.string().trim().max(80).optional(),
    room: z.string().trim().max(80).optional(),
    days: z.string().trim().max(80).optional(),
    centre: z.string().trim().max(80).optional(),
    message: z.string().trim().max(2000).optional(),
    source: z.string().trim().max(40).optional(),
});

/* ─── CONTACT ENQUIRY SCHEMA ──────────────────────────────────────────────
   ONE schema, imported by both the browser form and the API route, so client
   and server can never disagree about what a valid enquiry is. Loosening a
   rule here loosens it in exactly one place.

   Deliberately a SUPERSET of what the enrolment form sends. That form
   (components/enroll/EnrolEnquiryForm.tsx, validated against
   lib/enrol-form-schema.ts) posts parentName / phone / email / childName /
   childAge / room / days / centre / message to the same endpoint, so every
   field it does not send is optional here and the route keeps accepting it
   unchanged. */

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

/* ── Phone numbers (International & Domestic) ──
   Accepts numbers from any country with or without country code.
   Spaces, dashes, dots and brackets are ignored.
   Validates 7 to 15 digits total (accommodates 10-digit local numbers as well as
   international country code prefixes). */
export function normaliseAuPhone(raw: string): string {
    return raw.trim();
}

export function isValidPhone(raw: string): boolean {
    if (!raw) return false;
    const cleaned = raw.trim().replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+')) {
        const digits = cleaned.slice(1);
        return /^\d{7,15}$/.test(digits);
    }
    return /^\d{7,15}$/.test(cleaned);
}

export const isValidAuPhone = isValidPhone;

const trimmed = (max: number) => z.string().trim().max(max);

export const contactEnquirySchema = z.object({
    firstName: trimmed(60).min(2, 'Please enter your first name.'),
    lastName: trimmed(60).min(2, 'Please enter your last name.'),

    email: trimmed(180)
        .min(1, 'Please enter your email address.')
        .pipe(z.email('That does not look like a valid email address.')),

    phone: trimmed(30)
        .min(1, 'Please enter a phone number.')
        .refine(isValidPhone, 'Please enter a valid phone number.'),

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
        .refine(isValidPhone, 'Please enter a valid phone number.'),
    childName: z.string().trim().max(80).optional(),
    childAge: z.string().trim().max(40).optional(),
    program: z.string().trim().max(80).optional(),
    room: z.string().trim().max(80).optional(),
    days: z.string().trim().max(80).optional(),
    centre: z.string().trim().max(80).optional(),
    preferredCenter: z.string().trim().max(80).optional(),
    date: z.string().trim().max(20).optional(),
    timeSlot: z.string().trim().max(100).optional(),
    message: z.string().trim().max(2000).optional(),
    notes: z.string().trim().max(2000).optional(),
    source: z.string().trim().max(40).optional(),
});

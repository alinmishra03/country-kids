'use client';

/* ─── CONTACT ENQUIRY FORM ────────────────────────────────────────────────
   React Hook Form + Zod, validating against lib/contact-schema.ts — the same
   module the API route validates with, so the two cannot drift.

   Validation timing is deliberate: onTouched, not onChange. Validating every
   keystroke shouts "invalid email" at someone who has typed two characters of
   it. Fields go quiet until you leave them, then re-validate live once they
   have something to correct.

   Accessibility contract, since a form is where it matters most:
     · every input has a real <label for>, never a placeholder standing in
     · errors are tied to their input with aria-describedby + aria-invalid
     · the error text itself is role="alert", so it is announced on appearance
     · the summary after a failed submit takes focus and lists what to fix
     · the honeypot is aria-hidden AND tabIndex -1 — a screen reader user must
       never be handed a trap field they cannot see but can focus */

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Icon from '@/components/shared/Icon';
import {
    contactEnquirySchema,
    type ContactEnquiry,
    PROGRAM_OPTIONS,
    CENTRE_OPTIONS,
} from '@/lib/contact-schema';
import { PHONE, PHONE_HREF } from '@/lib/site-data';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactForm() {
    const [status, setStatus] = useState<Status>('idle');
    const [serverError, setServerError] = useState<string | null>(null);
    const summaryRef = useRef<HTMLDivElement>(null);

    /* Stamped once on mount and sent with the payload. The route rejects
       anything completed implausibly fast. useRef, not state — it must never
       trigger a render. */
    const renderedAt = useRef<number>(0);
    useEffect(() => {
        renderedAt.current = Date.now();
    }, []);

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting, submitCount },
    } = useForm<ContactEnquiry>({
        resolver: zodResolver(contactEnquirySchema),
        mode: 'onTouched',
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            childName: '',
            childAge: '',
            program: '',
            centre: CENTRE_OPTIONS[0],
            message: '',
            company: '',
        },
    });

    const errorList = Object.entries(errors);

    /* Move focus to the summary after a failed submit so a keyboard or screen
       reader user is told what happened instead of being left where they were. */
    useEffect(() => {
        if (submitCount > 0 && errorList.length > 0) summaryRef.current?.focus();
    }, [submitCount, errorList.length]);

    const onSubmit = async (values: ContactEnquiry) => {
        setStatus('sending');
        setServerError(null);

        try {
            const res = await fetch('/api/enquire', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...values,
                    parentName: `${values.firstName} ${values.lastName}`.trim(),
                    renderedAt: renderedAt.current,
                    source: 'contact-page',
                }),
            });

            const json = await res.json().catch(() => null);

            if (!res.ok) {
                /* Re-attach server-side field errors to their inputs, so a rule
                   the client missed still lands on the right field. */
                if (json?.fieldErrors) {
                    for (const [field, message] of Object.entries(json.fieldErrors)) {
                        setError(field as keyof ContactEnquiry, {
                            type: 'server',
                            message: String(message),
                        });
                    }
                }
                setServerError(json?.error ?? 'We could not send your enquiry.');
                setStatus('error');
                return;
            }

            reset();
            setStatus('sent');
        } catch {
            /* Network failure, not a validation failure — say so honestly and
               give them the phone number rather than a spinner that never ends. */
            setServerError(
                'We could not reach our server. Please check your connection, or call us.'
            );
            setStatus('error');
        }
    };

    const busy = isSubmitting || status === 'sending';

    if (status === 'sent') {
        return (
            <div className="contact-form-card" data-state="sent">
                <div className="form-success" role="status">
                    <span className="form-success-icon" aria-hidden="true">
                        <Icon name="circle-check" />
                    </span>
                    <h3>Thank you — your enquiry is with us.</h3>
                    <p>
                        One of our team will be in touch within one business day. If it is
                        urgent, call us on{' '}
                        <a href={PHONE_HREF} className="link-accent">
                            {PHONE}
                        </a>
                        .
                    </p>
                    <button
                        type="button"
                        className="btn-outline"
                        onClick={() => setStatus('idle')}
                    >
                        Send another enquiry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="contact-form-card">
            <form className="contact-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Honeypot. Hidden from sight, from assistive tech and from the
                    tab order — only automation reaches it. */}
                <div className="hp-field" aria-hidden="true">
                    <label htmlFor="company">Company</label>
                    <input
                        id="company"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        {...register('company')}
                    />
                </div>

                {submitCount > 0 && errorList.length > 0 && (
                    <div
                        className="form-alert"
                        role="alert"
                        ref={summaryRef}
                        tabIndex={-1}
                    >
                        <Icon name="shield" aria-hidden="true" />
                        <p>
                            Please check {errorList.length}{' '}
                            {errorList.length === 1 ? 'field' : 'fields'} below.
                        </p>
                    </div>
                )}

                {status === 'error' && serverError && (
                    <div className="form-alert is-error" role="alert">
                        <Icon name="shield" aria-hidden="true" />
                        <p>{serverError}</p>
                    </div>
                )}

                <div className="form-row two">
                    <Field
                        id="firstName"
                        label="First name"
                        error={errors.firstName?.message}
                        required
                    >
                        <input
                            id="firstName"
                            type="text"
                            autoComplete="given-name"
                            aria-invalid={!!errors.firstName}
                            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                            {...register('firstName')}
                        />
                    </Field>

                    <Field
                        id="lastName"
                        label="Last name"
                        error={errors.lastName?.message}
                        required
                    >
                        <input
                            id="lastName"
                            type="text"
                            autoComplete="family-name"
                            aria-invalid={!!errors.lastName}
                            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                            {...register('lastName')}
                        />
                    </Field>
                </div>

                <div className="form-row two">
                    <Field
                        id="email"
                        label="Parent email"
                        error={errors.email?.message}
                        required
                    >
                        <input
                            id="email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            aria-invalid={!!errors.email}
                            aria-describedby={errors.email ? 'email-error' : undefined}
                            {...register('email')}
                        />
                    </Field>

                    <Field
                        id="phone"
                        label="Phone number"
                        error={errors.phone?.message}
                        hint="Mobile or landline"
                        required
                    >
                        <input
                            id="phone"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            aria-invalid={!!errors.phone}
                            aria-describedby={
                                errors.phone ? 'phone-error' : 'phone-hint'
                            }
                            {...register('phone')}
                        />
                    </Field>
                </div>

                <div className="form-row two">
                    <Field id="childName" label="Child's name" optional>
                        <input
                            id="childName"
                            type="text"
                            autoComplete="off"
                            {...register('childName')}
                        />
                    </Field>

                    <Field id="childAge" label="Child's age" optional hint="e.g. 2 years">
                        <input
                            id="childAge"
                            type="text"
                            autoComplete="off"
                            aria-describedby="childAge-hint"
                            {...register('childAge')}
                        />
                    </Field>
                </div>

                <div className="form-row two">
                    <Field id="program" label="Interested program" optional>
                        <select id="program" defaultValue="" {...register('program')}>
                            <option value="">Choose a program…</option>
                            {PROGRAM_OPTIONS.map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field id="centre" label="Preferred centre" optional>
                        <select id="centre" {...register('centre')}>
                            {CENTRE_OPTIONS.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>

                <Field
                    id="message"
                    label="Message"
                    error={errors.message?.message}
                    required
                >
                    <textarea
                        id="message"
                        rows={5}
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? 'message-error' : undefined}
                        {...register('message')}
                    />
                </Field>

                <div className="form-consent">
                    <input
                        id="consent"
                        type="checkbox"
                        aria-invalid={!!errors.consent}
                        aria-describedby={errors.consent ? 'consent-error' : undefined}
                        {...register('consent')}
                    />
                    <label htmlFor="consent">
                        I agree to the{' '}
                        <a href="/privacy" className="link-accent">
                            Privacy Policy
                        </a>
                        .
                    </label>
                    {errors.consent && (
                        <p className="field-error" id="consent-error" role="alert">
                            {errors.consent.message}
                        </p>
                    )}
                </div>

                <button type="submit" className="btn-primary contact-submit" disabled={busy}>
                    {busy ? (
                        <>
                            <span className="btn-spinner" aria-hidden="true" />
                            Sending…
                        </>
                    ) : (
                        <>
                            Send enquiry
                            <Icon name="arrow-right" />
                        </>
                    )}
                </button>

                {/* Announced without stealing focus, so the label change is not
                    silent for a screen reader user mid-submit. */}
                <p className="sr-only" role="status">
                    {busy ? 'Sending your enquiry' : ''}
                </p>
            </form>
        </div>
    );
}

/* One field wrapper, so label / hint / error markup and their id wiring are
   written once instead of nine times. */
function Field({
    id,
    label,
    error,
    hint,
    required,
    optional,
    children,
}: {
    id: string;
    label: string;
    error?: string;
    hint?: string;
    required?: boolean;
    optional?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className={`form-field${error ? ' has-error' : ''}`}>
            <label htmlFor={id}>
                {label}
                {required && (
                    <span className="field-required" aria-hidden="true">
                        *
                    </span>
                )}
                {optional && <span className="field-optional">Optional</span>}
            </label>
            {children}
            {hint && !error && (
                <p className="field-hint" id={`${id}-hint`}>
                    {hint}
                </p>
            )}
            {error && (
                <p className="field-error" id={`${id}-error`} role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

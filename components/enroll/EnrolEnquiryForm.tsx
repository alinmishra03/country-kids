'use client';

/* ─── BOOK A TOUR / ENROL — the whole /enroll page ────────────────────────
   The page is this form and nothing else, so the form has to carry the job a
   page of supporting copy would normally do: say who we are, what happens after
   you press send, and how to reach a human instead. That is what the header,
   the per-field hints and the success panel are for — they are part of the
   instrument, not decoration around it.

   Built on the same foundations as the contact form (react-hook-form + Zod,
   validating against the schema the API route re-checks server-side) so the two
   forms behave identically. It borrows contact-page.css's input treatment by
   carrying the .contact-form class as well; css/enrol-form.css adds only what
   is genuinely new here — the intent chooser, the numbered steps, the date and
   time controls.

   Validation is onTouched, not onChange: telling someone their email is invalid
   after they have typed two characters of it is noise, not help. Fields stay
   quiet until you leave them, then correct live.

   Accessibility, since a form is where it matters most:
     · the intent chooser is a real radiogroup — a fieldset with a legend
     · every input has a <label for>; no placeholder stands in for one
     · errors are tied to their input with aria-describedby + aria-invalid, and
       the message itself is role="alert" so it is announced on appearance
     · the post-submit summary takes focus and says how many fields need work
     · the honeypot is aria-hidden AND tabIndex -1, so a screen reader user is
       never handed a trap they can focus but cannot see */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Icon from '@/components/shared/Icon';
import {
    enrolEnquirySchema,
    buildEnquiryMessage,
    formatLongDate,
    startOfToday,
    toISODate,
    ENQUIRY_TYPES,
    TOUR_TIMES,
    START_TIMING,
    REFERRAL_OPTIONS,
    type EnrolEnquiry,
} from '@/lib/enrol-form-schema';
import { ROOM_OPTIONS, DAYS_OPTIONS } from '@/lib/enrolment-data';
import { CENTRE_OPTIONS } from '@/lib/contact-schema';
import { PHONE, PHONE_HREF, EMAIL, EMAIL_HREF, ADDRESS } from '@/lib/site-data';

type Status = 'idle' | 'sending' | 'sent' | 'error';

/* Server-side field errors come back keyed by the PAYLOAD's field names, which
   are not always this form's field names. Anything not listed here shares its
   name with a form field and is attached directly. */
const SERVER_FIELD_MAP: Record<string, keyof EnrolEnquiry> = {
    parentName: 'firstName',
    form: 'message',
};

export default function EnrolEnquiryForm() {
    const [status, setStatus] = useState<Status>('idle');
    const [serverError, setServerError] = useState<string | null>(null);
    const [sentSummary, setSentSummary] = useState<{ type: string; tour?: string } | null>(null);
    const summaryRef = useRef<HTMLDivElement>(null);

    /* Stamped once on mount and sent with the payload; the route discards
       anything completed implausibly fast. A ref, not state — it must never
       cause a render. */
    const renderedAt = useRef<number>(0);

    /* Both computed from the clock, so they cannot be rendered on the server
       without risking a hydration mismatch (and a stale value if the tab is
       left open across midnight). Empty until mount, which simply leaves the
       date input unbounded for the fraction of a second before hydration. */
    const [dateBounds, setDateBounds] = useState<{ min: string; max: string } | null>(null);

    useEffect(() => {
        renderedAt.current = Date.now();

        const today = startOfToday();
        /* Six months is as far ahead as a room placement is worth pencilling
           in; past that we would be booking a tour of a room the child has
           outgrown. */
        const horizon = new Date(today);
        horizon.setMonth(horizon.getMonth() + 6);
        setDateBounds({ min: toISODate(today), max: toISODate(horizon) });
    }, []);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setError,
        formState: { errors, isSubmitting, submitCount },
    } = useForm<EnrolEnquiry>({
        resolver: zodResolver(enrolEnquirySchema),
        mode: 'onTouched',
        defaultValues: {
            enquiryType: 'tour',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            childName: '',
            childAge: '',
            room: '',
            days: '',
            startTiming: '',
            tourDate: '',
            tourTime: '',
            referral: '',
            message: '',
            company: '',
        },
    });

    const enquiryType = watch('enquiryType');
    const wantsTour = enquiryType === 'tour';

    const errorList = useMemo(() => Object.entries(errors), [errors]);

    /* Move focus to the summary after a failed submit, so a keyboard or screen
       reader user is told what happened rather than left where they were. */
    useEffect(() => {
        if (submitCount > 0 && errorList.length > 0) summaryRef.current?.focus();
    }, [submitCount, errorList.length]);

    const onSubmit = async (values: EnrolEnquiry) => {
        setStatus('sending');
        setServerError(null);

        /* The backend stores a fixed set of columns, so the answers it has no
           column for travel inside `message`. buildEnquiryMessage owns that
           composition — see lib/enrol-form-schema.ts. */
        const payload = {
            parentName: `${values.firstName} ${values.lastName}`.trim(),
            email: values.email,
            phone: values.phone,
            childName: values.childName,
            childAge: values.childAge,
            room: values.room,
            days: values.days,
            centre: CENTRE_OPTIONS[0],
            message: buildEnquiryMessage(values),
            source: 'enroll-page',
            renderedAt: renderedAt.current,
            company: values.company,
        };

        try {
            const res = await fetch('/api/enquire', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const json = await res.json().catch(() => null);

            if (!res.ok) {
                /* Re-attach server-side field errors to their inputs, so a rule
                   the browser missed still lands on the right field. */
                if (json?.fieldErrors) {
                    for (const [field, message] of Object.entries(json.fieldErrors)) {
                        const target = SERVER_FIELD_MAP[field] ?? (field as keyof EnrolEnquiry);
                        setError(target, { type: 'server', message: String(message) });
                    }
                }
                setServerError(
                    json?.error ??
                        'Your enquiry was not submitted. Please try again, or call us and we will take the details over the phone.'
                );
                setStatus('error');
                return;
            }

            if (!json?.ok) {
                setServerError(
                    json?.error ??
                        'Your enquiry was not saved to our system. Please try again or call us.'
                );
                setStatus('error');
                return;
            }

            setSentSummary({
                type: values.enquiryType,
                tour:
                    values.enquiryType === 'tour' && values.tourDate
                        ? formatLongDate(values.tourDate)
                        : undefined,
            });
            reset();
            setStatus('sent');
        } catch {
            /* A network failure, not a validation failure. Say so honestly and
               hand over the phone number rather than spin forever. */
            setServerError(
                'We could not reach our server, so nothing was sent. Please check your connection, or call us instead.'
            );
            setStatus('error');
        }
    };

    const busy = isSubmitting || status === 'sending';

    if (status === 'sent') {
        return (
            <div className="enrolq-card" data-state="sent">
                <div className="enrolq-success" role="status">
                    <span className="enrolq-success-icon" aria-hidden="true">
                        <Icon name="circle-check" />
                    </span>
                    <h1>Thank you — we have your enquiry.</h1>
                    <p className="enrolq-success-lead">
                        {sentSummary?.tour ? (
                            <>
                                We will confirm your tour for <strong>{sentSummary.tour}</strong> by
                                phone or email within one business day.
                            </>
                        ) : (
                            <>One of our team will be in touch within one business day.</>
                        )}
                    </p>

                    <ol className="enrolq-next">
                        <li>
                            <span aria-hidden="true">1</span>
                            We check availability in the room that suits your child&apos;s age.
                        </li>
                        <li>
                            <span aria-hidden="true">2</span>
                            We call or email you to confirm a time that works.
                        </li>
                        <li>
                            <span aria-hidden="true">3</span>
                            You visit, meet the educators, and ask us anything.
                        </li>
                    </ol>

                    <div className="enrolq-success-actions">
                        <a className="btn-primary" href={PHONE_HREF}>
                            <Icon name="phone" /> Call {PHONE}
                        </a>
                        <button
                            type="button"
                            className="btn-outline"
                            onClick={() => {
                                setSentSummary(null);
                                setStatus('idle');
                                renderedAt.current = Date.now();
                            }}
                        >
                            Send another enquiry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="enrolq-card">
            {/* The page has no other copy, so the form introduces itself — and
                on a white canvas the navy banner is also what gives the card an
                edge and the page its brand colour. */}
            <header className="enrolq-banner">
                <p className="enrolq-kicker">
                    Country Kids Learning Center · {ADDRESS.line2}
                </p>
                <h1>Book a tour or enrol your child</h1>
                <p className="enrolq-lead">
                    Tours are free, take about thirty minutes and run Monday to Friday. Tell
                    us a little about your family below and we will be in touch within one
                    business day.
                </p>
                <ul className="enrolq-assurances">
                    <li>
                        <Icon name="clock" aria-hidden="true" />
                        Reply within 1 business day
                    </li>
                    <li>
                        <Icon name="graduation" aria-hidden="true" />
                        Funded 3 &amp; 4 year old kinder
                    </li>
                    <li>
                        <Icon name="shield" aria-hidden="true" />
                        Your details stay private
                    </li>
                </ul>
            </header>

            <form
                className="contact-form enrolq-form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
            >
                {/* Honeypot. Out of sight, out of the tab order, hidden from
                    assistive tech — only automation ever fills it. */}
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
                    <div className="form-alert" role="alert" ref={summaryRef} tabIndex={-1}>
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

                {/* ── The two columns ──
                    The card is the full width of the page shell, so the four
                    steps run in two columns rather than one long ribbon — a
                    single 1140px-wide column of inputs is a worse form, not a
                    fuller one. Wrappers rather than grid placement on the steps
                    themselves: the alerts above and the submit below must span
                    the whole width, and two plain divs say that without any
                    line-placement arithmetic to get wrong.

                    Reading order is unchanged — column one, then column two —
                    and the step numbers state it outright either way. */}
                <div className="enrolq-grid">
                    <div className="enrolq-col">

                {/* ── 1 · Intent ──
                    A radiogroup rather than a select: two options are worth
                    seeing at once, and the choice changes what the form asks
                    for next. */}
                <Step n={1} legend="What can we help you with?">
                    <div className="enrolq-intent" role="radiogroup" aria-label="Type of enquiry">
                        {ENQUIRY_TYPES.map((t) => (
                            <label className="enrolq-intent-option" key={t.value}>
                                <input type="radio" value={t.value} {...register('enquiryType')} />
                                <span className="enrolq-intent-face">
                                    <span className="enrolq-intent-icon" aria-hidden="true">
                                        <Icon name={t.icon} />
                                    </span>
                                    <span className="enrolq-intent-label">{t.label}</span>
                                    <span className="enrolq-intent-blurb">{t.blurb}</span>
                                    {/* Selection is already carried by the
                                        border and the inverted icon plate; the
                                        tick is a third, shape-based signal so
                                        the state survives greyscale. */}
                                    <span className="enrolq-intent-check" aria-hidden="true">
                                        <Icon name="check" />
                                    </span>
                                </span>
                            </label>
                        ))}
                    </div>

                    {/* Only asked for when a tour is what they came for. */}
                    {wantsTour && (
                        <div className="form-row two enrolq-tour">
                            <Field
                                id="tourDate"
                                label="Preferred day"
                                error={errors.tourDate?.message}
                                hint="Weekdays only · we will confirm the exact time"
                                required
                            >
                                <input
                                    id="tourDate"
                                    type="date"
                                    min={dateBounds?.min}
                                    max={dateBounds?.max}
                                    aria-invalid={!!errors.tourDate}
                                    aria-describedby={
                                        errors.tourDate ? 'tourDate-error' : 'tourDate-hint'
                                    }
                                    {...register('tourDate')}
                                />
                            </Field>

                            <Field id="tourTime" label="Preferred time" optional>
                                <select id="tourTime" defaultValue="" {...register('tourTime')}>
                                    <option value="">Choose a time…</option>
                                    {TOUR_TIMES.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                    )}
                </Step>

                {/* ── 2 · Who we are replying to ── */}
                <Step n={2} legend="Your details">
                    <div className="form-row two">
                        <Field id="firstName" label="First name" error={errors.firstName?.message} required>
                            <input
                                id="firstName"
                                type="text"
                                autoComplete="given-name"
                                aria-invalid={!!errors.firstName}
                                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                                {...register('firstName')}
                            />
                        </Field>

                        <Field id="lastName" label="Last name" error={errors.lastName?.message} required>
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
                        <Field id="email" label="Email" error={errors.email?.message} required>
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
                            label="Phone"
                            error={errors.phone?.message}
                            hint="Mobile or landline, any country"
                            required
                        >
                            <input
                                id="phone"
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                aria-invalid={!!errors.phone}
                                aria-describedby={errors.phone ? 'phone-error' : 'phone-hint'}
                                {...register('phone')}
                            />
                        </Field>
                    </div>
                </Step>

                    </div>
                    <div className="enrolq-col">

                {/* ── 3 · What we need to check availability ──
                    Every field optional. A parent who does not yet know which
                    room their child belongs in should still be able to press
                    send — working that out is our job, not theirs. */}
                <Step
                    n={3}
                    legend="About your child"
                    note="All optional — it just helps us check the right room before we call."
                >
                    <div className="form-row two">
                        <Field id="childName" label="Child's name" optional>
                            <input
                                id="childName"
                                type="text"
                                autoComplete="off"
                                {...register('childName')}
                            />
                        </Field>

                        <Field id="childAge" label="Age" optional hint="e.g. 2 years, or 8 months">
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
                        <Field id="room" label="Room of interest" optional>
                            <select id="room" defaultValue="" {...register('room')}>
                                <option value="">Not sure yet — please advise</option>
                                {ROOM_OPTIONS.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field id="days" label="Days per week" optional>
                            <select id="days" defaultValue="" {...register('days')}>
                                <option value="">Choose attendance…</option>
                                {DAYS_OPTIONS.map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    <Field id="startTiming" label="When would you like to start?" optional>
                        <select id="startTiming" defaultValue="" {...register('startTiming')}>
                            <option value="">Choose a timeframe…</option>
                            {START_TIMING.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </Field>
                </Step>

                {/* ── 4 · Anything we should know ── */}
                <Step n={4} legend="Anything else?">
                    <Field
                        id="message"
                        label="Your message"
                        error={errors.message?.message}
                        hint="Allergies, siblings enrolling together, funding questions — anything at all."
                        optional
                    >
                        <textarea
                            id="message"
                            rows={4}
                            aria-invalid={!!errors.message}
                            aria-describedby={errors.message ? 'message-error' : 'message-hint'}
                            {...register('message')}
                        />
                    </Field>

                    <Field id="referral" label="How did you hear about us?" optional>
                        <select id="referral" defaultValue="" {...register('referral')}>
                            <option value="">Prefer not to say</option>
                            {REFERRAL_OPTIONS.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
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
                            I agree to Country Kids contacting me about this enquiry, and to the{' '}
                            <a href="/compliance" className="link-accent">
                                privacy terms
                            </a>
                            .
                        </label>
                        {errors.consent && (
                            <p className="field-error" id="consent-error" role="alert">
                                {errors.consent.message}
                            </p>
                        )}
                    </div>
                </Step>

                    </div>
                </div>

                <button type="submit" className="btn-primary enrolq-submit" disabled={busy}>
                    {busy ? (
                        <>
                            <span className="btn-spinner" aria-hidden="true" />
                            Sending…
                        </>
                    ) : (
                        <>
                            {wantsTour ? 'Request my tour' : 'Send my enquiry'}
                            <Icon name="arrow-right" />
                        </>
                    )}
                </button>

                {/* Announced without stealing focus, so the label change is not
                    silent for a screen reader user mid-submit. */}
                <p className="sr-only" role="status">
                    {busy ? 'Sending your enquiry' : ''}
                </p>

                <footer className="enrolq-foot">
                    <p>
                        Your information is kept strictly private and used only to respond to
                        this enquiry.
                    </p>
                    <p className="enrolq-foot-contact">
                        Prefer to talk?{' '}
                        <a href={PHONE_HREF} className="link-accent">
                            {PHONE}
                        </a>{' '}
                        ·{' '}
                        <a href={EMAIL_HREF} className="link-accent">
                            {EMAIL}
                        </a>
                    </p>
                </footer>
            </form>
        </div>
    );
}

/* ── A numbered section ──
   A real <fieldset>/<legend>, so the grouping is announced rather than merely
   drawn. The number is decorative and sits outside the accessible name. */
function Step({
    n,
    legend,
    note,
    children,
}: {
    n: number;
    legend: string;
    note?: string;
    children: React.ReactNode;
}) {
    return (
        <fieldset className="enrolq-step">
            <legend>
                <span className="enrolq-step-n" aria-hidden="true">
                    {n}
                </span>
                {legend}
            </legend>
            {note && <p className="enrolq-step-note">{note}</p>}
            <div className="enrolq-step-body">{children}</div>
        </fieldset>
    );
}

/* One field wrapper, so label / hint / error markup and their id wiring are
   written once instead of thirteen times. Same contract as the contact form's. */
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

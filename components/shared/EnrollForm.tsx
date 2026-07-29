'use client';

/* Enrolment / tour-request form. Connected to CMS & Backend API. */

import { useState, useEffect } from 'react';
import Icon from '@/components/shared/Icon';
import { ROOM_OPTIONS, DAYS_OPTIONS, FORM_PRIVACY, FORM_SUCCESS } from '@/lib/enrolment-data';
import { PHONE } from '@/lib/site-data';

export default function EnrollForm() {
    const [isMounted, setIsMounted] = useState(false);
    const [sent, setSent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const payload = {
            parentName: formData.get('parentName') as string,
            phone: formData.get('phone') as string,
            email: formData.get('email') as string,
            childAge: formData.get('childAge') as string,
            room: formData.get('room') as string,
            days: formData.get('days') as string,
            message: formData.get('message') as string,
        };

        try {
            await fetch('/api/enquire', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            console.warn('[EnrollForm] Local proxy submission error:', err);
        }

        setIsSubmitting(false);
        setSent(true);
    };

    if (sent) {
        return (
            <div className="enroll-form">
                <div className="form-success">
                    <span className="form-success-icon"><Icon name="circle-check" /></span>
                    <p>{FORM_SUCCESS}</p>
                </div>
            </div>
        );
    }

    return (
        <form className="enroll-form" onSubmit={handleSubmit} suppressHydrationWarning>
            <div className="form-row two">
                <div>
                    <label htmlFor="parentName">Parent / Guardian Name</label>
                    <input id="parentName" name="parentName" type="text" required autoComplete="name" />
                </div>
                <div>
                    <label htmlFor="phone">Phone</label>
                    <input id="phone" name="phone" type="tel" required autoComplete="tel" />
                </div>
            </div>

            <div className="form-row">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" required autoComplete="email" />
            </div>

            <div className="form-row two">
                <div>
                    <label htmlFor="childAge">Child&apos;s Age</label>
                    <input id="childAge" name="childAge" type="text" placeholder="e.g. 2 years" />
                </div>
                <div>
                    <label htmlFor="room">Room of Interest</label>
                    <select id="room" name="room" defaultValue="" key={isMounted ? 'mounted' : 'ssr'}>
                        <option value="" disabled>Choose a room…</option>
                        {ROOM_OPTIONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-row">
                <label htmlFor="days">Days per week</label>
                <select id="days" name="days" defaultValue="" key={isMounted ? 'mounted-days' : 'ssr-days'}>
                    <option value="" disabled>Choose attendance…</option>
                    {DAYS_OPTIONS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>

            <div className="form-row">
                <label htmlFor="message">Anything we should know?</label>
                <textarea id="message" name="message" rows={4} />
            </div>

            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%' }}>
                <Icon name="send" /> {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
            </button>
            <p className="form-note">
                {FORM_PRIVACY} Prefer to talk? Call us on {PHONE}.
            </p>
        </form>
    );
}

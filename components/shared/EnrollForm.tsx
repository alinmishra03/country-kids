'use client';

/* Enrolment / tour-request form. Client-side only (no backend) — on submit it
   shows a success confirmation. Wire the handleSubmit body to your API/email
   service when ready. Options come from lib/enrolment-data.js. */

import { useState } from 'react';
import Icon from '@/components/shared/Icon';
import { ROOM_OPTIONS, DAYS_OPTIONS, FORM_PRIVACY, FORM_SUCCESS } from '@/lib/enrolment-data';
import { PHONE } from '@/lib/site-data';

export default function EnrollForm() {
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: POST to your backend / email service here.
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
        <form className="enroll-form" onSubmit={handleSubmit}>
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
                    <select id="room" name="room" defaultValue="">
                        <option value="" disabled>Choose a room…</option>
                        {ROOM_OPTIONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-row">
                <label htmlFor="days">Days per week</label>
                <select id="days" name="days" defaultValue="">
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

            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                <Icon name="send" /> Submit Enquiry
            </button>
            <p className="form-note">
                {FORM_PRIVACY} Prefer to talk? Call us on {PHONE}.
            </p>
        </form>
    );
}

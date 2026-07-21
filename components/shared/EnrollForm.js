'use client';

/* Enrollment / tour-request form. Client-side only (no backend) — on submit it
   shows a success confirmation. Wire the handleSubmit body to your API/email
   service when ready. */

import { useState } from 'react';
import { PROGRAMS } from '@/lib/programs-data';

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
                    {'\u{1F389}'} Thank you! We&apos;ve received your request and will contact you
                    within one business day to schedule your visit.
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
                    <label htmlFor="program">Program of Interest</label>
                    <select id="program" name="program" defaultValue="">
                        <option value="" disabled>Choose a program…</option>
                        {PROGRAMS.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-row">
                <label htmlFor="message">Anything we should know?</label>
                <textarea id="message" name="message" rows={4} />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Request a Tour
            </button>
            <p className="form-note">
                We&apos;ll never share your details. Prefer to talk? Call us at (555) 264-KIDS.
            </p>
        </form>
    );
}

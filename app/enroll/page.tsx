'use client';

/* ENROL (app/enroll) — the destination of the site's lead action, the "Enroll
   Now" CTA in the navbar and drawer.

   Deliberately a FORM AND NOTHING ELSE: no hero, no photography, no section
   bands, no Explore More rail. Someone who has pressed "Enroll Now" has already
   been sold to by every other page; asking them to scroll past a five-step
   explainer to reach the fields is a tax on the one visitor who was ready to
   act. Everything they still need to know — that tours are free, that we reply
   within a business day, how to reach a human instead — is carried by the form
   itself in components/enroll/EnrolEnquiryForm.tsx.

   The route intentionally does not use Page's hero/section scaffolding, so the
   surface band map in css/surfaces.css never applies here and the card floats
   on the plain page field. */

import Page from '@/components/shared/Page';
import EnrolEnquiryForm from '@/components/enroll/EnrolEnquiryForm';

export default function EnrollPage() {
    return (
        <Page id="enroll">
            <main className="enrolq-page">
                <div className="enrolq-shell">
                    <EnrolEnquiryForm />
                </div>
            </main>
        </Page>
    );
}

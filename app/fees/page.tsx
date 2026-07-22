'use client';

/* FEES & CCS — "Making Quality Care Affordable". The four subsidy steps and an
   interactive weekly-cost estimator (indicative only). Content + estimator data
   from lib/fees-data.js. */

import { useRef, useState, useMemo } from 'react';
import Page from '@/components/shared/Page';
import PageHero from '@/components/shared/PageHero';
import SectionHeader from '@/components/shared/SectionHeader';
import CTASection from '@/components/shared/CTASection';
import Reveal from '@/components/shared/Reveal';
import Icon from '@/components/shared/Icon';
import {
    FEES_INTRO,
    SUBSIDY_STEPS,
    INCOME_BANDS,
    DAY_OPTIONS,
    ROOM_GROUPS,
    ESTIMATOR_NOTE,
} from '@/lib/fees-data';
import { PHOTOS } from '@/lib/images';

const money = (n) => `$${Math.round(n).toLocaleString('en-AU')}`;

export default function FeesPage() {
    const rootRef = useRef(null);
    const [bandId, setBandId] = useState(INCOME_BANDS[1].id);
    const [days, setDays] = useState(DAY_OPTIONS[2].id);
    const [groupId, setGroupId] = useState(ROOM_GROUPS[1].id);

    const estimate = useMemo(() => {
        const band = INCOME_BANDS.find((b) => b.id === bandId) || INCOME_BANDS[0];
        const group = ROOM_GROUPS.find((g) => g.id === groupId) || ROOM_GROUPS[0];
        const full = group.rate * days;
        const oop = full * (1 - band.ccs);
        const low = Math.max(0, oop * 0.95);
        const high = oop * 1.05;
        const saving = full - oop;
        return { full, low, high, saving };
    }, [bandId, days, groupId]);

    return (
        <Page id="fees" innerRef={rootRef}>
            <PageHero
                kicker={FEES_INTRO.kicker}
                title="Making Quality Care Affordable"
                lead={FEES_INTRO.lead}
                image={PHOTOS.pageHeroPrograms}
                badges={['3-Day CCS Guarantee', 'Kinder Funding · up to $2,500/yr', 'Not-for-Profit']}
            />

            <section className="section">
                <div className="container">
                    <SectionHeader
                        kicker="How the Subsidy Works"
                        title={<>Four steps to <span>lower fees</span></>}
                        lead="The Child Care Subsidy is paid directly to Country Kids, so you only ever pay the gap. Here is how to set it up."
                    />
                    <Reveal className="fee-steps" stagger amount={0.1}>
                        {SUBSIDY_STEPS.map((s) => (
                            <Reveal as="article" variant="item" className="fee-step" key={s.title}>
                                <span className="fee-step-icon" aria-hidden="true"><Icon name={s.icon} /></span>
                                <h3>{s.title}</h3>
                                <p>{s.text}</p>
                            </Reveal>
                        ))}
                    </Reveal>
                </div>
            </section>

            <section className="section section-alt">
                <div className="container">
                    <SectionHeader
                        kicker="Weekly Cost Estimator"
                        title={<>See your <span>estimated out-of-pocket</span></>}
                        lead="Choose your family income, days per week and room group for an indicative weekly gap fee after the Child Care Subsidy."
                    />

                    <div className="estimator">
                        <div className="estimator-controls">
                            <div className="estimator-field">
                                <label htmlFor="band">Combined family income</label>
                                <select id="band" value={bandId} onChange={(e) => setBandId(e.target.value)}>
                                    {INCOME_BANDS.map((b) => (
                                        <option key={b.id} value={b.id}>{b.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="estimator-field">
                                <label htmlFor="days">Days per week</label>
                                <select id="days" value={days} onChange={(e) => setDays(Number(e.target.value))}>
                                    {DAY_OPTIONS.map((d) => (
                                        <option key={d.id} value={d.id}>{d.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="estimator-field">
                                <label htmlFor="group">Room group</label>
                                <select id="group" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
                                    {ROOM_GROUPS.map((g) => (
                                        <option key={g.id} value={g.id}>{g.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="estimator-result">
                            <span className="estimator-result-label">Estimated weekly out-of-pocket</span>
                            <span className="estimator-result-range">
                                {money(estimate.low)}–{money(estimate.high)}
                            </span>
                            <span className="estimator-result-sub">
                                before Victorian Kinder Funding for eligible 3 &amp; 4 year olds
                            </span>
                            <span className="estimator-result-saving">
                                Full fee would be <b>{money(estimate.full)}/wk</b> — the subsidy saves you
                                about <b>{money(estimate.saving)}</b> every week.
                            </span>
                        </div>
                    </div>

                    <p className="estimator-note">{ESTIMATOR_NOTE}</p>
                </div>
            </section>

            <CTASection
                title="Let's work out your fees together"
                text="Every family's entitlement is different. Book a free tour and our enrolment team will help you understand exactly what you'll pay."
            />
        </Page>
    );
}

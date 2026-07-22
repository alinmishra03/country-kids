'use client';

/* Home compliance / trust teaser — the four assurance pillars as cards, plus a
   row of trust badges. Links to /compliance. */

import Link from 'next/link';
import SectionHeader from '@/components/shared/SectionHeader';
import Reveal from '@/components/shared/Reveal';
import Icon from '@/components/shared/Icon';
import { COMPLIANCE_PILLARS } from '@/lib/compliance-data';
import { TRUST_BADGES } from '@/lib/site-data';

export default function ComplianceStrip() {
    return (
        <section className="section section-alt compliance-strip" id="compliance">
            <div className="container">
                <SectionHeader
                    kicker="Quality & Compliance"
                    title={<>Committed to the <span>highest standards</span></>}
                    lead="We operate within Australia’s rigorous National Quality Framework, administered by ACECQA — registered on Starting Blocks and compliant with all 2025–2026 reforms."
                />

                <Reveal className="pillars-grid" stagger amount={0.1}>
                    {COMPLIANCE_PILLARS.map((p) => (
                        <Reveal as="article" variant="item" className="pillar-card" key={p.title}>
                            <span className="pillar-icon" aria-hidden="true"><Icon name={p.icon} /></span>
                            <h3>{p.title}</h3>
                            <p>{p.text}</p>
                        </Reveal>
                    ))}
                </Reveal>

                <Reveal className="trust-badges" variant="fadeUp">
                    {TRUST_BADGES.map((b) => (
                        <span className="trust-badge" key={b}><Icon name="badge" /> {b}</span>
                    ))}
                </Reveal>

                <div className="section-cta">
                    <Link className="btn-outline" href="/compliance">
                        See our commitments <Icon name="arrow-right" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

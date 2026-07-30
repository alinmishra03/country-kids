'use client';

/* COMPLIANCE — "Committed to the Highest Standards". The four assurance pillars,
   trust badges, a Starting Blocks callout, and the 2025–2026 sector-updates
   timeline. Content from lib/compliance-data.js + site-data.js. */

import { useRef } from 'react';
import Page from '@/components/shared/Page';
import PageHero from '@/components/shared/PageHero';
import SectionHeader from '@/components/shared/SectionHeader';
import CTASection from '@/components/shared/CTASection';
import SplitFeature from '@/components/shared/SplitFeature';
import Reveal from '@/components/shared/Reveal';
import Icon from '@/components/shared/Icon';
import { COMPLIANCE_INTRO, COMPLIANCE_PILLARS, SECTOR_UPDATES } from '@/lib/compliance-data';
import { TRUST_BADGES, STARTING_BLOCKS_HREF } from '@/lib/site-data';
import { PAGE_MEDIA } from '@/lib/page-media';
import PageNavigator from '@/components/common/PageNavigator';

export default function CompliancePage() {
    const rootRef = useRef(null);

    return (
        <Page id="compliance" innerRef={rootRef}>
            <PageHero
                kicker={COMPLIANCE_INTRO.kicker}
                title="Committed to the Highest Standards"
                lead={COMPLIANCE_INTRO.lead}
                image={PAGE_MEDIA.compliance.hero.src}
                badges={TRUST_BADGES.slice(0, 3)}
                variant="editorial"
                parallax
            />

            {/* Same kicker, title and lead as before — set beside a photograph
                rather than centred, with the four pillars and the trust badges
                still beneath. No wording altered, no new claims. */}
            <SplitFeature
                kicker="Four Pillars of Assurance"
                title={<>Love, <span>written down where it can be kept</span></>}
                paras={[
                    'Keeping children safe is the quieter part of love — the careful, never-ending work behind every policy and routine. Here is how we hold ourselves accountable.',
                ]}
                image={PAGE_MEDIA.compliance.feature}
            >
                <Reveal className="pillars-grid" stagger amount={0.1}>
                    {COMPLIANCE_PILLARS.map((p) => (
                        <Reveal as="article" variant="item" className={`pillar-card ${p.image ? 'has-bg' : ''}`} key={p.title}>
                            {p.image && (
                                <div className="pillar-card-bg" aria-hidden="true">
                                    <img src={p.image} alt="" loading="lazy" />
                                    <div className="pillar-card-overlay" />
                                </div>
                            )}
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
            </SplitFeature>

            <section className="section section-alt">
                <div className="container">
                    <Reveal className="sblocks-callout" variant="fadeUp">
                        <div className="sblocks-callout-text">
                            <h3>Find us on Starting Blocks</h3>
                            <p>
                                Search &ldquo;Country Kids Learning Centre&rdquo; in Ravenhall VIC 3023
                                for our current NQS rating, assessment reports and compliance history —
                                updated daily from ACECQA&rsquo;s National Quality Agenda IT System.
                            </p>
                        </div>
                        <a className="btn-primary" href={STARTING_BLOCKS_HREF} target="_blank" rel="noopener noreferrer">
                            Visit Starting Blocks <Icon name="external-link" />
                        </a>
                    </Reveal>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <SectionHeader
                        kicker="2025–2026 Sector Reforms"
                        title={<>Ahead of <span>every change</span></>}
                        lead="Early childhood education is reforming fast. Country Kids meets each new requirement early — here is where we stand."
                    />
                    <div className="timeline">
                        {SECTOR_UPDATES.map((u) => (
                            <Reveal as="div" className="timeline-item" variant="fadeUp" key={u.title}>
                                <span className="timeline-when">{u.when}</span>
                                <div className="timeline-card">
                                    <h3>{u.title}</h3>
                                    <p>{u.text}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            <PageNavigator />

            <CTASection
                title="A promise we make in writing"
                text="When you place your child in our care, you hand us the most precious thing you have. We will never treat that lightly. Book a tour and see for yourself."
            />
        </Page>
    );
}

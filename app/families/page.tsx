'use client';

/* FAMILIES — families as partners: how we communicate and share the day, plus
   the FAQ accordion. FAQ content from lib/faq-data.js. */

import { useRef, useState } from 'react';
import Page from '@/components/shared/Page';
import PageHero from '@/components/shared/PageHero';
import SectionHeader from '@/components/shared/SectionHeader';
import CTASection from '@/components/shared/CTASection';
import Reveal from '@/components/shared/Reveal';
import Icon from '@/components/shared/Icon';
import { FAQS } from '@/lib/faq-data';
import { PHOTOS } from '@/lib/images';

const FAMILY_HIGHLIGHTS = [
    {
        icon: 'smartphone',
        title: 'Daily Updates, Wherever You Are',
        text: 'Photos, learning observations, meal notes and daily moments shared through our parent communication app throughout the day.',
    },
    {
        icon: 'utensils',
        title: 'Five Fresh Meals a Day',
        text: 'Our full-time on-site cook prepares breakfast, morning tea, lunch, afternoon tea and a late snack — adapted for allergies and cultural preferences.',
    },
    {
        icon: 'heart-handshake',
        title: 'Genuine Partnership',
        text: 'Families are never guests in our program. You are partners and contributors — the first and most important teachers your child will ever have.',
    },
    {
        icon: 'users',
        title: 'Not-for-Profit, Community First',
        text: 'Every dollar is reinvested into children, educators and facilities — never returned to shareholders. That means better ratios and richer resources.',
    },
];

export default function FamiliesPage() {
    const rootRef = useRef(null);
    const [open, setOpen] = useState(0);

    return (
        <Page id="families" innerRef={rootRef}>
            <PageHero
                kicker="Families"
                title="Walking Together, Every Day"
                lead="A child cannot be raised by a centre alone — it takes a village. Here is how we keep families close, informed, and part of everything we do."
                image={PHOTOS.aboutHome}
                badges={['Parent communication app', '5 meals daily', 'First & most important teachers']}
            />

            <section className="section">
                <div className="container">
                    <SectionHeader
                        kicker="Partners in the Journey"
                        title={<>The world inside &amp; the world <span>beyond, woven as one</span></>}
                        lead="Children learn most deeply when everything around them makes sense together. That is why we bring families into the everyday life of the centre."
                    />
                    <Reveal className="features-grid" stagger amount={0.1}>
                        {FAMILY_HIGHLIGHTS.map((f) => (
                            <Reveal as="div" variant="item" className="feature-item" key={f.title}>
                                <div className="feature-icon" aria-hidden="true"><Icon name={f.icon} /></div>
                                <h3>{f.title}</h3>
                                <p>{f.text}</p>
                            </Reveal>
                        ))}
                    </Reveal>
                </div>
            </section>

            <section className="section section-alt">
                <div className="container">
                    <SectionHeader
                        kicker="Frequently Asked Questions"
                        title={<>Everything you <span>might be wondering</span></>}
                        lead="Can't find your answer here? Call us on 03 9360 5409 or book a tour — we love to talk."
                    />
                    <div className="faq-list">
                        {FAQS.map((item, i) => {
                            const isOpen = open === i;
                            return (
                                <div className={`faq-item${isOpen ? ' is-open' : ''}`} key={item.q}>
                                    <button
                                        type="button"
                                        className="faq-q"
                                        aria-expanded={isOpen}
                                        onClick={() => setOpen(isOpen ? -1 : i)}
                                    >
                                        {item.q}
                                        <span className="faq-q-icon" aria-hidden="true"><Icon name="chevron-down" /></span>
                                    </button>
                                    <div className="faq-a">
                                        <div className="faq-a-inner">
                                            <p>{item.a}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <CTASection
                title="Become part of the Country Kids family"
                text="The best way to feel our community is to visit. Book a free tour and meet the educators, the rooms, and the families who wouldn't be anywhere else."
            />
        </Page>
    );
}

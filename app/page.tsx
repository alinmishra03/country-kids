'use client';

/* HOME PAGE — a premium single-scroll landing that teases every section:
     hero → stats → learning spaces → welcome/story → rooms → philosophy →
     compliance → gallery → testimonials → closing CTA

   Page-level hooks scoped to this page's root:
     useFadeUps  — .fade-up reveal observer
     useCountUp  — stat number count-up */

import { useRef } from 'react';
import Page from '@/components/shared/Page';
import useFadeUps from '@/hooks/useFadeUps';
import useCountUp from '@/hooks/useCountUp';

import Hero from '@/components/home/Hero';
import StatsBar from '@/components/home/StatsBar';
import WelcomeSection from '@/components/home/WelcomeSection';
import RoomsPreview from '@/components/home/RoomsPreview';
import LearningSpaces from '@/components/home/LearningSpaces';
import PhilosophyTeaser from '@/components/home/PhilosophyTeaser';
import ComplianceStrip from '@/components/home/ComplianceStrip';
import Gallery from '@/components/home/Gallery';
import Testimonials from '@/components/testimonials/Testimonials';
import CTASection from '@/components/shared/CTASection';

export default function HomePage() {
    const rootRef = useRef(null);

    useFadeUps(rootRef);
    useCountUp(rootRef);

    return (
        <Page id="home" innerRef={rootRef}>
            <Hero />
            <StatsBar />
            <LearningSpaces />
            <WelcomeSection />
            <RoomsPreview />
            <PhilosophyTeaser />
            <ComplianceStrip />
            <Gallery />
            <Testimonials />
            <CTASection />
        </Page>
    );
}

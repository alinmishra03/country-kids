'use client';

/* HOME PAGE — section order:
     hero → stats → programs → about → why-choose-us → gallery →
     testimonials → contact strip

   Page-level hooks scoped to this page's root:
     useFadeUps  — .fade-up reveal observer
     useCountUp  — stat number count-up */

import { useRef } from 'react';
import Page from '@/components/shared/Page';
import useFadeUps from '@/hooks/useFadeUps';
import useCountUp from '@/hooks/useCountUp';

import Hero from '@/components/home/Hero';
import StatsBar from '@/components/home/StatsBar';
import ProgramsGrid from '@/components/home/ProgramsGrid';
import AboutSection from '@/components/home/AboutSection';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import Gallery from '@/components/home/Gallery';
import Testimonials from '@/components/home/Testimonials';
import ContactStrip from '@/components/home/ContactStrip';

export default function HomePage() {
    const rootRef = useRef(null);

    useFadeUps(rootRef);
    useCountUp(rootRef);

    return (
        <Page id="home" innerRef={rootRef}>
            <Hero />
            <StatsBar />
            <ProgramsGrid />
            <AboutSection />
            <WhyChooseUs />
            <Gallery />
            <Testimonials />
            <ContactStrip />
        </Page>
    );
}

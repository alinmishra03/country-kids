'use client';

import { useRef } from 'react';
import Page from '@/components/shared/Page';
import Hero from '@/components/home/hero/Hero';

export default function HomePage() {
    const rootRef = useRef(null);

    return (
        <Page id="home" innerRef={rootRef}>
            <Hero />
        </Page>
    );
}

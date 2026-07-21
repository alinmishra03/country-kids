'use client';

import { FEATURES } from '@/lib/programs-data';

export default function WhyChooseUs() {
    return (
        <section className="section section-alt">
            <div className="container">
                <div className="section-head">
                    <div className="section-eyebrow">Peace of Mind</div>
                    <h2 className="section-title">Everything parents <span>look for</span></h2>
                    <div className="divider-dots"><span></span><span></span><span></span></div>
                </div>

                <div className="features-grid">
                    {FEATURES.map((f) => (
                        <div className="feature-item" key={f.title}>
                            <div className="feature-emoji" aria-hidden="true">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

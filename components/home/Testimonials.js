'use client';

import { TESTIMONIALS } from '@/lib/testimonials-data';

export default function Testimonials() {
    return (
        <section className="section section-alt">
            <div className="container">
                <div className="section-head">
                    <div className="section-eyebrow">Loved by Families</div>
                    <h2 className="section-title">What <span>parents</span> say</h2>
                    <div className="divider-dots"><span></span><span></span><span></span></div>
                </div>

                <div className="testimonials-grid">
                    {TESTIMONIALS.map((t) => (
                        <figure className="testimonial-card" key={t.name}>
                            <div className="testimonial-stars" aria-label="5 out of 5 stars">
                                {'★★★★★'}
                            </div>
                            <blockquote className="testimonial-quote">{t.quote}</blockquote>
                            <figcaption className="testimonial-author">
                                <span className="testimonial-avatar" aria-hidden="true">{t.avatar}</span>
                                <span>
                                    <b>{t.name}</b>
                                    <span>{t.role}</span>
                                </span>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}

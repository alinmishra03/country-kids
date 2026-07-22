'use client';

import Link from 'next/link';
import { TESTIMONIALS, initials } from '@/lib/testimonials-data';
import Icon from '@/components/shared/Icon';
import { img } from '@/lib/images';

export default function Testimonials() {
    const featured = TESTIMONIALS.slice(0, 3);
    return (
        <section className="section testimonials-section" id="families">
            <div className="container">
                <div className="section-head">
                    <div className="section-eyebrow">Family Stories</div>
                    <h2 className="section-title">Words from the families who <span>trust us</span></h2>
                    <div className="divider-dots"><span></span><span></span><span></span></div>
                </div>

                <div className="testimonials-grid">
                    {featured.map((t) => (
                        <figure className="testimonial-card" key={t.name}>
                            <div className="testimonial-stars" aria-label="Rated 5 out of 5 stars">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Icon key={i} name="star" className="star-filled" />
                                ))}
                            </div>
                            <blockquote className="testimonial-quote">{t.quote}</blockquote>
                            <figcaption className="testimonial-author">
                                {t.img ? (
                                    <img
                                        className="testimonial-avatar"
                                        src={img(t.img, 96, 60)}
                                        alt={t.name}
                                        loading="lazy"
                                        decoding="async"
                                        width="48"
                                        height="48"
                                    />
                                ) : (
                                    <span className="testimonial-avatar" aria-hidden="true">{initials(t.name)}</span>
                                )}
                                <span>
                                    <b>{t.name}</b>
                                    <span>{t.role}</span>
                                </span>
                            </figcaption>
                        </figure>
                    ))}
                </div>

                <div className="section-cta">
                    <Link className="btn-outline" href="/families">
                        Read more family stories <Icon name="arrow-right" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

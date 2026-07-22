'use client';

/* Animated stats band. Numbers count up on scroll via the parent page's
   useCountUp hook (data-count attribute). Content = the centre's headline stats. */

import { CENTRE_STATS } from '@/lib/philosophy-data';

export default function StatsBar() {
    return (
        <section className="stats-bar">
            <div className="stats-grid">
                {CENTRE_STATS.map((s) => (
                    <div className="stat-item" key={s.label}>
                        <div className="stat-number" data-count={s.number}>{s.number}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}

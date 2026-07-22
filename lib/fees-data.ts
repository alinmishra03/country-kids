/* Fees & Funding — the four subsidy steps and the data behind the weekly-cost
   estimator. Faithful to the centre's own content. */

export const FEES_INTRO = {
    kicker: 'Fees & Funding',
    title: 'Making Quality Care Affordable',
    lead:
        'The Australian Government’s Child Care Subsidy and Victoria’s Kinder Funding can dramatically reduce your out-of-pocket costs. From January 2026, all eligible families are guaranteed 3 subsidised days per fortnight — no activity test required.',
};

export const SUBSIDY_STEPS = [
    {
        icon: 'user-check',
        title: 'Create or Log In to myGov',
        text:
            'Link your myGov account to Centrelink and claim the Child Care Subsidy online. This takes around 15–20 minutes.',
    },
    {
        icon: 'clipboard',
        title: 'Enrol at Country Kids',
        text:
            "Provide your Customer Reference Number (CRN) and your child's CRN during our enrolment process.",
    },
    {
        icon: 'circle-check',
        title: 'Subsidy Applied Automatically',
        text:
            'Your CCS is paid directly to Country Kids. You pay only the gap — every fortnight, automatically.',
    },
    {
        icon: 'graduation',
        title: 'Stack Victorian Kinder Funding',
        text:
            'Eligible 3 and 4 year olds receive additional Victorian Government Kinder Funding on top of CCS, saving families up to $2,500 per year.',
    },
];

/* ── Weekly-cost estimator ──────────────────────────────────────────────────
   Indicative only. Base fee ≈ $155/day. CCS % is applied by combined family
   income band (approximate 2026 CCS taper), then multiplied by days/week and
   the room's daily rate. Output is a low–high weekly out-of-pocket range. */

export const INCOME_BANDS = [
    { id: 'u80', label: 'Under $80,000', ccs: 0.9 },
    { id: '80-120', label: '$80,000 – $120,000', ccs: 0.82 },
    { id: '120-160', label: '$120,000 – $160,000', ccs: 0.68 },
    { id: '160-200', label: '$160,000 – $200,000', ccs: 0.54 },
    { id: '200-250', label: '$200,000 – $250,000', ccs: 0.4 },
    { id: 'o250', label: 'Over $250,000', ccs: 0.2 },
];

export const DAY_OPTIONS = [
    { id: 3, label: '3 days' },
    { id: 4, label: '4 days' },
    { id: 5, label: '5 days' },
];

export const ROOM_GROUPS = [
    { id: 'joey-koala', label: 'Joey / Koala (0–2yrs)', rate: 160 },
    { id: 'kooka-cockatoo', label: 'Kookaburra / Cockatoo (2–3yrs)', rate: 155 },
    { id: 'kinder', label: 'Kingfisher / Kangaroo / Emu (3–6yrs)', rate: 150 },
];

export const ESTIMATOR_NOTE =
    'Estimate only. Use the official Services Australia CCS calculator for an accurate figure based on your circumstances.';

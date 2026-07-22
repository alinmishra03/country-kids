/* Family stories — Google reviews from Country Kids families. Faithful to the
   centre's own content. `img` is optional (falls back to an initials chip). */

type Testimonial = { name: string; role: string; quote: string; img?: string };

export const TESTIMONIALS: Testimonial[] = [
    {
        name: 'Deva V.',
        role: 'Google Review',
        quote:
            'Very good place and our kids are so happy here. The educators genuinely love engaging with the children. Our son loves coming every single day — that says everything about this centre.',
    },
    {
        name: 'Paige H.',
        role: 'Google Review',
        quote:
            'From the moment we stepped inside we felt completely comfortable. Our son smiles every day when he sees his educators. The communication with parents is exceptional.',
    },
    {
        name: 'Linda C.',
        role: 'Google Review',
        quote:
            'As a first-time mum I visited many centres. As soon as I walked in here I felt at ease. The orientation was so thoughtful — our family couldn’t be happier with the care our son receives.',
    },
    {
        name: 'Priya M.',
        role: 'Google Review',
        quote:
            'The meals are outstanding — my daughter eats better at the centre than at home! The educators keep me updated via the app and I feel confident and connected every single day.',
    },
    {
        name: 'Anonymous Family',
        role: 'Google Review',
        quote:
            'Our child is developing so well and truly enjoys every day. The educators are attentive, caring and go above and beyond. I highly recommend Country Kids to any Ravenhall family.',
    },
    {
        name: 'The Nguyen Family',
        role: 'Google Review',
        quote:
            'The outdoor play area is incredible — our son talks about the fairy garden and bird aviary constantly. You can see the love and thought that went into creating this magical environment.',
    },
];

/* Build initials (e.g. "Deva V." -> "DV") for the avatar chips. */
export function initials(name: string) {
    return name
        .split(/\s+/)
        .map((w) => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

'use client';

/* Central icon system. Data files store a short string KEY instead of an emoji;
   this component maps that key to a Lucide line icon so the whole site shares one
   consistent, professional icon set. Size and colour are driven by CSS (icons
   inherit `currentColor` and are sized via the parent rule targeting `svg`). */

import {
    Baby,
    Blocks,
    Palette,
    GraduationCap,
    Backpack,
    Sun,
    ShieldCheck,
    Apple,
    Users,
    Smartphone,
    Home,
    Sparkles,
    Clock,
    Heart,
    HeartHandshake,
    Check,
    CircleCheck,
    Star,
    Phone,
    Mail,
    MapPin,
    BookOpen,
    Music,
    Leaf,
    Bike,
    Calculator,
    PartyPopper,
    Sprout,
    X,
    // Rooms / nature
    Bird,
    Feather,
    Fish,
    Rabbit,
    Egg,
    Waves,
    TreePine,
    // Compliance / process
    Landmark,
    ClipboardList,
    ClipboardCheck,
    Scale,
    UserCheck,
    BadgeCheck,
    // Utility / UI
    ArrowRight,
    ArrowUpRight,
    ChevronDown,
    ChevronRight,
    Plus,
    Minus,
    Menu,
    Quote,
    Calendar,
    ExternalLink,
    Send,
    Utensils,
    Baby as BabyIcon,
} from 'lucide-react';

const ICONS = {
    // Programs / rooms
    baby: Baby,
    blocks: Blocks,
    palette: Palette,
    graduation: GraduationCap,
    backpack: Backpack,
    sun: Sun,
    bird: Bird,
    feather: Feather,
    fish: Fish,
    rabbit: Rabbit,
    egg: Egg,
    waves: Waves,
    tree: TreePine,
    // Features / trust / compliance
    shield: ShieldCheck,
    apple: Apple,
    users: Users,
    smartphone: Smartphone,
    landmark: Landmark,
    clipboard: ClipboardList,
    'clipboard-check': ClipboardCheck,
    scale: Scale,
    'user-check': UserCheck,
    badge: BadgeCheck,
    utensils: Utensils,
    // Brand / hero / about
    home: Home,
    sparkles: Sparkles,
    clock: Clock,
    heart: Heart,
    'heart-handshake': HeartHandshake,
    sprout: Sprout,
    check: Check,
    'circle-check': CircleCheck,
    star: Star,
    quote: Quote,
    calendar: Calendar,
    // Contact
    phone: Phone,
    mail: Mail,
    'map-pin': MapPin,
    send: Send,
    'external-link': ExternalLink,
    // Gallery activities
    book: BookOpen,
    music: Music,
    leaf: Leaf,
    bike: Bike,
    calculator: Calculator,
    party: PartyPopper,
    // UI
    'arrow-right': ArrowRight,
    'arrow-up-right': ArrowUpRight,
    'chevron-down': ChevronDown,
    'chevron-right': ChevronRight,
    plus: Plus,
    minus: Minus,
    menu: Menu,
    x: X,
};

export default function Icon({ name, size, strokeWidth = 2, className, ...rest }: any) {
    const Cmp = ICONS[name] || Sparkles;
    return (
        <Cmp
            size={size}
            strokeWidth={strokeWidth}
            className={className}
            aria-hidden="true"
            focusable="false"
            {...rest}
        />
    );
}

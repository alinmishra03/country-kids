/* Every tuning number for the hero globe lives here — geometry, motion, camera
   and quality. Nothing in the 3D components hard-codes a magic number, so the
   whole experience can be re-tuned from one file. */

export const GLOBE = {
    /** Sphere radius in world units at the equator. */
    radius: 3.78,
    /** Cards per ring. Also the snap resolution. */
    columns: 8,
    /** Number of latitude bands. columns × rows = card count. */
    rows: 3,
    /** Latitude of the outer bands, degrees. 0 would collapse to a flat ring. */
    latitude: 29,
    /** Odd bands are offset half a column so the ball reads organic, not gridded. */
    stagger: true,

    cardW: 1.18,
    cardH: 1.54,
    cardDepth: 0.055,
    cardRadius: 0.1,
} as const;

export const MOTION = {
    /** Idle orbit, radians/second. Deliberately very slow. */
    autoSpeed: 0.085,
    /** Orbit multiplier while a card is hovered — near-stop, but never a hard stop. */
    hoverSpeed: 0.1,
    /** Radians of Y rotation per pixel dragged. */
    dragSensX: 0.0058,
    /** Vertical drag tilts the globe, far less sensitive, and clamped. */
    dragSensY: 0.0032,
    maxTilt: 0.28,
    /** Inertia decay per 1/60s after release. */
    friction: 0.945,
    /** Below this angular speed the throw is spent and the snap takes over. */
    snapBelow: 0.16,
    /** Snap tween. */
    snapDuration: 0.9,
    /** How long the globe rests on a snapped card before the idle orbit resumes. */
    snapHold: 1.15,
    /** How fast the idle orbit fades back in (units/second). */
    resume: 1.4,
} as const;

/* Card springs. Selection is NOT here: once a card is selected the DOM focus
   card represents it (see FOCUS below), and the 3D card simply fades out. */
export const CARD_MOTION = {
    hoverScale: 1.11,
    /** Push along the card's own normal (toward the camera) in world units. */
    hoverLift: 0.34,
    /** Emissive gain — this is what the bloom pass picks up. */
    hoverGlow: 0.4,
    /** Extra brightness on the active card's own map, on top of the glow. */
    activeBrightness: 1.16,
    /** The bevel rim lights up with the card it belongs to. */
    rimGlow: 0.55,

    /** Opacity of the OTHER cards while one is hovered. (Once one is SELECTED
        the whole canvas is dimmed in CSS instead, so nothing dims here.) */
    hoverDimOpacity: 0.5,

    /** Per-card idle bob. */
    floatAmp: 0.055,
    floatSpeed: 0.5,
    /** Lerp factor per 1/60s. Settles in ~330ms, i.e. the 300–500ms band, and
        because it is a lerp the curve is inherently ease-out. */
    ease: 0.16,

    /* ── Depth cueing ──
       A card's brightness and size track how far it is from the camera, so the
       far side of the globe recedes instead of reading as a flat ring. Real
       per-card BLUR is deliberately not done: blurring individual objects needs
       a depth-of-field pass over the whole scene, which costs more than the
       whole rest of the hero. Darkening plus a size falloff reads as depth at a
       fraction of the price. */
    depthDim: 0.5,        /* brightness at the very back (1 = no dimming)      */
    depthShrink: 0.12,    /* how much smaller the very back card is            */
} as const;

/* Idle life — the globe is never completely still. All of it is tiny on
   purpose; it should register as "alive", never as movement. */
export const IDLE = {
    /** Breathing scale, ± this fraction. */
    breatheAmp: 0.014,
    breatheSpeed: 0.42,
    /** Slow vertical drift of the whole globe, in world units. */
    driftAmp: 0.075,
    driftSpeed: 0.24,
} as const;

/* The centred focus state (components/home/hero/FocusCard.tsx). */
export const FOCUS = {
    /** Card flies out of the globe to dead centre. */
    enter: 0.72,
    /** Reverse. Slightly quicker — a dismissal should not linger. */
    exit: 0.52,
} as const;

export const CAMERA = {
    fov: 42,
    near: 0.1,
    far: 60,
    /** Resting distance. CameraRig re-fits this to the viewport aspect. */
    z: 9.4,
    /** Distance when a card is selected — a small, deliberate dolly forward. */
    zSelected: 8.1,
    /** Pointer parallax, world units at the screen edge. */
    parallax: 0.42,
    parallaxEase: 0.045,
    /** The globe must fit inside this half-extent on both axes. */
    fit: 4.6,
} as const;

/* Card face texture. Sized for the largest on-screen card (~340 css px) at 2×,
   which is the honest resolution ceiling — anything more is GPU memory spent on
   pixels no one sees. 24 cards at this size is ~20 MB of VRAM. */
export const TEXTURE = {
    width: 400,
    height: 522,
    anisotropy: 4,
} as const;

export const PARTICLES = {
    count: 700,
    /** Shell the dust occupies — well outside the globe so it reads as depth. */
    innerRadius: 5,
    outerRadius: 15,
    size: 0.055,
    driftSpeed: 0.012,
} as const;

/* Quality tiers. Shadows and postprocessing are the two things that actually
   cost frames, so both are gated on a device check rather than shipped blind. */
export const QUALITY = {
    /** Devices narrower than this get the cheap path. */
    mobileBreakpoint: 900,
    dprDesktop: [1, 1.85] as [number, number],
    dprMobile: [1, 1.4] as [number, number],
} as const;

'use client';

/* Translatable text helper. Renders TRANSLATIONS[lang][k] when present, else the
   English children fallback. `as` chooses the wrapper element (default: span).
   Mirrors the reference project's <T> so markup reads the same way. */

import { useTranslation } from '@/components/providers/TranslationProvider';

export default function T({ k, as: Tag = 'span', className, children }: any) {
    const { t } = useTranslation();
    // When there is no translation, render children verbatim (preserves inline
    // markup like <span> inside titles). Otherwise render the translated string.
    const translated = t(k, null);
    if (translated == null) {
        return <Tag className={className}>{children}</Tag>;
    }
    return <Tag className={className}>{translated}</Tag>;
}

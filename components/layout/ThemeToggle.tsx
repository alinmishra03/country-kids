'use client';

/* Sun/moon theme toggle button. ids are preserved so nav.css / theme-dark.css
   can target the header vs mobile instances directly. */

import { useTheme } from '@/components/providers/ThemeProvider';

export default function ThemeToggle({ id, className }: any) {
    const { toggle, theme } = useTheme();

    return (
        <button
            type="button"
            className={`theme-toggle ${className || ''}`}
            id={id}
            onClick={toggle}
            aria-pressed={theme === 'dark'}
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
        >
            <svg className="icon-sun" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
            </svg>
            <svg className="icon-moon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
        </button>
    );
}

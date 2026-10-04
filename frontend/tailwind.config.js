/** @type {import('tailwindcss').Config} */
const tone = (name) => ({
    DEFAULT: `hsl(var(--${name}))`,
    soft: `hsl(var(--${name}-soft))`,
});

export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
            },
            fontSize: {
                '2xs': ['0.6875rem', { lineHeight: '1rem' }],
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                surface: "hsl(var(--surface))",
                sunken: "hsl(var(--sunken))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                    soft: "hsl(var(--primary-soft))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                success: tone('success'),
                warning: tone('warning'),
                danger: tone('danger'),
                info: tone('info'),
            },
            borderRadius: {
                xl: `calc(var(--radius) + 4px)`,
                lg: `var(--radius)`,
                md: `calc(var(--radius) - 2px)`,
                sm: "calc(var(--radius) - 4px)",
            },
            boxShadow: {
                overlay: '0 16px 40px -16px hsl(var(--shadow) / 0.30), 0 2px 8px -2px hsl(var(--shadow) / 0.10)',
            },
            keyframes: {
                'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
                'pop-in': { from: { opacity: '0', transform: 'translate(-50%, -48%) scale(0.985)' }, to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' } },
                'rise-in': { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
                'drop-in': { from: { opacity: '0', transform: 'translateY(-4px) scale(0.98)' }, to: { opacity: '1', transform: 'translateY(0) scale(1)' } },
                'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
                'slide-in-left': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
                shimmer: { '100%': { transform: 'translateX(100%)' } },
                progress: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(250%)' } },
            },
            animation: {
                'fade-in': 'fade-in 150ms ease-out',
                'pop-in': 'pop-in 180ms cubic-bezier(0.2, 0.9, 0.3, 1)',
                'rise-in': 'rise-in 240ms ease-out both',
                'drop-in': 'drop-in 140ms ease-out',
                'slide-in-right': 'slide-in-right 260ms cubic-bezier(0.2, 0.9, 0.3, 1)',
                'slide-in-left': 'slide-in-left 260ms cubic-bezier(0.2, 0.9, 0.3, 1)',
                shimmer: 'shimmer 1.4s infinite',
                progress: 'progress 900ms ease-in-out infinite',
            },
        },
    },
    plugins: [],
}

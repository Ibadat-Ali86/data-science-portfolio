/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                // Professional typography for business platform
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
                display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', 'monospace'],
            },
            colors: {
                // Brand - Primary Brand Color (Business Indigo)
                brand: {
                    50: 'var(--primary-50)',
                    100: 'var(--primary-100)',
                    200: 'var(--primary-200)',
                    300: 'var(--primary-300)',
                    400: 'var(--primary-400)',
                    500: 'var(--primary-500)',
                    600: 'var(--primary-600)',
                    700: 'var(--primary-700)',
                    800: 'var(--primary-800)',
                    900: 'var(--primary-900)',
                },
                // Primary - Mapped to Brand for logic consistency
                primary: {
                    50: 'var(--primary-50)',
                    100: 'var(--primary-100)',
                    200: 'var(--primary-200)',
                    300: 'var(--primary-300)',
                    400: 'var(--primary-400)',
                    500: 'var(--primary-500)',
                    600: 'var(--primary-600)',
                    700: 'var(--primary-700)',
                    800: 'var(--primary-800)',
                    900: 'var(--primary-900)',
                },
                // Secondary - Mapped to Emerald (Success/Growth)
                secondary: {
                    50: 'var(--secondary-50)',
                    500: 'var(--secondary-500)',
                    600: 'var(--secondary-600)',
                },
                // Backgrounds
                bg: {
                    primary: 'var(--bg-primary)',
                    secondary: 'var(--bg-secondary)',
                    tertiary: 'var(--bg-tertiary)',
                    elevated: 'var(--bg-elevated)',
                },
                surface: {
                    default: 'var(--bg-secondary)',
                    subtle: 'var(--bg-tertiary)',
                },
                // Text
                text: {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                    tertiary: 'var(--text-tertiary)',
                    inverse: 'var(--text-inverse)',
                },
                // Neutrals
                gray: {
                    50: 'var(--gray-50)',
                    100: 'var(--gray-100)',
                    200: 'var(--gray-200)',
                    300: 'var(--gray-300)',
                    400: 'var(--gray-400)',
                    500: 'var(--gray-500)',
                    600: 'var(--gray-600)',
                    700: 'var(--gray-700)',
                    800: 'var(--gray-800)',
                    900: 'var(--gray-900)',
                },
                // Semantic Colors
                success: {
                    50: 'var(--success-50)',
                    500: 'var(--success-500)',
                    600: 'var(--success-600)',
                },
                warning: {
                    50: 'var(--warning-50)',
                    500: 'var(--warning-500)',
                },
                error: {
                    50: 'var(--danger-50)',
                    500: 'var(--danger-500)',
                },
                info: {
                    50: 'var(--info-50)',
                    500: 'var(--info-500)',
                },
                // Border
                border: {
                    default: 'var(--border-default)',
                    subtle: 'var(--gray-700)',
                    primary: 'var(--border-default)',
                    secondary: 'var(--gray-300)',
                    focus: 'var(--border-focus)',
                    error: 'var(--accent-danger)',
                }
            },
            spacing: {
                // 8px Grid System
                '0': '0',
                '1': '0.25rem',  // 4px
                '2': '0.5rem',   // 8px
                '3': '0.75rem',  // 12px
                '4': '1rem',     // 16px
                '5': '1.25rem',  // 20px
                '6': '1.5rem',   // 24px
                '8': '2rem',     // 32px
                '10': '2.5rem',  // 40px
                '12': '3rem',    // 48px
                '16': '4rem',    // 64px
                '20': '5rem',    // 80px
                '24': '6rem',    // 96px
            },
            fontSize: {
                xs: ['0.75rem', { lineHeight: '1rem' }],         // 12px
                sm: ['0.875rem', { lineHeight: '1.25rem' }],     // 14px
                base: ['1rem', { lineHeight: '1.5rem' }],        // 16px
                lg: ['1.125rem', { lineHeight: '1.75rem' }],     // 18px
                xl: ['1.25rem', { lineHeight: '1.75rem' }],      // 20px
                '2xl': ['1.5rem', { lineHeight: '2rem' }],       // 24px
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],  // 30px
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],    // 36px
                '5xl': ['3rem', { lineHeight: '3rem' }],         // 48px
                '6xl': ['3.75rem', { lineHeight: '3.75rem' }],   // 60px
            },
            borderRadius: {
                sm: '0.25rem',    // 4px
                DEFAULT: '0.5rem', // 8px
                md: '0.5rem',     // 8px
                lg: '0.75rem',    // 12px
                xl: '1rem',       // 16px
                '2xl': '1.5rem',  // 24px
                full: '9999px',
            },
            boxShadow: {
                // Light mode shadows - softer, more subtle
                sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
                DEFAULT: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                md: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
                lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
                xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
                '2xl': '0 25px 50px rgba(0, 0, 0, 0.15)',
                'card': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
                'card-hover': '0 4px 12px rgba(59, 130, 246, 0.15)',
                'button': '0 1px 2px rgba(0, 0, 0, 0.05)',
                'button-hover': '0 4px 6px rgba(59, 130, 246, 0.2)',
            },
            transitionDuration: {
                'fast': '150ms',
                'normal': '200ms',
                'slow': '300ms',
                'slower': '400ms',
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 200ms ease-out',
                'slide-up': 'slideUp 200ms ease-out',
                'scale-in': 'scaleIn 200ms ease-out',
                'shimmer': 'shimmer 2s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
            }
        },
    },
    plugins: [],
}

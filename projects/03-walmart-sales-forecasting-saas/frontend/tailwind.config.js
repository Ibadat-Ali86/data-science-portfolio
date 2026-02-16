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
                mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
            },
            colors: {
                // Primary Blue - Conveys trust, stability, intelligence
                primary: {
                    50: '#EFF6FF',
                    100: '#DBEAFE',
                    200: '#BFDBFE',
                    300: '#93C5FD',
                    400: '#60A5FA',
                    500: '#3B82F6',
                    600: '#2563EB',
                    700: '#1D4ED8',
                    800: '#1E40AF',
                    900: '#1E3A8A',
                },
                // Secondary - Professional sophistication (Indigo)
                secondary: {
                    50: '#EEF2FF',
                    100: '#E0E7FF',
                    200: '#C7D2FE',
                    300: '#A5B4FC',
                    400: '#818CF8',
                    500: '#6366F1',
                    600: '#4F46E5',
                    700: '#4338CA',
                    800: '#3730A3',
                    900: '#312E81',
                },
                // Light Mode Background Colors
                bg: {
                    primary: '#F9FAFB',    // Main page background
                    secondary: '#FFFFFF',   // Cards, elevated surfaces
                    tertiary: '#F3F4F6',    // Subtle sections
                    elevated: '#FFFFFF',    // Modals, dropdowns
                },
                // Light Mode Text Colors
                text: {
                    primary: '#111827',     // Main headings (gray-900)
                    secondary: '#4B5563',   // Body text (gray-600)
                    tertiary: '#9CA3AF',    // Muted text (gray-400)
                },
                // Neutral Gray Scale
                gray: {
                    50: '#F9FAFB',
                    100: '#F3F4F6',
                    200: '#E5E7EB',
                    300: '#D1D5DB',
                    400: '#9CA3AF',
                    500: '#6B7280',
                    600: '#4B5563',
                    700: '#374151',
                    800: '#1F2937',
                    900: '#111827',
                },
                // Success - Growth, positive metrics, profit
                success: {
                    50: '#ECFDF5',
                    100: '#D1FAE5',
                    200: '#A7F3D0',
                    500: '#10B981',
                    600: '#059669',
                    700: '#047857',
                },
                // Warning - Caution, attention needed
                warning: {
                    50: '#FFFBEB',
                    100: '#FEF3C7',
                    200: '#FDE68A',
                    500: '#F59E0B',
                    600: '#D97706',
                    700: '#B45309',
                },
                // Error - Loss, negative metrics, risk
                error: {
                    50: '#FEF2F2',
                    100: '#FEE2E2',
                    200: '#FECACA',
                    500: '#EF4444',
                    600: '#DC2626',
                    700: '#B91C1C',
                },
                // Info - Neutral information
                info: {
                    50: '#EFF6FF',
                    100: '#DBEAFE',
                    200: '#BFDBFE',
                    500: '#3B82F6',
                    600: '#2563EB',
                    700: '#1D4ED8',
                },
                // Data Visualization Palette (Business-friendly)
                viz: {
                    primary: '#3B82F6',    // Blue - Main series
                    secondary: '#10B981',  // Green - Growth/positive
                    tertiary: '#F59E0B',   // Amber - Caution
                    quaternary: '#6366F1', // Indigo - Alternative
                    quinary: '#EC4899',    // Pink - Highlights
                    senary: '#8B5CF6',     // Purple - Special
                },
                // Borders (Light Mode)
                border: {
                    primary: '#E5E7EB',    // Standard borders
                    secondary: '#D1D5DB',  // Emphasized borders
                    focus: '#3B82F6',      // Focus state
                    error: '#EF4444',      // Error state
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

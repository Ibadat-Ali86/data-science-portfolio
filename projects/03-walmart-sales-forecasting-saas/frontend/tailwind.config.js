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
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
                display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
            },
            colors: {
                // Primary Brand - Blue
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                // Background Colors from Design System
                bg: {
                    primary: '#0A0E1A',
                    secondary: '#131829',
                    tertiary: '#1C2333',
                    elevated: '#242B3D',
                },
                // Text Colors
                text: {
                    primary: '#E8EDF4',
                    secondary: '#A3ADBF',
                    tertiary: '#6B7790',
                },
                // Accent Colors
                accent: {
                    blue: '#4A9EFF',
                    cyan: '#00D9FF',
                    purple: '#B794F6',
                    pink: '#FF6B9D',
                    green: '#4ADE80',
                    yellow: '#FFC947',
                    red: '#FF5757',
                    orange: '#FF8A5B',
                },
                // Semantic Colors
                status: {
                    info: '#4A9EFF',
                    success: '#4ADE80',
                    warning: '#FFC947',
                    error: '#FF5757',
                },
                // Data Viz Colors
                viz: {
                    1: '#4A9EFF',
                    2: '#4ADE80',
                    3: '#FFC947',
                    4: '#FF6B9D',
                    5: '#B794F6',
                    6: '#00D9FF',
                    7: '#FF8A5B',
                    8: '#8B5CF6',
                },
                // Borders
                border: {
                    primary: 'rgba(163, 173, 191, 0.12)',
                    focus: '#4A9EFF',
                    error: '#FF5757',
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
                xs: ['0.75rem', { lineHeight: '1.5' }],      // 12px
                sm: ['0.875rem', { lineHeight: '1.5' }],     // 14px
                base: ['1rem', { lineHeight: '1.5' }],       // 16px
                lg: ['1.125rem', { lineHeight: '1.75' }],    // 18px
                xl: ['1.25rem', { lineHeight: '1.75' }],     // 20px
                '2xl': ['1.5rem', { lineHeight: '2rem' }],   // 24px
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
                '5xl': ['3rem', { lineHeight: '1' }],        // 48px
                '6xl': ['3.75rem', { lineHeight: '1' }],     // 60px
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
                sm: '0 1px 3px rgba(0, 0, 0, 0.4)',
                DEFAULT: '0 1px 3px rgba(0, 0, 0, 0.4)',
                md: '0 4px 12px rgba(0, 0, 0, 0.5)',
                lg: '0 20px 40px rgba(0, 0, 0, 0.6)',
                xl: '0 40px 80px rgba(0, 0, 0, 0.7)',
                'glow-blue': '0 0 20px rgba(74, 158, 255, 0.3)',
                'glow-purple': '0 0 20px rgba(183, 148, 246, 0.3)',
            },
            transitionDuration: {
                'fast': '150ms',
                'base': '250ms',
                'slow': '350ms',
                'slower': '500ms',
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'blob': 'blob 7s infinite',
                'gradient': 'gradient 15s ease infinite',
            },
            keyframes: {
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                gradient: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                }
            }
        },
    },
    plugins: [],
}

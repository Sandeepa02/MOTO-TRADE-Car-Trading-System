/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(15, 23, 42, 0.06), 0 8px 24px -4px rgba(91, 33, 182, 0.08)',
        lift: '0 12px 40px -12px rgba(15, 23, 42, 0.12), 0 4px 16px -4px rgba(91, 33, 182, 0.1)'
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      colors: {
        primary: {
          50: '#f6f4ff',
          100: '#eeeaff',
          200: '#ddd5ff',
          300: '#c4b5ff',
          400: '#a78bff',
          500: '#8b5cf6',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#2e1065'
        },
        secondary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        },
        surface: {
          50: '#fbfaff',
          100: '#f7f5ff',
          200: '#f1eeff'
        }
      }
    }
  },
  plugins: []
};

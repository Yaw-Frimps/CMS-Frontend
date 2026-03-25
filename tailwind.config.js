/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f2f6f8',
          100: '#e6edf1',
          200: '#cddce4',
          300: '#aabed1',
          400: '#7d9ebb',
          500: '#507D9B', // Core
          600: '#406680',
          700: '#325066',
          800: '#253d4d',
          900: '#1b2c3a',
          950: '#111e29',
          DEFAULT: '#507D9B',
        },
        secondary: {
          50: '#f6f4f1',
          100: '#eeebe5',
          200: '#dbd1c3',
          300: '#c3b19b',
          400: '#a99477',
          500: '#8C7355', // Core
          600: '#745d43',
          700: '#5c4933',
          800: '#443625',
          900: '#312619',
          950: '#21180f',
          DEFAULT: '#8C7355',
        },
        tertiary: {
          50: '#fdfbfa',
          100: '#f9f6f1',
          200: '#f0e6d6',
          300: '#e4d0b1',
          400: '#d6b98e',
          500: '#C5A16F', // Core
          600: '#a38458',
          700: '#806642',
          800: '#5f4b30',
          900: '#413220',
          950: '#261c11',
          DEFAULT: '#C5A16F',
        },
        neutral: {
          50: '#ffffff',
          100: '#F9F7F2', // Background Neutral
          200: '#ece8de',
          300: '#ded5c5',
          400: '#ccbfa8',
          500: '#b7a88e',
          600: '#9b8d75',
          700: '#7b6c59',
          800: '#5d5042',
          900: '#43392e',
          950: '#2a231b',
          DEFAULT: '#F9F7F2',
        },
        zinc: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        headline: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      }
    },
  },
  plugins: [],
}

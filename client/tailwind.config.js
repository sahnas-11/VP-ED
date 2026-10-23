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
        pastel: {
          50: '#fff5f7',
          100: '#ffe4ec',
          200: '#fecddc',
          300: '#fea3bd',
          400: '#f87198',
          500: '#ee4375',
          600: '#db275e',
          700: '#b8174a',
          800: '#991642',
          900: '#82173d',
        },
        blush: {
          DEFAULT: '#FDECEF',
          dark: '#F5C6D0',
          card: '#FFF8FA',
          border: '#F8B4C4',
        },
        mauve: {
          50: '#f6f5f7',
          100: '#ece9ef',
          200: '#ddd6e2',
          500: '#866b8c',
          700: '#5c4363',
          800: '#46324b',
          900: '#342339',
        },
        gavel: {
          navy: '#1B2A4A',
          wine: '#882D4B',
          rose: '#E06D88',
          gold: '#E5A93B',
          cream: '#FFFDF9'
        },
        darkpink: {
          bg: '#1A1218',
          card: '#2A1D27',
          border: '#452A3D',
          hover: '#382333',
          text: '#FDECEF'
        }
      },
      fontFamily: {
        sans: ['Quicksand', 'Nunito', 'Poppins', 'sans-serif'],
      },
      borderRadius: {
        'cute': '1.25rem',
        'super': '1.75rem',
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(238, 67, 117, 0.08)',
        'cute': '0 10px 25px -5px rgba(219, 39, 94, 0.12), 0 8px 10px -6px rgba(219, 39, 94, 0.08)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(238, 67, 117, 0.06)'
      }
    },
  },
  plugins: [],
}

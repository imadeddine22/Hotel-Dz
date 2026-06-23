/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // green accent (matches the restosdz-style UI)
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          400: '#4ade80',
          500: '#34c77b',
          600: '#22a96a',
          700: '#1b8a57',
        },
        ink: '#1f2937',
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 6px 24px -8px rgba(0,0,0,0.18)',
      },
    },
  },
  plugins: [],
};

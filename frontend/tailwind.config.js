/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Cyan / Sky-blue — matches the hotel booking UI reference
          50:  '#e0f7fa',
          100: '#b2ebf2',
          200: '#80deea',
          400: '#26c6da',
          500: '#00bcd4',
          600: '#00acc1',
          700: '#0097a7',
        },
        gold: {
          // Yellow / Amber accent — used on CTA buttons
          400: '#ffd740',
          500: '#ffc107',
          600: '#ffb300',
        },
        ink: '#1a2332',
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

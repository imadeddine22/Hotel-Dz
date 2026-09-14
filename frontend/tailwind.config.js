/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Deep navy / slate theme matching the footer background and branding
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          400: '#1e293b',
          500: '#0f172a',
          600: '#0b1329',
          700: '#020617',
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
        sans: ['"Plus Jakarta Sans"', 'var(--font-poppins)', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 6px 24px -8px rgba(0,0,0,0.18)',
      },
    },
  },
  plugins: [],
};

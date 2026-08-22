/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mehmon: {
          bg: '#1F1915',
          card: '#2B231D',
          'card-hover': '#352C25',
          dark: '#16120F',
          gold: '#D4A359',
          'gold-hover': '#B8863B',
          'gold-light': '#F4E2C7',
          'gold-muted': '#C5A880',
          border: '#3D332B',
          cream: '#F5EBE0',
          muted: '#A89F91',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(212, 163, 89, 0.25)',
        'gold-subtle': '0 4px 20px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}

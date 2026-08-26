/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        mehmon: {
          bg: 'var(--bg-main)',
          card: 'var(--bg-card)',
          'card-hover': 'var(--bg-card-hover)',
          subtle: 'var(--bg-subtle)',
          input: 'var(--bg-input)',
          dark: 'var(--bg-dark)',
          gold: 'var(--color-gold)',
          'gold-hover': 'var(--color-gold-hover)',
          'gold-light': 'var(--color-gold-light)',
          'gold-muted': 'var(--color-gold-muted)',
          border: 'var(--border-main)',
          'border-subtle': 'var(--border-subtle)',
          text: 'var(--text-main)',
          muted: 'var(--text-muted)',
          cream: '#F5EBE0',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'gold-glow': 'var(--shadow-glow)',
        'gold-subtle': 'var(--shadow-subtle)',
        'card-custom': 'var(--shadow-card)',
      }
    },
  },
  plugins: [],
}

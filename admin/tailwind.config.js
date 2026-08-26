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
          sidebar: 'var(--bg-sidebar)',
          subtle: 'var(--bg-subtle)',
          input: 'var(--bg-input)',
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
      width: {
        'sidebar': '20%',
      },
      boxShadow: {
        'gold-glow': 'var(--shadow-glow)',
        'card-custom': 'var(--shadow-card)',
      }
    },
  },
  plugins: [],
}

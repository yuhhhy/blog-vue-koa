/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        admin: {
          text: 'var(--admin-text)',
          muted: 'var(--admin-text-muted)',
          soft: 'var(--admin-text-soft)',
          primary: 'var(--admin-primary)',
          accent: 'var(--admin-accent)',
          ink: 'var(--admin-ink)',
        },
      },
      borderRadius: {
        admin: 'var(--admin-radius)',
        'admin-sm': 'var(--admin-radius-sm)',
      },
      boxShadow: {
        glass: 'var(--admin-shadow-soft)',
        'glass-lg': 'var(--admin-shadow)',
        'glass-inset': '0 1px 0 rgba(255, 255, 255, 0.68) inset',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
}

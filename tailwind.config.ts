import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#FAF6F3',
          'bg-secondary': '#F5EDE8',
          gold: '#C4A97D',
          'gold-dark': '#8B7355',
          brown: '#6B5B45',
          hover: '#E8DDD5',
          border: '#E5DDD5',
          text: '#4A4A4A',
          title: '#2D2D2D',
          muted: '#9C9C9C',
          success: '#7B9E6B',
          warning: '#D4A853',
          error: '#C17B6E',
        },
      },
      fontFamily: {
        cormorant: ['var(--font-cormorant)', 'Cormorant Garamond', 'serif'],
        cinzel: ['var(--font-cinzel)', 'Cinzel', 'serif'],
        outfit: ['var(--font-outfit)', 'Outfit', 'sans-serif'],
        inter: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 15px rgba(0, 0, 0, 0.06)',
        card: '0 4px 24px rgba(0, 0, 0, 0.08)',
        gold: '0 4px 15px rgba(196, 169, 125, 0.3)',
      },
      borderRadius: {
        brand: '12px',
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
}
export default config

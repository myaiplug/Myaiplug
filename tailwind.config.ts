import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './sections/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // MyAiPlug brand colors
        'myai': {
          'bg-dark': '#0D0D0F',
          'bg-panel': '#111122',
          'primary': '#7C4DFF',
          'accent': '#00C2FF',
          'accent-warm': '#FFB84D',
          'accent-warm-2': '#FF9900',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Orbitron', 'Inter', 'sans-serif'],
      },
      animation: {
        'gradient': 'gradient 22s ease infinite',
        'glow-pulse': 'glowPulse 6s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6', boxShadow: '0 0 20px rgba(124, 77, 255, 0.3)' },
          '50%': { opacity: '1', boxShadow: '0 0 40px rgba(124, 77, 255, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}

export default config

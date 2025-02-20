import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import tailwindcssAnimate from 'tailwindcss-animate'

export default {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      sm: '520px',
      md: '700px',
      lg: '768px',
      xl: '1024px',
    },
    fontFamily: {
      system: 'var(--font-family-system)',
      sans: 'Helvetica, Arial, sans-serif',
    },
    extend: {
      fontSize: {
        '3xl': '2rem',
      },
      spacing: {
        'sidebar-width': 'var(--sidebar-width)',
        'header-height': 'var(--header-height)',
        'mobile-nav-height': 'var(--mobile-nav-height)',
      },
      colors: {
        'primary-bg': 'var(--primary-bg)',
        'secondary-bg': 'var(--secondary-bg)',
        'tertiary-bg': 'var(--tertiary-bg)',
        'elevated-bg': 'var(--elevated-bg)',
        'hovered-bg': 'var(--hovered-bg)',
        'glimmer-bg': 'var(--glimmer-bg)',
        'primary-outline': 'var(--primary-outline)',
        'primary-border': 'var(--primary-border)',
        'primary-text': 'var(--primary-text)',
        'secondary-text': 'var(--secondary-text)',
        'charcoal-text': 'var(--charcoal-text)',
        'placeholder-text': 'var(--placeholder-text)',
        'error-text': 'var(--error-text)',
        'secondary-button': 'var(--secondary-button)',
        'navigation-icon': 'var(--navigation-icon)',
        notification: 'var(--notification)',
      },
      scale: {
        80: '.8',
        85: '.85',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        glimmer: 'glimmer 2.5s ease-in-out alternate infinite', // 2s duration, loops infinitely
      },
      keyframes: {
        glimmer: {
          '100%, 0%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
    plugin(({ addUtilities }) => {
      const newUtilities = {
        '.mask-gradient': {
          'mask-image': 'linear-gradient(to top, black 0% 75%, transparent 25% 100%)',
        },
      }
      addUtilities(newUtilities)
    }),
  ],
} satisfies Config

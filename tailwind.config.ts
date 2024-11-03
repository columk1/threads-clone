import type { Config } from 'tailwindcss'
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
      spacing: {
        'sidebar-width': 'var(--sidebar-width)',
      },
      colors: {
        'gray-0': 'var(--gray-0)',
        'gray-1': 'var(--gray-1)',
        'gray-2': 'var(--gray-2)',
        'gray-3': 'var(--gray-3)',
        'gray-4': 'var(--gray-4)',
        'gray-5': 'var(--gray-5)',
        'gray-6': 'var(--gray-6)',
        'gray-7': 'var(--gray-7)',
        'gray-8': 'var(--gray-8)',
        'primary-bg': 'var(--primary-bg)',
        'secondary-bg': 'var(--secondary-bg)',
        'tertiary-bg': 'var(--tertiary-bg)',
        'active-bg': 'var(--active-bg)',
        'hovered-bg': 'var(--hovered-bg)',
        'primary-text': 'var(--primary-text)',
        'placeholder-text': 'var(--placeholder-text)',
        'error-text': 'var(--error-text)',
        'primary-outline': 'var(--primary-outline)',
        'secondary-button': 'var(--secondary-button)',
        'notification': 'var(--notification)',
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
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config

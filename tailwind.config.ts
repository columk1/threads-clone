import type { Config } from 'tailwindcss'

export default {
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
      colors: {
        'gray-0': 'var(--gray-0)',
        'gray-1': 'var(--gray-1)',
        'gray-2': 'var(--gray-2)',
        'gray-3': 'var(--gray-3)',
        'gray-4': 'var(--gray-4)',
        'gray-5': 'var(--gray-5)',
        'gray-6': 'var(--gray-6)',
        'gray-7': 'var(--gray-7)',
        'primary-bg': 'var(--primary-bg)',
        'tertiary-bg': 'var(--tertiary-bg)',
        'active-bg': 'var(--active-bg)',
        'primary-text': 'var(--primary-text)',
        'placeholder-text': 'var(--placeholder-text)',
        'primary-outline': 'var(--primary-outline)',
        'secondary-button': 'var(--secondary-button)',
        'notification': 'var(--notification)',
      },
      scale: {
        85: '.85',
      },
    },
  },
  plugins: [],
} satisfies Config

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
        'primary-bg': 'var(--primary-bg)',
        'tertiary-bg': 'var(--tertiary-bg)',
        'primary-text': 'var(--primary-text)',
        'placeholder-text': 'var(--placeholder-text)',
        'gray-text': 'var(--gray-text)',
        'primary-outline': 'var(--primary-outline)',
        'secondary-button': 'var(--secondary-button)',
      },
    },
  },
  plugins: [],
} satisfies Config

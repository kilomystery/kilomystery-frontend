import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b0b0c',
        card: '#121214',
        text: '#f7f8f8',
        muted: '#9aa3af',
        accent: '#7c5cff',
        accent2: '#00e29f'
      },
      borderRadius: { '2xl': '1.25rem' }
    }
  },
  plugins: []
};

export default config;
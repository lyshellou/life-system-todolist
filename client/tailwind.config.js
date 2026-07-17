import { defineConfig } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        card: '12px',
        btn: '8px',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        canvas: '#F7F6F3',
        'card-bg': '#FFFFFF',
        'border-light': '#EAEAEA',
        accent: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        dim: {
          health: { bg: '#EDF3EC', text: '#346538' },
          work: { bg: '#E1F3FE', text: '#1F6C9F' },
          study: { bg: '#EBE5FA', text: '#5B3E9F' },
          social: { bg: '#FDF3DB', text: '#956400' },
          fun: { bg: '#FDEBEC', text: '#9F2F2D' },
        },
      },
    },
  },
  plugins: [],
};

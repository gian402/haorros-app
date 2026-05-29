/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#6C63FF',
        secondary: '#FF6584',
        accent: '#00D4AA',
        dark: {
          bg: '#0F0F1A',
          card: '#1A1A2E',
          surface: '#16213E',
          border: '#2A2A4A',
        },
      },
    },
  },
  plugins: [],
};

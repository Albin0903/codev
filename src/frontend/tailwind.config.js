/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#0d69f2',
        'primary-light': '#F0EEFF',
        'primary-dark': '#372E75',
        'background-light': '#f5f7f8',
        'background-dark': '#101722',
        'card-dark': 'rgba(30, 41, 59, 0.6)',
        'card-light': 'rgba(255, 255, 255, 0.6)',
        'border-dark': 'rgba(51, 65, 85, 0.4)',
        'border-light': 'rgba(255, 255, 255, 0.8)',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
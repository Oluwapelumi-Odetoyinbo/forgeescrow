/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#c5f015',
        secondary: '#8a2be2',
        accent: '#00ffff',
        background: '#0a0a0a',
        surface: '#121212',
        text: '#FFFFFF',
        textSecondary: '#A3A3A3',
        border: 'rgba(255, 255, 255, 0.1)',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['Raleway', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(197, 240, 21, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(197, 240, 21, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}

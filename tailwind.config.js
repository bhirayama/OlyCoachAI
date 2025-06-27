/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          primary: '#1a2332',
          secondary: '#243447',
        },
        electric: '#00d4ff',
        teal: '#00b8a3',
        orange: {
          DEFAULT: '#ff6b35',
          light: '#ff8f65',
        },
        text: {
          primary: '#ffffff',
          secondary: '#e8eaed',
          disabled: '#9ca3af',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'sweep-movement': 'sweep-movement 8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'sweep-movement': {
          '0%, 100%': { transform: 'translateX(-100%) translateY(50%)' },
          '50%': { transform: 'translateX(0%) translateY(-50%)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      boxShadow: {
        'glow-orange': '0 0 20px rgba(255, 107, 53, 0.4)',
        'glow-electric': '0 0 20px rgba(0, 212, 255, 0.4)',
      },
    },
  },
  plugins: [],
}
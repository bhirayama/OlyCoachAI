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
        // Olympic Power Theme
        'navy-primary': '#1a2332',
        'navy-secondary': '#243447',
        'electric-blue': '#00d4ff',
        'teal-accent': '#00b8a3',
        'orange': '#ff6b35',
        'orange-light': '#ff7a47',

        // Text colors
        'text-primary': '#ffffff',
        'text-secondary': '#e8eaed',
        'text-disabled': '#9ca3af',

        // Status colors
        'success-green': '#10b981',
        'warning-amber': '#f59e0b',
        'error-red': '#ef4444',

        // Simplified aliases
        'electric': '#00d4ff',
        'teal': '#00b8a3'
      },
      boxShadow: {
        'glow-orange': '0 4px 20px rgba(255, 107, 53, 0.4)',
        'glow-electric': '0 4px 20px rgba(0, 212, 255, 0.4)',
      },
      animation: {
        'sweep-movement': 'sweep-movement 8s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
      },
      keyframes: {
        'sweep-movement': {
          '0%, 100%': { transform: 'translateX(-100%) translateY(50%)' },
          '50%': { transform: 'translateX(0%) translateY(-50%)' }
        },
        fadeInUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(30px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      }
    },
  },
  plugins: [],
}
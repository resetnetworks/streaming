/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        fadeInUp: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(30px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'fadeInUp': 'fadeInUp 0.8s ease-out forwards',
        'pulse-glow': 'pulse 2s ease-in-out infinite',
      },
      fontFamily: {
        'jura': ['Jura', 'sans-serif'],
      },
      colors: {
        'landing-blue': {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      },
      backdropBlur: {
        'xs': '2px',
      },
      dropShadow: {
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-strong': '0 0 30px rgba(59, 130, 246, 0.8)',
      }
    },
  },
  plugins: [],
};

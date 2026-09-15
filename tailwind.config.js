/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#059669',        // Neon Emerald Primary
        secondary: '#10B981',      // Vibrant Botanical Emerald
        accentGold: '#F59E0B',     // Liquid Gold
        liquidGold: '#D4AF37',     // Pure Gold Accent
        velvetDark: '#06150D',     // Ultra Deep Velvet Dark Bg
        forestVelvet: '#0B2B1A',   // Velvet Forest Surface
        ecoLight: '#F2F7F4',       // Clean Eco Light Bg
        cardoraEmerald: '#047857', // Deep Emerald Token
        sage: '#D1E5D7',
        lightSage: '#E6F4EA',
        bgLight: '#F2F7F4',
        cardBg: '#FFFFFF',
        heading: '#06150D',
        bodyText: '#374151',
        borderColor: '#CDE3D5',
        darkForest: '#06150D',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        space: ['Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        '20': '20px',
        '30': '30px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        soft: '0 10px 30px -5px rgba(5, 150, 105, 0.08)',
        cardGlow: '0 0 25px rgba(16, 185, 129, 0.2)',
        goldGlow: '0 0 25px rgba(245, 158, 11, 0.35)',
        emeraldGlow: '0 0 30px rgba(5, 150, 105, 0.3)',
        glass: '0 8px 32px 0 rgba(6, 21, 13, 0.1)',
      },
    },
  },
  plugins: [],
}
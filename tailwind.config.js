/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1F5E3B',       // Primary Green
        secondary: '#5C8D4E',     // Secondary Green
        sage: '#DDEFD9',          // Light Sage
        lightSage: '#DDEFD9',
        bgLight: '#F8FAF7',       // Background
        cardBg: '#FFFFFF',        // Cards
        accentGold: '#C9A227',    // Accent Gold
        heading: '#17331F',       // Heading
        bodyText: '#4A5568',      // Body Text
        borderColor: '#D7E6D5',   // Borders
        darkForest: '#17331F',    // Dark Forest Green
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
        soft: '0 10px 30px -5px rgba(31, 94, 59, 0.08)',
        cardGlow: '0 0 25px rgba(31, 94, 59, 0.15)',
        goldGlow: '0 0 20px rgba(201, 162, 39, 0.3)',
        glass: '0 8px 32px 0 rgba(23, 51, 31, 0.08)',
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        alpha: {
          50: '#C2ECFD',   // Light Blue
          100: '#47C4E6',  // Sky Aqua
          200: '#2B57D0',  // Royal Azure
          300: '#141685',  // Electric Royal
          400: '#092849',  // Prussian Blue
          500: '#092849',  // Prussian Blue (primary)
          600: '#141685',  // Electric Royal
          700: '#2B57D0',  // Royal Azure
          800: '#47C4E6',  // Sky Aqua
          900: '#C2ECFD',  // Light Blue
        }
      }
    },
  },
  plugins: [],
}

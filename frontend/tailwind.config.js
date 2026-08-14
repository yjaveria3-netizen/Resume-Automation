/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        khaki: {
          light: '#F5F2EB',
          DEFAULT: '#C3B091',
        },
        'olive-wood': '#2C302E',
        sage: {
          DEFAULT: '#8A9A86',
          hover: '#73836F',
        },
      },
    },
  },
  plugins: [],
}
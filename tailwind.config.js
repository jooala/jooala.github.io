/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Space Grotesk', 'sans-serif'], // Re-mapping old utility to new font
        inter: ['Inter', 'sans-serif'],
        oswald: ['Oswald', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

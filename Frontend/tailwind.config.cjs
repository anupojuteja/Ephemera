/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette 3 – "Insta Sunset"
        sunset: {
          50:  "#fff5f7",
          100: "#ffe4e8",
          200: "#ffbfd1",
          300: "#ff94b5",
          400: "#ff5a8c",
          500: "#ff2d6f",
          600: "#e0155c",
          700: "#b30f49",
          800: "#800a34",
          900: "#4d041f",
        },
      },
    },
  },
  plugins: [],
};

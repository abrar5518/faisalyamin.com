/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
        serif: ["var(--font-playfair)"],
      },
      colors: {
        brand: {
          bg: "var(--brand-bg)",
          text: "var(--brand-text)",
          border: "var(--brand-border)",
          surface: "var(--brand-surface)",
          primary: "var(--brand-primary)",
          primaryHover: "var(--brand-primary-hover)",
        },
      },
    },
  },
  plugins: [],
};

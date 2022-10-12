/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      maxWidth: {
        content: "1024px",
      },
      maxHeight: {
        autocompleteResults: "500px",
      },
    },
  },
  plugins: [],
};

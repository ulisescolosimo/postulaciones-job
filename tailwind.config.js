/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'dark-primary': '#1A1A1A',
        'dark-secondary': '#2D2D2D',
        'dark-accent': '#3A3A3A',
      },
    },
  },
  plugins: [],
}

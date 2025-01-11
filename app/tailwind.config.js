/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        th: {
          background: 'var(--background)',
          foreground: 'var(--foreground)',
          primary: 'var(--primary)',
          secondary: 'var(--secondary)',
          muted: 'var(--muted)',
          red: 'var(--red)'
        },
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}


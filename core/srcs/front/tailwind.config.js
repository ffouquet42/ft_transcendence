/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./front_srcs/**/*.{html,ts}",
      "./index.html",
    ],
    theme: {
      extend: {
        colors: {
          primary: '#1a1a1a',
          secondary: '#ffffff',
          accent: '#4a90e2',
        },
        fontFamily: {
          sans: ['Arial', 'sans-serif'],
        },
      },
    },
    plugins: [],
  };
  
   
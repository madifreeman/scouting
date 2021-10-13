const colors = require('tailwindcss/colors');

module.exports = {
  mode: 'jit',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        black: colors.black,
        white: colors.white,
        gray: colors.coolGray,
        red: colors.red,
        yellow: colors.amber,
        green: colors.emerald,
        teal: colors.cyan,
        indigo: colors.indigo,
        'energy-yellow': '#FFB900',
      },
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      textColor: ['disabled'],
      cursor: ['disabled'],
      
    },
  },
  plugins: [],
}

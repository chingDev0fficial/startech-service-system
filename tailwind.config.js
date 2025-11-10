module.exports = {
  darkMode: 'class', // Fixed typo: darckMode -> darkMode (though not needed for light-only mode)
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.vue",
  ],
  theme: {
    extend: {
      keyframes: {
        drawCircle: {
          '0%': { transform: 'rotate(-360deg)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'rotate(0deg)', opacity: '1' },
        },
      },
      animation: {
        drawCircle: 'drawCheck 1s ease-in-out forwards',
      },
    },
  },
  plugins: [],
}

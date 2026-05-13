module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: '#0A0F0D',
        card: '#111714',
        'card-alt': '#161D19',
        border: '#1E2E25',
        green: {
          DEFAULT: '#22C55E',
          light: '#4ADE80',
          dark: '#16A34A',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'DM Sans', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#16697A',
        error: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
        info: '#3B82F6',
        backgroundDefault: '#EDE7E3',
        backgroundPaper: '#FFFFFF',
        textPrimary: '#212121',
        textSecondary: '#555555',
      },
    },
  },
  plugins: [],
};

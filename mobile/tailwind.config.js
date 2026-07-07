/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#09090b',
        surface: '#18181b',
        stroke: '#27272a',
        muted: '#71717a',
        'text-primary': '#fafafa',
      },
      fontFamily: {
        display: ['InstrumentSerif_400Regular_Italic'],
        body: ['Inter_400Regular'],
        'body-medium': ['Inter_500Medium'],
        'body-semibold': ['Inter_600SemiBold'],
        'body-bold': ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
};

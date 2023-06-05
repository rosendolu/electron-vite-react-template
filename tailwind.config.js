/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  // corePlugins: {
  //   preflight: false
  // },
  plugins: [],
  extend: {
    spacing: {
      '8px': '8px',
      '16px': '16px',
    },
  },
};

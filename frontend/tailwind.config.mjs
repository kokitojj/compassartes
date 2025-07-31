/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#FF8C42', // Naranja vibrante
        secondary: '#6B7A8F', // gris
        backblue: '#0e0e28', // Azul oscuro para fondos
        mediumblue: '#2C5F8A', // Azul medio
      },
    },
  },
  plugins: [],
};

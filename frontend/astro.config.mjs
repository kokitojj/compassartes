import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import node from '@astrojs/node';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://astro.build/config
export default defineConfig({
  // Habilita el modo de renderizado en servidor (SSR).
  output: 'server',

  // AÑADIR ESTA LÍNEA: Configura el adaptador de Node.js para que la aplicación
  // sepa cómo ejecutarse en un entorno de servidor.
  adapter: node({
    mode: 'standalone',
  }),

  integrations: [tailwind(), react()],
  base: '/',
  vite: {
    envPrefix: 'VITE_',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src').replace(/\\/g, '/'),
      },
    },
  },
});

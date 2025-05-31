import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import React from 'react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      exclude: ['fs', 'path', 'os'], // Исключаем модули, которые могут вызывать проблемы
      globals: {
        Buffer: true,
        process: true,
        global: true,
      },
    }),
  ],
  define: {
    'process.env': {},
  },
});

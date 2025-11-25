import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import appdevDesignMode from '../../src/index';

export default defineConfig({
  plugins: [
    react(),
    appdevDesignMode({
      enabled: true,
      verbose: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['node_modules', 'dist'],
    }),
  ],
  server: {
    port: 5175,
    fs: {
      allow: ['..', '../../src'],
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import appdevDesignMode from '@xagi/vite-plugin-design-mode';

export default defineConfig({
  plugins: [
    react(),
    appdevDesignMode({
      enabled: true,
      verbose: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['node_modules', 'dist'],
    }),
  ]
});

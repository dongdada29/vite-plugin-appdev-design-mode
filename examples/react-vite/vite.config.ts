import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import appdevDesignMode from '@xagi/vite-plugin-design-mode';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
      appdevDesignMode()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }
});

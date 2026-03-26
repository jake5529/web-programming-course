import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      include: ['src/components/MainComponents/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.{test,spec}.{ts,tsx}',
        '**/index.{ts,tsx}',
        '**/*.d.ts',
        'generated/',
        'mock-server/',
      ],
    },
    server: {
      deps: {
        inline: ['html-encoding-sniffer', '@exodus/bytes'],
        fallbackCJS: true
      }
    },
  },
  optimizeDeps: {
    include: ['html-encoding-sniffer', '@exodus/bytes']
  }
});
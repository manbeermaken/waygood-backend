import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, 
    environment: 'node', 
    setupFiles: ['./tests/setup.ts'], 
    include: ['tests/**/*.test.ts'], 
    coverage: {
      provider: 'v8',
      exclude: [
        'src/config/**', 
        'src/types.d.ts', 
        'src/scripts/**',
        'tests/setup.ts'
      ],
    },
  },
});
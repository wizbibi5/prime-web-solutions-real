import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/hooks/index.tsx',
    'src/components/index.tsx',
    'src/providers/index.tsx',
  ],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  external: ['react', 'react-dom', '@supabase/supabase-js'],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});

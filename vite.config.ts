import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import builtinModules from 'builtin-modules';

import pkg from './package.json' with { type: 'json' };
const externals = Object.keys(pkg.dependencies || {});

export default defineConfig({
  build: {
    target: 'node20',
    outDir: 'dist',
    minify: true,
    sourcemap: false,
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/index.ts',
      output: {
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
      preserveEntrySignatures: 'strict',
      external: [
        ...builtinModules,
        ...externals,
        'fastify-plugin',
      ]
    },
  },
  plugins: [tsconfigPaths()],
  ssr: {
    external: [...builtinModules]
  },
  define: {
    'process.env': 'process.env'
  },
});

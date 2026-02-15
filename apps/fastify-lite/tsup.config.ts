import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  sourcemap: false,
  minify: true,

  // Bundle workspace packages but exclude external deps
  noExternal: [/^@workspace\//],

  // External dependencies (don't bundle these)
  external: [
    // Fastify ecosystem
    'fastify',
    '@fastify/cookie',
    '@fastify/cors',
    '@fastify/helmet',
    '@fastify/rate-limit',

    // Other large deps
    '@t3-oss/env-core',
    'zod',
  ],

  // Handle TypeScript compilation
  esbuildOptions(options) {
    options.resolveExtensions = ['.ts', '.tsx', '.js', '.jsx']
    options.conditions = ['typescript']
  },
})

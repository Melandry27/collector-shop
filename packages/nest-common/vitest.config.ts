import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// SWC compile les décorateurs avec leurs métadonnées (emitDecoratorMetadata),
// indispensables à l'injection de dépendances de NestJS ; esbuild, utilisé par défaut, ne le fait pas.
export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/main.ts', 'src/index.ts'],
    },
  },
});

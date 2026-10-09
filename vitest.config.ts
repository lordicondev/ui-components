import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: { alias: { '@shared': resolve(import.meta.dirname, 'shared') } },
    test: {
        environment: 'happy-dom',
        include: ['shared/**/*.test.ts', 'scripts/**/*.test.ts'],
    },
});

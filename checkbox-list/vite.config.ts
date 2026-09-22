import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    // A relative base, so the build works from any path.
    base: './',
    resolve: {
        alias: { '@shared': resolve(import.meta.dirname, 'shared') },
    },
});

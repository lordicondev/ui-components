import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    // A relative base means the build runs from anywhere — a server, a subdirectory,
    // or straight off disk.
    base: './',
    resolve: {
        alias: { '@shared': resolve(import.meta.dirname, 'shared') },
    },
});

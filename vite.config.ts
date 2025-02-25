import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createRequire } from "module";
import tailwindcss from "@tailwindcss/vite";
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

const require = createRequire(import.meta.url);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      buffer: require.resolve("buffer/"),
      process: require.resolve("process/browser"),
      stream: 'stream-browserify',
      zlib: 'browserify-zlib',
      util: 'util',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
      ],
    },
  },
  build: {
    rollupOptions: {}, // No inject needed
  }
});

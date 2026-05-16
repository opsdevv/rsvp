import { defineConfig } from "vite";

/** Bundles `src/rsvp-entry.ts` → `public/assets/rsvp.js` for PHP embedding. */
export default defineConfig({
  publicDir: false,
  build: {
    lib: {
      entry: "src/rsvp-entry.ts",
      name: "RSVP",
      fileName: () => "rsvp.js",
      formats: ["iife"],
    },
    outDir: "public/assets",
    emptyOutDir: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});

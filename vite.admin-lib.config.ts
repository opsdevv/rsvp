import { defineConfig } from "vite";

/** Bundles `src/admin-entry.ts` → `public/assets/admin.js` for PHP embedding. */
export default defineConfig({
  publicDir: false,
  build: {
    lib: {
      entry: "src/admin-entry.ts",
      name: "RSVPAdmin",
      fileName: () => "admin.js",
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

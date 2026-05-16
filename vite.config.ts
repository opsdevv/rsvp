import type { Plugin } from "vite";
import { defineConfig } from "vite";

/** Dev: /admin and /admin/ serve the admin dashboard (same as /admin.html). */
function adminRoutePlugin(): Plugin {
  return {
    name: "admin-route",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const raw = (req as { url?: string }).url ?? "";
        const path = raw.split("?")[0] ?? "";
        if (path === "/admin" || path === "/admin/") {
          (req as { url?: string }).url = "/admin.html";
        }
        next();
      });
    },
  };
}

/** Dev server + static build for RSVP and admin pages. */
export default defineConfig({
  root: ".",
  publicDir: "public",
  plugins: [adminRoutePlugin()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: "index.html",
        admin: "admin.html",
      },
    },
  },
  server: {
    port: 5173,
  },
});

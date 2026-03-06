import type { Express } from "express";
import type { Server } from "http";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function setupVite(httpServer: Server, app: Express) {
  const vite = await createViteServer({
    root: path.resolve(__dirname, "../client"),
    server: {
      middlewareMode: true,
      hmr: { server: httpServer },
      allowedHosts: "all",
    },
    appType: "spa",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "../client/src"),
        "@shared": path.resolve(__dirname, "../shared"),
      },
    },
  });

  app.use(vite.middlewares);
}

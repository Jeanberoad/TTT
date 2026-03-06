import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertConfigurationSchema } from "@shared/schema";

export async function registerRoutes(httpServer: Server, app: Express) {
  app.get("/api/config", async (_req: Request, res: Response) => {
    try {
      const config = await storage.getConfig();
      res.json(config);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/config", async (req: Request, res: Response) => {
    try {
      const parsed = insertConfigurationSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation error",
          errors: parsed.error.errors,
        });
      }
      const config = await storage.updateConfig(parsed.data);
      res.json(config);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });
}

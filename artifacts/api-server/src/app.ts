import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import adminRouter from "./routes/admin";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health-check — first route, no auth, used by external uptime monitors
app.get("/health-check", (_req, res): void => {
  console.log("Ping de santé reçu");
  res.status(200).json({ status: "up" });
});

// Admin dashboard + admin API — mounted at root so /admin and /api/admin/* work
app.use(adminRouter);

// All other API routes under /api
app.use("/api", router);

export default app;

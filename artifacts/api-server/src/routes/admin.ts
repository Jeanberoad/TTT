import { Router, type IRouter } from "express";
import { basicAuth } from "../middlewares/basicAuth";
import { getPendingPaymentsCount, clearPendingPayments, invalidateTokenCache } from "../lib/mvola";
import { getRecentLogs } from "../lib/logBuffer";
import { getPaymentAttempts } from "../lib/paymentLog";
import { getFullConfig, saveConfig, CONFIG_FIELDS } from "../lib/configStore";
import { ADMIN_DASHBOARD_HTML } from "../lib/dashboardHtml";

const router: IRouter = Router();

const START_TIME = Date.now();

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}j ${h % 24}h ${m % 60}m`;
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

// ── Dashboard HTML ─────────────────────────────────────────────────────────────

router.get("/admin", basicAuth, (_req, res): void => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(ADMIN_DASHBOARD_HTML);
});

// ── API: Status ───────────────────────────────────────────────────────────────

router.get("/api/admin/status", basicAuth, (_req, res): void => {
  res.json({
    uptime:        formatUptime(Date.now() - START_TIME),
    uptimeMs:      Date.now() - START_TIME,
    pendingPayments: getPendingPaymentsCount(),
    serverTime:    new Date().toISOString(),
    nodeVersion:   process.version,
    env:           process.env.NODE_ENV ?? "development",
  });
});

// ── API: Clear pending payments ───────────────────────────────────────────────

router.post("/api/admin/clear-pending", basicAuth, (_req, res): void => {
  const count = clearPendingPayments();
  res.json({ cleared: count, message: `${count} paiement(s) en attente annulé(s)` });
});

// ── API: Payment history ──────────────────────────────────────────────────────

router.get("/api/admin/payments", basicAuth, (_req, res): void => {
  res.json(getPaymentAttempts());
});

// ── API: Logs ─────────────────────────────────────────────────────────────────

router.get("/api/admin/logs", basicAuth, (req, res): void => {
  const n = Math.min(Number(req.query.n ?? 100), 200);
  res.json(getRecentLogs(n));
});

// ── API: Config (read) ────────────────────────────────────────────────────────

router.get("/api/admin/config", basicAuth, (_req, res): void => {
  const raw = getFullConfig();
  const fields = CONFIG_FIELDS.map(f => ({
    key:   f.key,
    label: f.label,
    value: f.secret ? (raw[f.key] ? "••••••••" : "") : (raw[f.key] ?? ""),
    rawValue: raw[f.key] ?? "",
    secret:   f.secret,
    description: f.description,
    default:     f.default,
  }));
  res.json(fields);
});

// ── API: Config (write) ───────────────────────────────────────────────────────

router.post("/api/admin/config", basicAuth, (req, res): void => {
  const body = req.body as Record<string, string>;

  const allowed = new Set(CONFIG_FIELDS.map(f => f.key));
  const updates: Record<string, string> = {};

  for (const [k, v] of Object.entries(body)) {
    if (!allowed.has(k)) continue;
    if (typeof v !== "string") continue;
    // Skip masked values (secret fields that weren't changed)
    if (v === "••••••••") continue;
    updates[k] = v.trim();
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "Aucune modification valide reçue" });
    return;
  }

  saveConfig(updates);

  // Invalidate cached MVola token so next request uses new credentials
  if ("MVOLA_CONSUMER_KEY" in updates || "MVOLA_CONSUMER_SECRET" in updates) {
    invalidateTokenCache();
  }

  res.json({ saved: Object.keys(updates), message: "Configuration sauvegardée" });
});

export default router;

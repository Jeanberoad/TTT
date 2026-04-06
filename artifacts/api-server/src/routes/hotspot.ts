import { Router, type IRouter } from "express";
import { initiateAndVerifyPayment } from "../lib/mvola";
import { createHotspotUser } from "../lib/mikrotik";
import { logger } from "../lib/logger";
import { logPaymentAttempt } from "../lib/paymentLog";

const router: IRouter = Router();

// ── Plan catalogue (matches frontend PLAN_DATA planId values) ─────────────────
const PLANS: Record<string, { amount: number; profile: string; label: string }> = {
  AB:      { amount: 30000, profile: "AB",     label: "1 mois"     },
  "24h":   { amount: 3000,  profile: "24h",    label: "24 heures"  },
  "1h30m": { amount: 1000,  profile: "1h30m",  label: "1h 30m"     },
  "30m":   { amount: 500,   profile: "30m",    label: "30 minutes" },
};

/**
 * POST /api/hotspot/purchase
 * Body: { phone: string, plan: "AB" | "24h" | "1h30m" | "30m" }
 * Returns: { username, password, transactionId }
 */
router.post("/hotspot/purchase", async (req, res): Promise<void> => {
  const { phone, plan } = req.body as { phone?: string; plan?: string };

  if (!phone || !plan) {
    res.status(400).json({ error: "Missing required fields: phone, plan" });
    return;
  }

  const planConfig = PLANS[plan];
  if (!planConfig) {
    res.status(400).json({
      error: `Unknown plan "${plan}". Valid values: ${Object.keys(PLANS).join(", ")}`,
    });
    return;
  }

  req.log.info(
    { phone, plan, amount: planConfig.amount, profile: planConfig.profile },
    "[Hotspot] Purchase request received"
  );

  // ── Step 1: MVola payment ──────────────────────────────────────────────────
  const payment = await initiateAndVerifyPayment({
    amount:         planConfig.amount,
    customerMsisdn: phone,
    description:    `Hotspot ${planConfig.label}`,
  });

  if (!payment.success) {
    req.log.warn({ reason: payment.message }, "[Hotspot] MVola payment failed");

    logPaymentAttempt({
      time:    new Date().toISOString(),
      phone,
      plan,
      amount:  planConfig.amount,
      status:  payment.message?.includes("timeout") ? "timeout" : "failed",
      message: payment.message,
    });

    res.status(402).json({ error: `Payment failed: ${payment.message}` });
    return;
  }

  req.log.info({ transactionId: payment.transactionId }, "[Hotspot] MVola payment accepted");

  // ── Step 2: MikroTik user creation ──────────────────────────────────────────
  let creds: { username: string; password: string };
  try {
    creds = await createHotspotUser({
      profile: planConfig.profile,
      comment: `MVola tx:${payment.transactionId} phone:${phone} plan:${plan}`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ err: msg }, "[Hotspot] MikroTik user creation failed");

    logPaymentAttempt({
      time:    new Date().toISOString(),
      phone,
      plan,
      amount:  planConfig.amount,
      status:  "failed",
      transactionId: payment.transactionId,
      message: `MikroTik error: ${msg}`,
    });

    res.status(500).json({ error: `Router error: ${msg}` });
    return;
  }

  // ── Log success ────────────────────────────────────────────────────────────
  logPaymentAttempt({
    time:    new Date().toISOString(),
    phone,
    plan,
    amount:  planConfig.amount,
    status:  "success",
    transactionId: payment.transactionId,
  });

  req.log.info({ username: creds.username }, "[Hotspot] Ticket created — returning credentials");

  res.json({
    username:      creds.username,
    password:      creds.password,
    transactionId: payment.transactionId,
  });
});

export default router;

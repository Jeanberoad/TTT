import { Router, type IRouter } from "express";
import { resolvePaymentCallback, type CallbackPayload } from "../lib/mvola";
import { logger } from "../lib/logger";

const router: IRouter = Router();

/**
 * POST or PUT /api/hotspot/mvola-callback
 *
 * MVola calls this URL once the customer confirms (or rejects) the payment.
 * The sandbox uses PUT; production may use POST — both are handled here.
 */
function handleCallback(req: import("express").Request, res: import("express").Response): void {
  const body = req.body as Record<string, unknown>;

  logger.info({ method: req.method, body }, "[MVola Callback] Received");

  // MVola callback body structure (may vary slightly between sandbox and prod)
  const serverCorrelationId =
    (body.serverCorrelationId as string) ??
    (body.ServerCorrelationId as string) ??
    "";

  const status =
    (body.status              as string) ??
    (body.Status              as string) ??
    (body.transactionStatus   as string) ??
    (body.TransactionStatus   as string) ??
    "unknown";

  const transactionReference =
    (body.transactionReference as string) ??
    (body.TransactionReference as string) ??
    undefined;

  const notificationDescription =
    (body.notificationDescription as string) ??
    (body.NotificationDescription as string) ??
    undefined;

  if (!serverCorrelationId) {
    logger.warn({ body }, "[MVola Callback] Missing serverCorrelationId — ignoring");
    res.status(200).json({ received: true });
    return;
  }

  const payload: CallbackPayload = {
    serverCorrelationId,
    status,
    transactionReference,
    notificationDescription,
    rawBody: body,
  };

  resolvePaymentCallback(payload);

  // MVola expects a 200 response to acknowledge receipt
  res.status(200).json({ received: true });
}

// Sandbox sends PUT; production may send POST — handle both
router.post("/hotspot/mvola-callback", handleCallback);
router.put("/hotspot/mvola-callback",  handleCallback);

export default router;

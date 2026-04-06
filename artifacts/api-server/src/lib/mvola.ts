import axios from "axios";
import { logger } from "./logger";

// ── Dynamic config helpers (read process.env at call time) ────────────────────

function getBaseUrl(): string {
  return process.env.MVOLA_BASE_URL ?? "https://devapi.mvola.mg";
}

function getCallbackUrl(): string {
  return (
    process.env.MVOLA_CALLBACK_URL ??
    "https://wdt-api.onrender.com/api/hotspot/mvola-callback"
  );

}

// ── OAuth token cache ─────────────────────────────────────────────────────────

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const consumerKey    = process.env.MVOLA_CONSUMER_KEY;
  const consumerSecret = process.env.MVOLA_CONSUMER_SECRET;
  if (!consumerKey || !consumerSecret) {
    throw new Error("MVOLA_CONSUMER_KEY or MVOLA_CONSUMER_SECRET is not set");
  }

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  logger.info("[MVola] Fetching OAuth access token");

  const { data } = await axios.post(
    `${getBaseUrl()}/token`,
    "grant_type=client_credentials&scope=EXT_INT_MVOLA_SCOPE&validity_period=1",
    {
      headers: {
        Authorization:  `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
      timeout: 15000,
    }
  );

  if (!data.access_token) {
    throw new Error(`MVola token response missing access_token: ${JSON.stringify(data)}`);
  }

  cachedToken = data.access_token as string;
  const expiresIn = (data.expires_in ?? 3600) as number;
  tokenExpiry = Date.now() + expiresIn * 900; // cache for 90% of lifetime

  logger.info({ expiresIn }, "[MVola] Access token obtained");
  return cachedToken;
}

/** Call this from admin when the consumer key/secret changes. */
export function invalidateTokenCache(): void {
  cachedToken = null;
  tokenExpiry = 0;
}

// ── Pending payment registry ──────────────────────────────────────────────────

interface PendingResolver {
  resolve: (result: CallbackPayload) => void;
  reject:  (err: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

export interface CallbackPayload {
  serverCorrelationId: string;
  status:   string;
  transactionReference?:    string;
  notificationDescription?: string;
  rawBody: unknown;
}

const pendingPayments = new Map<string, PendingResolver>();

export function getPendingPaymentsCount(): number {
  return pendingPayments.size;
}

export function clearPendingPayments(): number {
  const count = pendingPayments.size;
  for (const [, entry] of pendingPayments) {
    clearTimeout(entry.timeoutId);
    entry.reject(new Error("Cleared by admin"));
  }
  pendingPayments.clear();
  return count;
}

/** Called by the callback route once MVola notifies us of a result. */
export function resolvePaymentCallback(payload: CallbackPayload): void {
  const entry = pendingPayments.get(payload.serverCorrelationId);
  if (!entry) {
    logger.warn(
      { serverCorrelationId: payload.serverCorrelationId },
      "[MVola] Callback for unknown correlationId (already resolved or timed out)"
    );
    return;
  }
  clearTimeout(entry.timeoutId);
  pendingPayments.delete(payload.serverCorrelationId);
  entry.resolve(payload);
}

function waitForCallback(serverCorrelationId: string, timeoutMs: number): Promise<CallbackPayload> {
  return new Promise<CallbackPayload>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      pendingPayments.delete(serverCorrelationId);
      reject(new Error(`MVola payment timeout after ${timeoutMs / 1000}s — no callback received`));
    }, timeoutMs);
    pendingPayments.set(serverCorrelationId, { resolve, reject, timeoutId });
  });
}

// ── Sanitize text for MVola fields ────────────────────────────────────────────

function mvolaText(text: string, maxLen = 50): string {
  return text.replace(/[^a-zA-Z0-9\s\-._,]/g, "").slice(0, maxLen).trim();
}

// ── Result type ───────────────────────────────────────────────────────────────

export interface MVolaPaymentResult {
  success: boolean;
  transactionId?:      string;
  serverCorrelationId?: string;
  status?:  string;
  message?: string;
  rawError?: unknown;
}

// ── Main payment function ─────────────────────────────────────────────────────

export async function initiateAndVerifyPayment(params: {
  amount: number;
  customerMsisdn: string;
  description: string;
  callbackTimeoutMs?: number;
}): Promise<MVolaPaymentResult> {
  const partnerMsisdn = process.env.MVOLA_PARTNER_MSISDN ?? "0343500003";

  const token = await getAccessToken();

  const correlationId   = `${Date.now()}`;
  const requestDate     = new Date().toISOString();
  const descriptionText = mvolaText(params.description, 50);

  const payload = {
    amount:      String(params.amount),
    currency:    "Ar",
    descriptionText,
    requestDate,
    debitParty:  [{ key: "msisdn", value: params.customerMsisdn }],
    creditParty: [{ key: "msisdn", value: partnerMsisdn }],
    metadata: [
      { key: "partnerName", value: "HotspotPortal" },
      { key: "fc",          value: "USD" },
      { key: "amountFc",    value: "1" },
    ],
    requestingOrganisationTransactionReference: correlationId,
    originalTransactionReference: "",
  };

  logger.info(
    { amount: params.amount, customer: params.customerMsisdn, correlationId },
    "[MVola] Initiating payment"
  );

  let serverCorrelationId: string;

  try {
    const response = await axios.post(
      `${getBaseUrl()}/mvola/mm/transactions/type/merchantpay/1.0.0/`,
      payload,
      {
        headers: {
          Authorization:         `Bearer ${token}`,
          "Content-Type":        "application/json",
          Version:               "1.0",
          "X-CorrelationID":     correlationId,
          "X-Callback-URL":      getCallbackUrl(),
          UserLanguage:          "MG",
          UserAccountIdentifier: `msisdn;${partnerMsisdn}`,
          partnerName:           "HotspotPortal",
          "Cache-Control":       "no-cache",
        },
        timeout: 20000,
      }
    );

    serverCorrelationId = response.data?.serverCorrelationId ?? correlationId;
    logger.info(
      { httpStatus: response.status, mvolaStatus: response.data?.status, serverCorrelationId },
      "[MVola] Payment initiated — waiting for customer confirmation"
    );
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) cachedToken = null;
      logger.error({ status: err.response?.status, data: err.response?.data }, "[MVola] Payment initiation failed");
      const d = err.response?.data;
      const message =
        d?.errorDescription ?? d?.ErrorDescription ??
        d?.fault?.description ?? d?.description ??
        d?.message ?? err.message;
      return { success: false, message, rawError: d };
    }
    throw err;
  }

  // ── Wait for MVola callback ────────────────────────────────────────────────
  const timeoutMs =
    params.callbackTimeoutMs ??
    (Number(process.env.PAYMENT_TIMEOUT_MS) || 120_000);

  try {
    const cb = await waitForCallback(serverCorrelationId, timeoutMs);
    logger.info({ serverCorrelationId, status: cb.status }, "[MVola] Callback received");

    if (cb.status?.toLowerCase() !== "completed") {
      return {
        success: false,
        serverCorrelationId,
        status:  cb.status,
        message: cb.notificationDescription ?? `Payment ${cb.status}`,
      };
    }
    return {
      success: true,
      serverCorrelationId,
      status:  cb.status,
      transactionId: cb.transactionReference ?? serverCorrelationId,
    };
  } catch (timeoutErr: unknown) {
    const message = timeoutErr instanceof Error ? timeoutErr.message : String(timeoutErr);
    logger.warn({ serverCorrelationId, message }, "[MVola] Callback timeout");
    return { success: false, serverCorrelationId, message };
  }
}

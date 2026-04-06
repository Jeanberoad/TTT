import { Router, type IRouter } from "express";
import axios from "axios";

const router: IRouter = Router();

// MVola sandbox test numbers
const SANDBOX_PARTNER_MSISDN = "0343500003"; // merchant (credit party)
const SANDBOX_CUSTOMER_MSISDN = "0343500004"; // test customer (debit party)

function getBaseUrl(): string {
  return process.env.MVOLA_BASE_URL ?? "https://devapi.mvola.mg";
}

async function getToken(): Promise<string> {
  const key    = process.env.MVOLA_CONSUMER_KEY;
  const secret = process.env.MVOLA_CONSUMER_SECRET;
  const creds  = Buffer.from(`${key}:${secret}`).toString("base64");

  const { data } = await axios.post(
    `${getBaseUrl()}/token`,
    "grant_type=client_credentials&scope=EXT_INT_MVOLA_SCOPE&validity_period=1",
    {
      headers: {
        Authorization:  `Basic ${creds}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
      timeout: 15000,
    }
  );
  return data.access_token as string;
}

/**
 * GET /api/test-mvola?phone=0343500004&amount=500
 *
 * Quick diagnostic endpoint — tries a single payment request and shows the
 * full MVola response.  Uses sandbox defaults if no params given.
 */
router.get("/test-mvola", async (req, res): Promise<void> => {
  const phone  = (req.query.phone  as string) ?? SANDBOX_CUSTOMER_MSISDN;
  const amount = (req.query.amount as string) ?? "500";
  const partnerMsisdn = process.env.MVOLA_PARTNER_MSISDN ?? SANDBOX_PARTNER_MSISDN;

  const envStatus = {
    MVOLA_CONSUMER_KEY:    !!process.env.MVOLA_CONSUMER_KEY,
    MVOLA_CONSUMER_SECRET: !!process.env.MVOLA_CONSUMER_SECRET,
    MVOLA_PARTNER_MSISDN:  !!process.env.MVOLA_PARTNER_MSISDN,
    BASE_URL: getBaseUrl(),
  };

  let token: string;
  try {
    token = await getToken();
  } catch (err) {
    res.status(502).json({
      step: "oauth_token_failed",
      envStatus,
      error: axios.isAxiosError(err) ? err.response?.data : String(err),
    });
    return;
  }

  const correlationId = `${Date.now()}`.slice(-10);
  const payload = {
    amount,
    currency: "Ar",
    descriptionText: "Hotspot ticket test",
    requestDate: new Date().toISOString(),
    requestingOrganisationTransactionReference: correlationId,
    originalTransactionReference: "",
    debitParty:  [{ key: "msisdn", value: phone }],
    creditParty: [{ key: "msisdn", value: partnerMsisdn }],
    metadata: [
      { key: "partnerName", value: "HotspotPortal" },
      { key: "fc",          value: "USD" },
      { key: "amountFc",    value: "1" },
    ],
  };

  const headers = {
    Authorization:         `Bearer ${token}`,
    "Content-Type":        "application/json",
    Version:               "1.0",
    "X-CorrelationID":     correlationId,
    "X-Callback-URL":      process.env.MVOLA_CALLBACK_URL ?? "https://wdt-api.onrender.com/api/hotspot/mvola-callback",
    UserLanguage:          "MG",
    UserAccountIdentifier: `msisdn;${partnerMsisdn}`,
    partnerName:           "HotspotPortal",
    "Cache-Control":       "no-cache",
  };

  try {
    const response = await axios.post(
      `${getBaseUrl()}/mvola/mm/transactions/type/merchantpay/1.0.0/`,
      payload,
      { headers, timeout: 20000 }
    );
    res.json({
      step: "payment",
      success: true,
      envStatus,
      tokenObtained: true,
      httpStatus: response.status,
      mvolaResponse: response.data,
      payloadSent: payload,
    });
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      res.json({
        step: "payment",
        success: false,
        envStatus,
        tokenObtained: true,
        httpStatus: err.response?.status,
        mvolaResponse: err.response?.data ?? null,
        payloadSent: payload,
      });
      return;
    }
    throw err;
  }
});

export default router;

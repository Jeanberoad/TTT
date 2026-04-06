import { RouterOSAPI } from "node-routeros";
import { logger } from "./logger";

function generateCredentials(): { username: string; password: string } {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  const username = `hs-${suffix}`;
  const password = Math.random().toString(36).slice(2, 10);
  return { username, password };
}

export async function createHotspotUser(params: {
  profile: string;
  limitUptime?: string;
  comment?: string;
}): Promise<{ username: string; password: string }> {
  const host = process.env.MIKROTIK_IP;
  const user = process.env.MIKROTIK_USER;
  const pass = process.env.MIKROTIK_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "MikroTik credentials (MIKROTIK_IP, MIKROTIK_USER, MIKROTIK_PASS) are not fully set"
    );
  }

  logger.info(
    { host, profile: params.profile },
    "[MikroTik] Connecting to router"
  );

  const conn = new RouterOSAPI({
    host,
    user,
    password: pass,
    timeout: 10,
  });

  await conn.connect();
  logger.info("[MikroTik] Connected");

  const creds = generateCredentials();

  const addParams: Record<string, string> = {
    name: creds.username,
    password: creds.password,
    profile: params.profile,
  };
  if (params.limitUptime) addParams["limit-uptime"] = params.limitUptime;
  if (params.comment) addParams.comment = params.comment;

  logger.info(
    { username: creds.username, profile: params.profile },
    "[MikroTik] Creating hotspot user"
  );

  await conn.write("/ip/hotspot/user/add", Object.entries(addParams).map(([k, v]) => `=${k}=${v}`));

  logger.info(
    { username: creds.username },
    "[MikroTik] Hotspot user created successfully"
  );

  conn.close();

  return creds;
}

import fs from "fs";
import path from "path";

const CONFIG_FILE = path.resolve(process.cwd(), "hotspot-config.json");

export interface ConfigField {
  key: string;
  label: string;
  secret: boolean;
  default: string;
  description: string;
}

export const CONFIG_FIELDS: ConfigField[] = [
  {
    key: "MVOLA_BASE_URL",
    label: "MVola API URL",
    secret: false,
    default: "https://devapi.mvola.mg",
    description: "Sandbox: devapi.mvola.mg — Production: api.mvola.mg",
  },
  {
    key: "MVOLA_PARTNER_MSISDN",
    label: "MSISDN Partenaire (Marchand)",
    secret: false,
    default: "0343500003",
    description: "Numéro MVola du marchand (sandbox: 0343500003)",
  },
  {
    key: "MVOLA_CONSUMER_KEY",
    label: "MVola Consumer Key",
    secret: true,
    default: "",
    description: "Clé API MVola (portail développeur)",
  },
  {
    key: "MVOLA_CONSUMER_SECRET",
    label: "MVola Consumer Secret",
    secret: true,
    default: "",
    description: "Secret API MVola (portail développeur)",
  },
  {
    key: "MVOLA_CALLBACK_URL",
    label: "MVola Callback URL",
    secret: false,
    default: "https://wdt-api.onrender.com/api/hotspot/mvola-callback",
    description: "URL que MVola appellera après confirmation du client",
  },
  {
    key: "MIKROTIK_IP",
    label: "IP MikroTik",
    secret: false,
    default: "",
    description: "Adresse IP du routeur MikroTik (API RouterOS)",
  },
  {
    key: "MIKROTIK_USER",
    label: "Utilisateur MikroTik",
    secret: false,
    default: "",
    description: "Nom d'utilisateur RouterOS",
  },
  {
    key: "MIKROTIK_PASS",
    label: "Mot de passe MikroTik",
    secret: true,
    default: "",
    description: "Mot de passe RouterOS",
  },
  {
    key: "PAYMENT_TIMEOUT_MS",
    label: "Timeout paiement (ms)",
    secret: false,
    default: "120000",
    description: "Délai max pour confirmation MVola (en millisecondes, défaut : 120000 = 2 min)",
  },
];

export function getConfigValue(key: string): string {
  const field = CONFIG_FIELDS.find(f => f.key === key);
  return process.env[key] ?? field?.default ?? "";
}

export function loadConfig(): void {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return;
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Record<string, string>;
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "string") {
        process.env[k] = v;
      }
    }
  } catch {
    // Config file missing or corrupt — ignore, use env defaults
  }
}

export function saveConfig(updates: Record<string, string>): void {
  // Apply to process.env immediately
  for (const [k, v] of Object.entries(updates)) {
    process.env[k] = v;
  }

  // Persist to file (merge with existing)
  let existing: Record<string, string> = {};
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      existing = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8")) as Record<string, string>;
    }
  } catch { /* ignore */ }

  const merged = { ...existing, ...updates };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), "utf-8");
}

export function getFullConfig(): Record<string, string> {
  const result: Record<string, string> = {};
  for (const field of CONFIG_FIELDS) {
    result[field.key] = getConfigValue(field.key);
  }
  return result;
}

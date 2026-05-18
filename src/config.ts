const API_KEY_REGEX = /^(pk|sk)_[0-9a-f]{32}$/;

export interface MotomarksConfig {
  apiBaseUrl: string;
  imageBaseUrl: string;
  secretKey: string;
  publicKey: string;
  referer?: string;
  timeoutMs: number;
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export function sanitizeApiToken(raw: string | undefined): string | null {
  if (!raw) return null;

  const token = raw.trim();
  if (token.length === 0 || token.length > 255) return null;

  return API_KEY_REGEX.test(token) ? token : null;
}

export function redactSecret(value: string | undefined): string {
  if (!value) return "";
  if (value.length <= 10) return "***";
  return `${value.slice(0, 3)}_${"*".repeat(8)}${value.slice(-4)}`;
}

export function redactText(text: string, config?: Partial<MotomarksConfig>): string {
  let redacted = text;
  const keys = [config?.secretKey, config?.publicKey].filter(Boolean) as string[];

  for (const key of keys) {
    redacted = redacted.split(key).join(redactSecret(key));
  }

  return redacted;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): MotomarksConfig {
  const apiBaseUrl = parseUrl(env.MOTOMARKS_API_BASE_URL ?? "https://motomarks.io", "MOTOMARKS_API_BASE_URL");
  const imageBaseUrl = parseUrl(env.MOTOMARKS_IMAGE_BASE_URL ?? "https://motomarks.io/img", "MOTOMARKS_IMAGE_BASE_URL");
  const timeoutMs = parseTimeout(env.MOTOMARKS_TIMEOUT_MS);

  const secretKey = sanitizeApiToken(env.MOTOMARKS_SECRET_KEY);
  if (!secretKey || !secretKey.startsWith("sk_")) {
    throw new ConfigError("MOTOMARKS_SECRET_KEY must be a valid secret key starting with sk_.");
  }

  const publicKey = sanitizeApiToken(env.MOTOMARKS_PUBLIC_KEY);
  if (!publicKey || !publicKey.startsWith("pk_")) {
    throw new ConfigError("MOTOMARKS_PUBLIC_KEY must be a valid publishable key starting with pk_.");
  }

  return {
    apiBaseUrl,
    imageBaseUrl,
    secretKey,
    publicKey,
    referer: env.MOTOMARKS_REFERER?.trim() || undefined,
    timeoutMs,
  };
}

function parseUrl(raw: string, name: string): string {
  try {
    const url = new URL(raw);
    return url.toString().replace(/\/$/, "");
  } catch {
    throw new ConfigError(`${name} must be a valid URL.`);
  }
}

function parseTimeout(raw: string | undefined): number {
  if (!raw) return 10_000;

  const timeoutMs = Number.parseInt(raw, 10);
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new ConfigError("MOTOMARKS_TIMEOUT_MS must be a positive integer.");
  }

  return timeoutMs;
}

export type Band = "bajo" | "sospechoso" | "alto";

export type FeatureName =
  | "domain_new"
  | "lookalike_brand"
  | "punycode"
  | "ip_host"
  | "shortener"
  | "risky_tld"
  | "many_subdomains"
  | "at_symbol"
  | "urgency"
  | "payment"
  | "credentials"
  | "impersonation"
  | "emergency"
  | "prize";

export interface EngineInput {
  message?: string;
  url?: string;
  domain_age_days?: number | null;
  web_risk_hit?: boolean;
}

export interface EngineResult {
  probability: number;
  band: Band;
  registrable_domain: string;
  features: Record<FeatureName, number>;
  top_reasons: Array<FeatureName | "web_risk_hit">;
}

const protectedBrands: Record<string, string[]> = {
  bancoandino: ["bancoandino.pe"],
  pagofacil: ["pagofacil.com.pe"],
  correosur: ["correosur.com"],
};

const shorteners = new Set(["bit.ly", "tinyurl.com", "t.co", "cutt.ly", "is.gd", "rb.gy", "shorturl.at"]);
const riskyTlds = new Set(["top", "xyz", "click", "zip", "mov", "cfd", "sbs", "rest"]);
const secondLevelDomains = new Set([
  "com.pe",
  "gob.pe",
  "org.pe",
  "edu.pe",
  "com.mx",
  "com.br",
  "com.ar",
  "co.uk",
  "com.co",
]);

const lexicon = {
  urgency: [
    "urgente",
    "inmediato",
    "inmediatamente",
    "ultimo aviso",
    "hoy mismo",
    "24 horas",
    "bloqueada",
    "bloqueado",
    "suspendida",
    "suspendido",
    "vence",
    "urgent",
    "immediately",
    "suspended",
    "locked",
    "final notice",
    "urgente!",
    "imediatamente",
    "bloqueada",
  ],
  payment: [
    "yape",
    "yapea",
    "yapeame",
    "yapear",
    "plin",
    "plinea",
    "plineame",
    "transferencia",
    "transfiere",
    "deposita",
    "deposito",
    "pix",
    "western union",
    "gift card",
    "tarjeta de regalo",
    "cripto",
    "bitcoin",
    "wire transfer",
    "pago pendiente",
  ],
  credentials: [
    "contrasena",
    "clave",
    "codigo de verificacion",
    "codigo sms",
    "pin",
    "cvv",
    "token",
    "password",
    "verification code",
    "one-time code",
    "senha",
    "codigo",
  ],
  impersonation: [
    "cambie de numero",
    "cambie mi numero",
    "este es mi nuevo numero",
    "soy tu hijo",
    "soy tu hija",
    "mama",
    "papa",
    "no le digas a nadie",
    "new number",
    "it's me",
    "mudei de numero",
  ],
  emergency: [
    "estoy en problemas",
    "tuve un accidente",
    "estoy en la comisaria",
    "estoy detenido",
    "en el hospital",
    "emergencia",
    "i'm in trouble",
    "emergency",
    "estou com problemas",
  ],
  prize: [
    "premio",
    "ganaste",
    "ganador",
    "sorteo",
    "reclama tu",
    "winner",
    "prize",
    "you won",
    "voce ganhou",
    "premio exclusivo",
  ],
} satisfies Record<string, string[]>;

const weights: Record<FeatureName, number> = {
  domain_new: 2.2,
  lookalike_brand: 3.0,
  punycode: 1.8,
  ip_host: 1.6,
  shortener: 0.9,
  risky_tld: 0.8,
  many_subdomains: 0.7,
  at_symbol: 1.0,
  urgency: 1.2,
  payment: 1.3,
  credentials: 1.7,
  impersonation: 1.5,
  emergency: 1.0,
  prize: 0.9,
};

const featureOrder = Object.keys(weights) as FeatureName[];
const homoglyphs: Record<string, string> = { "0": "o", "1": "l", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a" };

export function normalizeText(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/\p{M}/gu, "");
}

export function osaDistance(left: string, right: string): number {
  const matrix = Array.from({ length: left.length + 1 }, () => Array<number>(right.length + 1).fill(0));
  for (let i = 0; i <= left.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= right.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && left[i - 1] === right[j - 2] && left[i - 2] === right[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
      }
    }
  }
  return matrix[left.length][right.length];
}

export function registrableDomain(host: string): string {
  const parts = host.split(".");
  if (parts.length >= 3 && secondLevelDomains.has(parts.slice(-2).join("."))) return parts.slice(-3).join(".");
  return parts.slice(-2).join(".");
}

function parseUrl(input: string): { host: string; path: string; authority: string } {
  const candidate = input.includes("://") ? input : `http://${input}`;
  try {
    const parsed = new URL(candidate);
    const authority = candidate.match(/^[a-z][a-z\d+.-]*:\/\/([^/?#]*)/i)?.[1] ?? "";
    return { host: parsed.hostname.toLowerCase(), path: parsed.pathname.toLowerCase(), authority };
  } catch {
    return { host: "", path: "", authority: "" };
  }
}

function urlFeatures(
  url: string,
  ageDays: number | null | undefined,
): { features: Partial<Record<FeatureName, number>>; domain: string } {
  const { host, path, authority } = parseUrl(url);
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
  const domain = isIp ? host : host ? registrableDomain(host) : "";
  const label = isIp ? "" : (domain.split(".")[0] ?? "");
  const officialDomains = new Set(Object.values(protectedBrands).flat());

  let lookalike = 0;
  if (!officialDomains.has(domain)) {
    const normalizedLabel = label.replace(/[013457@]/g, (character) => homoglyphs[character]);
    const tokens = [normalizedLabel, ...normalizedLabel.split(/[-_]/).filter(Boolean)];
    for (const brand of Object.keys(protectedBrands)) {
      for (const token of tokens) {
        if (token && token !== brand && osaDistance(token, brand) <= 2 && token.length >= 4) lookalike = 1;
      }
      if (label && label !== brand && normalizedLabel.includes(brand)) lookalike = 1;
      if ((brand && host.replace(domain, "").includes(brand)) || (brand && path.includes(brand))) lookalike = 1;
    }
  }

  const ageSignal = ageDays == null ? 0.3 : ageDays < 30 ? 1 : ageDays < 180 ? 0.5 : 0;
  return {
    domain,
    features: {
      domain_new: ageSignal,
      lookalike_brand: lookalike,
      punycode: host.includes("xn--") ? 1 : 0,
      ip_host: isIp ? 1 : 0,
      shortener: shorteners.has(domain) || shorteners.has(host) ? 1 : 0,
      risky_tld: riskyTlds.has(host.split(".").at(-1) ?? "") ? 1 : 0,
      many_subdomains: (host.match(/\./g)?.length ?? 0) >= 4 ? 1 : 0,
      at_symbol: authority.includes("@") ? 1 : 0,
    },
  };
}

function textFeatures(message: string): Partial<Record<FeatureName, number>> {
  const normalized = normalizeText(message);
  const result: Partial<Record<FeatureName, number>> = {};
  for (const [name, words] of Object.entries(lexicon) as Array<[keyof typeof lexicon, string[]]>) {
    const matches = new Set<string>();
    for (const rawWord of words) {
      const word = normalizeText(rawWord);
      if (new RegExp(`(?<![a-z0-9])${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-z0-9])`).test(normalized)) {
        matches.add(word);
      }
    }
    result[name] = name === "urgency" ? Math.min(matches.size, 3) / 3 : matches.size > 0 ? 1 : 0;
  }
  return result;
}

export function extractUrl(message: string): string {
  const match = message.match(/(?:https?:\/\/[^\s<>"']+|(?:[\w-]+\.)+[a-z]{2,}(?:\/[^\s<>"']*)?)/i);
  if (!match) return "";
  const candidate = match[0].replace(/[),.;!?\]}]+$/g, "");
  return candidate.includes("://") ? candidate : `https://${candidate}`;
}

function round(value: number, digits: number): number {
  return Number(value.toFixed(digits));
}

export function score(input: EngineInput = {}): EngineResult {
  const message = input.message ?? "";
  const url = input.url ?? "";
  const features = Object.fromEntries(featureOrder.map((name) => [name, 0])) as Record<FeatureName, number>;
  let domain = "";
  if (url) {
    const urlResult = urlFeatures(url, input.domain_age_days);
    domain = urlResult.domain;
    Object.assign(features, urlResult.features);
  }
  Object.assign(features, textFeatures(message));

  const linearScore = -3 + featureOrder.reduce((total, name) => total + weights[name] * features[name], 0);
  let probability = 1 / (1 + Math.exp(-linearScore));
  if (input.web_risk_hit) probability = Math.max(probability, 0.99);
  const band: Band = probability < 0.2 ? "bajo" : probability < 0.6 ? "sospechoso" : "alto";
  const reasons: Array<FeatureName | "web_risk_hit"> = featureOrder
    .filter((name) => features[name] > 0)
    .map((name, index) => ({ name, value: round(weights[name] * features[name], 3), index }))
    .sort((a, b) => b.value - a.value || a.index - b.index)
    .slice(0, 3)
    .map(({ name }) => name);
  if (input.web_risk_hit) reasons.unshift("web_risk_hit");

  return {
    probability: round(probability, 4),
    band,
    registrable_domain: domain,
    features: Object.fromEntries(featureOrder.map((name) => [name, round(features[name], 4)])) as Record<
      FeatureName,
      number
    >,
    top_reasons: reasons.slice(0, 3),
  };
}

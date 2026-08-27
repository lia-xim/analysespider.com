const GATEWAY_BASE_URL = "https://tools.contextter.com/free-tools/v1";
const TOOL_PATH = "analysespider-crawler-view";
const TOOL_SCOPE = "tool_analysespider_crawler";
const CAP_ORIGIN = "https://cap.local";

export type EligibilityState = "yes" | "no" | "mixed" | "unknown";

export interface CrawlerReport {
  readonly fetchFacts: {
    readonly requestedUrl: string;
    readonly finalUrl: string;
    readonly status: number | null;
    readonly redirectChain: readonly {
      readonly url: string;
      readonly status: number;
      readonly location: string;
    }[];
    readonly contentType: string | null;
    readonly responseSizeBytes: number | null;
    readonly cacheState: "hit" | "miss" | "stale";
    readonly fetchState: "fetched" | "blocked_or_challenged" | "failed";
    readonly blockedReason: string | null;
    readonly failureReason: string | null;
    readonly fetchedAt: string;
  };
  readonly eligibility: {
    readonly pageFetch: EligibilityState;
    readonly searchCrawlerFetch: EligibilityState;
    readonly indexingAllowed: EligibilityState;
    readonly meaningfulContentExtractable: EligibilityState;
  };
  readonly indexability: {
    readonly metaRobots: readonly string[];
    readonly xRobotsTag: readonly string[];
    readonly noindex: boolean;
    readonly canonical: {
      readonly state: string;
      readonly url: string | null;
      readonly knownTargetStatus: number | null;
    };
    readonly titlePresent: boolean;
    readonly metaDescriptionPresent: boolean;
  };
  readonly extraction: {
    readonly htmlLanguage: string | null;
    readonly visibleMainTextLength: number;
    readonly extractionRatio: number;
    readonly h1Count: number;
    readonly headingOutline: readonly {
      readonly level: number;
      readonly text: string;
    }[];
    readonly meaningfulInternalLinks: number;
  };
  readonly crawlerMatrix: readonly {
    readonly crawlerId: string;
    readonly crawlerName: string;
    readonly purpose: "search" | "training" | "user_fetch";
    readonly state: "allowed" | "blocked" | "no_rule" | "unknown";
  }[];
  readonly findings: readonly {
    readonly code: string;
    readonly severity: "critical" | "warning" | "info";
    readonly nextAction: string;
  }[];
  readonly limitations: readonly string[];
}

interface CapProof {
  readonly token: string;
  readonly solutions: readonly number[];
  readonly instr?: unknown;
  readonly instrBlocked?: boolean;
  readonly instrTimeout?: boolean;
}

interface ActiveSession {
  readonly inputDigest: string;
  proof?: CapProof;
  error?: GatewayError;
}

interface CapInstance {
  readonly widget: { remove: () => void };
  readonly solve: () => Promise<{ readonly success: boolean }>;
}

type CapConstructor = new (config: Record<string, string>) => CapInstance;

declare global {
  interface Window {
    CAP_CUSTOM_FETCH?: (
      input: RequestInfo | URL,
      init?: RequestInit,
    ) => Promise<Response>;
    CAP_CUSTOM_WASM_URL?: string;
    CAP_PAKO_URL?: string;
  }
}

export class GatewayError extends Error {
  constructor(
    readonly code: string,
    readonly retryAfterSeconds?: number,
  ) {
    super(code);
    this.name = "GatewayError";
  }
}

const sessions = new Map<string, ActiveSession>();
let dispatcherInstalled = false;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function sessionRequest(
  input: RequestInfo | URL,
): { readonly id: string; readonly action: "challenge" | "redeem" } | null {
  const raw =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  try {
    const url = new URL(raw);
    if (url.origin !== CAP_ORIGIN) return null;
    const match = /^\/([^/]+)\/(challenge|redeem)$/u.exec(url.pathname);
    if (match == null) return null;
    return {
      id: match[1] ?? "",
      action: match[2] === "challenge" ? "challenge" : "redeem",
    };
  } catch {
    return null;
  }
}

async function publicError(response: Response): Promise<GatewayError> {
  const body: unknown = await response.json().catch(() => undefined);
  if (!isRecord(body) || !isRecord(body.error)) {
    return new GatewayError("SERVICE_UNAVAILABLE");
  }
  return new GatewayError(
    typeof body.error.code === "string"
      ? body.error.code
      : "SERVICE_UNAVAILABLE",
    typeof body.error.retryAfterSeconds === "number"
      ? body.error.retryAfterSeconds
      : undefined,
  );
}

function installDispatcher(): void {
  if (dispatcherInstalled) return;
  window.CAP_CUSTOM_FETCH = async (input, init) => {
    const request = sessionRequest(input);
    if (request == null) return window.fetch(input, init);
    const session = sessions.get(request.id);
    if (session == null) return Response.json({ error: "CAP_INVALID" });

    if (request.action === "challenge") {
      const response = await window.fetch(`${GATEWAY_BASE_URL}/challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: TOOL_SCOPE,
          inputDigest: session.inputDigest,
        }),
      });
      if (!response.ok) {
        session.error = await publicError(response);
        return Response.json({ error: session.error.code });
      }
      return Response.json(await response.json());
    }

    const body =
      typeof init?.body === "string"
        ? (JSON.parse(init.body) as Record<string, unknown>)
        : {};
    session.proof = {
      token: typeof body.token === "string" ? body.token : "",
      solutions: Array.isArray(body.solutions)
        ? body.solutions.filter((value): value is number =>
            Number.isInteger(value),
          )
        : [],
      ...(body.instr === undefined ? {} : { instr: body.instr }),
      ...(typeof body.instr_blocked === "boolean"
        ? { instrBlocked: body.instr_blocked }
        : {}),
      ...(typeof body.instr_timeout === "boolean"
        ? { instrTimeout: body.instr_timeout }
        : {}),
    };
    return Response.json({
      success: true,
      token: request.id,
      expires: Date.now() + 30_000,
    });
  };
  dispatcherInstalled = true;
}

function normalizePublicUrl(raw: string): string {
  const url = new URL(raw.trim());
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new GatewayError("VALIDATION_INVALID_INPUT");
  }
  if (url.username !== "" || url.password !== "" || url.hash !== "") {
    throw new GatewayError("VALIDATION_INVALID_INPUT");
  }
  url.hostname = url.hostname.toLowerCase();
  if (
    (url.protocol === "http:" && url.port === "80") ||
    (url.protocol === "https:" && url.port === "443")
  ) {
    url.port = "";
  }
  return url.toString();
}

async function digest(value: string): Promise<string> {
  const result = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(result), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

async function solveProof(inputDigest: string): Promise<CapProof> {
  if (
    typeof Worker !== "function" ||
    typeof crypto.subtle === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) {
    throw new GatewayError("CAP_UNSUPPORTED");
  }
  installDispatcher();
  window.CAP_CUSTOM_WASM_URL = "/vendor/cap/cap_wasm_bg.wasm";
  window.CAP_PAKO_URL = "/vendor/cap/pako_inflate.min.js";

  const id =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
          byte.toString(16).padStart(2, "0"),
        ).join("");
  const session: ActiveSession = { inputDigest };
  sessions.set(id, session);
  let cap: CapInstance | undefined;
  try {
    const capModule = await import("@cap.js/widget");
    const CapClass = capModule.default as unknown as CapConstructor;
    cap = new CapClass({ apiEndpoint: `${CAP_ORIGIN}/${id}/` });
    const solved = await cap.solve();
    if (!solved.success || session.proof === undefined) {
      throw session.error ?? new GatewayError("CAP_INVALID");
    }
    return session.proof;
  } finally {
    cap?.widget.remove();
    sessions.delete(id);
  }
}

function isCrawlerReport(value: unknown): value is CrawlerReport {
  return (
    isRecord(value) &&
    isRecord(value.fetchFacts) &&
    isRecord(value.eligibility) &&
    isRecord(value.indexability) &&
    isRecord(value.extraction) &&
    Array.isArray(value.crawlerMatrix) &&
    Array.isArray(value.findings) &&
    Array.isArray(value.limitations)
  );
}

export async function runCrawlerCheck(rawUrl: string): Promise<CrawlerReport> {
  let normalizedUrl: string;
  try {
    normalizedUrl = normalizePublicUrl(rawUrl);
  } catch (error) {
    if (error instanceof GatewayError) throw error;
    throw new GatewayError("VALIDATION_INVALID_INPUT");
  }

  const proof = await solveProof(await digest(normalizedUrl));
  const response = await window.fetch(`${GATEWAY_BASE_URL}/${TOOL_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: { url: normalizedUrl }, cap: proof }),
  });
  if (!response.ok) throw await publicError(response);
  const payload: unknown = await response.json().catch(() => undefined);
  if (
    !isRecord(payload) ||
    payload.success !== true ||
    !isCrawlerReport(payload.data)
  ) {
    throw new GatewayError("SERVICE_UNAVAILABLE");
  }
  return payload.data;
}

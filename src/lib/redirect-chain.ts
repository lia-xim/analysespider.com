export const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
export const MAX_REDIRECT_BLOCKS = 12;
export const MAX_REDIRECT_INPUT_BYTES = 64 * 1024;

export interface RedirectHop {
  requestUrl: string;
  status: number;
  location: string | null;
  resolvedLocation: string | null;
  cacheControl: string | null;
  xRobotsTag: string | null;
  isRedirect: boolean;
}

export interface RedirectChainResult {
  hops: RedirectHop[];
  findings: string[];
  unknowns: string[];
  rejectedBlocks: number;
  capped: boolean;
  outcome: "complete" | "incomplete" | "loop" | "invalid";
}

export interface LiveRedirectEvidence {
  requestedUrl: string;
  finalUrl: string;
  status: number | null;
  redirectChain: readonly {
    url: string;
    status: number;
    location: string;
  }[];
}

export function formatLiveRedirectEvidence(evidence: LiveRedirectEvidence): string {
  const blocks = evidence.redirectChain.map((hop) =>
    [`URL: ${hop.url}`, `HTTP/2 ${hop.status}`, `Location: ${hop.location}`].join("\n"),
  );
  if (evidence.status != null && evidence.finalUrl) {
    blocks.push([`URL: ${evidence.finalUrl}`, `HTTP/2 ${evidence.status}`].join("\n"));
  }
  return blocks.join("\n\n");
}

const normaliseUrl = (value: string) => {
  const url = new URL(value);
  if (!/^https?:$/.test(url.protocol)) throw new Error("Only HTTP and HTTPS request URLs are supported.");
  return url.href;
};

export function parseRedirectChain(input: string): RedirectChainResult {
  const allBlocks = input.trim().split(/\r?\n\s*\r?\n/).filter(Boolean);
  const capped = allBlocks.length > MAX_REDIRECT_BLOCKS;
  const blocks = allBlocks.slice(0, MAX_REDIRECT_BLOCKS);
  const hops: RedirectHop[] = [];
  let rejectedBlocks = 0;

  for (const block of blocks) {
    const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const urlLine = lines.find((line) => /^URL\s*:/i.test(line));
    const statusLine = lines.find((line) => /^HTTP\//i.test(line));
    const status = Number(statusLine?.match(/\s(\d{3})(?:\s|$)/)?.[1]);
    if (!urlLine || !Number.isInteger(status)) {
      rejectedBlocks += 1;
      continue;
    }

    try {
      const requestUrl = normaliseUrl(urlLine.replace(/^URL\s*:/i, "").trim());
      const headers = new Map<string, string>();
      for (const line of lines) {
        if (line === urlLine || line === statusLine) continue;
        const split = line.indexOf(":");
        if (split < 1) continue;
        const name = line.slice(0, split).trim().toLowerCase();
        if (!headers.has(name)) headers.set(name, line.slice(split + 1).trim());
      }
      const location = headers.get("location") ?? null;
      let resolvedLocation: string | null = null;
      if (location) {
        try {
          resolvedLocation = normaliseUrl(new URL(location, requestUrl).href);
        } catch {}
      }
      hops.push({
        requestUrl,
        status,
        location,
        resolvedLocation,
        cacheControl: headers.get("cache-control") ?? null,
        xRobotsTag: headers.get("x-robots-tag") ?? null,
        isRedirect: REDIRECT_STATUSES.has(status),
      });
    } catch {
      rejectedBlocks += 1;
    }
  }

  if (!hops.length) {
    return {
      hops,
      findings: [],
      unknowns: ["No complete URL plus HTTP status block was recognised."],
      rejectedBlocks,
      capped,
      outcome: "invalid",
    };
  }

  const findings: string[] = [];
  const unknowns: string[] = capped ? [`Input contained more than ${MAX_REDIRECT_BLOCKS} blocks; only the first ${MAX_REDIRECT_BLOCKS} were analysed.`] : [];
  const seen = new Set<string>();
  let outcome: RedirectChainResult["outcome"] = "complete";

  for (let index = 0; index < hops.length; index += 1) {
    const hop = hops[index];
    if (seen.has(hop.requestUrl)) {
      findings.push(`Loop: ${hop.requestUrl} appears more than once as a requested URL.`);
      outcome = "loop";
    }
    seen.add(hop.requestUrl);

    if (hop.isRedirect && !hop.location) {
      findings.push(`Hop ${index + 1} uses redirect status ${hop.status} without a Location field.`);
      outcome = outcome === "loop" ? outcome : "incomplete";
    } else if (hop.isRedirect && !hop.resolvedLocation) {
      findings.push(`Hop ${index + 1} has a Location field that is not a supported HTTP(S) destination.`);
      outcome = outcome === "loop" ? outcome : "incomplete";
    }
    if (!hop.isRedirect && hop.location) {
      findings.push(`Hop ${index + 1} has a Location field on non-redirect status ${hop.status}; automatic redirect behavior is not established.`);
    }

    const next = hops[index + 1];
    if (hop.resolvedLocation && next && hop.resolvedLocation !== next.requestUrl) {
      findings.push(`Gap after hop ${index + 1}: Location resolves to ${hop.resolvedLocation}, but the next captured request is ${next.requestUrl}.`);
      outcome = outcome === "loop" ? outcome : "incomplete";
    }
  }

  const last = hops.at(-1)!;
  if (last.isRedirect) {
    unknowns.push("The capture ends on a redirect; the final response is unknown.");
    if (outcome === "complete") outcome = "incomplete";
  } else {
    findings.push(`Final captured response: ${last.status} at ${last.requestUrl}.`);
  }
  unknowns.push("Live availability, rendered content, canonical selection, intent equivalence, and search index state were not fetched or verified.");

  return { hops, findings, unknowns, rejectedBlocks, capped, outcome };
}

const fixtures = [
  {
    id: "relative-location",
    input: "URL: https://example.com/old\nHTTP/2 301\nLocation: /new\n\nURL: https://example.com/new\nHTTP/2 200",
    expected: "complete",
  },
  {
    id: "capture-gap",
    input: "URL: https://example.com/a\nHTTP/2 302\nLocation: /b\n\nURL: https://example.com/c\nHTTP/2 200",
    expected: "incomplete",
  },
  {
    id: "redirect-loop",
    input: "URL: https://example.com/a\nHTTP/2 301\nLocation: /b\n\nURL: https://example.com/b\nHTTP/2 308\nLocation: /a\n\nURL: https://example.com/a\nHTTP/2 301\nLocation: /b",
    expected: "loop",
  },
] as const;

export const redirectChainFixtureResults = fixtures.map((fixture) => ({
  id: fixture.id,
  expected: fixture.expected,
  actual: parseRedirectChain(fixture.input).outcome,
  passed: parseRedirectChain(fixture.input).outcome === fixture.expected,
}));

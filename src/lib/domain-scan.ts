import { trackEvent } from "./analytics";
import {
  GatewayError,
  runDomainScan,
  type DomainScanReport,
} from "./crawler-gateway";

type Locale = "en" | "de";

const copy = {
  de: {
    yes: "Ja",
    no: "Nein",
    unknown: "Unklar",
    source: "Gefunden über",
    cacheHit: "Ergebnis aus dem höchstens eine Stunde alten Cache",
    cacheMiss: "Frisch geprüft",
    sitemap: "Sitemap",
    homepage_links: "Links auf der Startseite",
    homepage_only: "nur Startseite",
    noIssue: "Kein offensichtlicher Blocker",
    noFilteredRows: "Keine URLs entsprechen diesem Filter.",
    truncated: "Die Website enthält mehr URLs; geprüft wurden die ersten 50.",
    invalid: "Bitte gib eine öffentliche Domain oder HTTP-/HTTPS-URL ein.",
    unavailable:
      "Der Dienst ist vorübergehend nicht verfügbar. Bitte versuche es später erneut.",
    rate: "Das Scan-Limit ist erreicht. Bitte versuche es später erneut.",
    busy: "Ein anderer Website-Check läuft gerade. Bitte versuche es gleich noch einmal.",
  },
  en: {
    yes: "Yes",
    no: "No",
    unknown: "Unknown",
    source: "Discovered from",
    cacheHit: "Loaded from a cache no more than one hour old",
    cacheMiss: "Freshly checked",
    sitemap: "Sitemap",
    homepage_links: "homepage links",
    homepage_only: "homepage only",
    noIssue: "No obvious blocker",
    noFilteredRows: "No URLs match this filter.",
    truncated: "The website contains more URLs; the first 50 were checked.",
    invalid: "Enter a public domain or HTTP/HTTPS URL.",
    unavailable:
      "The service is temporarily unavailable. Please try again later.",
    rate: "The scan limit has been reached. Please try again later.",
    busy: "Another website check is running. Please try again shortly.",
  },
} as const;

const findingLabels: Readonly<Record<string, readonly [string, string]>> = {
  page_fetch_failed: ["Seite nicht abrufbar", "Page could not be fetched"],
  fetch_blocked_or_challenged: [
    "Zugriffstor oder Bot-Challenge",
    "Access gate or bot challenge",
  ],
  indexing_blocked: ["Noindex gefunden", "Noindex found"],
  search_crawlers_blocked: [
    "Googlebot durch robots.txt gesperrt",
    "Googlebot blocked by robots.txt",
  ],
  canonical_points_elsewhere: [
    "Canonical zeigt auf eine andere URL",
    "Canonical points to another URL",
  ],
  canonical_invalid: ["Canonical ist ungültig", "Canonical is invalid"],
  canonical_missing: ["Canonical fehlt", "Canonical is missing"],
  main_content_empty: [
    "Kaum sichtbarer Hauptinhalt",
    "Little visible main content",
  ],
  title_missing: ["Title fehlt", "Title is missing"],
  h1_missing: ["H1 fehlt", "H1 is missing"],
};

function text(element: Element | null, value: string): void {
  if (element != null) element.textContent = value;
}

function stateLabel(state: "yes" | "no" | "unknown", locale: Locale): string {
  return copy[locale][state];
}

function findingLabel(code: string, locale: Locale): string {
  const value = findingLabels[code];
  return value?.[locale === "de" ? 0 : 1] ?? code.replaceAll("_", " ");
}

function errorMessage(error: unknown, locale: Locale): string {
  if (!(error instanceof GatewayError)) return copy[locale].unavailable;
  if (error.code === "VALIDATION_INVALID_INPUT") return copy[locale].invalid;
  if (error.code === "RATE_LIMITED") return copy[locale].rate;
  if (error.code === "TOOL_BUSY") return copy[locale].busy;
  return copy[locale].unavailable;
}

function hasIssue(row: DomainScanReport["rows"][number]): boolean {
  return (
    row.fetchState !== "fetched" ||
    row.status == null ||
    row.status >= 400 ||
    row.robotsAllowed !== "yes" ||
    row.indexingAllowed !== "yes" ||
    row.canonicalState !== "self" ||
    !row.titlePresent ||
    row.visibleMainTextLength < 80
  );
}

function badge(
  value: string,
  state: "good" | "bad" | "unknown",
): HTMLSpanElement {
  const element = document.createElement("span");
  element.className = `domain-scan-badge is-${state}`;
  element.textContent = value;
  return element;
}

function renderRows(
  root: Element,
  report: DomainScanReport,
  locale: Locale,
  filter: string,
): void {
  const body = root.querySelector("[data-domain-scan-rows]");
  const empty = root.querySelector("[data-domain-scan-empty]");
  if (!(body instanceof HTMLElement)) return;
  body.replaceChildren();
  const rows = report.rows.filter(
    (row) => filter !== "issues" || hasIssue(row),
  );
  for (const row of rows) {
    const tr = document.createElement("tr");
    const urlCell = document.createElement("td");
    const link = document.createElement("a");
    link.href = row.requestedUrl;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = row.requestedUrl;
    urlCell.append(link);

    const statusCell = document.createElement("td");
    statusCell.append(
      badge(
        row.status == null ? "—" : String(row.status),
        row.status != null && row.status < 400 ? "good" : "bad",
      ),
    );
    const robotsCell = document.createElement("td");
    robotsCell.append(
      badge(
        stateLabel(row.robotsAllowed, locale),
        row.robotsAllowed === "yes"
          ? "good"
          : row.robotsAllowed === "no"
            ? "bad"
            : "unknown",
      ),
    );
    const indexCell = document.createElement("td");
    indexCell.append(
      badge(
        stateLabel(row.indexingAllowed, locale),
        row.indexingAllowed === "yes"
          ? "good"
          : row.indexingAllowed === "no"
            ? "bad"
            : "unknown",
      ),
    );
    const canonicalCell = document.createElement("td");
    canonicalCell.textContent = row.canonicalState.replaceAll("_", " ");
    const findingCell = document.createElement("td");
    const relevantFindings = row.findings.filter(
      (code) => code !== "meta_description_missing",
    );
    findingCell.textContent =
      relevantFindings.length === 0
        ? copy[locale].noIssue
        : relevantFindings
            .slice(0, 2)
            .map((code) => findingLabel(code, locale))
            .join(" · ");
    tr.append(
      urlCell,
      statusCell,
      robotsCell,
      indexCell,
      canonicalCell,
      findingCell,
    );
    body.append(tr);
  }
  if (empty instanceof HTMLElement) {
    empty.hidden = rows.length > 0;
    empty.textContent = rows.length > 0 ? "" : copy[locale].noFilteredRows;
  }
}

function download(report: DomainScanReport): void {
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: "application/json",
  });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `analysespider-domain-check-${new URL(report.siteUrl).hostname}.json`;
  link.click();
  URL.revokeObjectURL(href);
}

function mount(root: Element): void {
  const locale: Locale =
    root.getAttribute("data-locale") === "de" ? "de" : "en";
  const form = root.querySelector("[data-domain-scan-form]");
  const input = form?.querySelector('input[name="url"]');
  const progress = root.querySelector("[data-domain-scan-progress]");
  const results = root.querySelector("[data-domain-scan-results]");
  const error = root.querySelector("[data-domain-scan-error]");
  const filter = root.querySelector("[data-domain-scan-filter]");
  const downloadButton = root.querySelector("[data-domain-scan-download]");
  let report: DomainScanReport | null = null;

  if (
    !(form instanceof HTMLFormElement) ||
    !(input instanceof HTMLInputElement)
  )
    return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (progress instanceof HTMLElement) progress.hidden = false;
    if (results instanceof HTMLElement) results.hidden = true;
    if (error instanceof HTMLElement) error.hidden = true;
    const button = form.querySelector("button");
    if (button instanceof HTMLButtonElement) button.disabled = true;
    trackEvent("tool_run_started", { tool: "domain_scan" });
    try {
      report = await runDomainScan(input.value);
      text(
        root.querySelector('[data-summary="checked"]'),
        String(report.checkedUrlCount),
      );
      text(
        root.querySelector('[data-summary="fetchable"]'),
        String(report.summary.fetchable),
      );
      text(
        root.querySelector('[data-summary="indexable"]'),
        String(report.summary.indexable),
      );
      text(
        root.querySelector('[data-summary="problems"]'),
        String(report.rows.filter(hasIssue).length),
      );
      const meta = `${copy[locale].source}: ${copy[locale][report.discoveredFrom]} · ${
        report.cacheState === "hit"
          ? copy[locale].cacheHit
          : copy[locale].cacheMiss
      }${report.truncated ? ` · ${copy[locale].truncated}` : ""}`;
      text(root.querySelector("[data-domain-scan-meta]"), meta);
      renderRows(
        root,
        report,
        locale,
        filter instanceof HTMLSelectElement ? filter.value : "all",
      );
      if (results instanceof HTMLElement) {
        results.hidden = false;
        results.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      trackEvent("tool_run_succeeded", {
        tool: "domain_scan",
        outcome: "complete",
      });
    } catch (caught) {
      if (error instanceof HTMLElement) error.hidden = false;
      text(
        root.querySelector("[data-domain-scan-error-text]"),
        errorMessage(caught, locale),
      );
      const reason =
        caught instanceof GatewayError &&
        caught.code === "VALIDATION_INVALID_INPUT"
          ? "validation"
          : caught instanceof GatewayError && caught.code === "RATE_LIMITED"
            ? "rate_limit"
            : caught instanceof GatewayError && caught.code === "TOOL_BUSY"
              ? "busy"
              : "service";
      trackEvent("tool_run_failed", { tool: "domain_scan", reason });
    } finally {
      if (progress instanceof HTMLElement) progress.hidden = true;
      if (button instanceof HTMLButtonElement) button.disabled = false;
    }
  });
  filter?.addEventListener("change", () => {
    if (report != null && filter instanceof HTMLSelectElement) {
      renderRows(root, report, locale, filter.value);
    }
  });
  downloadButton?.addEventListener("click", () => {
    if (report != null) {
      download(report);
      trackEvent("report_action", { action: "download", outcome: "success" });
    }
  });
}

export function mountDomainScanTools(): void {
  for (const root of document.querySelectorAll("[data-domain-scan]"))
    mount(root);
}

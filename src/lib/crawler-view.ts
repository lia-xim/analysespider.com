import {
  GatewayError,
  normalizePublicUrl,
  runCrawlerCheck,
  type CrawlerReport,
  type EligibilityState,
} from "./crawler-gateway";
import { formatLiveRedirectEvidence } from "./redirect-chain";

type Locale = "de" | "en";

const messages = {
  de: {
    yes: "Ja",
    no: "Nein",
    mixed: "Teilweise",
    unknown: "Unklar",
    purposes: {
      search: "Suche",
      training: "Training",
      user_fetch: "Nutzerabruf",
    },
    crawlerStates: {
      allowed: "Erlaubt",
      blocked: "Gesperrt",
      no_rule: "Keine Regel",
      unknown: "Unklar",
    },
    details: {
      status: "HTTP-Status",
      finalUrl: "Finale URL",
      redirects: "Weiterleitungen",
      contentType: "Inhaltstyp",
      size: "Antwortgröße",
      canonical: "Canonical",
      robots: "Robots-Angaben",
      title: "Seitentitel",
      description: "Meta Description",
      h1: "H1-Überschriften",
      text: "Erkannter Haupttext",
      language: "HTML-Sprache",
      links: "Interne Links",
      fetchedAt: "Abgerufen am",
    },
    found: "Gefunden",
    missing: "Fehlt",
    none: "Keine",
    chars: "Zeichen",
    links: "Links",
    error: {
      VALIDATION_INVALID_INPUT:
        "Bitte gib eine öffentliche Domain oder HTTP-/HTTPS-URL ein.",
      RATE_LIMITED:
        "Das kostenlose Prüflimit ist erreicht. Bitte versuche es später erneut.",
      TOOL_BUSY:
        "Der einzelne AnalyseSpider-Prüfslot ist gerade belegt. Bitte versuche es gleich noch einmal.",
      TOOL_TIMEOUT: "Die Zielseite hat nicht rechtzeitig geantwortet.",
      ORIGIN_NOT_ALLOWED:
        "Diese Website ist noch nicht für den Prüf-Endpunkt freigeschaltet.",
      CAP_UNSUPPORTED:
        "Dein Browser unterstützt die notwendige Missbrauchsprüfung nicht.",
      default:
        "Der Dienst ist vorübergehend nicht erreichbar. Bitte versuche es später erneut.",
    },
  },
  en: {
    yes: "Yes",
    no: "No",
    mixed: "Partly",
    unknown: "Unknown",
    purposes: {
      search: "Search",
      training: "Training",
      user_fetch: "User fetch",
    },
    crawlerStates: {
      allowed: "Allowed",
      blocked: "Blocked",
      no_rule: "No rule",
      unknown: "Unknown",
    },
    details: {
      status: "HTTP status",
      finalUrl: "Final URL",
      redirects: "Redirects",
      contentType: "Content type",
      size: "Response size",
      canonical: "Canonical",
      robots: "Robots directives",
      title: "Page title",
      description: "Meta description",
      h1: "H1 headings",
      text: "Detected main text",
      language: "HTML language",
      links: "Internal links",
      fetchedAt: "Fetched at",
    },
    found: "Found",
    missing: "Missing",
    none: "None",
    chars: "characters",
    links: "links",
    error: {
      VALIDATION_INVALID_INPUT: "Enter a public domain or HTTP/HTTPS URL.",
      RATE_LIMITED:
        "The free check limit has been reached. Please try again later.",
      TOOL_BUSY:
        "AnalyseSpider's single check slot is busy. Please try again in a moment.",
      TOOL_TIMEOUT: "The target page did not respond in time.",
      ORIGIN_NOT_ALLOWED:
        "This website is not yet enabled for the check endpoint.",
      CAP_UNSUPPORTED:
        "Your browser does not support the required abuse check.",
      default:
        "The service is temporarily unavailable. Please try again later.",
    },
  },
} as const;

const actionCopy: Record<Locale, Record<string, string>> = {
  de: {
    add_descriptive_title:
      "Gib der Seite einen eindeutigen, beschreibenden Seitentitel.",
    add_meta_description:
      "Ergänze eine kurze Meta Description, die den Seiteninhalt zusammenfasst.",
    add_one_clear_h1:
      "Nutze eine klare H1-Überschrift für das Hauptthema der Seite.",
    consider_self_canonical:
      "Setze ein selbstreferenzierendes Canonical, wenn diese URL indexiert werden soll.",
    confirm_canonical_target:
      "Prüfe, ob das Canonical wirklich auf die gewünschte Haupt-URL zeigt.",
    declare_html_language: "Gib die Seitensprache im html-lang-Attribut an.",
    publish_server_visible_main_content:
      "Liefere den wichtigen Hauptinhalt bereits in der Serverantwort aus.",
    reduce_markup_or_expose_main_content:
      "Vereinfache das Markup oder mache den Hauptinhalt im HTML deutlicher erkennbar.",
    remove_noindex_if_page_should_rank:
      "Entferne noindex nur dann, wenn diese Seite in Suchergebnissen erscheinen soll.",
    remove_or_document_access_gate:
      "Entferne die Zugriffssperre für öffentliche Inhalte oder dokumentiere sie bewusst.",
    repair_canonical_url: "Korrigiere die ungültige Canonical-URL.",
    restore_public_page_access:
      "Stelle eine erfolgreiche öffentliche Serverantwort für diese URL her.",
    review_crawler_specific_rules:
      "Prüfe die unterschiedlichen robots.txt-Regeln für Such- und AI-Crawler.",
    review_heading_hierarchy:
      "Ordne die Überschriften in eine klare Hierarchie.",
    review_search_robots_rules:
      "Prüfe, ob robots.txt wichtige Suchcrawler unbeabsichtigt sperrt.",
  },
  en: {
    add_descriptive_title: "Add a unique, descriptive page title.",
    add_meta_description:
      "Add a short meta description that summarises the page.",
    add_one_clear_h1: "Use one clear H1 for the page's main topic.",
    consider_self_canonical:
      "Add a self-referencing canonical if this URL should be indexed.",
    confirm_canonical_target:
      "Confirm that the canonical points to the intended primary URL.",
    declare_html_language:
      "Declare the page language in the html lang attribute.",
    publish_server_visible_main_content:
      "Deliver the important main content in the server response.",
    reduce_markup_or_expose_main_content:
      "Simplify the markup or expose the main content more clearly in HTML.",
    remove_noindex_if_page_should_rank:
      "Remove noindex only if this page should appear in search results.",
    remove_or_document_access_gate:
      "Remove the access gate for public content or document it intentionally.",
    repair_canonical_url: "Repair the invalid canonical URL.",
    restore_public_page_access:
      "Restore a successful public server response for this URL.",
    review_crawler_specific_rules:
      "Review the different robots.txt rules for search and AI crawlers.",
    review_heading_hierarchy: "Organise the headings into a clear hierarchy.",
    review_search_robots_rules:
      "Check whether robots.txt unintentionally blocks important search crawlers.",
  },
};

function text(element: Element | null, value: string): void {
  if (element != null) element.textContent = value;
}

function statusPresentation(
  state: EligibilityState,
  locale: Locale,
): { value: string; className: string; icon: string } {
  const copy = messages[locale];
  if (state === "yes")
    return { value: copy.yes, className: "is-good", icon: "✓" };
  if (state === "no") return { value: copy.no, className: "is-bad", icon: "×" };
  if (state === "mixed")
    return { value: copy.mixed, className: "is-warn", icon: "!" };
  return { value: copy.unknown, className: "is-unknown", icon: "?" };
}

function statusDescription(
  key: keyof CrawlerReport["eligibility"],
  report: CrawlerReport,
  locale: Locale,
): string {
  const state = report.eligibility[key];
  const de = locale === "de";
  if (key === "pageFetch") {
    if (state === "yes")
      return de
        ? `Der Server hat ${report.fetchFacts.status ?? "eine Antwort"} geliefert.`
        : `The server returned ${report.fetchFacts.status ?? "a response"}.`;
    if (report.fetchFacts.fetchState === "blocked_or_challenged")
      return de
        ? "Die Serverantwort sieht nach einer Zugangssperre oder Bot-Challenge aus."
        : "The server response looks like an access gate or bot challenge.";
    return de
      ? "Die Seite konnte nicht zuverlässig abgerufen werden."
      : "The page could not be fetched reliably.";
  }
  if (key === "searchCrawlerFetch") {
    if (state === "yes")
      return de
        ? "Die gefundenen robots.txt-Regeln erlauben gängigen Suchcrawlern den Zugriff."
        : "The observed robots.txt rules allow common search crawlers.";
    if (state === "mixed")
      return de
        ? "Die robots.txt-Regeln behandeln Suchcrawler unterschiedlich."
        : "The robots.txt rules treat search crawlers differently.";
    if (state === "no")
      return de
        ? "Die gefundenen Regeln sperren Suchcrawler."
        : "The observed rules block search crawlers.";
    return de
      ? "Aus der robots.txt ließ sich keine sichere Antwort ableiten."
      : "The robots.txt did not provide a conclusive answer.";
  }
  if (key === "indexingAllowed") {
    if (state === "yes")
      return de
        ? "In der Serverantwort wurde kein noindex gefunden."
        : "No noindex directive was found in the server response.";
    if (state === "no")
      return de
        ? "Eine noindex-Angabe verhindert die Indexierung dieser Antwort."
        : "A noindex directive prevents this response from being indexed.";
    return de
      ? "Die Indexierungsangaben sind nicht eindeutig."
      : "The indexing directives are inconclusive.";
  }
  if (state === "yes")
    return de
      ? "Im ausgelieferten HTML wurde ausreichend sichtbarer Haupttext erkannt."
      : "Enough visible main text was detected in the delivered HTML.";
  if (state === "no")
    return de
      ? "Im ausgelieferten HTML wurde kein klarer Hauptinhalt erkannt."
      : "No clear main content was detected in the delivered HTML.";
  return de
    ? "Der Hauptinhalt lässt sich aus dieser Serverantwort nicht sicher beurteilen."
    : "The main content cannot be judged reliably from this server response.";
}

function renderStatuses(
  root: Element,
  report: CrawlerReport,
  locale: Locale,
): void {
  for (const key of Object.keys(
    report.eligibility,
  ) as (keyof CrawlerReport["eligibility"])[]) {
    const row = root.querySelector(`[data-status-row="${key}"]`);
    if (row == null) continue;
    const presentation = statusPresentation(report.eligibility[key], locale);
    row.classList.remove("is-good", "is-bad", "is-warn", "is-unknown");
    row.classList.add(presentation.className);
    text(row.querySelector("[data-status-value]"), presentation.value);
    text(
      row.querySelector("[data-status-description]"),
      statusDescription(key, report, locale),
    );
    text(row.querySelector(".crawler-status-icon"), presentation.icon);
  }
}

function renderActions(
  root: Element,
  report: CrawlerReport,
  locale: Locale,
): void {
  const list = root.querySelector("[data-crawler-actions]");
  if (!(list instanceof HTMLOListElement)) return;
  list.replaceChildren();
  const sorted = [...report.findings].sort((left, right) => {
    const weight = { critical: 0, warning: 1, info: 2 } as const;
    return weight[left.severity] - weight[right.severity];
  });
  const actions = [
    ...new Set(
      sorted
        .map((finding) => actionCopy[locale][finding.nextAction])
        .filter(Boolean),
    ),
  ].slice(0, 3);
  const fallback =
    locale === "de"
      ? [
          "Vergleiche den erkannten Inhalt mit dem, was Nutzer auf der Seite sehen.",
          "Prüfe wichtige Änderungen anschließend mit derselben URL erneut.",
          "Nutze für viele Seiten einen vollständigen Site Audit.",
        ]
      : [
          "Compare the detected content with what users see on the page.",
          "Recheck the same URL after important changes.",
          "Use a full Site Audit when you need to inspect many pages.",
        ];
  for (const candidate of fallback) {
    if (actions.length >= 3) break;
    actions.push(candidate);
  }
  for (const action of actions) {
    const item = document.createElement("li");
    item.textContent = action;
    list.append(item);
  }
}

function renderDetails(
  root: Element,
  report: CrawlerReport,
  locale: Locale,
): void {
  const list = root.querySelector("[data-crawler-details]");
  if (!(list instanceof HTMLDListElement)) return;
  const copy = messages[locale];
  const canonical =
    report.indexability.canonical.url ?? report.indexability.canonical.state;
  const directives = [
    ...report.indexability.metaRobots,
    ...report.indexability.xRobotsTag,
  ];
  const redirects =
    report.fetchFacts.redirectChain.length === 0
      ? copy.none
      : report.fetchFacts.redirectChain
          .map((hop) => `${hop.status} → ${hop.location}`)
          .join(" · ");
  const fields: readonly [string, string][] = [
    [
      copy.details.status,
      report.fetchFacts.status == null
        ? copy.unknown
        : String(report.fetchFacts.status),
    ],
    [copy.details.finalUrl, report.fetchFacts.finalUrl],
    [copy.details.redirects, redirects],
    [copy.details.contentType, report.fetchFacts.contentType ?? copy.unknown],
    [
      copy.details.size,
      report.fetchFacts.responseSizeBytes == null
        ? copy.unknown
        : `${Math.round(report.fetchFacts.responseSizeBytes / 1024)} KB`,
    ],
    [copy.details.canonical, canonical],
    [
      copy.details.robots,
      directives.length === 0 ? copy.none : directives.join(", "),
    ],
    [
      copy.details.title,
      report.indexability.titlePresent ? copy.found : copy.missing,
    ],
    [
      copy.details.description,
      report.indexability.metaDescriptionPresent ? copy.found : copy.missing,
    ],
    [copy.details.h1, String(report.extraction.h1Count)],
    [
      copy.details.text,
      `${report.extraction.visibleMainTextLength.toLocaleString(locale)} ${copy.chars}`,
    ],
    [copy.details.language, report.extraction.htmlLanguage ?? copy.missing],
    [
      copy.details.links,
      `${report.extraction.meaningfulInternalLinks.toLocaleString(locale)} ${copy.links}`,
    ],
    [
      copy.details.fetchedAt,
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(report.fetchFacts.fetchedAt)),
    ],
  ];
  list.replaceChildren();
  for (const [label, value] of fields) {
    const wrapper = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = value;
    wrapper.append(term, description);
    list.append(wrapper);
  }

  const matrix = root.querySelector("[data-crawler-matrix]");
  if (!(matrix instanceof HTMLTableSectionElement)) return;
  matrix.replaceChildren();
  for (const crawler of report.crawlerMatrix) {
    const row = document.createElement("tr");
    for (const value of [
      crawler.crawlerName,
      copy.purposes[crawler.purpose],
      copy.crawlerStates[crawler.state],
    ]) {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    }
    matrix.append(row);
  }
}

function renderCacheStatus(
  root: Element,
  report: CrawlerReport,
  locale: Locale,
): void {
  const note = root.querySelector("[data-crawler-cache]");
  if (!(note instanceof HTMLElement)) return;
  const observed = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(report.fetchFacts.fetchedAt));
  note.dataset.cacheState = report.fetchFacts.cacheState;
  if (report.fetchFacts.cacheState === "hit") {
    note.textContent = locale === "de"
      ? `Cache-Ergebnis vom ${observed}. Wiederholte Prüfungen derselben URL verwenden es höchstens eine Stunde lang.`
      : `Cached result from ${observed}. Repeat checks for the same URL reuse it for no more than one hour.`;
    return;
  }
  note.textContent = locale === "de"
    ? `Frisch abgerufen am ${observed}. Dieses Ergebnis kann für dieselbe URL bis zu eine Stunde wiederverwendet werden.`
    : `Fetched fresh on ${observed}. This result may be reused for the same URL for up to one hour.`;
}

function errorMessage(error: unknown, locale: Locale): string {
  const copy = messages[locale].error;
  const code = error instanceof GatewayError ? error.code : "default";
  return copy[code as keyof typeof copy] ?? copy.default;
}

function mount(root: Element): void {
  if (root.getAttribute("data-mounted") === "true") return;
  root.setAttribute("data-mounted", "true");
  const locale: Locale =
    root.getAttribute("data-locale") === "de" ? "de" : "en";
  const form = root.querySelector("[data-crawler-form]");
  const input = form?.querySelector("input[name='url']");
  const button = form?.querySelector("button[type='submit']");
  const progress = root.querySelector("[data-crawler-progress]");
  const results = root.querySelector("[data-crawler-results]");
  const error = root.querySelector("[data-crawler-error]");
  if (
    !(form instanceof HTMLFormElement) ||
    !(input instanceof HTMLInputElement) ||
    !(button instanceof HTMLButtonElement)
  )
    return;

  input.addEventListener("blur", () => {
    try {
      input.value = normalizePublicUrl(input.value);
    } catch {
      // Keep the original value so submit can show the localised validation error.
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!input.reportValidity()) return;
    button.disabled = true;
    progress?.removeAttribute("hidden");
    results?.setAttribute("hidden", "");
    error?.setAttribute("hidden", "");
    try {
      const normalizedUrl = normalizePublicUrl(input.value);
      input.value = normalizedUrl;
      const report = await runCrawlerCheck(normalizedUrl);
      renderStatuses(root, report, locale);
      renderActions(root, report, locale);
      renderDetails(root, report, locale);
      renderCacheStatus(root, report, locale);
      const redirectHandoff = root.querySelector("[data-redirect-handoff]");
      if (redirectHandoff instanceof HTMLButtonElement) {
        if (report.fetchFacts.redirectChain.length > 0) {
          redirectHandoff.hidden = false;
          redirectHandoff.onclick = () => {
            sessionStorage.setItem(
              "analysespider.redirect-chain",
              formatLiveRedirectEvidence(report.fetchFacts),
            );
            window.location.assign("/tools/redirect-chain?from=crawler-check");
          };
        } else {
          redirectHandoff.hidden = true;
          redirectHandoff.onclick = null;
        }
      }
      const responseHandoff = root.querySelector("[data-response-handoff]");
      if (responseHandoff instanceof HTMLButtonElement) {
        responseHandoff.onclick = () => {
          sessionStorage.setItem(
            "analysespider.http-response",
            JSON.stringify({
              status: report.fetchFacts.status,
              contentType: report.fetchFacts.contentType,
              xRobotsTag: report.indexability.xRobotsTag,
              canonical: report.indexability.canonical.url,
              metaRobots: report.indexability.metaRobots,
            }),
          );
          window.location.assign("/tools/url-inspector?from=crawler-check");
        };
      }
      results?.removeAttribute("hidden");
      results?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (caught) {
      text(
        root.querySelector("[data-crawler-error-text]"),
        errorMessage(caught, locale),
      );
      error?.removeAttribute("hidden");
    } finally {
      button.disabled = false;
      progress?.setAttribute("hidden", "");
    }
  });
}

export function mountCrawlerTools(): void {
  for (const root of document.querySelectorAll("[data-crawler-tool]"))
    mount(root);
}

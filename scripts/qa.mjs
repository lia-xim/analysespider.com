import { access, readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeUrlInput } from "../src/lib/public-url.mjs";

const dist = new URL("../dist/", import.meta.url);

const publicUrlCases = [
  ["matthiasramahi.de", "https://matthiasramahi.de/"],
  ["www.matthiasramahi.de", "https://www.matthiasramahi.de/"],
  [
    "matthiasramahi.de/impressum.html?test=1#abschnitt",
    "https://matthiasramahi.de/impressum.html?test=1",
  ],
  [
    "http://MatthiasRamahi.de:80/kontakt",
    "http://matthiasramahi.de/kontakt",
  ],
  ["//matthiasramahi.de/portfolio", "https://matthiasramahi.de/portfolio"],
];
for (const [input, expected] of publicUrlCases) {
  if (normalizeUrlInput(input) !== expected) {
    throw new Error(`URL normalization mismatch for ${input}`);
  }
}
for (const input of ["", "ftp://matthiasramahi.de/file", "https://user:secret@example.com/"]) {
  let rejected = false;
  try {
    normalizeUrlInput(input);
  } catch {
    rejected = true;
  }
  if (!rejected) throw new Error(`Unsafe URL input was accepted: ${input}`);
}
const distDir = fileURLToPath(dist);
const origin = "https://analysespider.com";
const { canonicalRoutes: routes, sitemapRoutes } = await import(
  new URL("../src/data/routes.ts", import.meta.url)
);
const { robotsFixtureResults } = await import(
  new URL("../src/lib/robots.ts", import.meta.url)
);
const { redirectChainFixtureResults } = await import(
  new URL("../src/lib/redirect-chain.ts", import.meta.url)
);
const { crawlerLabBuiltPaths } = await import(
  new URL("../src/data/crawler-lab.ts", import.meta.url)
);
const { localePairs } = await import(new URL("../src/data/i18n.ts", import.meta.url));
const { sanitizeEvent } = await import(new URL("../src/lib/analytics.ts", import.meta.url));
const { default: crawlerRanges } = await import(new URL("../src/data/crawler-ip-ranges.json", import.meta.url), { with: { type: "json" } });
const editorialRoutes = new Set([
  "/guides/log-file-analysis",
  "/guides/crawler-log-analysis",
  "/guides/http-response-debugging",
  "/guides/redirect-chain-analysis",
  "/guides/test-robots-txt-rules",
  "/blog/how-to-find-search-bots-in-server-logs",
  "/blog/what-a-301-response-does-not-prove",
  "/blog/private-data-in-access-logs",
  "/blog/robots-txt-allows-bot-cdn-blocks-it",
  "/blog/initial-html-vs-rendered-dom",
  "/reference/http-status-codes",
  "/reference/crawler-user-agents",
  "/reference/robots-directives",
  "/reference/crawler-verification-methods",
]);
const collectionRoutes = new Set([
  "/tools",
  "/guides",
  "/crawlers",
  "/blog",
  "/reference",
  "/for",
  "/de/tools",
  "/de/wissen",
  "/de/crawler",
]);
const toolRoutes = new Set([
  "/tools/crawler-view",
  "/de/tools/crawler-sicht",
  "/tools/log-file-inspector",
  "/tools/url-inspector",
  "/tools/redirect-chain",
  "/tools/robots-rule-tester",
  "/tools/ip-location",
  "/tools/bot-verification",
  "/de/tools/http-antwort",
  "/de/tools/weiterleitungskette",
  "/de/tools/robots-regel-test",
  "/de/tools/server-log-analyse",
  "/de/tools/ip-adresse",
  "/de/tools/bot-verifizierung",
]);
const approvedPortfolioLinks = new Map([
  [
    "/",
    new Set([
      "https://contextter.com/features/site-audit",
      "https://ai-fanout.com/",
    ]),
  ],
  [
    "/de",
    new Set([
      "https://contextter.com/de/features/site-audit",
      "https://ai-fanout.com/de",
    ]),
  ],
  [
    "/tools/crawler-view",
    new Set([
      "https://contextter.com/features/site-audit",
      "https://ai-fanout.com/",
    ]),
  ],
  [
    "/de/tools/crawler-sicht",
    new Set([
      "https://contextter.com/de/features/site-audit",
      "https://ai-fanout.com/de",
    ]),
  ],
  ["/guides", new Set(["https://seo-fanout.com/tool/"])],
  ["/guides/appear-in-ai-search", new Set(["https://ai-fanout.com"])],
  ["/crawlers", new Set(["https://ai-fanout.com/"])],
  ["/de/wissen", new Set(["https://seo-fanout.com/tool/"])],
  ["/de/wissen/in-ai-suche-erscheinen", new Set(["https://ai-fanout.com/de"])],
  ["/de/crawler", new Set(["https://ai-fanout.com/de"])],
]);

const failures = [];
const pass = (condition, message) => {
  if (!condition) failures.push(message);
};
const sanitizedAnalyticsEvent = sanitizeEvent("tool_run_succeeded", {
  tool: "bot_verification",
  outcome: "verified",
  url: "https://secret.example/path?token=secret",
  ip: "66.249.66.1",
  log: "private log line",
});
pass(
  JSON.stringify(sanitizedAnalyticsEvent) === JSON.stringify({ name: "tool_run_succeeded", data: { tool: "bot_verification", outcome: "verified" } }),
  "analytics sanitizer must strip URLs, IPs, logs and undeclared event fields",
);
const expectedRangeIds = ["googlebot", "oai_searchbot", "gptbot", "chatgpt_user", "perplexitybot", "perplexity_user", "claude_searchbot", "claudebot", "claude_user"];
pass(
  expectedRangeIds.every((id) => crawlerRanges.entries.some((entry) => entry.id === id && entry.prefixes.length > 0)),
  "every maintained crawler identity must have a non-empty official range snapshot",
);
pass(
  Date.now() - new Date(crawlerRanges.reviewedAt).getTime() <= 14 * 24 * 60 * 60 * 1000,
  "crawler range snapshot must be refreshed at least every 14 days",
);

pass(
  routes.length >= 45,
  `route inventory unexpectedly small: ${routes.length}`,
);
pass(
  new Set(routes).size === routes.length,
  "duplicate canonical routes in central route registry",
);
pass(
  new Set(sitemapRoutes).size === sitemapRoutes.length,
  "duplicate sitemap routes in central route registry",
);
pass(
  routes.length === sitemapRoutes.length &&
    routes.every((route) => sitemapRoutes.includes(route)),
  "all current canonical 200 routes must be sitemap eligible",
);

const findOutput = async (pathname) => {
  if (pathname === "/") return new URL("index.html", dist);
  const clean = pathname.slice(1);
  const candidates = extname(clean)
    ? [new URL(`${clean}/index.html`, dist), new URL(clean, dist)]
    : [new URL(`${clean}/index.html`, dist), new URL(`${clean}.html`, dist)];
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {}
  }
  return candidates[0];
};

const htmlFiles = [];
const walk = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.name.endsWith(".html")) htmlFiles.push(full);
  }
};

const titles = new Map();
const descriptions = new Map();
for (const route of routes) {
  const output = await findOutput(route);
  let html = "";
  try {
    html = await readFile(output, "utf8");
  } catch {
    failures.push(`missing built route: ${route}`);
    continue;
  }

  const canonical = new URL(route, origin).href;
  pass(
    html.includes(`rel="canonical" href="${canonical}"`),
    `canonical mismatch for ${route}`,
  );
  pass(
    html.includes('content="index, follow"'),
    `index/follow meta missing for ${route}`,
  );
  pass(
    !html.includes("noindex, nofollow, noarchive"),
    `stale noindex remains on ${route}`,
  );
  pass(
    html.includes('"@context":"https://schema.org"'),
    `structured data missing for ${route}`,
  );
  pass(html.includes('"@graph"'), `structured-data graph missing for ${route}`);
  pass(!html.includes("Project setup"), `placeholder copy remains on ${route}`);
  pass(
    !/lorem ipsum|as an ai language model/i.test(html),
    `draft filler remains on ${route}`,
  );
  const portfolioLinks = [
    ...html.matchAll(
      /href="(https:\/\/(?:contextter\.com|ai-fanout\.com|seo-fanout\.com)[^"]*)"/g,
    ),
  ].map((match) => match[1]);
  const approvedLinks = approvedPortfolioLinks.get(route) ?? new Set();
  for (const link of portfolioLinks) {
    pass(
      approvedLinks.has(link),
      `unapproved common-owner link ${link} found on ${route}`,
    );
  }
  if (portfolioLinks.length) {
    pass(
      /(?:operated by Matthias Ramahi|betrieben von Matthias Ramahi)/i.test(
        html,
      ) &&
        /(?:not (?:an )?independent recommendation|keine unabhängige(?:n)? Empfehlung(?:en)?)/i.test(
          html,
        ),
      `common-owner disclosure missing on ${route}`,
    );
  }

  const h1Count = (html.match(/<h1(?:\s|>)/g) ?? []).length;
  pass(h1Count === 1, `expected exactly one h1 on ${route}, found ${h1Count}`);

  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  const description = html.match(
    /<meta name="description" content="([^"]+)"/,
  )?.[1];
  pass(Boolean(title), `title missing for ${route}`);
  pass(Boolean(description), `description missing for ${route}`);
  if (title) {
    pass(
      !titles.has(title),
      `duplicate title on ${route} and ${titles.get(title)}`,
    );
    titles.set(title, route);
  }
  if (description) {
    pass(
      !descriptions.has(description),
      `duplicate description on ${route} and ${descriptions.get(description)}`,
    );
    descriptions.set(description, route);
  }

  if (editorialRoutes.has(route)) {
    pass(
      html.includes('property="og:type" content="article"'),
      `article Open Graph type missing for ${route}`,
    );
    pass(
      html.includes('"@type":"TechArticle"'),
      `TechArticle structured data missing for ${route}`,
    );
    pass(
      html.includes("Primary sources"),
      `primary sources section missing for ${route}`,
    );
  }
  if (route.startsWith("/guides/") && route !== "/guides/ip-geolocation-data") {
    pass(
      /href="\/tools\//.test(html),
      `guide must link to a relevant tool: ${route}`,
    );
  }
  if (collectionRoutes.has(route)) {
    pass(
      html.includes('"@type":"CollectionPage"'),
      `CollectionPage structured data missing for ${route}`,
    );
  }
  if (toolRoutes.has(route)) {
    pass(
      html.includes('"@type":"WebApplication"'),
      `WebApplication structured data missing for ${route}`,
    );
    pass(
      /href="\/(?:guides|de\/wissen|reference)\//.test(html),
      `tool must link to a relevant guide: ${route}`,
    );
  }
}

const imprint = await readFile(await findOutput("/impressum"), "utf8");
for (const required of [
  "Matthias Ramahi",
  "Kempener Straße 44",
  "40699 Erkrath",
  "info@matthiasramahi.de",
  "+49 176 42 44 98 58",
  "§ 5 DDG",
  "New ownership",
]) {
  pass(
    imprint.includes(required),
    `impressum missing verified operator or ownership fact: ${required}`,
  );
}

const privacy = await readFile(await findOutput("/privacy"), "utf8");
for (const required of [
  "Vercel",
  "browser-local",
  "Umami",
  "Gateway metrics",
  "Do not submit private, signed",
  "No application or tracking cookie",
  "never sends the checked URL or hostname",
  "No contact form",
  "data-subject",
]) {
  pass(
    privacy.includes(required),
    `privacy notice missing technology fact: ${required}`,
  );
}
pass(!/Google Analytics/i.test(privacy), "privacy notice must not claim an inactive analytics provider");
pass(privacy.includes('src="https://analytics.contextter.com/script.js"'), "privacy page must include the active Umami tracker");
pass(
  !privacy.includes("<strong>No analytics</strong>"),
  "privacy notice must not contradict documented gateway metrics with a broad no-analytics claim",
);

const germanHome = await readFile(await findOutput("/de"), "utf8");
for (const href of [
  "/de/tools/weiterleitungskette",
  "/de/tools/robots-regel-test",
  "/de/tools/server-log-analyse",
]) {
  pass(germanHome.includes(`href="${href}"`), `German homepage missing localized tool link ${href}`);
}
const technicalSeoPage = await readFile(await findOutput("/for/technical-seos"), "utf8");
pass(
  technicalSeoPage.includes("one public HTTP or HTTPS URL") &&
    technicalSeoPage.includes("SSRF-protected gateway"),
  "technical SEO audience page must describe the bounded live fetch accurately",
);
pass(
  !technicalSeoPage.includes("does not currently fetch arbitrary URLs"),
  "technical SEO audience page still contains the obsolete no-fetch statement",
);
for (const route of [
  "/de/wissen/robots-erlaubt-cdn-blockiert",
  "/de/wissen/initiales-html-vs-gerenderter-dom",
]) {
  const html = await readFile(await findOutput(route), "utf8");
  pass(html.includes('property="og:type" content="article"'), `article Open Graph type missing for ${route}`);
  pass(html.includes('"@type":"TechArticle"'), `TechArticle structured data missing for ${route}`);
  pass(html.includes("Primärquellen"), `German source section missing for ${route}`);
}

const robots = await readFile(new URL("robots.txt", dist), "utf8");
const sitemap = await readFile(new URL("sitemap.xml", dist), "utf8");
pass(robots.includes("Allow: /"), "robots.txt must allow crawling at launch");
pass(
  !/^Disallow:\s*\/$/m.test(robots),
  "robots.txt still blocks crawling at launch",
);
pass(
  robots.includes(`Sitemap: ${origin}/sitemap.xml`),
  "robots.txt must reference the canonical sitemap",
);
for (const route of sitemapRoutes) {
  pass(
    sitemap.includes(`<loc>${new URL(route, origin).href}</loc>`),
    `sitemap missing ${route}`,
  );
}
pass(
  (sitemap.match(/<url>/g) ?? []).length === sitemapRoutes.length,
  "sitemap URL count must match indexable canonical 200 route inventory",
);
const lastModifiedValues = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
pass(lastModifiedValues.length > 0, "sitemap must retain verified editorial modification dates");
pass(lastModifiedValues.length < sitemapRoutes.length, "sitemap must omit lastmod where no reliable page date exists");
pass(lastModifiedValues.every((value) => /^\d{4}-\d{2}-\d{2}$/.test(value)), "sitemap lastmod values must be ISO dates");
pass(!/<loc>https:\/\/analysespider\.com\/<\/loc><lastmod>/.test(sitemap), "homepage must not receive a build-date lastmod");
for (const page of (await import(new URL("../src/data/content.ts", import.meta.url))).contentPages) {
  const root = { guide: "/guides", "lab-note": "/blog", reference: "/reference", audience: "/for" }[page.kind];
  const location = new URL(`${root}/${page.slug}`, origin).href;
  pass(sitemap.includes(`<loc>${location}</loc><lastmod>${page.updatedAt}</lastmod>`), `sitemap lastmod mismatch for ${location}`);
}

for (const [english, german] of localePairs) {
  const englishHtml = await readFile(await findOutput(english), "utf8");
  const germanHtml = await readFile(await findOutput(german), "utf8");
  const englishUrl = new URL(english, origin).href;
  const germanUrl = new URL(german, origin).href;
  pass(englishHtml.includes(`hreflang="de" href="${germanUrl}"`), `English alternate missing for ${english}`);
  pass(germanHtml.includes(`hreflang="en" href="${englishUrl}"`), `German alternate missing for ${german}`);
}

const manifest = JSON.parse(
  await readFile(
    new URL("../src/data/legacy-url-actions.json", import.meta.url),
    "utf8",
  ),
);
const config = JSON.parse(
  await readFile(new URL("../vercel.json", import.meta.url), "utf8"),
);
const redirects = new Map(config.redirects.map((item) => [item.source, item]));
const rewrites = new Map(config.rewrites.map((item) => [item.source, item]));

pass(
  manifest.launchState === "public_indexable",
  `legacy launch state must be public_indexable, got ${manifest.launchState}`,
);
for (const record of manifest.records) {
  if (record.action === "restore_200") {
    try {
      await access(await findOutput(record.target_url));
    } catch {
      failures.push(`restore_200 target missing: ${record.target_url}`);
    }
  } else if (
    ["redirect_301", "redirect_308", "consolidate_redirect"].includes(
      record.action,
    )
  ) {
    const redirect = redirects.get(record.normalized_path);
    pass(
      Boolean(redirect),
      `redirect config missing for ${record.normalized_path}`,
    );
    if (redirect) {
      pass(
        redirect.destination === record.target_url,
        `redirect target mismatch for ${record.normalized_path}`,
      );
      pass(
        redirect.permanent === true,
        `redirect must be permanent for ${record.normalized_path}`,
      );
    }
  } else if (record.action === "410") {
    pass(
      rewrites.has(record.normalized_path),
      `410 rewrite missing for ${record.normalized_path}`,
    );
  }
}

for (const excludedPath of ["/404", ...redirects.keys(), ...rewrites.keys()]) {
  pass(
    !sitemap.includes(`<loc>${new URL(excludedPath, origin).href}</loc>`),
    `non-indexable status or redirect path leaked into sitemap: ${excludedPath}`,
  );
}

const notFound = await readFile(new URL("404.html", dist), "utf8");
pass(
  notFound.includes('content="noindex, follow"'),
  "404 page must declare noindex, follow",
);
pass(
  !notFound.includes('rel="canonical"'),
  "404 page must not emit a misleading canonical",
);
pass(
  !notFound.includes('property="og:url"'),
  "404 page must not emit an Open Graph URL",
);
pass(
  !notFound.includes('type="application/ld+json"'),
  "404 page must not emit indexable structured data",
);
pass(
  (notFound.match(/<h1(?:\s|>)/g) ?? []).length === 1,
  "404 page must contain exactly one h1",
);

pass(
  !config.headers.some((rule) =>
    rule.headers?.some(
      (header) =>
        header.key.toLowerCase() === "x-robots-tag" &&
        header.value.toLowerCase().includes("noindex"),
    ),
  ),
  "global X-Robots-Tag noindex must be absent at launch",
);
pass(
  !config.redirects.some(
    (rule) => rule.source === "/(.*)" || rule.source.includes(":path*"),
  ),
  "catch-all redirects are forbidden",
);
const csp =
  config.headers
    .flatMap((rule) => rule.headers ?? [])
    .find((header) => header.key.toLowerCase() === "content-security-policy")
    ?.value ?? "";
for (const directive of [
  "default-src 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
]) {
  pass(csp.includes(directive), "CSP missing required directive: " + directive);
}
pass(csp.includes("https://tools.contextter.com") && csp.includes("https://analytics.contextter.com"), "CSP must allow the protected gateway and self-hosted analytics only");
pass(
  csp.includes("worker-src 'self' blob:"),
  "CSP must allow the local Cap proof worker",
);
pass(csp.includes("script-src 'self' 'wasm-unsafe-eval' https://analytics.contextter.com"), "CSP must allow local scripts, the Cap WASM solver and the analytics host");
pass(!csp.includes("'unsafe-inline'"), "CSP must not allow inline script or style execution");
pass(
  !csp.includes(" 'unsafe-eval'"),
  "CSP must not enable unrestricted JavaScript eval",
);

const robotsTesterHtml = await readFile(
  await findOutput("/tools/robots-rule-tester"),
  "utf8",
);
for (const crawlerId of [
  "googlebot",
  "oai_searchbot",
  "gptbot",
  "claude_searchbot",
  "perplexitybot",
]) {
  pass(
    robotsTesterHtml.includes(`<option value="${crawlerId}"`),
    `robots tester dropdown missing crawler option: ${crawlerId}`,
  );
}
const crawlerViewSource = await readFile(
  new URL("../src/lib/crawler-view.ts", import.meta.url),
  "utf8",
);
const crawlerGatewaySource = await readFile(
  new URL("../src/lib/crawler-gateway.ts", import.meta.url),
  "utf8",
);
const crawlerViewHtml = await readFile(
  await findOutput("/tools/crawler-view"),
  "utf8",
);
const responseInspectorSource = await readFile(
  new URL("../src/pages/tools/url-inspector.astro", import.meta.url),
  "utf8",
);
pass(
  crawlerViewSource.includes("url: report.fetchFacts.requestedUrl"),
  "crawler-to-HTTP handoff must preserve the checked URL",
);
pass(
  responseInspectorSource.includes("headerInput.value = normalizePublicUrl(response.url)"),
  "HTTP inspector must prefill the transferred crawler URL",
);
for (const marker of [
  "data-crawler-matrix",
  "data-copy-report",
  "data-download-report",
  "data-compare-previous",
  "data-crawler-simulation-select",
]) {
  pass(
    crawlerViewHtml.includes(marker),
    `crawler result surface missing ${marker}`,
  );
}
pass(
  crawlerViewSource.includes("analysespider.crawler-history.v1") &&
    crawlerViewSource.includes("24 * 60 * 60 * 1_000") &&
    crawlerViewSource.includes("HISTORY_LIMIT = 5"),
  "crawler history must remain bounded to five local reports for 24 hours",
);
pass(
  crawlerGatewaySource.includes("request-identity=") &&
    crawlerGatewaySource.includes("requestIdentity"),
  "crawler simulation must bind the selected identity into the Cap input digest",
);
const benchmarkEvidence = JSON.parse(
  await readFile(
    new URL("../public/evidence/crawler-header-baseline-2026-08-28.json", import.meta.url),
    "utf8",
  ),
);
pass(
  benchmarkEvidence.summary.requests === 12 &&
    benchmarkEvidence.summary.bodyHashDifferences === 0,
  "crawler benchmark raw evidence summary is inconsistent",
);

const robotsFixturePage = await readFile(
  await findOutput("/lab/robots-rule-fixtures"),
  "utf8",
);
for (const fixture of robotsFixtureResults) {
  pass(fixture.passed, "robots fixture failed: " + fixture.id);
  pass(
    robotsFixturePage.includes(fixture.id),
    "robots fixture page missing fixture: " + fixture.id,
  );
}
for (const fixture of redirectChainFixtureResults) {
  pass(fixture.passed, "redirect-chain fixture failed: " + fixture.id);
}

const actionMatrix = await readFile(
  new URL("../docs/seo/page-action-matrix.md", import.meta.url),
  "utf8",
);
for (const route of routes)
  pass(
    actionMatrix.includes(
      String.fromCharCode(96) + route + String.fromCharCode(96),
    ),
    "page-action matrix missing " + route,
  );
for (const state of [
  "Verified",
  "Supported",
  "Hypothesis",
  "Experiment",
  "Rejected",
]) {
  const evidenceRegister = await readFile(
    new URL("../docs/seo/evidence-register.md", import.meta.url),
    "utf8",
  );
  pass(
    evidenceRegister.includes(state),
    "evidence register missing state: " + state,
  );
}

await walk(distDir);
for (const [route, href] of [
  ["/", "https://contextter.com/features/site-audit"],
  ["/de", "https://contextter.com/de/features/site-audit"],
]) {
  const homeHtml = await readFile(await findOutput(route), "utf8");
  pass(
    homeHtml.includes(`class="contextter-next"`) && homeHtml.includes(`href="${href}"`),
    `${route} must expose the disclosed Contextter Site Audit link in server-rendered HTML`,
  );
}
const existingRoutes = new Set(routes);
existingRoutes.add("/404");
existingRoutes.add("/robots.txt");
existingRoutes.add("/sitemap.xml");
existingRoutes.add("/favicon.svg");
existingRoutes.add("/feed.xml");
existingRoutes.add("/fixtures/synthetic-crawler-access.log");
existingRoutes.add("/evidence/crawler-header-baseline-2026-08-28.json");
for (const path of crawlerLabBuiltPaths) existingRoutes.add(path.replace(/\/$/, "") || "/");
existingRoutes.add("/fixtures/crawler-lab/redirect-one-hop");
for (const path of [...crawlerLabBuiltPaths, "/fixtures/crawler-lab/redirect-one-hop"]) {
  pass(
    !sitemap.includes(`<loc>${new URL(path, origin).href}</loc>`),
    `noindex crawler fixture leaked into sitemap: ${path}`,
  );
}
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  for (const href of hrefs) {
    if (/^(https?:|mailto:|tel:|#)/.test(href)) continue;
    if (href.startsWith("/_astro/")) continue;
    const pathname = new URL(href, origin).pathname.replace(/\/$/, "") || "/";
    pass(
      existingRoutes.has(pathname) || redirects.has(pathname),
      `broken internal link ${href} in ${relative(distDir, file)}`,
    );
  }
  pass(
    !/official continuation of the former AnalyseSpider operator/i.test(html),
    `forbidden continuity claim in ${file}`,
  );
  pass(
    !/former users (?:and|or) customers transferred/i.test(html),
    `forbidden transfer claim in ${file}`,
  );
  pass(
    !/independently (?:endorses|validates|recommends) Contextter/i.test(html),
    `forbidden independence claim in ${file}`,
  );
  pass(
    !/Contextter (?:endorsed|validated|recommended) by AnalyseSpider/i.test(
      html,
    ),
    `forbidden common-owner corroboration claim in ${file}`,
  );
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `QA passed: ${routes.length} canonical indexable 200 routes, unique metadata, legal/privacy facts, typed structured data, tool-guide links, launch robots, automatic sitemap, legacy actions, redirects, broken links, and forbidden claims.`,
);

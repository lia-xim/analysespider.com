export type ContentKind = "guide" | "lab-note" | "reference" | "audience";

export interface ContentSource {
  label: string;
  href: string;
  note: string;
}

export interface ContentSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  steps?: string[];
  callout?: string;
  code?: string;
  evidence?: { label: string; value: string }[];
}

export interface ContentPage {
  slug: string;
  kind: ContentKind;
  eyebrow: string;
  title: string;
  description: string;
  intro: string;
  takeaway: string;
  publishedAt: string;
  updatedAt: string;
  sourceCheckedAt?: string;
  readingMinutes: number;
  sections: ContentSection[];
  sources: ContentSource[];
  related: { label: string; href: string; note: string }[];
}

const sources = {
  rfc9110: {
    label: "RFC 9110 — HTTP Semantics",
    href: "https://www.rfc-editor.org/rfc/rfc9110.html",
    note: "The normative definitions for HTTP methods, status codes, fields, and response semantics.",
  },
  googleRedirects: {
    label: "Google Search Central — Redirects and Google Search",
    href: "https://developers.google.com/search/docs/crawling-indexing/301-redirects",
    note: "Google's current treatment of permanent and temporary redirects in Search.",
  },
  googleRobots: {
    label: "Google Search Central — Robots meta and X-Robots-Tag",
    href: "https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag",
    note: "Current page-level indexing and serving controls supported by Google Search.",
  },
  googleCrawlers: {
    label: "Google — Common crawlers",
    href: "https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers",
    note: "Published crawler tokens, user-agent strings, products, and IP-range context.",
  },
  googleVerify: {
    label: "Google — Verify crawler requests",
    href: "https://developers.google.com/crawling/docs/crawlers-fetchers/verify-google-requests",
    note: "Official IP-range and forward-confirmed reverse-DNS verification methods.",
  },
  bingCrawlers: {
    label: "Bing Webmaster Tools — Bing crawlers",
    href: "https://www.bing.com/webmasters/help/help/which-crawlers-does-bing-use-8c184ec0",
    note: "Published Bing crawler user agents and an explicit warning that strings can be spoofed.",
  },
  bingVerify: {
    label: "Bing Webmaster Tools — Verify Bingbot",
    href: "https://www.bing.com/webmasters/help/Verify-Bingbot-2195837f",
    note: "Bing's verification workflow for crawler IP addresses.",
  },
  apacheLogs: {
    label: "Apache HTTP Server — Log files",
    href: "https://httpd.apache.org/docs/current/logs.html",
    note: "Official access-log configuration and Common and Combined Log Format fields.",
  },
  nginxLogs: {
    label: "NGINX — HTTP log module",
    href: "https://nginx.org/en/docs/http/ngx_http_log_module.html",
    note: "Official access_log and log_format behavior, variables, buffering, and escaping.",
  },
} satisfies Record<string, ContentSource>;

export const guides: ContentPage[] = [
  {
    slug: "log-file-analysis",
    kind: "guide",
    eyebrow: "Guide 01",
    title: "Server log analysis without invented certainty",
    description: "A practical workflow for turning Apache or Nginx access logs into a bounded request inventory before drawing SEO conclusions.",
    intro: "Start with the fields the server actually recorded. A log line can show that a request reached one logging layer; it cannot prove that a page was indexed, rendered successfully, or understood.",
    takeaway: "Treat each log row as an observation about a request, then state separately what the row cannot answer.",
    publishedAt: "2026-08-22",
    updatedAt: "2026-08-22",
    readingMinutes: 7,
    sections: [
      {
        heading: "Confirm the log format first",
        paragraphs: [
          "Apache and Nginx access logs are configurable. A parser that assumes every row contains the same fields will eventually mislabel a value or reject valid data.",
          "Record the active format string with the sample. At minimum, identify the remote address, timestamp, request method and path, returned status, bytes sent, referrer, and user agent when those fields exist.",
        ],
        bullets: [
          "Common Log Format usually omits referrer and user agent.",
          "Combined formats commonly add both fields, but administrators can rename, reorder, or omit them.",
          "An upstream proxy or CDN may change which client address reaches the origin log.",
        ],
      },
      {
        heading: "Reduce before you interpret",
        paragraphs: [
          "Build a request inventory before hunting for a story. Count accepted and rejected rows, then group accepted rows by time window, method, path, status family, and declared user agent.",
        ],
        steps: [
          "Keep the raw sample unchanged and work on a copy.",
          "Remove or mask personal and secret-bearing fields that are not needed for the question.",
          "Parse the declared format and report rows that did not match it.",
          "Group requests by the smallest useful time window and URL pattern.",
          "Inspect exceptions before calculating rates or crawler shares.",
        ],
      },
      {
        heading: "Separate observation from inference",
        paragraphs: [
          "A 200 row means the logging server recorded a successful response status for that request. It does not prove that a downstream client received every byte or that a search engine indexed the response.",
          "A user-agent string containing Googlebot or bingbot is a claim made by the requester. Verification requires additional IP or DNS evidence from the relevant operator.",
        ],
        callout: "Useful conclusion: “The origin log recorded 138 GET requests to /products returning 200.” Unsupported conclusion: “Google indexed /products 138 times.”",
      },
      {
        heading: "Choose an action the log can support",
        paragraphs: [
          "Logs are strongest for finding patterns worth checking: repeated 5xx responses, crawler traffic concentrated on redirects, important paths that never appear, or large request volume on parameters.",
          "Confirm the suspected issue with response inspection, a crawl, Search Console, application telemetry, or the relevant server configuration before changing production behavior.",
        ],
      },
    ],
    sources: [sources.apacheLogs, sources.nginxLogs, sources.googleVerify],
    related: [
      { label: "Open Log File Inspector", href: "/tools/log-file-inspector", note: "Parse a bounded sample locally in your browser." },
      { label: "Crawler log analysis", href: "/guides/crawler-log-analysis", note: "Classify claimed bots without calling every matching string genuine." },
      { label: "Private data in access logs", href: "/blog/private-data-in-access-logs", note: "Decide what should be removed before analysis." },
    ],
  },
  {
    slug: "crawler-log-analysis",
    kind: "guide",
    eyebrow: "Guide 02",
    title: "Analyse crawler traffic in access logs",
    description: "Find declared search crawlers in server logs, verify identity where needed, and avoid confusing crawl activity with indexing.",
    intro: "A crawler-shaped user agent is a useful filter, not proof of identity. Use it to build a candidate set, then verify the requests that matter.",
    takeaway: "Label unverified user agents as claimed crawlers. Reserve verified crawler labels for requests that pass the operator's published checks.",
    publishedAt: "2026-08-22",
    updatedAt: "2026-08-22",
    readingMinutes: 8,
    sections: [
      {
        heading: "Build a candidate set",
        paragraphs: [
          "Filter the user-agent field for known product tokens, but preserve the original string. Normalising too early can erase distinctions between search crawlers, product fetchers, ad crawlers, and user-triggered fetchers.",
        ],
        bullets: [
          "Keep request time, IP address, method, path, status, bytes, and full user agent together.",
          "Group by token and IP only after recording the untouched row.",
          "Treat missing or custom user-agent fields as unknown, not human traffic.",
        ],
      },
      {
        heading: "Verify requests when identity matters",
        paragraphs: [
          "Google publishes crawler IP ranges and a forward-confirmed reverse-DNS process. Bing provides its own verification tool and warns that user-agent strings are easy to spoof.",
          "Verification may be unnecessary for a quick exploratory count. It becomes important before blocking traffic, attributing load, reporting crawl shares, or calling a request genuine search-engine activity.",
        ],
        steps: [
          "Match the request IP against the operator's current published ranges when available.",
          "If using DNS, perform the documented reverse lookup and then resolve the returned hostname forward.",
          "Require the forward result to contain the original IP.",
          "Store the verification timestamp and method because ranges and hostnames can change.",
        ],
      },
      {
        heading: "Measure paths and outcomes, not vanity volume",
        paragraphs: [
          "Total crawler hits are rarely the decision. Group verified or claimed requests by page type and returned status. Compare important 200 pages, redirected URLs, 404s, parameter traps, and repeated 5xx responses.",
          "A spike can reflect a deployment, sitemap change, new internal links, retries, or unwanted URL expansion. Logs alone do not identify the cause.",
        ],
      },
      {
        heading: "Do not turn crawl into index status",
        paragraphs: [
          "Crawling, rendering, canonical selection, and indexing are different stages. A request proves only that the recorded layer saw a request and produced the logged response fields.",
          "Use Search Console or the relevant engine's tools for indexing evidence. Use rendered HTML and response inspection for what a crawler could receive. Keep these evidence types in separate columns.",
        ],
      },
    ],
    sources: [sources.googleCrawlers, sources.googleVerify, sources.bingCrawlers, sources.bingVerify],
    related: [
      { label: "Find search bots in logs", href: "/blog/how-to-find-search-bots-in-server-logs", note: "A compact field note with a reusable classification table." },
      { label: "Log File Inspector", href: "/tools/log-file-inspector", note: "Explore a local sample without uploading it." },
      { label: "Crawler user-agent reference", href: "/reference/crawler-user-agents", note: "Know which labels are observations and which require verification." },
    ],
  },
  {
    slug: "http-response-debugging",
    kind: "guide",
    eyebrow: "Guide 03",
    title: "Debug HTTP responses in evidence order",
    description: "Inspect status, Location, canonical, robots directives, and rendered HTML without letting one signal stand in for the whole response.",
    intro: "The useful unit is the response as a set: status, headers, representation, and the request context that produced them. Reading only the final HTML can hide the redirect or header that changed the outcome.",
    takeaway: "Capture the response chain first. Interpret status, headers, and HTML as separate signals before combining them.",
    publishedAt: "2026-08-22",
    updatedAt: "2026-08-22",
    readingMinutes: 7,
    sections: [
      {
        heading: "Record request context",
        paragraphs: [
          "Write down the exact URL, method, timestamp, and relevant request headers. Scheme, host, path, query, cookies, authentication, language, and user agent can change the response.",
        ],
      },
      {
        heading: "Read the chain before the destination",
        paragraphs: [
          "For each hop, record status and Location exactly as returned. Resolve relative locations against the current URL, note loops, and stop at a defined hop limit.",
          "The final 200 does not erase a problematic chain. A temporary hop, cross-host change, protocol downgrade, or loop belongs in the diagnosis.",
        ],
      },
      {
        heading: "Keep header and HTML directives separate",
        paragraphs: [
          "A robots meta element lives in HTML. X-Robots-Tag lives in the response headers and can also control non-HTML resources. Record each occurrence and the user agent it targets.",
          "A canonical link is not a redirect and a redirect is not a canonical declaration. They can point to the same destination, conflict, or be absent.",
        ],
        callout: "If you only paste the final HTML into an inspector, the original status, Location header, and X-Robots-Tag are unknown. Say so in the result.",
      },
      {
        heading: "Translate evidence into the next check",
        paragraphs: [
          "Use the observed response to choose a focused follow-up: inspect the server rule, compare an unauthenticated request, fetch the canonical target, check an alternate host, or verify the rendered document.",
          "Do not rewrite production redirects or indexing controls from one capture when the route varies by region, device, cache, authentication, or deployment.",
        ],
      },
    ],
    sources: [sources.rfc9110, sources.googleRedirects, sources.googleRobots],
    related: [
      { label: "Open Response Inspector", href: "/tools/url-inspector", note: "Paste a raw response and HTML for browser-local inspection." },
      { label: "HTTP status-code reference", href: "/reference/http-status-codes", note: "Separate protocol meaning from SEO interpretation." },
      { label: "Redirect-chain analysis", href: "/guides/redirect-chain-analysis", note: "Work hop by hop without hiding intermediate states." },
    ],
  },
  {
    slug: "redirect-chain-analysis",
    kind: "guide",
    eyebrow: "Guide 04",
    title: "Analyse redirect chains hop by hop",
    description: "A bounded workflow for inspecting 301, 302, 307, and 308 responses, resolving Location fields, and identifying the check that comes next.",
    intro: "A redirect is one response, not a verdict on a migration. The chain matters because each hop can change host, scheme, method behavior, cacheability, and the final page a client receives.",
    takeaway: "Record every response in order and stop describing a chain as healthy until its destination and intent equivalence are checked.",
    publishedAt: "2026-08-22",
    updatedAt: "2026-08-22",
    readingMinutes: 7,
    sections: [
      {
        heading: "Capture each hop",
        paragraphs: [
          "Store the requested URL, response status, Location field, resolved destination, timestamp, and any cache or robots headers. Use a fixed redirect limit and flag repeated URLs as loops.",
        ],
        steps: [
          "Start from the exact historical or internal URL, including scheme and query.",
          "Record the first response before following it.",
          "Resolve a relative Location value against the current URL.",
          "Repeat until a non-redirect response, a loop, or the configured hop cap.",
          "Inspect the final representation and whether it satisfies the original user job.",
        ],
      },
      {
        heading: "Read permanence as stated intent",
        paragraphs: [
          "RFC 9110 defines the HTTP meaning of redirect status codes. Search platforms can add their own processing rules; Google currently describes 301 and 308 as permanent signals and 302, 303, and 307 as temporary signals for Search.",
          "That processing guidance does not prove that the target is equivalent, indexable, or selected as canonical. Those are separate checks.",
        ],
      },
      {
        heading: "Look for avoidable ambiguity",
        bullets: [
          "Multiple permanent hops where one direct redirect is possible.",
          "A scheme or host oscillation that creates a loop.",
          "A Location value that drops a required path or parameter.",
          "A final 404, soft error, login page, or unrelated homepage.",
          "Conflicting canonical or robots signals on the destination.",
        ],
        paragraphs: [
          "A long chain is not automatically broken, but every additional hop adds another state that must work. Reduce it when the direct destination is known and behavior can be preserved.",
        ],
      },
      {
        heading: "Check intent equivalence before consolidating",
        paragraphs: [
          "A permanent redirect is appropriate when the new resource is a real replacement for the old user job. Redirecting unrelated retired downloads or many distinct pages to a homepage creates a misleading destination for both users and diagnostic systems.",
          "When no equivalent remains, an explicit 404 or 410 can be more truthful than a broad redirect.",
        ],
      },
    ],
    sources: [sources.rfc9110, sources.googleRedirects],
    related: [
      { label: "Redirect Chain Builder", href: "/tools/redirect-chain", note: "Resolve pasted Location fields and expose chain gaps or loops locally." },
      { label: "What a 301 does not prove", href: "/blog/what-a-301-response-does-not-prove", note: "A short note on the gaps after the status is observed." },
      { label: "Response Inspector", href: "/tools/url-inspector", note: "Inspect pasted response evidence without a network fetch." },
      { label: "Legacy URL map", href: "/legacy", note: "See why redirects, restorations, and retirements are decided per URL." },
    ],
  },
];

export const blogPosts: ContentPage[] = [
  {
    slug: "how-to-find-search-bots-in-server-logs",
    kind: "lab-note",
    eyebrow: "Technical SEO Article 01",
    title: "A 12-line crawler log: what the inspector finds and misses",
    description: "A reproducible field note using one downloadable synthetic access log, exact local results and a spoofed Googlebot case the parser cannot verify.",
    intro: "This is not another general log-analysis checklist. Download the same 12-line file used below, run it through the browser-local inspector and compare the output with the hand-checked expected result.",
    takeaway: "The inspector finds five crawler claims, three 4xx responses and one 5xx response. It cannot tell that one Googlebot claim comes from a documentation-only address rather than a verified Google range.",
    publishedAt: "2026-08-22",
    updatedAt: "2026-08-28",
    sourceCheckedAt: "2026-08-28",
    readingMinutes: 6,
    sections: [
      {
        heading: "The file is deliberately small and slightly deceptive",
        paragraphs: [
          "All addresses use IANA documentation ranges, all paths are invented and no person or production system appears in the sample. Eleven rows match the Apache Combined-style parser. One malformed line is intentional and must be reported as rejected.",
          "The file contains two ordinary Googlebot strings, one Bingbot string, one GPTBot string and one copied Googlebot string attached to 203.0.113.77. The parser groups all five as crawler claims because it has no DNS or published-range verification step.",
        ],
        code: "203.0.113.77 - - [28/Aug/2026:08:01:07 +0000] \"GET /pricing HTTP/1.1\" 200 1450 \"-\" \"Googlebot/2.1 (+http://www.google.com/bot.html)\"",
      },
      {
        heading: "Expected local result",
        paragraphs: ["Run the sample without editing it. These counts are a deterministic check of the current parser, not an estimate."],
        evidence: [
          { label: "Accepted rows", value: "11" },
          { label: "Rejected rows", value: "1" },
          { label: "Unique addresses", value: "8" },
          { label: "Claimed crawler requests", value: "5" },
          { label: "4xx responses", value: "3" },
          { label: "5xx responses", value: "1" },
        ],
        callout: "Download the sample from the next-step panel and use “Analyse locally”. Nothing in the file needs a live network request.",
      },
      {
        heading: "The useful finding is the mismatch, not the bot total",
        paragraphs: [
          "One Googlebot claim receives a 301 on /old-guide and the following request reaches /guides/new-guide with 200. That pair is evidence of two server responses. It does not prove that Google consolidated the URLs or indexed the destination.",
          "Bingbot receives a 404 on /missing-product. GPTBot receives 429 on /api/export. Those are specific investigation leads: confirm whether the URLs should exist and whether the throttling rule is intended for that verified requester.",
        ],
      },
      {
        heading: "What the local parser cannot settle",
        paragraphs: [
          "The 203.0.113.77 row looks like Googlebot to a text classifier and stays labelled as a claim. To attribute it to Google, follow Google's current verification method using published ranges or reverse and forward DNS. The address in this synthetic file is reserved for documentation, so it is intentionally not a real Google crawler address.",
          "The sample also cannot answer whether JavaScript rendered, whether a URL entered an index, which canonical an engine selected or why the 500 occurred. Each of those needs different evidence.",
        ],
      },
      {
        heading: "Reproduce the check",
        steps: [
          "Download the synthetic Combined-style access log.",
          "Open the Log File Inspector and load or paste the file.",
          "Run the local analysis and compare the six counts with the expected result above.",
          "Open the crawler table and keep all five rows labelled as claims.",
          "Use the operator-specific verification method before changing a firewall rule or publishing an attributed bot count.",
        ],
      },
    ],
    sources: [sources.apacheLogs, sources.nginxLogs, sources.googleCrawlers, sources.googleVerify, sources.bingCrawlers],
    related: [
      { label: "Download the 12-line sample", href: "/fixtures/synthetic-crawler-access.log", note: "Synthetic Apache Combined-style input; no production or personal data." },
      { label: "Crawler user-agent reference", href: "/reference/crawler-user-agents", note: "Keep tokens, strings, IPs, and identity claims distinct." },
      { label: "Log File Inspector", href: "/tools/log-file-inspector", note: "Filter a bounded log sample locally." },
    ],
  },
  {
    slug: "what-a-301-response-does-not-prove",
    kind: "lab-note",
    eyebrow: "Technical SEO Article 02",
    title: "What a 301 response does not prove",
    description: "A 301 states that a resource has moved permanently. It does not prove destination quality, intent equivalence, or search-engine selection.",
    intro: "A 301 is strong protocol evidence about the server's stated redirect. It is not a complete migration report.",
    takeaway: "After observing 301, inspect Location, the rest of the chain, the final response, and whether the destination actually replaces the source.",
    publishedAt: "2026-08-22",
    updatedAt: "2026-08-28",
    readingMinutes: 8,
    sections: [
      {
        heading: "The status has a defined meaning",
        paragraphs: [
          "RFC 9110 defines 301 Moved Permanently as a redirect indicating that the target resource has been assigned a new permanent URI. Google currently describes 301 and 308 as permanent redirect signals for Search.",
          "That is enough to classify the observed response as a stated permanent move. It does not fill in any missing evidence about the destination.",
        ],
      },
      {
        heading: "Five questions remain",
        bullets: [
          "Did Location resolve to the intended URL?",
          "Did another hop change the destination or permanence?",
          "Did the final URL return a usable response and representation?",
          "Does the final page satisfy the same user job as the source?",
          "Do canonical and robots signals agree with the migration intent?",
        ],
      },
      {
        heading: "Homepage redirects need the same proof",
        paragraphs: [
          "A blanket redirect can remove 404s from a report while sending visitors to an unrelated page. That is not the same as restoring a resource or consolidating equivalent content.",
          "For retired software downloads or historical pages without a rights-safe successor, an explicit 404 or 410 may describe the state more accurately.",
        ],
      },
      {
        heading: "Test the chain as a sequence of separate responses",
        paragraphs: [
          "Record the requested URL, status and Location value at every hop. Resolve relative Location values against the current response URL, not the original URL. Stop on a loop, a missing Location header, an unsafe scheme, or a defined hop limit instead of guessing the final destination.",
          "Then request the final URL independently and capture its status, content type, robots directives and canonical. Browser address bars often hide intermediate hops, so a final-looking page is not evidence of a clean one-hop migration.",
        ],
      },
      {
        heading: "Judge equivalence from the user's task",
        paragraphs: [
          "The destination should help the person who requested the old URL complete substantially the same task. A moved product page can usually redirect to its direct successor. A retired download with no rights-safe replacement may be better represented by 410 and a clear explanation than by a generic homepage.",
          "This decision is editorial as well as technical. Matching words in a title are weaker evidence than matching purpose, scope and expected next action.",
        ],
      },
      {
        heading: "Migration evidence worth keeping",
        bullets: [
          "A versioned source-to-destination map with an owner for each decision.",
          "Pre-launch and post-launch captures for representative URLs.",
          "A check for redirect loops, long chains and mixed host or protocol hops.",
          "Final-page status, canonical, indexability and internal-link updates.",
          "A follow-up window in logs and search-platform reporting without a ranking promise.",
        ],
        callout: "A lower 404 count is not a success metric when unrelated URLs have merely been hidden behind homepage redirects.",
      },
    ],
    sources: [sources.rfc9110, sources.googleRedirects],
    related: [
      { label: "Redirect-chain guide", href: "/guides/redirect-chain-analysis", note: "Capture each hop and the final representation." },
      { label: "HTTP status-code reference", href: "/reference/http-status-codes", note: "Read protocol meaning without overextending it." },
      { label: "Legacy decisions", href: "/legacy", note: "Inspect URL-level restore, redirect, and retirement choices." },
    ],
  },
  {
    slug: "private-data-in-access-logs",
    kind: "lab-note",
    eyebrow: "Technical SEO Article 03",
    title: "Private data can hide inside ordinary access logs",
    description: "Access logs may contain addresses, identifiers, query values, referrers, and user agents. Minimise the sample before sharing or analysis.",
    intro: "A log file can look mechanical and still contain personal, confidential, or secret-bearing data. The safe default is to remove fields you do not need before the sample leaves its operational boundary.",
    takeaway: "Minimise first, analyse second. Redaction should preserve the pattern needed for the question without preserving the original identifier.",
    publishedAt: "2026-08-22",
    updatedAt: "2026-08-28",
    readingMinutes: 9,
    sections: [
      {
        heading: "Know which fields can carry data",
        paragraphs: [
          "Remote addresses, authenticated usernames, full paths, query strings, referrers, cookies, user agents, and custom headers can all reveal more than the analysis needs. URL parameters sometimes contain email addresses, search terms, session identifiers, or reset tokens.",
          "The exact exposure depends on the configured format. Read the Apache LogFormat or Nginx log_format definition instead of guessing from a few rows.",
        ],
      },
      {
        heading: "Preserve structure, not identity",
        bullets: [
          "Replace addresses with stable sample-only labels when sequence matters.",
          "Remove query values or retain only an allowlisted parameter name when value content is irrelevant.",
          "Delete cookies, authorisation fields, and secret-bearing headers from diagnostic exports.",
          "Reduce timestamps to the precision the question actually needs.",
          "Keep a small bounded window instead of exporting the complete retention period.",
        ],
      },
      {
        heading: "Local processing narrows the exposure",
        paragraphs: [
          "A browser-local tool avoids uploading the pasted sample to the tool operator, but it does not make the original file harmless. The device, clipboard, browser extensions, screenshots, and later exports remain part of the handling boundary.",
          "Document who can access the raw logs, how long they are retained, and which derived result is safe to share. Tool choice is one control, not the whole policy.",
        ],
      },
      {
        heading: "Build a question-specific minimisation plan",
        paragraphs: [
          "Start with the decision, not the available columns. Redirect diagnosis normally needs time, method, host, path, status and perhaps referrer. Crawler verification may additionally need address and user agent. Neither task normally needs cookies, authorisation headers or full query values.",
          "Write the required fields down before exporting. This makes overcollection visible and gives reviewers a concrete reason for every retained field.",
        ],
      },
      {
        heading: "Pseudonymisation is useful but not erasure",
        paragraphs: [
          "A stable replacement label can preserve request sequences without exposing the original address in the working file. If the mapping or a repeatable secret still exists, the data may remain linkable and should not automatically be described as anonymous.",
          "Use a fresh sample-specific mapping when cross-period tracking is unnecessary. Keep the key and the raw source out of the shared analysis package, and set a deletion date for both the working copy and derived exports.",
        ],
      },
      {
        heading: "A safe handoff checklist",
        steps: [
          "Confirm the configured log format and the exact analysis question.",
          "Choose the smallest time window and host scope that can answer it.",
          "Remove secret-bearing fields and minimise or pseudonymise identifiers.",
          "Inspect a sample for unexpected data in paths, queries and referrers.",
          "Share aggregate results by default and restrict access to the raw evidence.",
          "Document retention, deletion and the person responsible for the source file.",
        ],
        callout: "If a value is not needed to answer the question, do not preserve it merely because the log format collected it.",
      },
    ],
    sources: [sources.apacheLogs, sources.nginxLogs],
    related: [
      { label: "Method and privacy", href: "/methodology-and-privacy", note: "See the current browser-local processing boundary." },
      { label: "Log-analysis guide", href: "/guides/log-file-analysis", note: "Build a bounded request inventory after minimisation." },
      { label: "Log File Inspector", href: "/tools/log-file-inspector", note: "No current log sample is uploaded by the tool." },
    ],
  },
];

export const referencePages: ContentPage[] = [
  {
    slug: "http-status-codes",
    kind: "reference",
    eyebrow: "Reference 01",
    title: "HTTP status codes for web diagnostics",
    description: "A compact diagnostic reference for common 2xx, 3xx, 4xx, and 5xx responses, with protocol meaning separated from SEO inference.",
    intro: "An HTTP status code describes the result of one request in protocol terms. It does not, by itself, report rendering, canonical selection, indexing, or business impact.",
    takeaway: "Use RFC 9110 for status semantics. Add headers, representation, request context, and platform evidence before making an SEO diagnosis.",
    publishedAt: "2026-08-22",
    updatedAt: "2026-08-22",
    readingMinutes: 7,
    sections: [
      {
        heading: "Successful responses",
        bullets: [
          "200 OK: the request succeeded; the meaning of the content depends on the method.",
          "204 No Content: the request succeeded and the response has no content.",
          "206 Partial Content: the server is fulfilling a valid range request with selected content.",
        ],
        paragraphs: ["A 200 can still contain an error message, login screen, empty template, noindex directive, or unintended canonical. Inspect the representation."],
      },
      {
        heading: "Redirect responses",
        bullets: [
          "301 Moved Permanently and 308 Permanent Redirect state a permanent move.",
          "302 Found and 307 Temporary Redirect state a temporary move.",
          "303 See Other points the client to another resource, commonly after a non-GET request.",
          "304 Not Modified is a cache-validation response, not a normal redirect to another URL.",
        ],
        paragraphs: ["Record the Location field and follow the entire bounded chain. Status alone does not show whether the destination is equivalent or healthy."],
      },
      {
        heading: "Client-error responses",
        bullets: [
          "400 Bad Request: the server cannot or will not process the request because of a client-side error.",
          "401 Unauthorized: authentication credentials are required or insufficient for the request.",
          "403 Forbidden: the server understood the request but refuses to fulfil it.",
          "404 Not Found: the server did not find a current representation or is not willing to disclose one.",
          "410 Gone: the resource is no longer available and the condition is likely permanent.",
          "429 Too Many Requests: the client sent too many requests in a given time.",
        ],
      },
      {
        heading: "Server-error responses",
        bullets: [
          "500 Internal Server Error: the server encountered an unexpected condition.",
          "502 Bad Gateway: a gateway or proxy received an invalid upstream response.",
          "503 Service Unavailable: the server is temporarily unable to handle the request.",
          "504 Gateway Timeout: a gateway or proxy did not receive a timely upstream response.",
        ],
        paragraphs: ["Group repeated 5xx responses by route, upstream, time, and deployment. One row establishes an observed failure, not its root cause."],
      },
    ],
    sources: [sources.rfc9110, sources.googleRedirects],
    related: [
      { label: "HTTP response debugging", href: "/guides/http-response-debugging", note: "Turn a status into a complete evidence capture." },
      { label: "Response Inspector", href: "/tools/url-inspector", note: "Inspect pasted headers and HTML locally." },
      { label: "What a 301 does not prove", href: "/blog/what-a-301-response-does-not-prove", note: "Avoid a common over-interpretation." },
    ],
  },
  {
    slug: "crawler-user-agents",
    kind: "reference",
    eyebrow: "Reference 02",
    title: "Crawler user agents: claim, token, and verification",
    description: "A reference for classifying crawler strings without treating an easily spoofed header as verified identity.",
    intro: "The User-Agent header is supplied by the requester. It can name a crawler product, but identity requires the verification method published by that operator.",
    takeaway: "Store the full string, extracted token, source IP, identity state, verification method, and timestamp as separate fields.",
    publishedAt: "2026-08-22",
    updatedAt: "2026-08-22",
    readingMinutes: 6,
    sections: [
      {
        heading: "Five fields that should not collapse into one",
        bullets: [
          "Full user-agent string: the exact request header value.",
          "Product token: the crawler name used for matching or robots rules.",
          "Source address: the IP recorded by the logging layer.",
          "Identity state: claimed, verified, or unknown.",
          "Verification evidence: range file or DNS procedure plus timestamp.",
        ],
      },
      {
        heading: "Google crawler evidence",
        paragraphs: [
          "Google publishes common crawler strings and tokens as well as machine-readable IP ranges. It also documents a forward-confirmed reverse-DNS method for manual verification.",
          "Different Google products use different crawlers and fetchers. Do not normalise every string containing “Google” into Googlebot.",
        ],
      },
      {
        heading: "Bing crawler evidence",
        paragraphs: [
          "Bing publishes examples for bingbot and other crawler products. Its documentation explicitly warns that user-agent strings are easy to spoof and provides a verification workflow for IP addresses.",
        ],
      },
      {
        heading: "A classification rule that survives change",
        paragraphs: [
          "Keep the operator documentation URL and the date you checked it. Crawler strings, rendering-engine versions, IP ranges, and product names can change.",
          "A historical log should retain the evidence available at analysis time rather than silently receiving a present-day identity label.",
        ],
      },
    ],
    sources: [sources.googleCrawlers, sources.googleVerify, sources.bingCrawlers, sources.bingVerify],
    related: [
      { label: "Crawler log analysis", href: "/guides/crawler-log-analysis", note: "Apply the identity model to a real log sample." },
      { label: "Find bots in logs", href: "/blog/how-to-find-search-bots-in-server-logs", note: "Build the candidate and verified counts." },
      { label: "Log File Inspector", href: "/tools/log-file-inspector", note: "Explore declared agents before any external verification." },
    ],
  },
  {
    slug: "robots-directives",
    kind: "reference",
    eyebrow: "Reference 03",
    title: "Robots directives in headers and HTML",
    description: "Read robots meta elements and X-Robots-Tag response headers as page-level controls, with crawler access and conflicts kept visible.",
    intro: "Robots meta and X-Robots-Tag can carry page-level indexing and serving rules. They only help a crawler that can receive and process the response containing them.",
    takeaway: "Inspect response headers and HTML separately, record targeted user agents, and resolve conflicts with the relevant crawler documentation.",
    publishedAt: "2026-08-22",
    updatedAt: "2026-08-22",
    readingMinutes: 6,
    sections: [
      {
        heading: "Where directives appear",
        bullets: [
          "Robots meta element: an HTML element, normally in the document head.",
          "X-Robots-Tag: an HTTP response header that can also apply to non-HTML resources.",
          "robots.txt: a crawl-control file, not a page-level noindex mechanism.",
        ],
      },
      {
        heading: "Common rules",
        bullets: [
          "noindex asks a supporting search engine not to show the resource in results.",
          "nofollow asks a supporting crawler not to follow links on the resource.",
          "nosnippet prevents a text or video preview in supporting Google results.",
          "max-snippet, max-image-preview, and max-video-preview set supported preview limits.",
        ],
        paragraphs: ["Support and interpretation can differ by crawler. Recheck the operator's current documentation before relying on a rule outside Google Search."],
      },
      {
        heading: "Crawler access comes first",
        paragraphs: [
          "Google states that a crawler must be allowed to access a page to discover its meta or X-Robots-Tag rules. Disallowing a URL in robots.txt can prevent those page-level rules from being seen.",
          "This is why crawl control and index control should be tested as a combined system, not as interchangeable files.",
        ],
      },
      {
        heading: "What an inspector should report",
        bullets: [
          "Every robots meta element and its name attribute.",
          "Every X-Robots-Tag field and any targeted crawler token.",
          "Duplicate or conflicting rules without silently discarding one.",
          "Whether the HTML, response headers, or original fetch context are missing.",
        ],
      },
    ],
    sources: [sources.googleRobots],
    related: [
      { label: "Response debugging", href: "/guides/http-response-debugging", note: "Capture headers and HTML in evidence order." },
      { label: "Robots.txt Rule Tester", href: "/tools/robots-rule-tester", note: "Evaluate one product token and path locally under the RFC rule model." },
      { label: "Response Inspector", href: "/tools/url-inspector", note: "Compare page-level header and HTML directives." },
      { label: "Robots testing guide", href: "/guides/test-robots-txt-rules", note: "Capture delivery, matching, and decision boundaries in order." },
    ],
  },
  {
    slug: "crawler-verification-methods",
    kind: "reference",
    eyebrow: "Reference 04",
    title: "Crawler verification methods compared",
    description: "Compare user-agent matching, published IP ranges, forward-confirmed reverse DNS, operator tools, and request-log evidence without overstating identity.",
    intro: "Crawler verification is not one lookup. The useful method depends on whether you are filtering a sample, attributing load, blocking traffic, or making a public claim about who requested a URL.",
    takeaway: "Use the user agent to find candidates; use operator-published IP or DNS evidence when identity changes the decision; keep the original log row and verification time together.",
    publishedAt: "2026-08-22",
    updatedAt: "2026-08-22",
    readingMinutes: 8,
    sections: [
      {
        heading: "Comparison matrix",
        paragraphs: ["No single field establishes every part of crawler identity. Treat the methods as evidence layers with different failure modes."],
        bullets: [
          "User-agent token — fast candidate filter; supplied by the requester and easy to spoof; never sufficient for a genuine-bot claim.",
          "Published IP range — strong when the operator publishes current machine-readable ranges; requires fresh range data and exact address matching.",
          "Forward-confirmed reverse DNS — strong for operators that document hostname masks; requires both reverse lookup and a forward lookup back to the original IP.",
          "Operator verification tool — useful operator verdict for a specific address, such as Verify Bingbot; preserve the lookup time and input address.",
          "Access-log row — primary evidence that your logging layer observed a request, status, path, address, and user agent; it does not by itself verify the requester.",
          "Search Console crawl or indexing report — platform evidence about Google processing; it is not a row-level identity check for arbitrary server traffic.",
        ],
      },
      {
        heading: "Choose the minimum evidence for the decision",
        paragraphs: [
          "Exploratory log analysis can label user-agent matches as claimed crawlers. Blocking an address, attributing an outage, publishing crawler shares, or escalating abuse needs stronger verification because the consequence is larger.",
          "Google documents both published range files and a manual DNS workflow. Bing publishes crawler strings, warns that they can be spoofed, and provides an address-verification tool. Apply the method documented by the claimed operator rather than one universal hostname rule.",
        ],
        steps: [
          "Preserve the original request time, IP, full user agent, method, path, and status.",
          "Extract a product token only as a candidate label.",
          "Select the operator's current verification method and record its source version or lookup time.",
          "Store the result as claimed, verified, failed verification, or unknown; do not collapse unknown into human.",
          "Repeat verification when the decision is delayed because IP allocations and documentation can change.",
        ],
      },
      {
        heading: "Failure modes worth preserving",
        bullets: [
          "Reverse DNS name matches an expected suffix, but forward resolution does not return the original address.",
          "The address was checked against an old local copy of a published range file.",
          "A proxy or load balancer log recorded its own address because the trusted client-IP chain was not configured.",
          "A generic token grouped product fetchers, preview bots, advertising crawlers, and search crawlers into one family.",
          "An operator tool returned no verdict or was unavailable, and the report silently promoted the request to verified.",
        ],
        callout: "A failed or unavailable verification is not proof that a request is malicious. Record the evidence state and choose a proportionate next check.",
      },
      {
        heading: "A portable evidence record",
        paragraphs: ["A useful handoff keeps observation and verification separate: observed request fields, claimed product token, verification method, source URL or range version, verification timestamp, result, and unresolved proxy or retention caveats."],
      },
    ],
    sources: [sources.googleCrawlers, sources.googleVerify, sources.bingCrawlers, sources.bingVerify, sources.apacheLogs],
    related: [
      { label: "Log File Inspector", href: "/tools/log-file-inspector", note: "Build a bounded candidate inventory and export aggregate evidence locally." },
      { label: "Crawler log analysis", href: "/guides/crawler-log-analysis", note: "Apply the verification threshold to an operational workflow." },
      { label: "Crawler user-agent reference", href: "/reference/crawler-user-agents", note: "Keep string, token, address, identity state, and evidence separate." },
    ],
  },
];

export const audiencePages: ContentPage[] = [
  {
    slug: "technical-seos",
    kind: "audience",
    eyebrow: "For technical SEOs",
    title: "Technical SEO evidence before conclusions",
    description: "Browser-local log and response inspection for technical SEOs who need a reproducible first pass without uploading client evidence.",
    intro: "Use AnalyseSpider for the small evidence step before a larger crawl or platform investigation: isolate the requests, responses, directives, and unknowns that justify the next check.",
    takeaway: "The output is a diagnostic handoff, not an automated verdict about indexing or ranking.",
    publishedAt: "2026-08-22",
    updatedAt: "2026-08-22",
    readingMinutes: 4,
    sections: [
      { heading: "Useful starting jobs", paragraphs: ["Parse a bounded log sample, classify redirect and error patterns, inspect pasted response headers and HTML, or check whether an IP value is public, private, or reserved."], bullets: ["Crawler candidate inventory", "Status and path distribution", "Redirect and directive capture", "Observed, inferred, and unknown handoff"] },
      { heading: "Where this stops", paragraphs: ["AnalyseSpider does not currently fetch arbitrary URLs, crawl sites, query Search Console, verify bot IPs, or decide canonical selection. Those need separate evidence and controls."], callout: "Client logs can contain personal or confidential data. Minimise the sample before pasting it into any tool, including a local one." },
      { heading: "A practical sequence", steps: ["Reduce the sample to the affected time and route set.", "Inspect local observations and rejected rows.", "Write the strongest supported hypothesis.", "Verify it in the relevant server, crawler, search-platform, or application surface."] },
    ],
    sources: [],
    related: [
      { label: "Tools", href: "/tools", note: "Choose the smallest inspector for the evidence you already have." },
      { label: "Guides", href: "/guides", note: "Follow a bounded diagnostic workflow." },
      { label: "Method", href: "/methodology-and-privacy", note: "Audit processing, limits, and source roles." },
    ],
  },
  {
    slug: "web-developers",
    kind: "audience",
    eyebrow: "For web developers",
    title: "Web diagnostics for developers",
    description: "Inspect raw HTTP response evidence, redirect hops, directives, and local logs before editing middleware, proxy, or application rules.",
    intro: "A routing bug often crosses layers: CDN, proxy, framework, application, and browser. AnalyseSpider helps keep the captured evidence intact while you decide which layer to inspect next.",
    takeaway: "Use the tools to narrow the owner of a response. Do not treat a pasted capture as proof of every environment or request context.",
    publishedAt: "2026-08-22",
    updatedAt: "2026-08-28",
    readingMinutes: 4,
    sections: [
      { heading: "Capture the response as delivered", paragraphs: ["Keep status, Location, cache fields, content type, X-Robots-Tag, and relevant HTML together. Record the exact URL and request context that produced them."], bullets: ["Relative and absolute redirect targets", "Host and scheme changes", "Header and HTML directive conflicts", "Final response status and representation"] },
      { heading: "Use unknowns as test cases", paragraphs: ["If the capture omits a request header, intermediate hop, CDN state, or authenticated variant, mark it unknown. That missing field becomes the next reproducible test rather than an excuse for a broad configuration change."] },
      { heading: "A bounded network path", paragraphs: ["Log files and IP addresses stay in the browser. Response headers, redirect chains and robots.txt rules can also be pasted and analysed locally. Their optional live modes send one public URL to a protected gateway with private-network blocking, redirect and response caps, a proof challenge and rate limits."], callout: "This is a single-URL diagnostic request, not an unrestricted crawler, port scanner or authenticated-site inspection." },
    ],
    sources: [],
    related: [
      { label: "Response Inspector", href: "/tools/url-inspector", note: "Inspect raw pasted headers and HTML." },
      { label: "HTTP response guide", href: "/guides/http-response-debugging", note: "Move from request context to the next check." },
      { label: "HTTP status reference", href: "/reference/http-status-codes", note: "Keep protocol meaning and application diagnosis separate." },
    ],
  },
  {
    slug: "site-owners",
    kind: "audience",
    eyebrow: "For site owners",
    title: "Technical reports for site owners",
    description: "Plain evidence boundaries for site owners reviewing redirect, crawler, response, or IP findings before authorising a change.",
    intro: "Technical reports often compress a chain of observations into one confident sentence. AnalyseSpider keeps the status, path, directive, and uncertainty visible so you can ask for the missing proof.",
    takeaway: "A useful diagnosis tells you what was seen, what it may mean, what remains unknown, and which check would change the decision.",
    publishedAt: "2026-08-22",
    updatedAt: "2026-08-22",
    readingMinutes: 4,
    sections: [
      { heading: "Questions worth asking", bullets: ["Was this result observed on the live production URL?", "Which request and response fields were captured?", "Is the crawler identity verified or only declared?", "Does the destination replace the same user job?", "What evidence would disprove the recommendation?"] , paragraphs: ["These questions are more useful than asking whether an audit score is high or low."] },
      { heading: "Safe uses of the current tools", paragraphs: ["You can inspect a small redacted log sample, paste a response supplied by your developer, or classify an IP range without uploading the values to AnalyseSpider's server."] },
      { heading: "When to involve the system owner", paragraphs: ["Changes to redirects, access controls, log retention, crawler blocking, or production headers can affect users and search systems. Ask the developer, hosting owner, privacy owner, or SEO owner to confirm the scope before rollout."], callout: "An IP address does not establish a person's identity or precise location. Do not use the IP checker to make decisions about an individual." },
    ],
    sources: [],
    related: [
      { label: "Start with the tools", href: "/tools", note: "Choose a bounded browser-local inspection." },
      { label: "Read the reference", href: "/reference", note: "Translate technical labels into their actual scope." },
      { label: "Contact and corrections", href: "/contact", note: "Report a factual, privacy, or legacy issue." },
    ],
  },
];

export const contentPages = [...guides, ...blogPosts, ...referencePages, ...audiencePages];

export const formatDate = (date: string) => new Intl.DateTimeFormat("en", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(`${date}T00:00:00Z`));

# Hub and cluster map — 2026-08-28

Each cluster must remain useful without Contextter and must link tools, workflow, reference, and proof where those assets actually exist.

## 1. Crawl-log evidence

- Hub: `/guides`
- Tool: `/tools/log-file-inspector`
- German pair: `/de/tools/server-log-analyse`, `/de/wissen/crawler-in-server-logs-erkennen`
- Guides: `/guides/log-file-analysis`, `/guides/crawler-log-analysis`
- Lab note: `/blog/how-to-find-search-bots-in-server-logs`, `/blog/private-data-in-access-logs`
- Reference: `/reference/crawler-user-agents`, `/reference/crawler-verification-methods`
- Legacy successor: `/analysespider.html`

## 2. HTTP response and redirect evidence

- Hub: `/tools` and `/guides`
- Tools: `/tools/url-inspector`, `/tools/redirect-chain`
- German pairs: `/de/tools/http-antwort`, `/de/wissen/http-antwort-verstehen`, `/de/tools/weiterleitungskette`, `/de/wissen/redirect-kette-pruefen`
- Guides: `/guides/http-response-debugging`, `/guides/redirect-chain-analysis`
- Lab note: `/blog/what-a-301-response-does-not-prove`
- Reference: `/reference/http-status-codes`, `/reference/robots-directives`
- Legacy evidence: `/legacy`

## 2a. Live crawler diagnostics

- English tool: `/tools/crawler-view`
- German tool: `/de/tools/crawler-sicht`
- Local follow-up: `/tools/url-inspector`, `/tools/robots-rule-tester`
- Method and privacy boundary: `/methodology-and-privacy`, `/privacy`
- Crawler identity and role context: `/crawlers`, `/de/crawler`, `/reference/crawler-verification-methods`
- The live check remains one-URL, no-JavaScript, and useful without an outbound product handoff.

## 3. Robots and crawler access

- Tool: `/tools/robots-rule-tester`
- Guide: `/guides/test-robots-txt-rules`
- Reference: `/reference/robots-directives`, `/reference/crawler-user-agents`
- Parser proof: `/lab/robots-rule-fixtures`
- External crawler protocol and controlled fixture: `/lab/crawler-benchmarks`, `/fixtures/crawler-lab/`
- Method boundary: `/methodology-and-privacy`

## 4. IP and geography limits

- Tool: `/tools/ip-location`
- Guide: `/guides/ip-geolocation-data`
- German pair: `/de/tools/ip-adresse`, `/de/wissen/ip-geolokalisierung-verstehen`
- Restored references: `/ip2country/country_code.html`, `/geo-targeting/geo-targeting.html`
- Legacy redirects: `/ip2country/lookup.php`, `/ip2country/lookup.html`, `/ip2country/ip_country.html`

## 5. Identity, rights, and operation

- `/about`, `/new-ownership`, `/legacy`, `/methodology-and-privacy`
- `/privacy`, `/impressum`, `/contact`, `/changelog`

## 6. Audience routes

- Hub: `/for`
- `/for/technical-seos`, `/for/web-developers`, `/for/site-owners`
- These pages route a real audience to existing evidence; they are not keyword variants and should not multiply without a new user job.

## 7. Crawler comparison

- English hub: `/crawlers`
- German hub: `/de/crawler`
- Identity detail: `/reference/crawler-user-agents`, `/reference/crawler-verification-methods`
- Evidence boundary: `/lab/crawler-benchmarks`
- Related AI-answer evidence and page-decision tools may be linked only in the comparison context with common ownership visible.
- AI-search eligibility guide: `/guides/appear-in-ai-search` and `/de/wissen/in-ai-suche-erscheinen`
- The guide separates search crawling, training crawling, user-triggered retrieval, index eligibility and later answer selection.

## 8. German entry layer

- Entry pages: `/de`, `/de/tools`, `/de/wissen`, `/de/ueber`
- Five core jobs now have one shared-function German tool and one maintained German guide: HTTP, redirects, robots.txt, server logs and IP geography.
- Reciprocal `hreflang` is emitted only for maintained counterparts. Related but non-equivalent pages remain unpaired.

Link rule: use descriptive HTML anchors in the relevant workflow. Do not add sitewide portfolio links, reciprocal exact-match links, or unrelated homepage redirects.

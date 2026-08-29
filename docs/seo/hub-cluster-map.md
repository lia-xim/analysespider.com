# Hub and cluster map — 2026-08-29

Each cluster must remain useful without Contextter and must link tools, workflow, reference, and proof where those assets actually exist.

## 1. Crawl-log evidence

- Hub: `/guides`
- Tools: `/tools/log-file-inspector`, `/tools/bot-verification`
- German pair: `/de/tools/server-log-analyse`, `/de/wissen/crawler-in-server-logs-erkennen`
- Guides: `/guides/log-file-analysis`, `/guides/crawler-log-analysis`
- Lab note: `/blog/how-to-find-search-bots-in-server-logs`, `/blog/private-data-in-access-logs`
- Reference: `/reference/crawler-user-agents`, `/reference/crawler-verification-methods`
- Legacy successor: `/analysespider.html`
- Proof path: log analyzer -> browser-local request verifier -> crawler verification methods -> live URL check -> crawler benchmark

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
- Index-readiness focus: `/tools/google-index-check`, `/de/tools/google-index-check`
- Local follow-up: `/tools/url-inspector`, `/tools/robots-rule-tester`
- Method and privacy boundary: `/methodology-and-privacy`, `/privacy`
- Crawler identity and role context: `/crawlers`, `/de/crawler`, `/reference/crawler-verification-methods`
- The live check remains one-URL, no-JavaScript, and useful without an outbound product handoff.
- Result path: four eligibility answers -> visible purpose-based crawler matrix -> local Markdown/JSON export -> 24-hour browser-local comparison -> optional simulated-token response comparison.
- The simulation is one additional bounded request with an allowlisted product token. It exposes the exact User-Agent and compares status, response headers, canonical, noindex, visible text and HTML hash, but never presents the request as the real vendor crawler.
- Rendering guide pair: `/blog/initial-html-vs-rendered-dom`, `/de/wissen/initiales-html-vs-gerenderter-dom`.
- The index checker reports only current technical readiness. A manual `site:` link is labelled as a clue; authenticated Google URL Inspection remains the deeper common-owner workflow.

## 3. Robots and crawler access

- Tool: `/tools/robots-rule-tester`
- Guide: `/guides/test-robots-txt-rules`
- Reference: `/reference/robots-directives`, `/reference/crawler-user-agents`
- Parser proof: `/lab/robots-rule-fixtures`
- External crawler protocol, first controlled header baseline and raw evidence: `/lab/crawler-benchmarks`, `/fixtures/crawler-lab/`, `/evidence/crawler-header-baseline-2026-08-28.json`
- Method boundary: `/methodology-and-privacy`
- CDN/WAF diagnosis guide pair: `/blog/robots-txt-allows-bot-cdn-blocks-it`, `/de/wissen/robots-erlaubt-cdn-blockiert`.

## 4. IP and geography limits

- Tool: `/tools/ip-location`
- Guide: `/guides/ip-geolocation-data`
- German pair: `/de/tools/ip-adresse`, `/de/wissen/ip-geolokalisierung-verstehen`
- Bot identity bridge: `/tools/bot-verification`, `/de/tools/bot-verifizierung` (request origin, not geolocation)
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
- Diagnostic workflow: `/tools/crawler-view`, `/tools/robots-rule-tester`, `/tools/log-file-inspector` and their German counterparts.
- Hub order: crawler job -> fetch/process/select boundary -> operator table -> identity evidence -> logs -> focused tools -> technical eligibility.
- Related AI-answer evidence and page-decision tools may be linked only in the comparison context with common ownership visible.
- AI-search eligibility guide: `/guides/appear-in-ai-search` and `/de/wissen/in-ai-suche-erscheinen`
- The guide separates search crawling, training crawling, user-triggered retrieval, index eligibility and later answer selection.
- The hub links to the robots-versus-CDN and initial-HTML-versus-rendered-DOM articles as two distinct evidence problems.

## 8. German entry layer

- Entry pages: `/de`, `/de/tools`, `/de/wissen`, `/de/ueber`
- Five core jobs have one shared-function German tool and one maintained German guide: HTTP, redirects, robots.txt, server logs and IP geography. Two source-led German articles extend the crawler cluster for CDN blocking and JavaScript rendering.
- Reciprocal `hreflang` is emitted only for maintained counterparts. Related but non-equivalent pages remain unpaired.

Link rule: use descriptive HTML anchors in the relevant workflow. Do not add sitewide portfolio links, reciprocal exact-match links, or unrelated homepage redirects.

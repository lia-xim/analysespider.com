# Page action matrix — 2026-08-23

Every indexable canonical URL has one primary user job. “Keep” does not mean “finished forever”; it means no merge, redirect, or expansion is justified by current evidence.

| Canonical URL | Primary user job | Cluster | Evidence state | Action |
|---|---|---|---|---|
| `/` | Choose the smallest evidence-led diagnostic path. | Site entry | Verified | Strengthen navigation to the new robots cluster. |
| `/tools` | Choose a browser-local inspector by input type. | Tools | Verified | Strengthen with the robots tester. |
| `/tools/log-file-inspector` | Parse a bounded access-log sample locally. | Crawl logs | Verified | Keep. |
| `/tools/url-inspector` | Interpret pasted HTTP headers and HTML directives. | HTTP response | Verified | Keep; do not turn into unrestricted fetching. |
| `/tools/redirect-chain` | Assemble observed redirect hops and expose gaps, loops, and the final captured state. | HTTP response | Experiment | Replace interim alias with bounded local tool and measure completed chains. |
| `/tools/ip-location` | Classify IP syntax and selected address ranges locally. | IP and geo | Verified | Keep accuracy boundary. |
| `/tools/robots-rule-tester` | Decide one RFC-style robots rule match locally. | Robots access | Experiment | Build and measure completed tests. |
| `/guides` | Choose a stable diagnostic workflow. | Guides | Verified | Strengthen with robots workflow. |
| `/guides/log-file-analysis` | Turn raw server logs into a bounded request inventory. | Crawl logs | Supported | Keep. |
| `/guides/crawler-log-analysis` | Separate claimed from verified crawler traffic. | Crawl logs | Supported | Keep. |
| `/guides/http-response-debugging` | Inspect a response in evidence order. | HTTP response | Supported | Keep. |
| `/guides/redirect-chain-analysis` | Capture and interpret redirect hops individually. | HTTP response | Supported | Keep. |
| `/guides/ip-geolocation-data` | Understand IP-geolocation limits before acting. | IP and geo | Supported | Keep. |
| `/guides/test-robots-txt-rules` | Test robots delivery, group, path, and decision boundaries. | Robots access | Supported | Build and monitor. |
| `/blog` | Choose a dated diagnostic field note. | Lab notes | Verified | Keep. |
| `/blog/how-to-find-search-bots-in-server-logs` | Build a candidate crawler set from logs. | Crawl logs | Supported | Keep. |
| `/blog/what-a-301-response-does-not-prove` | Avoid over-interpreting one redirect status. | HTTP response | Supported | Keep. |
| `/blog/private-data-in-access-logs` | Minimise sensitive log data before analysis. | Crawl logs | Supported | Keep. |
| `/reference` | Choose a primary-source technical definition. | Reference | Verified | Keep. |
| `/reference/http-status-codes` | Separate HTTP semantics from SEO inference. | HTTP response | Supported | Keep. |
| `/reference/crawler-user-agents` | Classify crawler strings and identity evidence. | Crawl logs | Supported | Keep. |
| `/reference/crawler-verification-methods` | Choose proportionate crawler identity evidence for an operational decision. | Crawl logs | Supported | Publish one methods comparison; avoid vendor fan-out. |
| `/reference/robots-directives` | Distinguish meta and response-header robots controls. | Robots access | Supported | Strengthen links to robots tester and guide. |
| `/for` | Route an evidence owner to the relevant workflow. | Audience | Supported | Keep; no new variants without a new decision job. |
| `/for/technical-seos` | Prepare a reproducible technical SEO handoff. | Audience | Supported | Keep. |
| `/for/web-developers` | Reproduce response behavior before changing routing code. | Audience | Supported | Keep. |
| `/for/site-owners` | Review what a technical report actually observed. | Audience | Supported | Keep. |
| `/about` | Understand the current site's purpose and limits. | Governance | Verified | Keep. |
| `/changelog` | See user-visible changes to evidence and boundaries. | Governance | Verified | Add this release. |
| `/lab/crawler-benchmarks` | Inspect versioned test fixtures and their actual outcomes. | Robots access | Experiment | Replace protocol-only orphan with executed fixture evidence. |
| `/methodology-and-privacy` | Audit methods, processing boundaries, and source roles. | Governance | Verified | Keep. |
| `/new-ownership` | Separate the 2026 implementation from the former operator. | Governance | Verified | Keep. |
| `/legacy` | Find the explicit modern action for a historical URL. | Legacy | Verified | Keep manifest-driven. |
| `/contact` | Report corrections, rights, privacy, or abuse issues. | Governance | Verified | Keep. |
| `/impressum` | Identify the verified legal operator. | Governance | Verified | Keep. |
| `/privacy` | Understand the real hosting, local-processing, and contact data paths. | Governance | Verified | Keep in sync with technology. |
| `/analysespider.html` | Reach the rights-safe successor for historical log-analysis intent. | Crawl logs | Verified | Keep 200 successor. |
| `/ip2country/country_code.html` | Find a maintained country-code reference without identity claims. | IP and geo | Verified | Keep 200 successor. |
| `/geo-targeting/geo-targeting.html` | Design geo routing that fails open and avoids brittle IP assumptions. | IP and geo | Supported | Keep 200 successor. |
| `/crawlers` | Compare the roles and verification options of search and AI crawlers. | Crawler comparison | Supported | Keep primary-source table; add product scores only after repeatable tests. |
| `/de` | Choose a tool, answer or crawler comparison in German. | German entry | Experiment | Measure use before translating the full library. |
| `/de/tools` | Choose a browser-local tool from a German explanation. | German tools | Experiment | Keep one hub; tool interfaces remain English in this phase. |
| `/de/crawler` | Compare search and AI crawler roles in German. | Crawler comparison | Supported | Keep in sync with the official-source English table. |
| `/de/wissen` | Start with a plain German question and reach the best maintained answer. | German knowledge | Experiment | Translate detail pages only where demand and maintenance justify it. |
| `/de/wissen/warum-wird-meine-seite-nicht-indexiert` | Diagnose a missing-indexing report in a fixed technical order. | German knowledge | Supported | Keep as the first full German workflow; measure impressions and next-step clicks. |
| `/de/wissen/crawler-erkennen` | Verify a claimed crawler with evidence proportionate to the decision. | German knowledge | Supported | Keep aligned with current operator documentation. |
| `/de/ueber` | Understand purpose, processing limits and new ownership in German. | Governance | Verified | Keep synchronized with `/about`. |

## Non-canonical status paths

- `/ip2country/lookup.php` and `/ip2country/lookup.html`: permanent intent-equivalent redirect to `/tools/ip-location`.
- `/ip2country/ip_country.html`: permanent redirect to `/guides/ip-geolocation-data`.
- Former binaries, archives, download, and order URLs in the manifest: 410.
- Unknown paths: true noindex 404 with no canonical or structured-data claim.

## Cannibalisation decisions

- Response Inspector evaluates one pasted response and HTML; Redirect Chain Builder validates ordered hops; Robots Rule Tester evaluates group and path matching. Do not merge these different inputs and decisions.
- Robots directives reference defines page-level controls; the new robots guide covers the workflow; the tester performs one bounded decision. Keep the roles distinct and cross-link them.
- Log guide, crawler guide, and crawler lab note remain distinct: general inventory, identity verification, and a compact candidate-set field note.
- Audience pages stay capped at three because each maps to a different owner decision. Further persona or keyword variants are rejected without evidence.

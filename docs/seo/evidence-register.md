# SEO evidence register — 2026-08-22

This register separates facts from interpretations. It does not promise indexing or rankings.

| ID | State | Claim or question | Evidence | Decision |
|---|---|---|---|---|
| E-01 | Verified | The production apex serves the current Vercel build over HTTPS. | Live 200 response, Vercel headers, production deployment inspection. | Keep apex canonical. |
| E-02 | Verified | Public Vercel edges redirect `www` path and query to apex with 308. | Cloudflare/Google CNAME plus direct tests against both public edge addresses. A local resolver produced one stale 404. | No DNS change; verify through public edges after deploy. |
| E-03 | Verified | Canonical 200 pages are indexable, self-canonical, and in the generated sitemap. | Central route registry, built HTML audit, `robots.txt`, and `sitemap.xml`. | Preserve one route source and automated QA. |
| E-04 | Verified | Unknown paths return a real noindex 404 without canonical or schema. | Live unknown-path response and build QA. | Preserve. |
| E-05 | Verified | Rights-blocked former downloads return 410. | Live `/download/analysespider.exe` and legacy manifest. | Preserve; never recreate binaries without rights. |
| E-06 | Verified | Existing tools process current input in the browser and do not issue arbitrary fetches. | Source review and browser interaction tests. | Keep client-local boundary. |
| E-07 | Verified | `/lab/crawler-benchmarks` had no internal inbound link before this pass. | Built-link graph: inbound count 0. | Link from the Robots tool, guide, and relevant indexes. |
| E-08 | Verified | All 35 baseline pages had unique titles, descriptions, one H1, crawlable HTML links, and structured data. | `pnpm verify` plus generated-page inventory. | Keep automated gates. |
| E-09 | Supported | A robots rule tester is a distinct user job from HTTP response inspection. | RFC 9309 defines group/path matching; current Response Inspector only evaluates pasted response and HTML directives. | Build one local parser and a dedicated workflow guide. |
| E-10 | Experiment | Versioned RFC fixtures can become a useful crawler-access evidence asset. | Seven deterministic cases now execute at build/QA time; no external crawler run exists. | Publish fixture results, not a vendor leaderboard. |
| E-11 | Hypothesis | Search demand may justify deeper robots and crawler-access coverage. | Intent fit and standards evidence only; no fresh paid keyword endpoint or GSC performance export was used. | Measure impressions and completed tests before expanding. |
| E-12 | Rejected | More audience variants, city pages, PAA fan-out, or generic AI articles would strengthen this release. | No unique maintained job or original evidence identified. | Do not build. |
| E-13 | Rejected | AnalyseSpider can independently endorse Contextter. | Common ownership and operating contract. | No artificial Contextter links or corroboration. |
| E-14 | Supported | A CSP reduces exposure even with current inline-script allowances. | Current site uses only self-hosted assets and inline Astro scripts; prior live headers lacked CSP. | Add a restrictive self-origin policy with explicit inline exceptions. |
| E-15 | Hypothesis | Unique social preview images could improve shared-link presentation. | No `og:image` was present in the baseline build; no sharing performance evidence exists. | Defer until a maintained visual asset and measurement plan exist. |

Evidence labels: **Verified** = directly observed; **Supported** = primary-source and implementation evidence support the decision; **Hypothesis** = plausible but not yet measured; **Experiment** = bounded test with explicit success criteria; **Rejected** = considered and intentionally excluded.

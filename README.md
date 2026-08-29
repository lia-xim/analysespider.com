# analysespider.com

Public source repository for the new `analysespider.com` crawling and technical SEO resource.

## Purpose

AnalyseSpider provides plain-language guidance, crawler comparisons, and bounded browser tools for technical SEOs, developers, site owners, and web-operations teams. The current tools parse access logs, raw HTTP responses, HTML directives, redirect steps, robots rules, and IP-address properties locally in the browser. A protected single-URL check can show crawler policy by purpose, export evidence, keep a short browser-local history, and compare the normal response with one simulated crawler product token. A separate bounded website check discovers URLs from the site's sitemap or homepage and checks at most 50 same-site public URLs for HTTP, robots, noindex, canonical, title, and initial-HTML signals.

The project continues the former domain's broad technical-utility theme, but not its software, code, content, operator identity, users, customers, downloads, or claims.

## Current state

The substantive site is publicly launched and indexable. Its primary navigation is Tools, Crawlers, Learn/Wissen, and About/Über, with an English baseline and German core entry layer. It is assigned to Contextter in the canonical DomainPortfolio, with common ownership disclosed. The launch keeps the standalone user job, legal operator, privacy boundary, canonical host, rights limits, and explicit legacy URL decisions visible.

## Product boundaries

- No unrestricted server-side fetching or general-purpose crawling. The website check is capped at 50 same-site URLs from a sitemap or homepage.
- No active security scanning, port scanning, open redirects, or unrestricted crawling.
- Logs, pasted HTTP responses, and IP values are processed in the browser by default.
- Pasted logs, IPs, response evidence and local exports are not uploaded by the browser-local tools.
- Public URL checks use the documented protected gateway; the optional simulated-token view adds one bounded request and never claims to be the real crawler. The 50-URL website check has its own stricter scan and concurrency limits.
- Up to five successful crawler reports may remain in local browser storage for 24 hours for before/after comparison.
- A result must distinguish observation, inference, and unknowns.
- Contextter is an optional related workflow, not independent corroboration.

See [PROJECT_BRIEF.md](./PROJECT_BRIEF.md), [SECURITY.md](./SECURITY.md), `src/data/rights-evidence.json`, and `src/data/legacy-url-actions.json`.

## Local development

```bash
corepack pnpm install
corepack pnpm dev
```

Verification:

```bash
corepack pnpm verify
```

## Deployment

Vercel project: `analysespider-com`.

The apex domain is canonical. `www` is attached through an explicit Vercel DNS record and a permanent path-preserving domain redirect to the apex. The central route/content registry generates the sitemap from canonical indexable `200` pages. Production `robots.txt` allows crawling and references that sitemap.

## Rights

This repository is public for operational transparency. No license to reuse former-site text, identities, brands, media, datasets, binaries, source code, subscribers, customers, or other third-party material is granted. No open-source license is granted unless a later commit adds one explicitly.

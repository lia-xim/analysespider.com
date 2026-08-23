# analysespider.com

Public source repository for the new `analysespider.com` crawling and technical SEO resource.

## Purpose

AnalyseSpider provides plain-language guidance, crawler comparisons, and bounded browser tools for technical SEOs, developers, site owners, and web-operations teams. The current tools parse access logs, raw HTTP responses, HTML directives, redirect steps, robots rules, and IP-address properties locally in the browser.

The project continues the former domain's broad technical-utility theme, but not its software, code, content, operator identity, users, customers, downloads, or claims.

## Current state

The substantive site is publicly launched and indexable. Its primary navigation is Tools, Crawlers, Learn/Wissen, and About/Über, with an English baseline and German core entry layer. It is assigned to Contextter in the canonical DomainPortfolio, with common ownership disclosed. The launch keeps the standalone user job, legal operator, privacy boundary, canonical host, rights limits, and explicit legacy URL decisions visible.

## Product boundaries

- No unrestricted server-side fetching.
- No active security scanning, port scanning, open redirects, or unrestricted crawling.
- Logs, pasted HTTP responses, and IP values are processed in the browser by default.
- No submitted data is uploaded by the current tools.
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

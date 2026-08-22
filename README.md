# analysespider.com

Public source repository for the new `analysespider.com` Web Diagnostics Lab.

## Purpose

AnalyseSpider provides bounded, inspectable browser tools for technical SEOs, developers, site owners, and web-operations teams. The first implementation parses access logs, raw HTTP responses, HTML directives, and IP-address properties locally in the browser.

The project continues the former domain's broad technical-utility theme, but not its software, code, content, operator identity, users, customers, downloads, or claims.

## Current state

The substantive site is under construction. It is assigned to Contextter in the canonical DomainPortfolio, with common ownership disclosed. It must remain `noindex, nofollow, noarchive` until an explicit launch decision and verified production evidence exist.

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

The apex domain and `www` are attached to the Vercel project through Vercel DNS. Do not remove indexing blocks without separate authorization. The current `vercel.json`, page metadata, and `robots.txt` intentionally block indexing.

## Rights

This repository is public for operational transparency. No license to reuse former-site text, identities, brands, media, datasets, binaries, source code, subscribers, customers, or other third-party material is granted. No open-source license is granted unless a later commit adds one explicitly.

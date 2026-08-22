# AnalyseSpider project brief

Version: 1.0
Decision date: 2026-08-22
Launch state: pre-launch, noindex

## Job

Build a standalone Web Diagnostics Lab for technical SEOs, developers, site owners, and web-operations teams. The site must let a visitor inspect evidence before asking them to create an account or use another product.

The first release is browser-local:

1. Parse bounded Apache and Nginx access-log samples.
2. Inspect pasted HTTP response headers and HTML directives.
3. Classify an IP address without pretending that an IP proves a person or precise location.
4. Publish explicit legacy URL decisions and current methodology.

## Positioning

AnalyseSpider is a new implementation under new ownership in 2026. It truthfully continues the domain's historic technical-utility topic, not the former business or product identity.

The site is assigned to Contextter. Common ownership must be disclosed near any relevant relationship. AnalyseSpider must never describe Contextter as independently endorsed or corroborated by this site.

## Non-goals

- Recreate or distribute former software, binaries, databases, screenshots, documentation, copy, branding, or user accounts.
- Offer unrestricted URL fetching, active security testing, port scanning, arbitrary crawling, or a general-purpose proxy.
- Sell IP blocking, discrimination, or high-precision location claims.
- Blanket-redirect unrelated historical URLs to the homepage.
- Hide useful results behind signup or use the site mainly as a link shell.

## Evidence boundaries

- Paid backlink recovery on 2026-08-22 found 514 backlinks and 283 referring domains, with a mixed-quality profile and target-level evidence concentrated on log analysis and IP/country utility URLs.
- Historical snapshots establish topic continuity only. They do not establish rights, authorship, customer transfer, product ownership, or permission to republish.
- Current tools generate new browser-local observations. Inferences and unknowns are labeled separately.
- The versioned manifests in `src/data` are the repository contracts for rights and URL actions.

## Operating model

- Current burden: medium while tools remain local-only.
- Review cadence: monthly functional/privacy review; quarterly methodology and source review.
- Stop condition: do not launch a networked tool without a reviewed fetch boundary, named engineering owner, abuse monitoring, clean target sample, rate limits, redirect and DNS-rebinding controls, response-size caps, and a retention policy.

## Launch gates

- Explicit owner approval to launch and remove noindex.
- Production responses verified for canonical host, redirects, `404`, and `410` actions.
- Noindex metadata, `X-Robots-Tag`, robots policy, and sitemap changed together.
- Public privacy, methodology, corrections, new-ownership, and abuse-contact routes verified.
- All high-value legacy targets reviewed against current backlink and archive evidence.
- Core tools pass desktop/mobile browser QA, accessibility checks, and broken-link checks.
- Portfolio implementation state updated with reproducible evidence.

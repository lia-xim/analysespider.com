# Security boundary

## Current release

The current public deployment is a substantive static diagnostics lab. Its tools process supplied evidence locally in the browser. Any future network fetcher, authentication flow, API, upload, user data, billing, or destructive action requires a dedicated security review before release.

## Current tools

- No unrestricted server-side URL fetching.
- No active security scanning, port scanning, or crawling.
- No arbitrary redirects created from user input.
- Log files and pasted response evidence are processed in the browser.
- Input-size and line-count limits are enforced by the local tools.

## Future network-tool gate

Do not release a networked diagnostic tool until it has a named engineering owner, explicit egress controls, private/link-local/metadata address blocking, DNS-rebinding protection, redirect-depth and response-size caps, rate limits, timeouts, abuse monitoring, a retention contract, and tested failure behavior.

Security reports can be sent through the contact route published on the site. Do not include credentials, customer data, or unrestricted raw logs in an initial report.

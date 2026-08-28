export const crawlerLabCases = [
  { id: "CL-01", label: "Ordinary HTML link", path: "/fixtures/crawler-lab/static-200", expected: "Discover a linked 200 page in server-rendered HTML." },
  { id: "CL-02", label: "One-hop redirect", path: "/fixtures/crawler-lab/redirect-one-hop", expected: "Record a permanent redirect and its final 200 target." },
  { id: "CL-03", label: "Canonical elsewhere", path: "/fixtures/crawler-lab/canonical-source", expected: "Record the source URL and its canonical target without silently merging rows." },
  { id: "CL-04", label: "Meta noindex", path: "/fixtures/crawler-lab/noindex", expected: "Discover the URL and report its noindex directive." },
  { id: "CL-05", label: "robots.txt disallow", path: "/fixtures/crawler-lab/disallowed", expected: "Report the disallow rule and avoid fetching when configured to obey robots.txt." },
  { id: "CL-06", label: "JavaScript-added link", path: "/fixtures/crawler-lab/js-only", expected: "Discover the target only when JavaScript rendering and rendered-link extraction are enabled." },
  { id: "CL-07", label: "Orphan URL", path: "/fixtures/crawler-lab/orphan", expected: "Remain undiscovered from the start URL; appear only when supplied through another source." },
] as const;

export const crawlerLabBuiltPaths = [
  "/fixtures/crawler-lab/",
  "/fixtures/crawler-lab/static-200",
  "/fixtures/crawler-lab/canonical-source",
  "/fixtures/crawler-lab/canonical-target",
  "/fixtures/crawler-lab/noindex",
  "/fixtures/crawler-lab/disallowed",
  "/fixtures/crawler-lab/js-only",
  "/fixtures/crawler-lab/js-target",
  "/fixtures/crawler-lab/orphan",
] as const;

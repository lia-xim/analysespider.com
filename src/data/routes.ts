import { contentPages, type ContentKind } from "./content.ts";

export interface RouteRecord {
  path: string;
  status: 200;
  canonical: true;
  indexable: true;
  source: "static" | "content-registry";
}

const staticRoutes = [
  "/",
  "/tools",
  "/tools/crawler-view",
  "/crawlers",
  "/tools/log-file-inspector",
  "/tools/url-inspector",
  "/tools/redirect-chain",
  "/tools/robots-rule-tester",
  "/tools/ip-location",
  "/guides",
  "/guides/ip-geolocation-data",
  "/de",
  "/de/tools",
  "/de/tools/crawler-sicht",
  "/de/crawler",
  "/de/wissen",
  "/de/wissen/warum-wird-meine-seite-nicht-indexiert",
  "/de/wissen/crawler-erkennen",
  "/de/ueber",
  "/guides/test-robots-txt-rules",
  "/blog",
  "/reference",
  "/for",
  "/about",
  "/changelog",
  "/lab/crawler-benchmarks",
  "/methodology-and-privacy",
  "/new-ownership",
  "/legacy",
  "/contact",
  "/impressum",
  "/privacy",
  "/analysespider.html",
  "/ip2country/country_code.html",
  "/geo-targeting/geo-targeting.html",
] as const;

const rootByKind: Record<ContentKind, string> = {
  guide: "/guides",
  "lab-note": "/blog",
  reference: "/reference",
  audience: "/for",
};

export const routeRegistry: RouteRecord[] = [
  ...staticRoutes.map((path) => ({
    path,
    status: 200 as const,
    canonical: true as const,
    indexable: true as const,
    source: "static" as const,
  })),
  ...contentPages.map((page) => ({
    path: `${rootByKind[page.kind]}/${page.slug}`,
    status: 200 as const,
    canonical: true as const,
    indexable: true as const,
    source: "content-registry" as const,
  })),
];

export const canonicalRoutes = routeRegistry
  .filter((route) => route.status === 200 && route.canonical)
  .map((route) => route.path);

export const sitemapRoutes = routeRegistry
  .filter((route) => route.status === 200 && route.canonical && route.indexable)
  .map((route) => route.path);

export type IndexingState = "blocked" | "public";

export interface SiteConfig {
  schemaVersion: 1;
  domain: string;
  origin: string;
  language: "en";
  name: string;
  title: string;
  description: string;
  purpose: string;
  ownershipDisclosure: string;
  operatorDisclosure: string;
  operator: {
    schemaId: string;
    name: string;
    streetAddress: string;
    postalCode: string;
    addressLocality: string;
    addressCountry: "DE";
    email: string;
    telephone: string;
  };
  boundary: string;
  indexing: IndexingState;
  analytics: { enabled: false; provider: null };
  githubUrl: string;
  contactEmail: string;
  primaryProject: { id: "contextter"; name: "Contextter"; relationship: string };
  buildDate: string;
}

export const site: SiteConfig = {
  schemaVersion: 1,
  domain: "analysespider.com",
  origin: "https://analysespider.com",
  language: "en",
  name: "AnalyseSpider",
  title: "AnalyseSpider — free crawling and technical SEO tools",
  description: "Free browser tools and plain-language guides for checking crawler traffic, redirects, robots rules, HTTP responses and server logs.",
  purpose: "Help people understand crawler and response signals with small local tools, clear explanations and visible evidence limits.",
  ownershipDisclosure: "AnalyseSpider is a new implementation under new ownership in 2026. Former software, users, downloads, customers, and operator identity did not transfer.",
  operatorDisclosure: "Owned and legally operated by Matthias Ramahi. Product work is associated with Contextter; common ownership is disclosed and this site is not independent corroboration.",
  operator: {
    schemaId: "https://analysespider.com/#operator",
    name: "Matthias Ramahi",
    streetAddress: "Kempener Straße 44",
    postalCode: "40699",
    addressLocality: "Erkrath",
    addressCountry: "DE",
    email: "info@matthiasramahi.de",
    telephone: "+49 176 42 44 98 58",
  },
  boundary: "No former software, users, downloads, or operator identity transferred. No unrestricted server-side fetching or active security scanning.",
  primaryProject: {
    id: "contextter",
    name: "Contextter",
    relationship: "Common operator and optional downstream workflow after a complete standalone result.",
  },
  indexing: "public",
  analytics: { enabled: false, provider: null },
  githubUrl: "https://github.com/lia-xim/analysespider.com",
  contactEmail: "info@contextter.com",
  buildDate: "2026-08-23",
};

export const robotsContent = site.indexing === "public"
  ? `User-agent: *\nAllow: /\nSitemap: ${site.origin}/sitemap.xml\n`
  : `User-agent: *\nDisallow: /\nSitemap: ${site.origin}/sitemap.xml\n`;

import type { APIRoute } from "astro";
import { canonicalRoutes } from "../data/routes";
import { site } from "../data/site";

export const GET: APIRoute = () => {
  const urls = canonicalRoutes
    .map((path) => `  <url><loc>${new URL(path, site.origin).href}</loc><lastmod>${site.buildDate}</lastmod></url>`)
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};

import type { APIRoute } from "astro";
import { sitemapRouteRecords } from "../data/routes";
import { site } from "../data/site";

export const GET: APIRoute = () => {
  const escapeXml = (value: string) =>
    value.replace(/[<>&'\"]/g, (character) => ({
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '\"': "&quot;",
    })[character] ?? character);
  const urls = sitemapRouteRecords
    .map(({ path, updatedAt }) => {
      const location = escapeXml(new URL(path, site.origin).href);
      const lastModified = updatedAt ? `<lastmod>${updatedAt}</lastmod>` : "";
      return `  <url><loc>${location}</loc>${lastModified}</url>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};

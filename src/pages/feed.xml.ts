import type { APIRoute } from "astro";
import { contentPages } from "../data/content";
import { site } from "../data/site";

const roots = { guide: "/guides", "lab-note": "/blog", reference: "/reference" } as const;
const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (character) => ({
  "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '\"': "&quot;",
})[character] ?? character);

export const GET: APIRoute = () => {
  const entries = contentPages
    .filter((page): page is typeof page & { kind: keyof typeof roots } => page.kind !== "audience")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((page) => {
      const url = new URL(`${roots[page.kind]}/${page.slug}`, site.origin).toString();
      return `<entry><title>${escapeXml(page.title)}</title><id>${escapeXml(url)}</id><link href="${escapeXml(url)}"/><published>${page.publishedAt}T00:00:00Z</published><updated>${page.updatedAt}T00:00:00Z</updated><summary>${escapeXml(page.description)}</summary><author><name>${escapeXml(site.operator.name)}</name></author></entry>`;
    })
    .join("\n");
  const updated = contentPages.reduce((latest, page) => page.updatedAt > latest ? page.updatedAt : latest, "1970-01-01");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom"><title>AnalyseSpider articles</title><id>${site.origin}/</id><link href="${site.origin}/feed.xml" rel="self"/><link href="${site.origin}/"/><updated>${updated}T00:00:00Z</updated><subtitle>${escapeXml(site.description)}</subtitle>${entries}</feed>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/atom+xml; charset=utf-8" } });
};

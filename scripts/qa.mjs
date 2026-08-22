import { access, readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const dist = new URL("../dist/", import.meta.url);
const distDir = fileURLToPath(dist);
const origin = "https://analysespider.com";
const routeSource = await readFile(new URL("../src/data/routes.ts", import.meta.url), "utf8");
const routes = [...routeSource.matchAll(/^\s+"([^"]+)",$/gm)].map((match) => match[1]);
const editorialRoutes = new Set([
  "/guides/log-file-analysis",
  "/guides/crawler-log-analysis",
  "/guides/http-response-debugging",
  "/guides/redirect-chain-analysis",
  "/blog/how-to-find-search-bots-in-server-logs",
  "/blog/what-a-301-response-does-not-prove",
  "/blog/private-data-in-access-logs",
  "/reference/http-status-codes",
  "/reference/crawler-user-agents",
  "/reference/robots-directives",
]);

const failures = [];
const pass = (condition, message) => {
  if (!condition) failures.push(message);
};

pass(routes.length >= 35, `route inventory unexpectedly small: ${routes.length}`);
pass(new Set(routes).size === routes.length, "duplicate canonical routes in src/data/routes.ts");

const findOutput = async (pathname) => {
  if (pathname === "/") return new URL("index.html", dist);
  const clean = pathname.slice(1);
  const candidates = extname(clean)
    ? [new URL(`${clean}/index.html`, dist), new URL(clean, dist)]
    : [new URL(`${clean}/index.html`, dist), new URL(`${clean}.html`, dist)];
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {}
  }
  return candidates[0];
};

const htmlFiles = [];
const walk = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.name.endsWith(".html")) htmlFiles.push(full);
  }
};

const titles = new Map();
const descriptions = new Map();
for (const route of routes) {
  const output = await findOutput(route);
  let html = "";
  try {
    html = await readFile(output, "utf8");
  } catch {
    failures.push(`missing built route: ${route}`);
    continue;
  }

  const canonical = new URL(route, origin).href;
  pass(html.includes(`rel="canonical" href="${canonical}"`), `canonical mismatch for ${route}`);
  pass(html.includes('content="noindex, nofollow, noarchive"'), `noindex missing for ${route}`);
  pass(html.includes('"@context":"https://schema.org"'), `structured data missing for ${route}`);
  pass(!html.includes("Project setup"), `placeholder copy remains on ${route}`);
  pass(!/lorem ipsum|as an ai language model/i.test(html), `draft filler remains on ${route}`);

  const h1Count = (html.match(/<h1(?:\s|>)/g) ?? []).length;
  pass(h1Count === 1, `expected exactly one h1 on ${route}, found ${h1Count}`);

  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  pass(Boolean(title), `title missing for ${route}`);
  pass(Boolean(description), `description missing for ${route}`);
  if (title) {
    pass(!titles.has(title), `duplicate title on ${route} and ${titles.get(title)}`);
    titles.set(title, route);
  }
  if (description) {
    pass(!descriptions.has(description), `duplicate description on ${route} and ${descriptions.get(description)}`);
    descriptions.set(description, route);
  }

  if (editorialRoutes.has(route)) {
    pass(html.includes('property="og:type" content="article"'), `article Open Graph type missing for ${route}`);
    pass(html.includes('"@type":"Article"'), `Article structured data missing for ${route}`);
    pass(html.includes("Primary sources"), `primary sources section missing for ${route}`);
  }
}

const imprint = await readFile(await findOutput("/impressum"), "utf8");
for (const required of [
  "Matthias Ramahi",
  "Kempener Straße 44",
  "40699 Erkrath",
  "info@matthiasramahi.de",
  "+49 176 42 44 98 58",
  "§ 5 DDG",
  "New ownership",
]) {
  pass(imprint.includes(required), `impressum missing verified operator or ownership fact: ${required}`);
}

const privacy = await readFile(await findOutput("/privacy"), "utf8");
for (const required of [
  "Vercel",
  "browser-local",
  "No analytics",
  "No application cookies",
  "No contact form",
  "data-subject",
]) {
  pass(privacy.includes(required), `privacy notice missing technology fact: ${required}`);
}
pass(!/Google Analytics|Umami/i.test(privacy), "privacy notice must not claim an inactive analytics provider");

const robots = await readFile(new URL("robots.txt", dist), "utf8");
const sitemap = await readFile(new URL("sitemap.xml", dist), "utf8");
pass(robots.includes("Disallow: /"), "robots.txt must block every route before launch");
pass(robots.includes(`Sitemap: ${origin}/sitemap.xml`), "robots.txt must reference the canonical sitemap");
for (const route of routes) {
  pass(sitemap.includes(`<loc>${new URL(route, origin).href}</loc>`), `sitemap missing ${route}`);
}
pass((sitemap.match(/<url>/g) ?? []).length === routes.length, "sitemap URL count must match canonical route inventory");

const manifest = JSON.parse(await readFile(new URL("../src/data/legacy-url-actions.json", import.meta.url), "utf8"));
const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
const redirects = new Map(config.redirects.map((item) => [item.source, item]));
const rewrites = new Map(config.rewrites.map((item) => [item.source, item]));

for (const record of manifest.records) {
  if (record.action === "restore_200") {
    try {
      await access(await findOutput(record.target_url));
    } catch {
      failures.push(`restore_200 target missing: ${record.target_url}`);
    }
  } else if (["redirect_301", "redirect_308", "consolidate_redirect"].includes(record.action)) {
    const redirect = redirects.get(record.normalized_path);
    pass(Boolean(redirect), `redirect config missing for ${record.normalized_path}`);
    if (redirect) {
      pass(redirect.destination === record.target_url, `redirect target mismatch for ${record.normalized_path}`);
      pass(redirect.permanent === true, `redirect must be permanent for ${record.normalized_path}`);
    }
  } else if (record.action === "410") {
    pass(rewrites.has(record.normalized_path), `410 rewrite missing for ${record.normalized_path}`);
  }
}

pass(config.headers.some((rule) => rule.headers?.some((header) => header.key === "X-Robots-Tag" && header.value.includes("noindex"))), "global X-Robots-Tag noindex header missing");
pass(!config.redirects.some((rule) => rule.source === "/(.*)" || rule.source.includes(":path*")), "catch-all redirects are forbidden");

await walk(distDir);
const existingRoutes = new Set(routes);
existingRoutes.add("/404");
existingRoutes.add("/robots.txt");
existingRoutes.add("/sitemap.xml");
existingRoutes.add("/favicon.svg");
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  for (const href of hrefs) {
    if (/^(https?:|mailto:|tel:|#)/.test(href)) continue;
    if (href.startsWith("/_astro/")) continue;
    const pathname = new URL(href, origin).pathname.replace(/\/$/, "") || "/";
    pass(existingRoutes.has(pathname) || redirects.has(pathname), `broken internal link ${href} in ${relative(distDir, file)}`);
  }
  pass(!/official continuation of the former AnalyseSpider operator/i.test(html), `forbidden continuity claim in ${file}`);
  pass(!/former users (?:and|or) customers transferred/i.test(html), `forbidden transfer claim in ${file}`);
  pass(!/independently (?:endorses|validates|recommends) Contextter/i.test(html), `forbidden independence claim in ${file}`);
  pass(!/Contextter (?:endorsed|validated|recommended) by AnalyseSpider/i.test(html), `forbidden common-owner corroboration claim in ${file}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`QA passed: ${routes.length} canonical routes, unique metadata, legal/privacy facts, structured data, legacy actions, noindex, sitemap, redirects, broken links, and forbidden claims.`);

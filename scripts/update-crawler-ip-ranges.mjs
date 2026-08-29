import { mkdir, writeFile } from "node:fs/promises";

const sources = [
  { id: "googlebot", operator: "Google", token: "Googlebot", purpose: "Google Search", url: "https://developers.google.com/static/crawling/ipranges/common-crawlers.json" },
  { id: "oai_searchbot", operator: "OpenAI", token: "OAI-SearchBot", purpose: "ChatGPT Search", url: "https://openai.com/searchbot.json" },
  { id: "gptbot", operator: "OpenAI", token: "GPTBot", purpose: "model development", url: "https://openai.com/gptbot.json" },
  { id: "chatgpt_user", operator: "OpenAI", token: "ChatGPT-User", purpose: "user-triggered fetch", url: "https://openai.com/chatgpt-user.json" },
  { id: "perplexitybot", operator: "Perplexity", token: "PerplexityBot", purpose: "Perplexity Search", url: "https://www.perplexity.com/perplexitybot.json" },
  { id: "perplexity_user", operator: "Perplexity", token: "Perplexity-User", purpose: "user-triggered fetch", url: "https://www.perplexity.com/perplexity-user.json" },
  { id: "claude_searchbot", operator: "Anthropic", token: "Claude-SearchBot", purpose: "Claude Search", url: "https://claude.com/crawling/bots.json" },
  { id: "claudebot", operator: "Anthropic", token: "ClaudeBot", purpose: "model development", url: "https://claude.com/crawling/bots.json" },
  { id: "claude_user", operator: "Anthropic", token: "Claude-User", purpose: "user-triggered fetch", url: "https://claude.com/crawling/bots.json" },
];

const entries = [];
const payloads = new Map();
for (const source of sources) {
  let value = payloads.get(source.url);
  if (value === undefined) {
    const response = await fetch(source.url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`${source.id}: HTTP ${response.status}`);
    value = await response.json();
    payloads.set(source.url, value);
  }
  const prefixes = Array.isArray(value.prefixes)
    ? value.prefixes.flatMap((entry) => [entry.ipv4Prefix, entry.ipv6Prefix].filter((item) => typeof item === "string"))
    : [];
  if (prefixes.length === 0) throw new Error(`${source.id}: no prefixes`);
  entries.push({ ...source, sourceCreatedAt: value.creationTime ?? null, prefixes });
}

const output = {
  schemaVersion: 1,
  reviewedAt: new Date().toISOString(),
  generatedBy: "scripts/update-crawler-ip-ranges.mjs",
  entries,
};
await mkdir(new URL("../src/data/", import.meta.url), { recursive: true });
await writeFile(new URL("../src/data/crawler-ip-ranges.json", import.meta.url), `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Updated ${entries.length} crawler range records.`);

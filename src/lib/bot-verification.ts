import rangeData from "../data/crawler-ip-ranges.json";
import { trackEvent } from "./analytics";

const ipv4 = (value: string): boolean => /^\d{1,3}(?:\.\d{1,3}){3}$/u.test(value) && value.split(".").every((part) => Number(part) <= 255);
const ipv4Number = (value: string): bigint => value.split(".").reduce((total, part) => (total << 8n) + BigInt(part), 0n);

function ipv6Number(value: string): bigint | null {
  if (!/^[0-9a-f:]+$/iu.test(value) || value.includes(":::")) return null;
  const halves = value.toLowerCase().split("::");
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves[1] ? halves[1].split(":") : [];
  const missing = 8 - left.length - right.length;
  if ((halves.length === 1 && missing !== 0) || missing < 0) return null;
  const groups = halves.length === 2 ? [...left, ...Array<string>(missing).fill("0"), ...right] : left;
  if (groups.length !== 8 || groups.some((part) => !/^[0-9a-f]{1,4}$/iu.test(part))) return null;
  return groups.reduce((total, part) => (total << 16n) + BigInt(`0x${part}`), 0n);
}

function extractIp(value: string): string | null {
  const candidates = value.split(/[\s\[\]"',;()]+/u).map((part) => part.replace(/^::ffff:/iu, ""));
  return candidates.find((candidate) => ipv4(candidate) || ipv6Number(candidate) !== null) ?? null;
}

function inCidr(address: string, cidr: string): boolean {
  const [network = "", bitsText = ""] = cidr.split("/");
  const bits = Number(bitsText);
  const isV4 = ipv4(address);
  if (isV4 !== ipv4(network)) return false;
  const width = isV4 ? 32 : 128;
  const addressNumber = isV4 ? ipv4Number(address) : ipv6Number(address);
  const networkNumber = isV4 ? ipv4Number(network) : ipv6Number(network);
  if (addressNumber === null || networkNumber === null || bits < 0 || bits > width) return false;
  const shift = BigInt(width - bits);
  return (addressNumber >> shift) === (networkNumber >> shift);
}

function setList(selector: string, items: readonly string[]): void {
  const list = document.querySelector<HTMLUListElement>(selector);
  if (list === null) return;
  list.replaceChildren(...items.map((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    return li;
  }));
}

export function mountBotVerification(): void {
  const input = document.querySelector<HTMLTextAreaElement>("#bot-log-input");
  const profile = document.querySelector<HTMLSelectElement>("#bot-profile");
  const status = document.querySelector<HTMLElement>("#bot-status");
  const results = document.querySelector<HTMLElement>("#bot-results");
  if (input === null || profile === null || status === null || results === null) return;
  const de = document.documentElement.lang === "de";

  const inferProfile = (value: string) => {
    const lower = value.toLowerCase();
    return rangeData.entries.find((entry) => lower.includes(entry.token.toLowerCase()));
  };

  const verify = (): void => {
    const raw = input.value.trim();
    const address = extractIp(raw);
    const selected = rangeData.entries.find((entry) => entry.id === profile.value);
    if (address === null || selected === undefined) {
      results.hidden = true;
      status.textContent = de ? "Keine gültige IPv4- oder IPv6-Adresse gefunden." : "No valid IPv4 or IPv6 address was found.";
      trackEvent("tool_run_failed", { tool: "bot_verification", reason: "validation" });
      return;
    }
    const claimed = raw.toLowerCase().includes(selected.token.toLowerCase());
    const range = selected.prefixes.find((cidr) => inCidr(address, cidr)) ?? null;
    const unavailable = selected.prefixes.length === 0;
    const outcome = unavailable ? "unverifiable" : claimed && range !== null ? "verified" : "not_verified";
    const verdict = document.querySelector<HTMLElement>("#bot-verdict");
    const operator = document.querySelector<HTMLElement>("#bot-operator");
    if (verdict !== null) verdict.textContent = outcome === "verified" ? (de ? "Verifiziert" : "Verified") : outcome === "unverifiable" ? (de ? "Nicht per IP verifizierbar" : "Not verifiable by IP") : (de ? "Nicht verifiziert" : "Not verified");
    if (operator !== null) operator.textContent = selected.operator;
    setList("#bot-observed", [
      `${de ? "Gefundene IP" : "Extracted IP"}: ${address}`,
      `${de ? "Gewählter Token" : "Selected token"}: ${selected.token}`,
      `${de ? "Token in Eingabe" : "Token in input"}: ${claimed ? (de ? "ja" : "yes") : (de ? "nein" : "no")}`,
    ]);
    setList("#bot-verified", unavailable
      ? [de ? "Der Betreiber veröffentlicht derzeit keine maschinenlesbaren IP-Bereiche. Ein IP-Abgleich ist daher nicht möglich." : "The operator currently publishes no machine-readable IP ranges, so an IP match is not possible."]
      : [
        range !== null ? `${de ? "IP passt zu" : "IP matches"}: ${range}` : (de ? "Die IP liegt nicht in den veröffentlichten Bereichen." : "The IP is outside the published ranges."),
        outcome === "verified" ? (de ? "IP-Bereich und User-Agent-Behauptung passen zusammen." : "Published IP range and user-agent claim agree.") : (de ? "Für eine Verifizierung müssen IP-Bereich und Bot-Token zusammenpassen." : "Verification requires both the IP range and bot token to match."),
      ]);
    setList("#bot-boundary", [
      de ? "Die Logzeile selbst kann manipuliert oder falsch weitergegeben worden sein." : "The log line itself could have been altered or copied incorrectly.",
      de ? "Der Treffer beweist weder Indexierung noch Training oder Zitation." : "A match proves neither indexing, training, nor citation.",
      de ? `Range-Snapshot: ${new Date(rangeData.reviewedAt).toLocaleDateString("de-DE")}.` : `Range snapshot: ${new Date(rangeData.reviewedAt).toLocaleDateString("en-GB")}.`,
    ]);
    const source = document.querySelector<HTMLAnchorElement>("#bot-source");
    if (source !== null) source.href = selected.url;
    results.hidden = false;
    status.textContent = de ? "Prüfung lokal abgeschlossen." : "Local verification complete.";
    trackEvent("tool_run_succeeded", { tool: "bot_verification", outcome });
    trackEvent("bot_verification_result", {
      operator: selected.operator.toLowerCase(),
      outcome,
    });
    results.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  };

  document.querySelector("#verify-bot")?.addEventListener("click", () => {
    trackEvent("tool_run_started", { tool: "bot_verification" });
    verify();
  });
  document.querySelector<HTMLButtonElement>("#load-bot-sample")?.addEventListener("click", () => {
    const sample = document.querySelector<HTMLButtonElement>("[data-bot-preset]")?.dataset.botPreset;
    if (sample !== undefined) input.value = sample;
    profile.value = "googlebot";
    trackEvent("tool_preset_used", { tool: "bot_verification" });
    verify();
  });
  document.querySelectorAll<HTMLButtonElement>("[data-bot-preset]").forEach((button) => button.addEventListener("click", () => {
    input.value = button.dataset.botPreset ?? "";
    const inferred = inferProfile(input.value);
    if (inferred !== undefined) profile.value = inferred.id;
    trackEvent("tool_preset_used", { tool: "bot_verification" });
    verify();
  }));
  input.addEventListener("input", () => {
    const inferred = inferProfile(input.value);
    if (inferred !== undefined) profile.value = inferred.id;
  });
  const transferred = sessionStorage.getItem("analysespider.bot-log-line");
  if (transferred !== null) {
    sessionStorage.removeItem("analysespider.bot-log-line");
    input.value = transferred;
    const inferred = inferProfile(transferred);
    if (inferred !== undefined) profile.value = inferred.id;
    verify();
  }
}

type EventValue = string | number | boolean;

const eventSchemas = {
  navigation_click: {
    location: ["header", "main", "footer"],
    target: [
      "home",
      "tools",
      "crawlers",
      "learn",
      "about",
      "legal",
      "contextter",
      "ai_fanout",
      "github",
      "other_internal",
      "other_external",
    ],
  },
  tool_run_started: {
    tool: [
      "crawler_check",
      "crawler_comparison",
      "domain_scan",
      "http_response",
      "redirect_chain",
      "robots_rule",
      "server_log",
      "ip_classifier",
      "bot_verification",
    ],
  },
  tool_run_succeeded: {
    tool: [
      "crawler_check",
      "crawler_comparison",
      "domain_scan",
      "http_response",
      "redirect_chain",
      "robots_rule",
      "server_log",
      "ip_classifier",
      "bot_verification",
    ],
    outcome: [
      "yes",
      "no",
      "mixed",
      "unknown",
      "complete",
      "verified",
      "not_verified",
      "unverifiable",
    ],
  },
  tool_run_failed: {
    tool: [
      "crawler_check",
      "crawler_comparison",
      "domain_scan",
      "http_response",
      "redirect_chain",
      "robots_rule",
      "server_log",
      "ip_classifier",
      "bot_verification",
    ],
    reason: [
      "validation",
      "rate_limit",
      "busy",
      "timeout",
      "origin",
      "captcha",
      "service",
      "unknown",
    ],
  },
  crawler_profile_selected: {
    profile: [
      "googlebot",
      "oai_searchbot",
      "gptbot",
      "chatgpt_user",
      "claude_searchbot",
      "claudebot",
      "claude_user",
      "perplexitybot",
    ],
  },
  report_action: {
    action: [
      "copy",
      "download",
      "compare_previous",
      "open_redirects",
      "open_http",
    ],
    outcome: ["success", "failure", "unavailable"],
  },
  google_spot_check_opened: {
    tool: ["domain_scan"],
    scope: ["domain", "url"],
  },
  google_spot_check_recorded: {
    tool: ["domain_scan"],
    outcome: ["result_seen", "no_result_seen"],
  },
  tool_preset_used: {
    tool: [
      "http_response",
      "redirect_chain",
      "robots_rule",
      "server_log",
      "ip_classifier",
      "bot_verification",
    ],
  },
  bot_verification_result: {
    operator: ["google", "openai", "perplexity", "anthropic"],
    outcome: ["verified", "not_verified", "unverifiable"],
  },
} as const;

type EventName = keyof typeof eventSchemas;

declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: Record<string, EventValue>) => void;
    };
  }
}

export function sanitizeEvent(
  name: EventName,
  raw: Record<string, unknown>,
): { name: EventName; data: Record<string, EventValue> } {
  const schema = eventSchemas[name] as Record<string, readonly string[]>;
  const data: Record<string, EventValue> = {};
  for (const [key, allowed] of Object.entries(schema)) {
    const value = raw[key];
    if (typeof value === "string" && allowed.includes(value)) data[key] = value;
  }
  return { name, data };
}

export function trackEvent(
  name: EventName,
  raw: Record<string, unknown>,
): boolean {
  const event = sanitizeEvent(name, raw);
  const send = (): boolean => {
    if (typeof window.umami?.track !== "function") return false;
    window.umami.track(event.name, event.data);
    return true;
  };
  if (send()) return true;
  window.setTimeout(send, 800);
  return false;
}

function clickLocation(
  anchor: HTMLAnchorElement,
): "header" | "main" | "footer" {
  if (anchor.closest("header")) return "header";
  if (anchor.closest("footer")) return "footer";
  return "main";
}

function clickTarget(anchor: HTMLAnchorElement): string {
  const url = new URL(anchor.href, window.location.href);
  if (
    url.hostname === "contextter.com" ||
    url.hostname === "www.contextter.com"
  )
    return "contextter";
  if (url.hostname === "ai-fanout.com" || url.hostname === "www.ai-fanout.com")
    return "ai_fanout";
  if (url.hostname === "github.com") return "github";
  if (url.origin !== window.location.origin) return "other_external";
  const path = url.pathname.replace(/^\/de(?=\/|$)/u, "") || "/";
  if (path === "/") return "home";
  if (path.startsWith("/tools")) return "tools";
  if (path.startsWith("/crawlers")) return "crawlers";
  if (
    path.startsWith("/guides") ||
    path.startsWith("/blog") ||
    path.startsWith("/reference") ||
    path.startsWith("/wissen")
  )
    return "learn";
  if (path.startsWith("/about") || path.startsWith("/ueber")) return "about";
  if (
    path.startsWith("/privacy") ||
    path.startsWith("/impressum") ||
    path.startsWith("/contact") ||
    path.startsWith("/methodology")
  )
    return "legal";
  return "other_internal";
}

const genericToolActions: Readonly<
  Record<string, { tool: string; result: string }>
> = {
  "#check-ip": { tool: "ip_classifier", result: "#ip-results" },
  "#inspect-response": { tool: "http_response", result: "#response-results" },
  "#analyse-chain": { tool: "redirect_chain", result: "#chain-results" },
  "#test-robots": { tool: "robots_rule", result: "#robots-results" },
  "#analyse-log": { tool: "server_log", result: "#log-results" },
};

function observeToolResult(tool: string, selector: string): void {
  const result = document.querySelector<HTMLElement>(selector);
  if (result === null) return;
  let sent = false;
  const sendIfVisible = (): void => {
    if (sent || result.hidden) return;
    sent = true;
    trackEvent("tool_run_succeeded", { tool, outcome: "complete" });
    observer.disconnect();
  };
  const observer = new MutationObserver(sendIfVisible);
  observer.observe(result, { attributes: true, attributeFilter: ["hidden"] });
  window.setTimeout(() => {
    sendIfVisible();
    observer.disconnect();
  }, 15_000);
  sendIfVisible();
}

export function mountAnalytics(): void {
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (anchor instanceof HTMLAnchorElement) {
        trackEvent("navigation_click", {
          location: clickLocation(anchor),
          target: clickTarget(anchor),
        });
      }
      for (const [selector, action] of Object.entries(genericToolActions)) {
        if (target.closest(selector)) {
          trackEvent("tool_run_started", { tool: action.tool });
          observeToolResult(action.tool, action.result);
          break;
        }
      }
      if (
        target.closest(
          "[data-ip-preset], [data-robots-preset], [data-log-preset], [data-response-preset], [data-redirect-preset]",
        )
      ) {
        const tool = target.closest("[data-ip-preset]")
          ? "ip_classifier"
          : target.closest("[data-robots-preset]")
            ? "robots_rule"
            : target.closest("[data-log-preset]")
              ? "server_log"
              : target.closest("[data-response-preset]")
                ? "http_response"
                : "redirect_chain";
        trackEvent("tool_preset_used", { tool });
      }
    },
    { passive: true },
  );
}

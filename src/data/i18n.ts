export type Locale = "en" | "de";

export const localePaths = {
  en: {
    home: "/",
    tools: "/tools",
    crawlers: "/crawlers",
    learn: "/guides",
    about: "/about",
  },
  de: {
    home: "/de",
    tools: "/de/tools",
    crawlers: "/de/crawler",
    learn: "/de/wissen",
    about: "/de/ueber",
  },
} as const;

export const localePairs = [
  ["/", "/de"],
  ["/tools", "/de/tools"],
  ["/tools/crawler-view", "/de/tools/crawler-sicht"],
  ["/tools/google-index-check", "/de/tools/google-index-check"],
  ["/tools/url-inspector", "/de/tools/http-antwort"],
  ["/tools/redirect-chain", "/de/tools/weiterleitungskette"],
  ["/tools/robots-rule-tester", "/de/tools/robots-regel-test"],
  ["/tools/log-file-inspector", "/de/tools/server-log-analyse"],
  ["/tools/ip-location", "/de/tools/ip-adresse"],
  ["/tools/bot-verification", "/de/tools/bot-verifizierung"],
  ["/crawlers", "/de/crawler"],
  ["/guides", "/de/wissen"],
  ["/guides/http-response-debugging", "/de/wissen/http-antwort-verstehen"],
  ["/guides/redirect-chain-analysis", "/de/wissen/redirect-kette-pruefen"],
  ["/guides/test-robots-txt-rules", "/de/wissen/robots-txt-testen"],
  ["/guides/crawler-log-analysis", "/de/wissen/crawler-in-server-logs-erkennen"],
  ["/guides/ip-geolocation-data", "/de/wissen/ip-geolokalisierung-verstehen"],
  ["/reference/crawler-verification-methods", "/de/wissen/crawler-erkennen"],
  ["/blog/robots-txt-allows-bot-cdn-blocks-it", "/de/wissen/robots-erlaubt-cdn-blockiert"],
  ["/blog/initial-html-vs-rendered-dom", "/de/wissen/initiales-html-vs-gerenderter-dom"],
  ["/about", "/de/ueber"],
] as const;
const alternatePathPairs = new Map<string, string>(localePairs);

export const getLocale = (pathname: string): Locale =>
  pathname === "/de" || pathname.startsWith("/de/") ? "de" : "en";

export const getAlternatePath = (pathname: string): string | null => {
  if (alternatePathPairs.has(pathname))
    return alternatePathPairs.get(pathname) ?? null;
  for (const [english, german] of alternatePathPairs) {
    if (german === pathname) return english;
  }
  return null;
};

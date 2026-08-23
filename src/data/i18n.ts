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

const alternatePathPairs = new Map<string, string>([
  ["/", "/de"],
  ["/tools", "/de/tools"],
  ["/crawlers", "/de/crawler"],
  ["/guides", "/de/wissen"],
  ["/guides/http-response-debugging", "/de/wissen/warum-wird-meine-seite-nicht-indexiert"],
  ["/reference/crawler-verification-methods", "/de/wissen/crawler-erkennen"],
  ["/about", "/de/ueber"],
]);

export const getLocale = (pathname: string): Locale =>
  pathname === "/de" || pathname.startsWith("/de/") ? "de" : "en";

export const getAlternatePath = (pathname: string): string | null => {
  if (alternatePathPairs.has(pathname)) return alternatePathPairs.get(pathname) ?? null;
  for (const [english, german] of alternatePathPairs) {
    if (german === pathname) return english;
  }
  return null;
};

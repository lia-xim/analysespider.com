export type RobotsRuleType = "allow" | "disallow";

export interface RobotsRule {
  type: RobotsRuleType;
  pattern: string;
  line: number;
}

export interface RobotsGroup {
  agents: string[];
  rules: RobotsRule[];
}

export interface RobotsDecision {
  allowed: boolean;
  productToken: string;
  target: string;
  matchedAgents: string[];
  matchedRules: RobotsRule[];
  selectedRule: RobotsRule | null;
  reason: string;
  warnings: string[];
}

const MAX_BYTES = 500 * 1024;
const productTokenPattern = /^[A-Za-z_-]+$/;
const unreserved = /^[A-Za-z0-9._~-]$/;

const normalisePercentEncoding = (value: string) => value.replace(/%([0-9a-f]{2})/gi, (match, hex) => {
  const character = String.fromCharCode(Number.parseInt(hex, 16));
  return unreserved.test(character) ? character : match.toUpperCase();
});

const normaliseLiteral = (value: string) => normalisePercentEncoding(encodeURI(value));

const targetPath = (value: string) => {
  const parsed = new URL(value, "https://robots.invalid");
  return normalisePercentEncoding(`${parsed.pathname}${parsed.search}`);
};

const parseRobots = (source: string) => {
  const warnings: string[] = [];
  const size = new TextEncoder().encode(source).length;
  if (size > MAX_BYTES) {
    throw new Error(`Input exceeds the 500 KiB RFC parsing floor (${size.toLocaleString()} bytes).`);
  }

  const groups: RobotsGroup[] = [];
  let group: RobotsGroup | null = null;
  let rulesStarted = false;

  source.split(/\r?\n/).forEach((rawLine, index) => {
    const withoutComment = rawLine.replace(/#.*$/, "").trim();
    if (!withoutComment) return;
    const separator = withoutComment.indexOf(":");
    if (separator < 1) {
      warnings.push(`Line ${index + 1} has no parseable field separator.`);
      return;
    }
    const field = withoutComment.slice(0, separator).trim().toLowerCase();
    const value = withoutComment.slice(separator + 1).trim();

    if (field === "user-agent") {
      if (!group || rulesStarted) {
        group = { agents: [], rules: [] };
        groups.push(group);
        rulesStarted = false;
      }
      group.agents.push(value);
      return;
    }

    if (field === "allow" || field === "disallow") {
      if (!group) {
        warnings.push(`Line ${index + 1} is outside a user-agent group and was ignored.`);
        return;
      }
      rulesStarted = true;
      if (value) group.rules.push({ type: field, pattern: value, line: index + 1 });
    }
  });

  return { groups, warnings };
};

const ruleMatch = (rule: RobotsRule, target: string) => {
  const anchored = rule.pattern.endsWith("$");
  const pattern = anchored ? rule.pattern.slice(0, -1) : rule.pattern;
  const source = pattern
    .split("*")
    .map((part) => normaliseLiteral(part).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  const expression = new RegExp(`^${source}${anchored ? "$" : ""}`);
  const specificity = new TextEncoder().encode(normaliseLiteral(pattern.replace(/\*/g, ""))).length;
  return { matches: expression.test(target), specificity };
};

export const evaluateRobots = (source: string, productToken: string, urlOrPath: string): RobotsDecision => {
  const token = productToken.trim();
  if (!productTokenPattern.test(token)) {
    throw new Error("Enter one RFC product token using letters, underscores, or hyphens only.");
  }
  const target = targetPath(urlOrPath.trim() || "/");
  const { groups, warnings } = parseRobots(source);

  if (target === "/robots.txt") {
    return {
      allowed: true,
      productToken: token,
      target,
      matchedAgents: [],
      matchedRules: [],
      selectedRule: null,
      reason: "/robots.txt is implicitly allowed by RFC 9309.",
      warnings,
    };
  }

  const exactGroups = groups.filter((candidate) => candidate.agents.some((agent) => agent.toLowerCase() === token.toLowerCase()));
  const selectedGroups = exactGroups.length
    ? exactGroups
    : groups.filter((candidate) => candidate.agents.includes("*"));
  const matchedRules = selectedGroups.flatMap((candidate) => candidate.rules);
  const candidates = matchedRules
    .map((rule) => ({ rule, ...ruleMatch(rule, target) }))
    .filter((candidate) => candidate.matches)
    .sort((a, b) => b.specificity - a.specificity || (a.rule.type === "allow" ? -1 : 1));
  const selectedRule = candidates[0]?.rule ?? null;
  const allowed = selectedRule?.type !== "disallow";

  return {
    allowed,
    productToken: token,
    target,
    matchedAgents: selectedGroups.flatMap((candidate) => candidate.agents),
    matchedRules,
    selectedRule,
    reason: selectedRule
      ? `${selectedRule.type === "allow" ? "Allow" : "Disallow"} line ${selectedRule.line} is the most specific matching rule.`
      : selectedGroups.length
        ? "No rule in the applicable group matches this target, so access is allowed."
        : "No exact product-token group or wildcard group exists, so no rules apply.",
    warnings,
  };
};

export const robotsFixtures = [
  {
    id: "REP-01",
    name: "Exact product group replaces wildcard",
    robots: "User-agent: *\nDisallow: /\n\nUser-agent: ExampleBot\nAllow: /public/",
    token: "ExampleBot",
    target: "/public/report",
    expected: true,
  },
  {
    id: "REP-02",
    name: "Longest matching rule wins",
    robots: "User-agent: ExampleBot\nAllow: /private/preview/\nDisallow: /private/",
    token: "ExampleBot",
    target: "/private/preview/index.html",
    expected: true,
  },
  {
    id: "REP-03",
    name: "Equal Allow rule wins the tie",
    robots: "User-agent: ExampleBot\nDisallow: /asset\nAllow: /asset",
    token: "ExampleBot",
    target: "/asset",
    expected: true,
  },
  {
    id: "REP-04",
    name: "Duplicate product groups are combined",
    robots: "User-agent: ExampleBot\nDisallow: /one/\n\nUser-agent: ExampleBot\nDisallow: /two/",
    token: "ExampleBot",
    target: "/two/page",
    expected: false,
  },
  {
    id: "REP-05",
    name: "Wildcard and end anchor",
    robots: "User-agent: *\nDisallow: /*.pdf$",
    token: "ArchiveBot",
    target: "/reports/crawl.pdf",
    expected: false,
  },
  {
    id: "REP-06",
    name: "Query component participates in matching",
    robots: "User-agent: *\nDisallow: /*?preview=1$",
    token: "ExampleBot",
    target: "/article?preview=1",
    expected: false,
  },
  {
    id: "REP-07",
    name: "No applicable group allows access",
    robots: "User-agent: OtherBot\nDisallow: /",
    token: "ExampleBot",
    target: "/anything",
    expected: true,
  },
] as const;

export const robotsFixtureResults = robotsFixtures.map((fixture) => {
  const decision = evaluateRobots(fixture.robots, fixture.token, fixture.target);
  return { ...fixture, actual: decision.allowed, passed: decision.allowed === fixture.expected, decision };
});

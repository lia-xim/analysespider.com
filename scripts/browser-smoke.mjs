import { Builder, By, Key, logging } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import chromedriver from "chromedriver";

const baseUrl = process.env.ANALYSESPIDER_PREVIEW_URL ?? "http://127.0.0.1:4321";
const chromePath = process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const routes = ["/", "/tools", "/crawlers", "/de", "/de/crawler", "/de/tools/http-antwort", "/lab/crawler-benchmarks", "/blog/how-to-find-search-bots-in-server-logs", "/blog/robots-txt-allows-bot-cdn-blocks-it", "/blog/initial-html-vs-rendered-dom", "/de/wissen/robots-erlaubt-cdn-blockiert", "/de/wissen/initiales-html-vs-gerenderter-dom"];
const viewports = [
  { width: 1440, height: 1000, label: "desktop" },
  { width: 430, height: 932, label: "large mobile" },
  { width: 390, height: 844, label: "mobile" },
  { width: 320, height: 720, label: "small mobile" },
];

const runAtViewport = async (width, height) => {
  const options = new chrome.Options()
    .setChromeBinaryPath(chromePath)
    .addArguments("--headless=new", "--disable-gpu", "--no-sandbox", `--window-size=${width},${height}`);
  const preferences = new logging.Preferences();
  preferences.setLevel(logging.Type.BROWSER, logging.Level.SEVERE);
  options.setLoggingPrefs(preferences);
  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .setChromeService(new chrome.ServiceBuilder(chromedriver.path))
    .build();
  const failures = [];
  try {
    for (const route of routes) {
      await driver.get(`${baseUrl}${route}`);
      const state = await driver.executeScript(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        h1: document.querySelectorAll("h1").length,
        lang: document.documentElement.lang,
        overflowingElements: [...document.querySelectorAll("body *")]
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.width > 0 && (rect.left < -1 || rect.right > window.innerWidth + 1);
          })
          .slice(0, 6)
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${element.className && typeof element.className === "string" ? `.${element.className.trim().replace(/\s+/g, ".")}` : ""}[${Math.round(rect.left)},${Math.round(rect.right)}]`;
          }),
        clippedHeadings: [...document.querySelectorAll("h1")]
          .filter((heading) => {
            const rect = heading.getBoundingClientRect();
            return heading.scrollWidth > heading.clientWidth + 1 || rect.left < -1 || rect.right > window.innerWidth + 1;
          })
          .map((heading) => heading.textContent?.trim()),
        clippedNavigation: [...document.querySelectorAll(".site-header nav, .language-switch")]
          .filter((navigation) => navigation.scrollWidth > navigation.clientWidth + 1)
          .map((navigation) => navigation.className || navigation.tagName),
        undersizedControls: [...document.querySelectorAll("button, input:not([type='hidden']), select, textarea")]
          .filter((control) => {
            const rect = control.getBoundingClientRect();
            const style = getComputedStyle(control);
            return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0 && rect.height < 44;
          })
          .map((control) => `${control.tagName.toLowerCase()}${control.id ? `#${control.id}` : ""}:${Math.round(control.getBoundingClientRect().height)}px`),
      }));
      if (state.overflow > 1) failures.push(`${route}: ${state.overflow}px horizontal overflow at ${width}px (${state.overflowingElements.join(", ")})`);
      if (state.h1 !== 1) failures.push(`${route}: expected one H1, found ${state.h1}`);
      if (route.startsWith("/de") ? state.lang !== "de" : state.lang !== "en") failures.push(`${route}: wrong document language ${state.lang}`);
      if (state.clippedHeadings.length) failures.push(`${route}: clipped H1 at ${width}px (${state.clippedHeadings.join(", ")})`);
      if (state.clippedNavigation.length) failures.push(`${route}: clipped header navigation at ${width}px (${state.clippedNavigation.join(", ")})`);
      if (width <= 430 && state.undersizedControls.length) failures.push(`${route}: controls below 44px at ${width}px (${state.undersizedControls.join(", ")})`);
      await driver.findElement(By.css("body")).sendKeys(Key.TAB);
      const focus = await driver.executeScript(() => ({ tag: document.activeElement?.tagName, id: document.activeElement?.id, text: document.activeElement?.textContent?.trim() }));
      if (!focus.tag || focus.tag === "BODY") failures.push(`${route}: first Tab did not reach an interactive element`);
      const severe = await driver.manage().logs().get(logging.Type.BROWSER);
      for (const entry of severe) failures.push(`${route}: browser console ${entry.message}`);
    }
  } finally {
    await driver.quit();
  }
  return failures;
};

const failures = [];
for (const { width, height } of viewports) {
  failures.push(...await runAtViewport(width, height));
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Browser smoke passed: ${routes.length} routes across ${viewports.map(({ width, label }) => `${label} (${width}px)`).join(", ")}; no overflow or clipped headings/navigation, mobile controls are at least 44px high, one H1, correct language, keyboard focus, and no severe console errors.`);

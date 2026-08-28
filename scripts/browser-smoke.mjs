import { Builder, By, Key, logging } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import chromedriver from "chromedriver";

const baseUrl = process.env.ANALYSESPIDER_PREVIEW_URL ?? "http://127.0.0.1:4321";
const chromePath = process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const routes = ["/", "/tools", "/crawlers", "/de", "/de/crawler", "/de/tools/http-antwort", "/lab/crawler-benchmarks", "/blog/how-to-find-search-bots-in-server-logs", "/blog/robots-txt-allows-bot-cdn-blocks-it", "/blog/initial-html-vs-rendered-dom", "/de/wissen/robots-erlaubt-cdn-blockiert", "/de/wissen/initiales-html-vs-gerenderter-dom"];

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
      }));
      if (state.overflow > 1) failures.push(`${route}: ${state.overflow}px horizontal overflow at ${width}px`);
      if (state.h1 !== 1) failures.push(`${route}: expected one H1, found ${state.h1}`);
      if (route.startsWith("/de") ? state.lang !== "de" : state.lang !== "en") failures.push(`${route}: wrong document language ${state.lang}`);
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

const failures = [...await runAtViewport(1440, 1000), ...await runAtViewport(390, 844)];
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Browser smoke passed: ${routes.length} routes at desktop and mobile, no overflow, one H1, correct language, keyboard focus, no severe console errors.`);

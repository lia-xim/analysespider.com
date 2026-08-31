const root = document.querySelector("[data-generator-result]")?.closest(".tool-main") ?? document;
const agent = root.querySelector("[data-generator-agent]");
const allow = root.querySelector("[data-generator-allow]");
const disallow = root.querySelector("[data-generator-disallow]");
const sitemap = root.querySelector("[data-generator-sitemap]");
const output = root.querySelector("[data-generator-output]");
const statusMessage = root.querySelector("[data-generator-status]");
const locale = document.documentElement.lang === "de" ? "de" : "en";

const lines = (value) => [...new Set(value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))];
const setStatus = (deText, enText) => { statusMessage.textContent = locale === "de" ? deText : enText; };

const build = () => {
  const productToken = agent.value.trim();
  if (!productToken || !/^[A-Za-z0-9_*.-]+$/.test(productToken)) {
    setStatus("Der User-agent darf nur Buchstaben, Zahlen, Punkt, Bindestrich, Unterstrich oder * enthalten.", "User-agent may contain only letters, numbers, dots, hyphens, underscores or *.");
    return false;
  }

  const allowPaths = lines(allow.value);
  const disallowPaths = lines(disallow.value);
  const invalidPath = [...allowPaths, ...disallowPaths].find((path) => !path.startsWith("/"));
  if (invalidPath) {
    setStatus(`Der Pfad „${invalidPath}“ muss mit / beginnen.`, `The path “${invalidPath}” must start with /.`);
    return false;
  }

  const sitemapUrls = lines(sitemap.value);
  const invalidSitemap = sitemapUrls.find((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol !== "http:" && parsed.protocol !== "https:";
    } catch {
      return true;
    }
  });
  if (invalidSitemap) {
    setStatus(`Die Sitemap „${invalidSitemap}“ braucht eine vollständige http- oder https-URL.`, `The sitemap “${invalidSitemap}” needs a complete HTTP or HTTPS URL.`);
    return false;
  }

  const group = [`User-agent: ${productToken}`];
  allowPaths.forEach((path) => group.push(`Allow: ${path}`));
  disallowPaths.forEach((path) => group.push(`Disallow: ${path}`));
  if (!allowPaths.length && !disallowPaths.length) group.push("Disallow:");
  const sitemapRules = sitemapUrls.map((value) => `Sitemap: ${value}`);
  output.value = [...group, ...(sitemapRules.length ? ["", ...sitemapRules] : [])].join("\n");
  setStatus("robots.txt erstellt. Prüfe die Pfade, bevor du die Datei veröffentlichst.", "robots.txt generated. Review the paths before publishing the file.");
  return true;
};

const loadPreset = (preset) => {
  agent.value = "*";
  sitemap.value = "";
  if (preset === "allow") {
    allow.value = "/";
    disallow.value = "";
  } else if (preset === "block") {
    allow.value = "";
    disallow.value = "/";
  } else {
    allow.value = "";
    disallow.value = "";
  }
  build();
  if (preset === "allow") setStatus("Alles erlauben ist als sichere Ausgangsbasis geladen.", "Allow all is loaded as a safe starting point.");
  if (preset === "block") setStatus("Achtung: Diese Vorlage sperrt alle passenden Crawler für alle Pfade.", "Warning: this preset blocks every matching crawler from every path.");
  if (preset === "custom") setStatus("Füge nur Regeln hinzu, die du für konkrete Pfade brauchst.", "Add only the rules you need for specific paths.");
};

root.querySelectorAll("[data-generator-preset]").forEach((button) => {
  button.addEventListener("click", () => loadPreset(button.dataset.generatorPreset ?? "allow"));
});
root.querySelector("[data-generator-clear]")?.addEventListener("click", () => {
  agent.value = "*";
  allow.value = "";
  disallow.value = "";
  sitemap.value = "";
  output.value = "";
  setStatus("Eingaben geleert.", "Inputs cleared.");
});
root.querySelector("[data-generator-build]")?.addEventListener("click", build);
root.querySelector("[data-generator-copy]")?.addEventListener("click", async () => {
  if (!build()) return;
  try {
    await navigator.clipboard.writeText(output.value);
    setStatus("robots.txt kopiert.", "robots.txt copied.");
  } catch {
    output.focus();
    output.select();
    setStatus("Automatisches Kopieren war nicht möglich. Der Inhalt ist markiert.", "Automatic copy was unavailable. The content is selected.");
  }
});
root.querySelector("[data-generator-download]")?.addEventListener("click", () => {
  if (!build()) return;
  const url = URL.createObjectURL(new Blob([`${output.value}\n`], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "robots.txt";
  link.click();
  URL.revokeObjectURL(url);
  setStatus("robots.txt heruntergeladen.", "robots.txt downloaded.");
});

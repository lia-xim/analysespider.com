<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" doctype-system="about:legacy-compat" />

  <xsl:template match="/">
    <html lang="de">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, follow" />
        <title>XML-Sitemap — AnalyseSpider</title>
        <link rel="stylesheet" href="/sitemap.css" />
      </head>
      <body>
        <main>
          <header class="sitemap-header">
            <a class="brand" href="/" aria-label="Zur AnalyseSpider-Startseite">
              <span class="brand-mark" aria-hidden="true">AS</span>
              <span>AnalyseSpider</span>
            </a>
            <div class="intro">
              <p class="eyebrow">TECHNISCHE SEO</p>
              <h1>XML-Sitemap</h1>
              <p>Diese Datei hilft Suchmaschinen, die kanonischen und indexierbaren Seiten von AnalyseSpider zu entdecken.</p>
            </div>
            <div class="summary" aria-label="Sitemap-Zusammenfassung">
              <div><strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)" /></strong><span>URLs</span></div>
              <div><strong>200</strong><span>Nur Zielseiten</span></div>
              <div><strong>Automatisch</strong><span>Aus der Routenquelle</span></div>
            </div>
          </header>

          <section class="explanation" aria-labelledby="explanation-title">
            <div>
              <h2 id="explanation-title">Was sehe ich hier?</h2>
              <p>Jede Zeile ist eine URL, die direkt aufgerufen und indexiert werden darf. Weiterleitungen, Fehlerseiten, Test-Fixtures und stillgelegte Downloads sind ausgeschlossen.</p>
            </div>
            <a href="/method">Wie AnalyseSpider arbeitet <span aria-hidden="true">→</span></a>
          </section>

          <section class="url-section" aria-labelledby="url-title">
            <div class="section-heading">
              <div>
                <p class="eyebrow">KANONISCHE SEITEN</p>
                <h2 id="url-title">Enthaltene URLs</h2>
              </div>
              <p>Änderungsdaten erscheinen nur, wenn ein verlässliches redaktionelles Datum vorliegt.</p>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Nr.</th>
                    <th scope="col">URL</th>
                    <th scope="col">Sprache</th>
                    <th scope="col">Bereich</th>
                    <th scope="col">Geändert</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sitemap:urlset/sitemap:url">
                    <tr>
                      <td class="number"><xsl:value-of select="position()" /></td>
                      <td class="location"><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc" /></a></td>
                      <td><span class="badge"><xsl:choose><xsl:when test="contains(sitemap:loc, 'analysespider.com/de')">DE</xsl:when><xsl:otherwise>EN</xsl:otherwise></xsl:choose></span></td>
                      <td>
                        <xsl:choose>
                          <xsl:when test="contains(sitemap:loc, '/tools/') or contains(sitemap:loc, '/de/tools/')">Tool</xsl:when>
                          <xsl:when test="contains(sitemap:loc, '/guides/') or contains(sitemap:loc, '/de/wissen/')">Wissen</xsl:when>
                          <xsl:when test="contains(sitemap:loc, '/crawlers')">Crawler</xsl:when>
                          <xsl:when test="contains(sitemap:loc, '/blog/')">Artikel</xsl:when>
                          <xsl:when test="contains(sitemap:loc, '/reference/')">Referenz</xsl:when>
                          <xsl:when test="contains(sitemap:loc, '/lab/')">Evidenz</xsl:when>
                          <xsl:otherwise>Seite</xsl:otherwise>
                        </xsl:choose>
                      </td>
                      <td class="modified"><xsl:choose><xsl:when test="sitemap:lastmod"><time><xsl:value-of select="sitemap:lastmod" /></time></xsl:when><xsl:otherwise><span aria-label="Kein verlässliches Änderungsdatum">—</span></xsl:otherwise></xsl:choose></td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </div>
          </section>
        </main>
        <footer>
          <p>Eine menschenlesbare Ansicht der maschinenlesbaren XML-Sitemap.</p>
          <nav aria-label="Weiterführende Links"><a href="/robots.txt">robots.txt</a><a href="/contact">Kontakt</a><a href="/privacy">Datenschutz</a></nav>
        </footer>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>

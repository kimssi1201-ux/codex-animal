import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { articles } from "../jeju-travel-news/assets/articles.js";
import { siteOrigin } from "../jeju-travel-news/assets/editorial.js";
import {
  curateArticlesEn,
  editorialProfileEn,
  translatedSlugs
} from "../jeju-travel-news-en/assets/editorial-en.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const enRoot = path.join(rootDir, "en");
const articlesRoot = path.join(enRoot, "articles");
const curatedArticlesEn = curateArticlesEn(articles);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeXml(value) {
  return escapeHtml(value);
}

function articlePath(article) {
  return `/en/articles/${encodeURIComponent(article.slug)}/`;
}

function articleUrl(article) {
  return `${siteOrigin}${articlePath(article)}`;
}

function koArticleUrl(article) {
  return `${siteOrigin}/articles/${encodeURIComponent(article.slug)}/`;
}

function safeUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

function articleMatchForSpot(spot, currentSlug) {
  const term = String(spot || "").replace(/\s/g, "").toLowerCase();
  if (!term) return null;
  return curatedArticlesEn.find((article) => {
    if (article.slug === currentSlug) return false;
    const haystack = [article.title, article.region, ...(article.course || [])]
      .join("")
      .replace(/\s/g, "")
      .toLowerCase();
    return haystack.includes(term) || term.includes(article.title.replace(/\s/g, "").toLowerCase());
  });
}

function relatedArticles(article, count = 4) {
  const sameCategory = curatedArticlesEn.filter((item) => item.slug !== article.slug && item.category === article.category);
  const sameRegion = curatedArticlesEn.filter((item) => item.slug !== article.slug && item.region === article.region && !sameCategory.includes(item));
  const remaining = curatedArticlesEn.filter((item) => item.slug !== article.slug && !sameCategory.includes(item) && !sameRegion.includes(item));
  return [...sameCategory, ...sameRegion, ...remaining].slice(0, count);
}

function renderInfoTable(article) {
  const rows = [
    ["Region", article.region],
    ["Address", article.address],
    ["Parking", article.parking],
    ["Hours", article.operatingHours],
    ["Admission", article.fee]
  ];
  return `<table class="info-table article-info-table"><tbody id="articleInfoRows">${rows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value || "Check the official source before visiting")}</td></tr>`).join("")}</tbody></table>`;
}

function renderByline(article) {
  return `<div class="article-byline" aria-label="Author and review information">
    <span><strong>Written by</strong> ${escapeHtml(article.author || editorialProfileEn.author)}</span>
    <span><strong>Last reviewed</strong> ${escapeHtml(article.reviewedAt || article.date)}</span>
    <p><strong>Review basis</strong> ${escapeHtml(article.reviewMethod || editorialProfileEn.reviewMethod)}</p>
  </div>`;
}

function renderEditorialSections(article) {
  return `<section class="article-readable-section">
    <div class="section-kicker">TRAVEL NOTE</div>
    <h2>What to know</h2>
    <div class="readable-lead">
      <strong>Organized so you can use it on the day you actually visit.</strong>
      <p>${escapeHtml(article.summary)}</p>
    </div>
    <div class="article-note-list">${article.editorialSections.map((section) => `<article class="article-note-block">
      <h3>${escapeHtml(section.title)}</h3>
      ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
    </article>`).join("")}</div>
  </section>`;
}

function renderSources(article) {
  const sources = (article.sources || [])
    .map((source) => ({ name: String(source?.name || "").trim(), url: safeUrl(source?.url) }))
    .filter((source) => source.name && source.url);
  return `<section class="article-sources">
    <h2>Sources and corrections</h2>
    <p>Opening hours, fees and access can change. Please confirm with the official channels below before you visit. If you spot something wrong, let us know through the contact page and we'll review it.</p>
    <ul>${sources.map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.name)}</a></li>`).join("")}</ul>
    <a class="correction-link" href="/contact">Request a correction</a>
  </section>`;
}

function renderNearby(article) {
  const links = (article.nearbySpots || []).map((spot) => {
    const match = articleMatchForSpot(spot, article.slug);
    const href = match ? articlePath(match) : `https://map.naver.com/p/search/${encodeURIComponent(`${spot} Jeju`)}`;
    const external = match ? "" : ' target="_blank" rel="noreferrer"';
    return `<a href="${escapeHtml(href)}"${external}>${escapeHtml(spot)}</a>`;
  });
  return `<section>
    <h2>Nearby places</h2>
    <div class="spot-tags">${links.join("")}</div>
  </section>`;
}

function renderRelatedCard(article) {
  return `<article class="news-card">
    <a href="${articlePath(article)}">
      <img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.title)}" width="180" height="120" loading="lazy">
      <div>
        <p class="meta">${escapeHtml(article.category)} · ${escapeHtml(article.region)}</p>
        <h3>${escapeHtml(article.title)}</h3>
        <p>${escapeHtml(article.summary)}</p>
      </div>
    </a>
  </article>`;
}

function jsonLd(article) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    image: [article.image],
    datePublished: article.date,
    dateModified: article.dateModified || article.reviewedAt || article.date,
    author: { "@type": "Organization", name: article.author || editorialProfileEn.author, url: `${siteOrigin}/en/about` },
    publisher: { "@type": "Organization", name: editorialProfileEn.publisher, url: `${siteOrigin}/en/` },
    mainEntityOfPage: articleUrl(article),
    articleSection: article.category,
    inLanguage: "en-US"
  };
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}

function renderArticlePage(article) {
  const related = relatedArticles(article);
  const course = (article.course || []).map((step) => `<li>${escapeHtml(step)}</li>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(article.summary)}">
  <meta name="theme-color" content="#ffffff">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="en_US">
  <meta property="og:title" content="${escapeHtml(article.title)} | Jeju Travel News">
  <meta property="og:description" content="${escapeHtml(article.summary)}">
  <meta property="og:url" content="${articleUrl(article)}">
  <meta property="og:image" content="${escapeHtml(article.image)}">
  <meta property="article:published_time" content="${escapeHtml(article.date)}">
  <meta property="article:modified_time" content="${escapeHtml(article.dateModified || article.reviewedAt || article.date)}">
  <link rel="canonical" href="${articleUrl(article)}">
  <link rel="alternate" hreflang="en" href="${articleUrl(article)}">
  <link rel="alternate" hreflang="ko" href="${koArticleUrl(article)}">
  <link rel="alternate" hreflang="x-default" href="${koArticleUrl(article)}">
  <link rel="stylesheet" href="/jeju-travel-news/assets/styles.css?v=20260810-editorial-1">
  <title>${escapeHtml(article.title)} | Jeju Travel News</title>
  <script type="application/ld+json">${jsonLd(article)}</script>
</head>
<body>
  <header class="site-header detail-site-header">
    <a class="brand" href="/en/" aria-label="Jeju Travel News home">
      <span class="brand-mark" aria-hidden="true">JN</span>
      <span><strong>Jeju Travel News</strong><small>An editorial guide to Jeju</small></span>
    </a>
    <div class="detail-header-actions">
      <a class="list-link" href="${koArticleUrl(article)}" aria-label="Read this article in Korean">🇰🇷 한국어</a>
      <a class="list-link" href="/en/">List</a>
    </div>
  </header>
  <main class="article-page" id="top">
    <article class="article-detail" id="articleDetail" data-slug="${escapeHtml(article.slug)}" data-title="${escapeHtml(article.title)}" data-region="${escapeHtml(article.region)}" data-category="${escapeHtml(article.category)}" data-ko-title="${escapeHtml(article.koTitle)}" data-ko-region="${escapeHtml(article.koRegion)}" data-ko-category="${escapeHtml(article.koCategory)}" data-ko-nearby="${escapeHtml((article.koNearbySpots || []).join("|"))}">
      <img class="detail-hero" src="${escapeHtml(article.image)}" alt="${escapeHtml(article.title)}" width="1200" height="720">
      <div class="detail-body">
        <div class="meta">${escapeHtml(article.category)} · ${escapeHtml(article.region)} · ${escapeHtml(article.date)}</div>
        <h1>${escapeHtml(article.title)}</h1>
        <p class="summary">${escapeHtml(article.summary)}</p>
        ${renderByline(article)}
        ${renderInfoTable(article)}
        ${renderEditorialSections(article)}
        <section><h2>Suggested route</h2><ol class="course-list">${course}</ol></section>
        <section><h2>Before-you-go checklist</h2><ul class="check-list"><li>Confirm opening hours and admission with the official source on the day you visit.</li><li>For beaches and oreum trails, follow on-site wind, rain and fog closures over any online guide.</li><li>In peak season, check public parking near the destination, not just the spot right in front of it.</li></ul></section>
        ${renderNearby(article)}
        ${renderSources(article)}
        <section id="articleMyRealTripSection" class="mrt-section" aria-live="polite"></section>
      </div>
    </article>
    <aside class="related-box">
      <div class="section-heading"><p class="eyebrow">Related</p><h2>Related articles</h2></div>
      <div id="relatedArticles">${related.map(renderRelatedCard).join("")}</div>
    </aside>
  </main>
  <footer class="site-footer">
    <div class="footer-intro"><a class="brand footer-brand" href="/en/"><span class="brand-mark" aria-hidden="true">JN</span><span><strong>Jeju Travel News</strong><small>A practical guide to planning Jeju trips</small></span></a></div>
    <div class="footer-grid" id="footerLinks"><nav aria-label="Site"><h2>Site</h2><ul><li><a href="/">한국어 사이트 (Korean site)</a></li><li><a href="/contact">Contact / corrections (Korean form)</a></li></ul></nav></div>
    <p class="copyright">Copyright 2026 Jeju Travel News. All Rights Reserved.</p>
  </footer>
  <script type="module" src="/jeju-travel-news-en/assets/app.js?v=1"></script>
</body>
</html>
`;
}

function renderSnapshotRecommended(article, lead = false) {
  return `<article class="recommend-card${lead ? " is-lead" : ""}"><a href="${articlePath(article)}"><img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.title)}" width="720" height="480"><div class="recommend-content"><span class="recommend-label">${escapeHtml(article.category)}</span><strong>${escapeHtml(article.title)}</strong><em>${escapeHtml(article.region)} · ${escapeHtml(article.date)}</em></div></a></article>`;
}

function renderSnapshotRow(article) {
  return `<article class="news-row"><a href="${articlePath(article)}"><img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.title)}" width="220" height="150" loading="lazy"><div><p class="meta">${escapeHtml(article.category)} · ${escapeHtml(article.region)}</p><h2>${escapeHtml(article.title)}</h2><p>${escapeHtml(article.summary)}</p></div></a></article>`;
}

function replaceSnapshot(html, marker, content) {
  const start = `<!-- STATIC_${marker}_START -->`;
  const end = `<!-- STATIC_${marker}_END -->`;
  const pattern = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (!pattern.test(html)) throw new Error(`Missing ${marker} snapshot markers in en/index.html`);
  return html.replace(pattern, `${start}\n        ${content}\n        ${end}`);
}

function buildSitemap() {
  const staticPages = [{ loc: `${siteOrigin}/en/`, priority: "1.0" }];
  const articlePages = curatedArticlesEn.map((article) => ({ loc: articleUrl(article), priority: "0.8", lastmod: article.dateModified || article.reviewedAt || article.date }));
  const pages = [...staticPages, ...articlePages];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url><loc>${escapeXml(page.loc)}</loc>${page.lastmod ? `<lastmod>${escapeXml(page.lastmod)}</lastmod>` : ""}<changefreq>${page.loc === `${siteOrigin}/en/` ? "daily" : "monthly"}</changefreq><priority>${page.priority}</priority></url>`).join("\n")}
</urlset>
`;
}

function buildFeed() {
  const items = curatedArticlesEn.slice(0, 20);
  const latestDate = new Date(`${items[0]?.dateModified || items[0]?.date || editorialProfileEn.reviewedAt}T00:00:00+09:00`).toUTCString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Jeju Travel News</title>
  <link>${siteOrigin}/en/</link>
  <description>Reviewed Jeju travel guides in English: places to visit, beaches, oreum trails, cafes and stays with practical route notes.</description>
  <language>en-US</language>
  <lastBuildDate>${latestDate}</lastBuildDate>
${items.map((article) => `  <item><title>${escapeXml(article.title)}</title><link>${escapeXml(articleUrl(article))}</link><guid isPermaLink="true">${escapeXml(articleUrl(article))}</guid><description>${escapeXml(article.summary)}</description><category>${escapeXml(article.category)}</category><pubDate>${new Date(`${article.date}T00:00:00+09:00`).toUTCString()}</pubDate></item>`).join("\n")}
</channel>
</rss>
`;
}

async function build() {
  if (path.dirname(articlesRoot) !== enRoot || path.basename(articlesRoot) !== "articles") {
    throw new Error("Refusing to rebuild an unexpected en/articles directory");
  }
  if (curatedArticlesEn.length < 1) throw new Error("No translated English articles found");
  if (curatedArticlesEn.length !== translatedSlugs.length) {
    throw new Error("translatedSlugs and curated English articles are out of sync");
  }
  for (const article of curatedArticlesEn) {
    if (!article.editorialSections?.length || !article.sources?.length || !article.author || !article.reviewedAt) {
      throw new Error(`Incomplete English editorial metadata: ${article.slug}`);
    }
  }

  await rm(articlesRoot, { recursive: true, force: true });
  await mkdir(articlesRoot, { recursive: true });
  await Promise.all(curatedArticlesEn.map(async (article) => {
    const outputDir = path.join(articlesRoot, article.slug);
    await mkdir(outputDir, { recursive: true });
    await writeFile(path.join(outputDir, "index.html"), renderArticlePage(article), "utf8");
  }));

  const indexPath = path.join(enRoot, "index.html");
  let indexHtml = await readFile(indexPath, "utf8");
  indexHtml = replaceSnapshot(indexHtml, "RECOMMENDED", curatedArticlesEn.slice(0, 4).map((article, index) => renderSnapshotRecommended(article, index === 0)).join("\n"));
  indexHtml = replaceSnapshot(indexHtml, "FEED", curatedArticlesEn.slice(4, 12).map(renderSnapshotRow).join("\n"));
  await writeFile(indexPath, indexHtml, "utf8");
  await writeFile(path.join(enRoot, "sitemap.xml"), buildSitemap(), "utf8");
  await writeFile(path.join(enRoot, "feed.xml"), buildFeed(), "utf8");
}

await build();
console.log(`Built ${curatedArticlesEn.length} English article pages.`);

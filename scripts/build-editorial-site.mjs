import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { articles } from "../jeju-travel-news/assets/articles.js";
import { curateArticles, editorialProfile, siteOrigin } from "../jeju-travel-news/assets/editorial.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const articlesRoot = path.join(rootDir, "articles");
const curatedArticles = curateArticles(articles);

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
  return `/articles/${encodeURIComponent(article.slug)}/`;
}

function articleUrl(article) {
  return `${siteOrigin}${articlePath(article)}`;
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
  const term = String(spot || "").replace(/\s/g, "");
  if (!term) return null;
  return curatedArticles.find((article) => {
    if (article.slug === currentSlug) return false;
    const haystack = [article.title, article.region, ...(article.course || [])].join("").replace(/\s/g, "");
    return haystack.includes(term) || term.includes(article.title.replace(/\s/g, ""));
  });
}

function relatedArticles(article, count = 4) {
  const sameCategory = curatedArticles.filter((item) => item.slug !== article.slug && item.category === article.category);
  const sameRegion = curatedArticles.filter((item) => item.slug !== article.slug && item.region === article.region && !sameCategory.includes(item));
  const remaining = curatedArticles.filter((item) => item.slug !== article.slug && !sameCategory.includes(item) && !sameRegion.includes(item));
  return [...sameCategory, ...sameRegion, ...remaining].slice(0, count);
}

function renderInfoTable(article) {
  const rows = [
    ["지역", article.region],
    ["주소", article.address],
    ["주차", article.parking],
    ["운영시간", article.operatingHours],
    ["입장료", article.fee]
  ];
  return `<table class="info-table article-info-table"><tbody id="articleInfoRows">${rows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value || "방문 전 공식 안내 확인")}</td></tr>`).join("")}</tbody></table>`;
}

function renderByline(article) {
  return `<div class="article-byline" aria-label="기사 작성과 검수 정보">
    <span><strong>작성</strong> ${escapeHtml(article.author || editorialProfile.author)}</span>
    <span><strong>최종 검수</strong> ${escapeHtml(article.reviewedAt || article.date)}</span>
    <p><strong>검수 기준</strong> ${escapeHtml(article.reviewMethod || editorialProfile.reviewMethod)}</p>
  </div>`;
}

function renderShareBar(article) {
  return `<div class="article-share-row" aria-label="기사 공유">
    <span>공유</span>
    <button type="button" data-share-url="${escapeHtml(articleUrl(article))}" data-share-title="${escapeHtml(article.title)}">URL</button>
  </div>`;
}

function renderEditorialSections(article) {
  return `<section class="article-readable-section">
    <div class="section-kicker">TRAVEL NOTE</div>
    <h2>본문 정보</h2>
    <div class="readable-lead">
      <strong>일정에 바로 적용할 수 있도록 정리했습니다.</strong>
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
    <h2>자료 출처와 수정 요청</h2>
    <p>운영시간·요금·통제 정보는 바뀔 수 있습니다. 방문 전 아래 공식 채널을 다시 확인해 주세요. 잘못된 정보는 문의 페이지로 알려주시면 검토 후 수정합니다.</p>
    <ul>${sources.map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.name)}</a></li>`).join("")}</ul>
    <a class="correction-link" href="/contact">정보 수정 요청</a>
  </section>`;
}

function renderNearby(article) {
  const links = (article.nearbySpots || []).map((spot) => {
    const match = articleMatchForSpot(spot, article.slug);
    const href = match ? articlePath(match) : `https://map.naver.com/p/search/${encodeURIComponent(`${spot} 제주`)}`;
    const external = match ? "" : ' target="_blank" rel="noreferrer"';
    return `<a href="${escapeHtml(href)}"${external}>${escapeHtml(spot)}</a>`;
  });
  return `<section>
    <h2>근처 여행지</h2>
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
    author: { "@type": "Organization", name: article.author || editorialProfile.author, url: `${siteOrigin}/about` },
    publisher: { "@type": "Organization", name: editorialProfile.publisher, url: `${siteOrigin}/` },
    mainEntityOfPage: articleUrl(article),
    articleSection: article.category,
    inLanguage: "ko-KR"
  };
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}

function renderArticlePage(article) {
  const related = relatedArticles(article);
  const course = (article.course || []).map((step) => `<li>${escapeHtml(step)}</li>`).join("");
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(article.summary)}">
  <meta name="theme-color" content="#ffffff">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:title" content="${escapeHtml(article.title)} | 제주여행뉴스">
  <meta property="og:description" content="${escapeHtml(article.summary)}">
  <meta property="og:url" content="${articleUrl(article)}">
  <meta property="og:image" content="${escapeHtml(article.image)}">
  <meta property="article:published_time" content="${escapeHtml(article.date)}">
  <meta property="article:modified_time" content="${escapeHtml(article.dateModified || article.reviewedAt || article.date)}">
  <link rel="canonical" href="${articleUrl(article)}">
  <link rel="stylesheet" href="/jeju-travel-news/assets/styles.css?v=20260830-telltrip-mobile-2">
  <title>${escapeHtml(article.title)} | 제주여행뉴스</title>
  <script type="application/ld+json">${jsonLd(article)}</script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5751319666030430" crossorigin="anonymous"></script>
</head>
<body>
  <header class="site-header detail-site-header">
    <a class="brand" href="/" aria-label="제주여행뉴스 홈">
      <span class="brand-mark" aria-hidden="true">JN</span>
      <span><strong data-i18n="brand.name">제주여행뉴스</strong><small data-i18n="brand.tagline">제주 여행 정보 뉴스</small></span>
    </a>
    <div class="detail-header-actions">
      <div class="language-switch" id="languageSwitch" aria-label="언어 선택">
        <button type="button" data-lang="ko">KR</button><button type="button" data-lang="en">EN</button><button type="button" data-lang="ja">JP</button><button type="button" data-lang="zh">CN</button>
      </div>
      <a class="list-link" href="/" data-i18n="nav.list">목록</a>
    </div>
  </header>
  <main class="article-page" id="top">
    <article class="article-detail" id="articleDetail">
      <div class="detail-body">
        <div class="meta">${escapeHtml(article.category)} · ${escapeHtml(article.region)} · ${escapeHtml(article.date)}</div>
        <h1>${escapeHtml(article.title)}</h1>
        <p class="summary">${escapeHtml(article.summary)}</p>
        ${renderShareBar(article)}
        <img class="detail-hero" src="${escapeHtml(article.image)}" alt="${escapeHtml(article.title)}" width="1200" height="720">
        ${renderByline(article)}
        ${renderEditorialSections(article)}
        <section><h2>추천 여행 코스</h2><ol class="course-list">${course}</ol></section>
        ${renderInfoTable(article)}
        <section><h2>방문 전 체크포인트</h2><ul class="check-list"><li>운영시간과 입장료는 방문 당일 공식 안내를 확인하세요.</li><li>해변과 오름은 바람, 비, 안개와 현장 통제 안내를 우선하세요.</li><li>성수기에는 목적지 바로 앞뿐 아니라 주변 공영 주차장도 확인하세요.</li></ul></section>
        ${renderNearby(article)}
        ${renderSources(article)}
      </div>
    </article>
    <aside class="related-box">
      <div class="section-heading"><p class="eyebrow">Related</p><h2 data-i18n="article.related">관련 글</h2></div>
      <div id="relatedArticles">${related.map(renderRelatedCard).join("")}</div>
    </aside>
  </main>
  <footer class="site-footer">
    <div class="footer-intro"><a class="brand footer-brand" href="/"><span class="brand-mark" aria-hidden="true">JN</span><span><strong>제주여행뉴스</strong><small>제주 여행 선택을 돕는 뉴스 포털</small></span></a></div>
    <div class="footer-grid" id="footerLinks"><nav aria-label="사이트 안내"><h2>사이트 안내</h2><ul><li><a href="/about">사이트 소개</a></li><li><a href="/editorial-policy">편집 원칙</a></li><li><a href="/contact">문의·수정 요청</a></li><li><a href="/privacy">개인정보 처리방침</a></li></ul></nav></div>
    <p class="copyright">Copyright 2026 Jeju Travel News. All Rights Reserved.</p>
  </footer>
  <script type="module" src="/jeju-travel-news/assets/app.js?v=20260830-telltrip-mobile-2"></script>
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
  if (!pattern.test(html)) throw new Error(`Missing ${marker} snapshot markers in index.html`);
  return html.replace(pattern, `${start}\n${content}\n        ${end}`);
}

function buildSitemap() {
  const staticPages = [
    { loc: `${siteOrigin}/`, priority: "1.0" },
    { loc: `${siteOrigin}/about`, priority: "0.5" },
    { loc: `${siteOrigin}/editorial-policy`, priority: "0.5" },
    { loc: `${siteOrigin}/contact`, priority: "0.4" },
    { loc: `${siteOrigin}/privacy`, priority: "0.4" }
  ];
  const articlePages = curatedArticles.map((article) => ({ loc: articleUrl(article), priority: "0.8", lastmod: article.dateModified || article.reviewedAt || article.date }));
  const pages = [...staticPages, ...articlePages];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url><loc>${escapeXml(page.loc)}</loc>${page.lastmod ? `<lastmod>${escapeXml(page.lastmod)}</lastmod>` : ""}<changefreq>${page.loc === `${siteOrigin}/` ? "daily" : "monthly"}</changefreq><priority>${page.priority}</priority></url>`).join("\n")}
</urlset>
`;
}

function buildFeed() {
  const items = curatedArticles.slice(0, 20);
  const latestDate = new Date(`${items[0]?.dateModified || items[0]?.date || editorialProfile.reviewedAt}T00:00:00+09:00`).toUTCString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>제주여행뉴스</title>
  <link>${siteOrigin}/</link>
  <description>제주 가볼 만한 곳, 해변, 오름과 여행 동선을 직접 검수해 정리하는 제주 여행 매거진</description>
  <language>ko-KR</language>
  <lastBuildDate>${latestDate}</lastBuildDate>
${items.map((article) => `  <item><title>${escapeXml(article.title)}</title><link>${escapeXml(articleUrl(article))}</link><guid isPermaLink="true">${escapeXml(articleUrl(article))}</guid><description>${escapeXml(article.summary)}</description><category>${escapeXml(article.category)}</category><pubDate>${new Date(`${article.date}T00:00:00+09:00`).toUTCString()}</pubDate></item>`).join("\n")}
</channel>
</rss>
`;
}

async function build() {
  if (path.dirname(articlesRoot) !== rootDir || path.basename(articlesRoot) !== "articles") {
    throw new Error("Refusing to rebuild an unexpected articles directory");
  }
  if (curatedArticles.length < 15) throw new Error("At least 15 reviewed articles are required for the public build");
  for (const article of curatedArticles) {
    if (!article.editorialSections?.length || !article.sources?.length || !article.author || !article.reviewedAt) {
      throw new Error(`Incomplete editorial metadata: ${article.slug}`);
    }
  }

  await rm(articlesRoot, { recursive: true, force: true });
  await mkdir(articlesRoot, { recursive: true });
  await Promise.all(curatedArticles.map(async (article) => {
    const outputDir = path.join(articlesRoot, article.slug);
    await mkdir(outputDir, { recursive: true });
    await writeFile(path.join(outputDir, "index.html"), renderArticlePage(article), "utf8");
  }));

  const indexPath = path.join(rootDir, "index.html");
  let indexHtml = await readFile(indexPath, "utf8");
  indexHtml = replaceSnapshot(indexHtml, "RECOMMENDED", curatedArticles.slice(0, 6).map((article, index) => renderSnapshotRecommended(article, index === 0)).join("\n"));
  indexHtml = replaceSnapshot(indexHtml, "FEED", curatedArticles.slice(6, 14).map(renderSnapshotRow).join("\n"));
  await writeFile(indexPath, indexHtml, "utf8");
  await writeFile(path.join(rootDir, "sitemap.xml"), buildSitemap(), "utf8");
  await writeFile(path.join(rootDir, "feed.xml"), buildFeed(), "utf8");
}

await build();
console.log(`Built ${curatedArticles.length} reviewed article pages.`);

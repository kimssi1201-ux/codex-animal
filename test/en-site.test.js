import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { articles } from "../jeju-travel-news/assets/articles.js";
import { curateArticles } from "../jeju-travel-news/assets/editorial.js";
import {
  curateArticlesEn,
  editorialOverridesEn,
  translatedSlugs
} from "../jeju-travel-news-en/assets/editorial-en.js";

test("English overlay only covers slugs that also have Korean curated articles", () => {
  const koSlugs = new Set(curateArticles(articles).map((article) => article.slug));
  for (const slug of translatedSlugs) {
    assert.ok(koSlugs.has(slug), `translated slug "${slug}" has no matching Korean curated article`);
  }
  assert.equal(new Set(translatedSlugs).size, translatedSlugs.length, "translatedSlugs has duplicates");
  assert.equal(Object.keys(editorialOverridesEn).length >= translatedSlugs.length, true);
});

test("curateArticlesEn produces one complete, reviewed English article per translated slug", () => {
  const curatedEn = curateArticlesEn(articles);
  assert.equal(curatedEn.length, translatedSlugs.length);
  assert.equal(new Set(curatedEn.map((article) => article.slug)).size, curatedEn.length);
  for (const article of curatedEn) {
    assert.equal(article.status, "published");
    assert.ok(article.author);
    assert.match(article.reviewedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(article.sources.length >= 2, article.slug);
    assert.ok(article.editorialSections.length >= 1, article.slug);
    for (const section of article.editorialSections) {
      assert.ok(section.title, article.slug);
      assert.ok(section.paragraphs.length >= 1, article.slug);
    }
    // Structural fields (image, date) are reused from the shared Korean base
    // article; the Korean-language matching fields exist for the MyRealTrip
    // widget only and must never leak into visible content fields.
    assert.ok(article.image, article.slug);
    assert.ok(article.koTitle, article.slug);
    assert.notEqual(article.title, article.koTitle, article.slug);
  }
});

test("English build produces a static page for every translated article, with reciprocal hreflang", async () => {
  for (const slug of translatedSlugs) {
    const enHtml = await readFile(new URL(`../en/articles/${slug}/index.html`, import.meta.url), "utf8");
    assert.match(enHtml, new RegExp(`rel="canonical" href="https://www\\.moneyarchive\\.kr/en/articles/${slug}/"`));
    assert.match(enHtml, new RegExp(`hreflang="ko" href="https://www\\.moneyarchive\\.kr/articles/${slug}/"`));
    assert.match(enHtml, new RegExp(`hreflang="en" href="https://www\\.moneyarchive\\.kr/en/articles/${slug}/"`));
    assert.match(enHtml, /type="application\/ld\+json"/);
    assert.match(enHtml, /"inLanguage":"en-US"/);
    assert.match(enHtml, /Jeju Travel News Editorial Team/);
    assert.match(enHtml, /Sources and corrections/);

    const koHtml = await readFile(new URL(`../articles/${slug}/index.html`, import.meta.url), "utf8");
    assert.match(koHtml, new RegExp(`hreflang="en" href="https://www\\.moneyarchive\\.kr/en/articles/${slug}/"`));
  }
});

test("An untranslated Korean article carries no hreflang tags", async () => {
  const koSlugs = curateArticles(articles).map((article) => article.slug);
  const untranslated = koSlugs.find((slug) => !translatedSlugs.includes(slug));
  assert.ok(untranslated, "expected at least one untranslated curated slug for this test to be meaningful");
  const html = await readFile(new URL(`../articles/${untranslated}/index.html`, import.meta.url), "utf8");
  assert.doesNotMatch(html, /rel="alternate" hreflang=/);
  assert.doesNotMatch(html, /🇬🇧 English/);
});

test("English sitemap contains exactly the translated articles plus the English homepage", async () => {
  const sitemap = await readFile(new URL("../en/sitemap.xml", import.meta.url), "utf8");
  const articleUrls = sitemap.match(/<loc>https:\/\/www\.moneyarchive\.kr\/en\/articles\//g) || [];
  assert.equal(articleUrls.length, translatedSlugs.length);
  assert.match(sitemap, /<loc>https:\/\/www\.moneyarchive\.kr\/en\/<\/loc>/);
});

test("English homepage links back to the Korean site and does not touch Korean URLs", async () => {
  const enHtml = await readFile(new URL("../en/index.html", import.meta.url), "utf8");
  assert.match(enHtml, /hreflang="ko" href="https:\/\/www\.moneyarchive\.kr\/"/);
  assert.match(enHtml, /href="\/" aria-label="Read this site in Korean"/);
  assert.match(enHtml, /\/en\/articles\/seongsan-sunrise-course\//);
});

test("Korean homepage links to the English site without changing its own canonical URL", async () => {
  const rootHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(rootHtml, /rel="canonical" href="https:\/\/www\.moneyarchive\.kr\/"/);
  assert.match(rootHtml, /hreflang="en" href="https:\/\/www\.moneyarchive\.kr\/en\/"/);
  assert.match(rootHtml, /href="\/en\/">🇬🇧 English/);
});

test("robots.txt advertises both the Korean and English sitemaps", async () => {
  const robots = await readFile(new URL("../robots.txt", import.meta.url), "utf8");
  assert.match(robots, /Sitemap: https:\/\/www\.moneyarchive\.kr\/sitemap\.xml/);
  assert.match(robots, /Sitemap: https:\/\/www\.moneyarchive\.kr\/en\/sitemap\.xml/);
});

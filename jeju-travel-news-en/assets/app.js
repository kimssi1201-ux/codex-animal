// English-only frontend for the /en/ Jeju Travel News mirror.
//
// This is a deliberately small, English-only script — not a fork of
// jeju-travel-news/assets/app.js (which carries ko/ja/zh branching for a
// separate, shallow language toggle; see that file's languageCatalog).
// Every English article is a static, pre-rendered page (there is no
// English equivalent of the Korean draft pool), so this script only needs
// to do two things at runtime:
//   1. On the homepage, filter/search the small curated English article set.
//   2. On an article page, populate the MyRealTrip booking widget by
//      calling the existing, unmodified backend endpoints.

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=82";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeImageUrl(value) {
  const url = String(value || "").trim();
  if (!url) return FALLBACK_IMAGE;
  return url.startsWith("//") ? `https:${url}` : url;
}

function imageTag(src, alt, className = "") {
  const classAttribute = className ? ` class="${escapeHtml(className)}"` : "";
  return `<img${classAttribute} src="${escapeHtml(normalizeImageUrl(src))}" alt="${escapeHtml(alt)}" loading="lazy">`;
}

function safeExternalUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  const normalized = url.startsWith("/") ? `https:${url}` : url;
  if (!/^https:\/\//i.test(normalized)) return "";
  try {
    return new URL(normalized).href;
  } catch {
    return "";
  }
}

// MyRealTrip's own product catalog is Korean-only (its search endpoints are
// queried with Korean keywords — see myrealtripContextFromArticleEl below).
// Only this small, closed set of category/status labels the API can return
// itself is translated; real product titles come through as-is. This is a
// known, documented limitation rather than a bug: the underlying catalog
// has no English data to translate from.
const CATEGORY_LABELS_EN = {
  "숙소": "Stay",
  "투어·티켓": "Tours & Tickets",
  "마이리얼트립": "MyRealTrip",
  "여행 상품": "Travel product",
  "카테고리": "Category"
};

function translateCategory(value) {
  const text = String(value || "").trim();
  return CATEGORY_LABELS_EN[text] || text || "Travel product";
}

function translatePriceText(value) {
  const text = String(value ?? "").trim();
  return !text || text === "가격 확인" ? "Check price" : text;
}

function normalizeProduct(product = {}) {
  return {
    title: product.title || product.name || product.productName || "Jeju travel product",
    category: translateCategory(product.category || product.region || product.type),
    priceText: translatePriceText(product.priceText || product.displayPrice || product.price || product.salePrice),
    image: product.image || "",
    url: safeExternalUrl(product.url || product.link || product.deepLink || product.webUrl)
  };
}

function myrealtripCard(product) {
  const item = normalizeProduct(product);
  const content = `
    ${imageTag(item.image, item.title)}
    <span>
      <em>${escapeHtml(item.category)}</em>
      <strong>${escapeHtml(item.title)}</strong>
      <small>${escapeHtml(String(item.priceText))}</small>
    </span>
  `;
  if (item.url) {
    return `<article class="mrt-card"><a href="${escapeHtml(item.url)}" target="_blank" rel="sponsored nofollow noopener noreferrer">${content}</a></article>`;
  }
  return `<article class="mrt-card is-disabled">${content}</article>`;
}

const STAY_CATEGORY_HINTS = ["숙소", "호텔", "펜션"];

function myrealtripContextFromArticleEl(el) {
  const koTitle = el.dataset.koTitle || "";
  const koRegion = el.dataset.koRegion || "";
  const koCategory = el.dataset.koCategory || "";
  const koNearby = (el.dataset.koNearby || "").split("|").filter(Boolean);
  const isStay = STAY_CATEGORY_HINTS.some((hint) => koCategory.includes(hint));
  const spot = koNearby[0] || koTitle || koRegion || "제주";
  const keyword = isStay ? `${koRegion || "제주"} 숙소` : `제주 ${spot} 투어`;
  return {
    keyword,
    label: el.dataset.title || el.dataset.region || "Jeju",
    type: isStay ? "hotel" : "tour",
    title: koTitle,
    spot,
    category: koCategory,
    region: koRegion,
    nearby: koNearby.slice(0, 5),
    stayKeyword: koRegion || spot,
    scope: "article"
  };
}

function renderMyRealTripSection(section, items, mode, context) {
  const isStay = context.type === "hotel";
  const label = escapeHtml(context.label);
  const heading = isStay ? `Stays near ${label}` : `${label} Travel Picks`;
  const description = isStay
    ? "Bookable stays in the same area as this destination."
    : "Tours and activities related to this destination.";
  const validItems = items.map(normalizeProduct).filter((item) => item.title && item.url && item.image);

  if (mode !== "ready" || !validItems.length) {
    section.hidden = true;
    section.innerHTML = "";
    return;
  }

  section.hidden = false;
  section.innerHTML = `
    <div class="section-heading">
      <p class="eyebrow">MYREALTRIP</p>
      <h2>${heading}</h2>
      <p class="mrt-context-description">${escapeHtml(description)}</p>
      <p class="affiliate-disclosure">Advertising and affiliate disclosure: This area may include MyRealTrip affiliate links. We may receive a commission when you book or purchase through a link. Product names below come directly from MyRealTrip's own catalog and may appear in Korean.</p>
    </div>
    <div class="mrt-grid">${validItems.slice(0, 4).map(myrealtripCard).join("")}</div>
  `;
}

async function loadArticleMyRealTrip() {
  const detail = document.querySelector("#articleDetail");
  const section = document.querySelector("#articleMyRealTripSection");
  if (!detail || !section) return;
  const context = myrealtripContextFromArticleEl(detail);

  const fetchTours = async () => {
    const query = new URLSearchParams({
      keyword: context.keyword,
      type: context.type,
      title: context.title,
      spot: context.spot,
      category: context.category,
      region: context.region,
      nearby: context.nearby.join("|"),
      scope: context.scope,
      limit: "6"
    });
    const response = await fetch(`/api/myrealtrip?${query.toString()}`, { headers: { accept: "application/json" } });
    const payload = await response.json();
    return response.ok && payload?.ok !== false ? payload : { items: [] };
  };

  const fetchStays = async () => {
    if (!context.stayKeyword) return { items: [] };
    const response = await fetch("/api/myrealtrip-accommodation?action=search", {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify({
        keyword: context.stayKeyword,
        query: context.stayKeyword,
        title: context.title,
        spot: context.spot,
        region: context.region,
        nearby: context.nearby.join("|"),
        scope: context.scope,
        adults: 2,
        page: 1,
        limit: 4
      })
    });
    const payload = await response.json();
    return response.ok && payload?.ok !== false ? payload : { items: [] };
  };

  try {
    let payload = context.type === "hotel" ? await fetchStays() : await fetchTours();
    if (context.type !== "hotel" && !(payload.items || []).length && context.stayKeyword) {
      payload = await fetchStays();
    }
    renderMyRealTripSection(section, payload.items || [], "ready", context);
  } catch {
    renderMyRealTripSection(section, [], "empty", context);
  }
}

// --- Homepage: category filter + search over the English curated set ---

async function loadHomepage() {
  const grid = document.querySelector("#categoryNewsSections");
  const filterBar = document.querySelector("#categoryFilter");
  const searchInput = document.querySelector("#categorySearch");
  if (!grid || !filterBar) return;

  const [{ articles }, { curateArticlesEn }] = await Promise.all([
    import("/jeju-travel-news/assets/articles.js"),
    import("/jeju-travel-news-en/assets/editorial-en.js")
  ]);
  const publicArticles = curateArticlesEn(articles);

  const categories = ["All", ...new Set(publicArticles.map((article) => article.category))];
  let activeCategory = "All";
  let query = "";

  function articleRow(article) {
    return `<article class="news-row">
      <a href="/en/articles/${encodeURIComponent(article.slug)}/">
        ${imageTag(article.image, article.title)}
        <div>
          <p class="meta">${escapeHtml(article.category)} · ${escapeHtml(article.region)}</p>
          <h2>${escapeHtml(article.title)}</h2>
          <p>${escapeHtml(article.summary)}</p>
        </div>
      </a>
    </article>`;
  }

  function render() {
    const term = query.trim().toLowerCase();
    const visible = publicArticles.filter((article) => {
      const matchesCategory = activeCategory === "All" || article.category === activeCategory;
      const matchesQuery = !term || `${article.title} ${article.region} ${article.summary}`.toLowerCase().includes(term);
      return matchesCategory && matchesQuery;
    });
    grid.innerHTML = visible.length
      ? `<div class="news-list-feed">${visible.map(articleRow).join("")}</div>`
      : `<p class="empty-state">No articles match that search yet.</p>`;
  }

  function renderFilterBar() {
    filterBar.innerHTML = categories
      .map((category) => `<button type="button" class="${category === activeCategory ? "is-active" : ""}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`)
      .join("");
  }

  filterBar.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    renderFilterBar();
    render();
  });

  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      query = event.target.value;
      render();
    });
  }

  renderFilterBar();
  render();
}

function bindMenuToggle() {
  const toggle = document.querySelector("#menuToggle");
  const nav = document.querySelector("#primaryNav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("is-open", !expanded);
  });
}

bindMenuToggle();
loadHomepage();
loadArticleMyRealTrip();

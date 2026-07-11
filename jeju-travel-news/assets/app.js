import { articles, categories } from "./articles.js?v=20260711-content-15";

const $ = (selector) => document.querySelector(selector);
const params = new URLSearchParams(window.location.search);
const fallbackImage = "https://tong.visitkorea.or.kr/cms/resource/91/3481291_image2_1.jpg";
const tourismDataVersion = "20260711-content-15";
const detailPath = window.location.pathname.includes("/jeju-travel-news/") ? "article.html" : "/article.html";
const officialCache = new Map();
const airportCache = new Map();
const regionCache = new Map();
const tnaCategoryCache = new Map();
const myrealtripRequestKeys = new Map();
const articleThumbnailCache = new Map();
const articleThumbnailRequests = new Map();
const officialImageSlugs = new Set([
  "seongsan-sunrise-course",
  "hyeopjae-half-day",
  "hamdeok-cafe-street",
  "udo-day-trip",
  "seogwipo-olle-market-food",
  "sangumburi-autumn-course",
  "hallasan-beginner-trail",
  "seopjikoji-coastal-walk-guide",
  "bijarim-forest-walk-guide",
  "saryeoni-forest-road-check",
  "yongmeori-coast-visit-check",
  "jeongbang-waterfall-guide",
  "cheonjiyeon-night-walk-course",
  "woljeongri-beach-cafe-walk",
  "gimnyeong-beach-light-guide",
  "osulloc-west-jeju-course",
  "jeju-stone-park-rainy-day-course",
  "soesokkak-hahyo-walk-guide",
  "pyoseon-beach-family-guide",
  "dongmun-market-evening-food-route",
  "geum-oreum-sunset-walk-guide",
  "saebyeol-oreum-silvergrass-guide",
  "camellia-hill-season-guide",
  "aqua-planet-jeju-family-guide",
  "lee-jung-seop-street-walk-guide",
  "gimnyeong-maze-park-family-guide",
  "jeju-43-peace-park-guide",
  "hangmong-historic-site-guide",
  "jeju-herb-dongsan-night-guide",
  "nohyung-supermarket-indoor-guide",
  "arte-museum-jeju-indoor-guide",
  "suwolbong-geotrail-guide",
  "songaksan-dulle-gil-guide",
  "bangju-church-architecture-guide",
  "hallasan-arboretum-walk-guide"
]);
const articleImageKeywordOverrides = new Map([
  ["udo-day-trip", "우도"],
  ["seogwipo-olle-market-food", "서귀포 매일올레시장"],
  ["hallasan-beginner-trail", "한라산"],
  ["jeju-stone-park-rainy-day-course", "제주돌문화공원"],
  ["dongmun-market-evening-food-route", "동문시장"],
  ["lee-jung-seop-street-walk-guide", "이중섭거리"],
  ["jeju-43-peace-park-guide", "제주4.3평화공원"],
  ["nohyung-supermarket-indoor-guide", "노형수퍼마켙"],
  ["hallasan-arboretum-walk-guide", "한라수목원"]
]);

let activeCategory = categories[0] || "전체";
const filterCategories = categories.filter((category) => category !== categories[0]);
let officialRequestId = 0;
let articleThumbnailObserver = null;
const observedArticleThumbs = new WeakSet();

const todayKeywords = [
  { label: "제주 가볼만한 곳", category: "가볼 만한 곳" },
  { label: "제주 해변", category: "해변" },
  { label: "제주 맛집", category: "맛집" },
  { label: "카페 투어", category: "카페" },
  { label: "오름 산책", category: "오름" },
  { label: "계절 코스", category: "계절 코스" },
  { label: "숙소 위치", category: "숙소" },
  { label: "비 오는 날", category: "계절 코스" }
];

const faqItems = [
  {
    question: "제주여행뉴스에서는 무엇을 먼저 보면 좋나요?",
    answer: "추천 기사를 먼저 보고, 관심 있는 카테고리를 고르면 됩니다. 처음 방문이라면 가볼 만한 곳, 해변, 계절 코스 순서로 보는 편이 쉽습니다."
  },
  {
    question: "관광지 정보는 어디에서 확인하나요?",
    answer: "뉴스 피드 안의 장소 카드를 열면 주소, 분류, 위치 확인 링크를 볼 수 있습니다. 운영시간과 요금은 방문 직전 공식 안내를 다시 확인하세요."
  },
  {
    question: "상품이나 광고 영역이 있나요?",
    answer: "제주 여행 정보를 해치지 않는 범위에서 애드센스 광고와 마이리얼트립 제휴 상품 영역을 함께 운영합니다. 광고성 링크는 여행 준비 흐름에 맞는 위치에만 배치합니다."
  }
];

const footerGroups = [
  { title: "제주 여행", links: ["가볼 만한 곳", "해변", "오름", "계절 코스"] },
  { title: "여행 준비", links: ["방문 전 체크", "숙소 위치", "비 오는 날", "가족 여행"] },
  { title: "지역", links: ["제주시", "서귀포", "성산", "애월"] },
  { title: "언어", links: ["한국어", "English", "日本語", "中文"] }
];

const visitCheckItems = [
  {
    title: "운영시간",
    text: "폭포, 박물관, 유료 관광지는 입장 마감 시간이 다를 수 있습니다."
  },
  {
    title: "날씨",
    text: "오름과 해변은 바람, 안개, 우천 예보에 따라 체감 난이도가 달라집니다."
  },
  {
    title: "주차",
    text: "성수기에는 목적지 바로 앞보다 주변 공영 주차장과 도보 이동을 함께 보세요."
  },
  {
    title: "동선",
    text: "동쪽, 서쪽, 서귀포권을 하루에 모두 묶기보다 한 권역 중심으로 잡는 편이 편합니다."
  }
];

const myrealtripFallbackItems = [
  {
    title: "제주 동쪽 투어",
    category: "투어",
    priceText: "마이리얼트립 연결 대기",
    image: "https://tong.visitkorea.or.kr/cms/resource/75/3400775_image2_1.jpg"
  },
  {
    title: "제주 해변 액티비티",
    category: "티켓",
    priceText: "마이리얼트립 연결 대기",
    image: "https://tong.visitkorea.or.kr/cms/resource/81/3037781_image2_1.jpg"
  },
  {
    title: "제주 숙소",
    category: "숙소",
    priceText: "마이리얼트립 연결 대기",
    image: "https://tong.visitkorea.or.kr/cms/resource/36/3421436_image2_1.jpg"
  }
];

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function articleUrl(article) {
  return `${detailPath}?slug=${encodeURIComponent(article.slug)}`;
}

function officialUrl(place) {
  const query = new URLSearchParams({
    contentId: place.contentId,
    contentTypeId: place.contentTypeId || "",
    title: place.title || "",
    category: place.category || "",
    address: place.address || place.region || "",
    image: place.image || "",
    mapx: place.mapx || "",
    mapy: place.mapy || ""
  });
  return `${detailPath}?${query.toString()}`;
}

function spotUrl(spot, currentSlug = "") {
  const normalizedSpot = normalizeText(spot);
  const match = articles.find((article) => {
    if (article.slug === currentSlug) return false;
    const title = normalizeText(article.title);
    const region = normalizeText(article.region);
    const course = normalizeText((article.course || []).join(" "));
    return title.includes(normalizedSpot) || normalizedSpot.includes(title) || region.includes(normalizedSpot) || course.includes(normalizedSpot);
  });

  if (match) return articleUrl(match);
  return `${detailPath}?spot=${encodeURIComponent(spot)}`;
}

function mapUrl(place) {
  if (!place.mapx || !place.mapy) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.mapy},${place.mapx}`)}`;
}

function mapSearchUrl(value) {
  const keyword = String(value || "").trim();
  if (!keyword) return "";
  return `https://map.naver.com/p/search/${encodeURIComponent(keyword)}`;
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/[·ㆍ\-_/]/g, "")
    .toLowerCase();
}

function normalizeImageUrl(value) {
  const url = String(value || "").trim();
  if (!url) return fallbackImage;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("http://")) return url.replace(/^http:\/\//i, "https://");
  return url;
}

function safeExternalUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  const normalized = url.startsWith("//") ? `https:${url}` : url;
  if (!/^https:\/\//i.test(normalized)) return "";
  try {
    return new URL(normalized).href;
  } catch (error) {
    return "";
  }
}

function imageTag(src, alt, className = "", attrs = "") {
  const classAttribute = className ? ` class="${escapeHtml(className)}"` : "";
  const extraAttributes = attrs ? ` ${attrs}` : "";
  return `<img${classAttribute}${extraAttributes} src="${escapeHtml(normalizeImageUrl(src))}" alt="${escapeHtml(alt)}" loading="lazy">`;
}

function bindImageFallbacks() {
  document.addEventListener("error", (event) => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset.fallbackApplied) return;
    image.dataset.fallbackApplied = "true";
    image.src = fallbackImage;
  }, true);
}

function normalizeProduct(product = {}) {
  return {
    title: product.title || product.name || product.productName || "제주 여행 상품",
    category: product.category || product.type || product.productType || "여행 상품",
    priceText: product.priceText || product.displayPrice || product.price || product.salePrice || "가격 확인",
    image: product.image || product.imageUrl || product.thumbnail || product.thumbnailUrl || product.mainImage || "",
    url: safeExternalUrl(product.url || product.link || product.deepLink || product.webUrl)
  };
}

function cleanTravelKeyword(value) {
  return String(value || "")
    .replace(/[·•]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s*(여행\s*)?(코스|가이드|정보|체크|방문 전 체크)$/g, "")
    .trim();
}

function hasAnyKeyword(value, keywords) {
  const text = String(value || "");
  return keywords.some((keyword) => text.includes(keyword));
}

function compactKeywordParts(parts) {
  const unique = [];
  parts
    .map(cleanTravelKeyword)
    .filter(Boolean)
    .forEach((part) => {
      if (!unique.some((item) => normalizeText(item) === normalizeText(part))) unique.push(part);
    });
  return unique.join(" ").replace(/\s+/g, " ").trim();
}

function myrealtripContextFromArticle(article = {}, categoryOverride = "") {
  const category = cleanTravelKeyword(categoryOverride || article.category);
  const spot = cleanTravelKeyword(articleOfficialKeyword(article) || article.title);
  const region = cleanTravelKeyword(article.region).replace(/^제주\s*/, "제주 ");
  const title = cleanTravelKeyword(article.title);
  const base = spot || title || region || "제주";
  let keyword = compactKeywordParts(["제주", base]);
  let label = base || "제주";
  let type = "tour";

  if (hasAnyKeyword(category, ["숙소", "호텔", "펜션"])) {
    keyword = compactKeywordParts([region || "제주", "숙소"]);
    label = cleanTravelKeyword(region || "제주 숙소");
    type = "hotel";
  } else if (hasAnyKeyword(category, ["맛집", "먹거리"])) {
    keyword = compactKeywordParts(["제주", base, "맛집"]);
  } else if (hasAnyKeyword(category, ["카페"])) {
    keyword = compactKeywordParts(["제주", base, "카페"]);
  } else if (hasAnyKeyword(category, ["해변", "바다"])) {
    keyword = compactKeywordParts(["제주", base, "해변"]);
  } else if (hasAnyKeyword(category, ["오름", "숲", "산책"])) {
    keyword = compactKeywordParts(["제주", base, "트레킹"]);
  } else if (hasAnyKeyword(category, ["계절", "코스"])) {
    keyword = compactKeywordParts(["제주", base, "투어"]);
  } else {
    keyword = compactKeywordParts(["제주", base, "투어"]);
  }

  return {
    keyword: keyword || "제주 투어",
    label: label || keyword || "제주",
    type,
    category
  };
}

function myrealtripContextFromHome() {
  const category = activeCategory === categories[0] ? "" : activeCategory;
  const seed = visibleArticles()[0] || articles[0] || {};
  return myrealtripContextFromArticle(seed, category);
}

function contextualMyRealTripFallbackItems(context = {}) {
  const label = cleanTravelKeyword(context.label || context.keyword || "제주");
  const titles = context.type === "hotel"
    ? [`${label} 숙소`, `${label} 호텔`, `${label} 근처 여행 상품`]
    : [`${label} 투어·티켓`, `${label} 액티비티`, `${label} 숙소`];

  return myrealtripFallbackItems.map((item, index) => ({
    ...item,
    title: titles[index] || item.title,
    category: "마이리얼트립",
    priceText: "제휴 상품 확인"
  }));
}

function contextualProduct(product, context = {}, index = 0) {
  const item = normalizeProduct(product);
  const label = cleanTravelKeyword(context.label || context.keyword);
  const category = String(item.category || "");
  const isAffiliateFallback = category.includes("마이리얼트립") || category.includes("MyRealTrip");
  if (!label || !isAffiliateFallback || normalizeText(item.title).includes(normalizeText(label))) return item;

  const titles = context.type === "hotel"
    ? [`${label} 숙소`, `${label} 호텔`, `${label} 주변 여행 상품`]
    : [`${label} 투어·티켓`, `${label} 액티비티`, `${label} 숙소`];
  return { ...item, title: titles[index] || item.title };
}

function normalizeAirport(item = {}) {
  const code = String(item.code || item.iataCode || item.airportCode || item.id || "").toUpperCase();
  const city = item.city || item.cityName || item.regionName || "";
  const name = item.name || item.airportName || item.displayName || "";
  const label = [city, name].filter(Boolean).join(" ") || item.label || code;
  return { code, label };
}

function normalizeRegion(item = {}) {
  const regionId = String(item.regionId || item.id || item.value || item.code || "");
  const country = item.country || item.countryName || "";
  const name = item.name || item.regionName || item.displayName || item.title || "";
  const label = [country, name].filter(Boolean).join(" ") || item.label || name || regionId;
  return { regionId, label };
}

function normalizeTnaCategory(item = {}) {
  const value = String(item.value || item.category || item.id || item.code || "");
  const label = String(item.label || item.name || item.title || item.displayName || value || "카테고리");
  return { value, label };
}

function normalizeTnaProduct(product = {}) {
  return {
    title: product.title || product.name || product.productName || product.displayName || "투어·티켓 상품",
    category: product.categoryName || product.category || product.type || "투어·티켓",
    region: product.region || product.regionName || product.cityName || product.location || "",
    priceText: product.priceText || product.displayPrice || product.priceLabel || product.price || product.salePrice || "가격 확인",
    image: product.image || product.imageUrl || product.thumbnail || product.thumbnailUrl || product.mainImage || "",
    url: safeExternalUrl(product.url || product.link || product.deepLink || product.webUrl)
  };
}

function airportCodeFromInput(value, fallback = "") {
  const text = String(value || "");
  const match = text.match(/\(([A-Z]{3})\)/i) || text.match(/\b([A-Z]{3})\b/i);
  if (match) return match[1].toUpperCase();
  if (text.includes("제주")) return "CJU";
  if (text.includes("김포")) return "GMP";
  if (text.includes("인천")) return "ICN";
  if (text.includes("서울")) return "SEL";
  return fallback;
}

function regionIdFromInput(value) {
  const text = String(value || "");
  const match = text.match(/\[([^\]]+)\]$/);
  return match ? match[1] : "";
}

function flightMonthValue() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

function dateValue(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function priceText(value, currency = "KRW") {
  const numeric = Number(String(value || "").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return String(value || "가격 확인");
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(numeric);
}

function visibleArticles() {
  return activeCategory === categories[0] ? articles : articles.filter((article) => article.category === activeCategory);
}

function metaLine(parts) {
  return parts
    .filter(Boolean)
    .map((part) => `<span>${escapeHtml(part)}</span>`)
    .join("");
}

function thumbnailForArticle(article, useOfficialImage = false) {
  return useOfficialImage ? articleThumbnailCache.get(article.slug) || article.image : article.image;
}

function articleImageTag(article, className = "") {
  return imageTag(thumbnailForArticle(article, true), article.title, className, `data-article-thumb="${escapeHtml(article.slug)}"`);
}

function recommendedCard(article, isLead = false) {
  return `
    <article class="recommend-card${isLead ? " is-lead" : ""}">
      <a href="${articleUrl(article)}">
        ${articleImageTag(article)}
        <span class="recommend-content">
          <span class="recommend-label">${escapeHtml(article.category)}</span>
          <strong>${escapeHtml(article.title)}</strong>
          ${isLead ? `<p>${escapeHtml(article.summary)}</p>` : ""}
          <em>${escapeHtml([article.date, article.region].filter(Boolean).join(" · "))}</em>
        </span>
      </a>
    </article>
  `;
}

function sectionArticleCard(article) {
  return `
    <article class="section-card">
      <a href="${articleUrl(article)}">
        <span class="section-thumb">${articleImageTag(article)}</span>
        <span class="section-card-label">${escapeHtml(article.category)}</span>
        <h3>${escapeHtml(article.title)}</h3>
        <p>${escapeHtml(article.summary)}</p>
      </a>
    </article>
  `;
}

function leadArticleCard(article) {
  return `
    <a class="news-lead" href="${articleUrl(article)}">
      <span class="lead-thumb">${articleImageTag(article)}</span>
      <strong>${escapeHtml(article.title)}</strong>
      <span>${metaLine([article.category, article.region, article.date])}</span>
    </a>
  `;
}

function pickArticleCard(article) {
  return `
    <a class="pick-card" href="${articleUrl(article)}">
      <span class="pick-thumb">${articleImageTag(article)}</span>
      <strong>${escapeHtml(article.title)}</strong>
    </a>
  `;
}

function rowArticleCard(article) {
  return `
    <a class="news-row" href="${articleUrl(article)}">
      <span class="row-thumb">${articleImageTag(article)}</span>
      <span>
        <strong>${escapeHtml(article.title)}</strong>
        <em>${escapeHtml([article.category, article.region, article.date].filter(Boolean).join(" · "))}</em>
      </span>
    </a>
  `;
}

function newsCard(article) {
  return `
    <article class="news-feed-card">
      <a class="news-thumb" href="${articleUrl(article)}">
        ${articleImageTag(article)}
      </a>
      <div class="news-copy">
        <div class="meta">${metaLine([article.category, article.region])}</div>
        <h2><a href="${articleUrl(article)}">${escapeHtml(article.title)}</a></h2>
        <p>${escapeHtml(article.summary)}</p>
      </div>
    </article>
  `;
}

function uniqueByImage(items) {
  const seen = new Set();
  return items.filter((item) => {
    const image = normalizeImageUrl(item.image);
    if (seen.has(image)) return false;
    seen.add(image);
    return true;
  });
}

function galleryCard(article) {
  return `
    <a class="gallery-card" href="${articleUrl(article)}">
      ${articleImageTag(article)}
      <span>${escapeHtml(article.category)}</span>
      <strong>${escapeHtml(article.title)}</strong>
    </a>
  `;
}

function visualGalleryCard(article) {
  return `
    <a class="visual-gallery-card" href="${articleUrl(article)}" aria-label="${escapeHtml(article.title)}">
      ${articleImageTag(article)}
    </a>
  `;
}

function renderVisualGallery() {
  const gallery = $("#visualGallery");
  if (!gallery) return;
  const items = uniqueByImage(visibleArticles().slice(1)).slice(0, 8);
  const title = activeCategory === categories[0] ? "사진으로 보는 제주" : `${activeCategory} 사진`;
  gallery.innerHTML = `
    <div class="visual-gallery-head">
      <h2>${escapeHtml(title)}</h2>
      <span>${items.length}장</span>
    </div>
    <div class="visual-gallery-grid">${items.map(visualGalleryCard).join("")}</div>
  `;
}

function detailGalleryArticles(article, limit = 6) {
  const nearby = (article.nearbySpots || []).map(normalizeText).filter(Boolean);
  const regionHead = normalizeText(String(article.region || "").split("·")[0]);
  const scored = articles
    .filter((item) => item.slug !== article.slug)
    .map((item) => {
      const target = normalizeText([item.title, item.region, ...(item.course || [])].join(" "));
      const sameCategory = item.category === article.category ? 3 : 0;
      const sameRegion = regionHead && normalizeText(item.region).includes(regionHead) ? 2 : 0;
      const nearbyMatch = nearby.some((spot) => target.includes(spot) || spot.includes(normalizeText(item.title))) ? 5 : 0;
      return { item, score: sameCategory + sameRegion + nearbyMatch };
    })
    .sort((a, b) => b.score - a.score);
  const preferred = scored.filter(({ score }) => score > 0).map(({ item }) => item);
  const fallback = articles.filter((item) => item.slug !== article.slug);
  return uniqueByImage([...preferred, ...fallback]).slice(0, limit);
}

function renderArticleGallery(article) {
  const items = detailGalleryArticles(article);
  if (!items.length) return "";
  return `
    <section class="article-gallery-section">
      <h2>함께 볼 만한 사진</h2>
      <div class="article-gallery-grid">${items.map(galleryCard).join("")}</div>
    </section>
  `;
}

function placeCard(place) {
  return `
    <article class="news-feed-card place-feed-card">
      <a class="news-thumb" href="${officialUrl(place)}">
        ${imageTag(place.image, place.title)}
      </a>
      <div class="news-copy">
        <div class="meta">${metaLine(["공식 장소정보", place.category])}</div>
        <h2><a href="${officialUrl(place)}">${escapeHtml(place.title)}</a></h2>
        <p>${escapeHtml(place.address || place.region || "제주")}</p>
        <dl class="mini-info">
          <div><dt>분류</dt><dd>${escapeHtml(place.category)}</dd></div>
          <div><dt>연락처</dt><dd>${escapeHtml(place.tel || "정보 없음")}</dd></div>
        </dl>
      </div>
    </article>
  `;
}

function renderTabs() {
  const tabs = $("#topCategoryTabs");
  if (!tabs) return;
  tabs.innerHTML = filterCategories
    .map((category) => {
      const count = articles.filter((article) => article.category === category).length;
      return `
      <button type="button" class="${category === activeCategory ? "is-active" : ""}" data-category="${escapeHtml(category)}">
        <span>${escapeHtml(category)}</span>
        <b>${count}</b>
      </button>
    `;
    })
    .join("");
}

function renderPrimaryNav() {
  const nav = $("#primaryNav");
  if (!nav) return;
  const links = filterCategories.map((category) => ({ category, active: category === activeCategory }));
  nav.innerHTML = links
    .map((item) => `
      <a class="${item.active ? "is-active" : ""}" href="#july" data-category="${escapeHtml(item.category)}">
        ${escapeHtml(item.category)}
      </a>
    `)
    .join("");
}

function renderTodayKeywords() {
  if ($(".today-keyword-bar")) return;
  const header = $(".site-header");
  if (!header) return;
  const bar = document.createElement("nav");
  bar.className = "today-keyword-bar";
  bar.setAttribute("aria-label", "오늘의 여행 키워드");
  bar.innerHTML = `
    <div class="today-keyword-inner">
      <strong>JEJU NOW</strong>
      <div>
        ${todayKeywords.map((item) => `
          <a href="#july" data-category="${escapeHtml(item.category)}">${escapeHtml(item.label)}</a>
        `).join("")}
      </div>
    </div>
  `;
  header.after(bar);
}

function compactTravelSearchSections() {
  if ($("#travelTools")) return;

  const configs = [
    {
      id: "flights",
      className: "flight-section",
      eyebrow: "Air",
      title: "항공권",
      description: "일정이 정해졌을 때 서울-제주 최저가 흐름을 확인하세요.",
      button: "열기"
    },
    {
      id: "stays",
      className: "stay-section",
      eyebrow: "Stay",
      title: "숙소",
      description: "지역과 날짜를 넣어 숙소 후보를 가볍게 비교하세요.",
      button: "열기"
    },
    {
      id: "tourTickets",
      className: "tna-section",
      eyebrow: "Tour",
      title: "투어·티켓",
      description: "액티비티와 입장권은 여행 코스가 잡힌 뒤 확인하세요.",
      button: "열기"
    }
  ];

  const items = configs
    .map((config) => ({ config, section: document.getElementById(config.id) }))
    .filter(({ section }) => section);
  if (!items.length) return;

  const wrapper = document.createElement("section");
  wrapper.className = "travel-tools-section";
  wrapper.id = "travelTools";
  wrapper.setAttribute("aria-labelledby", "travelToolsTitle");
  wrapper.innerHTML = `
    <div class="section-heading">
      <p class="eyebrow">Travel Desk</p>
      <h2 id="travelToolsTitle">여행 준비</h2>
      <p>뉴스와 장소 정보를 먼저 보고, 필요한 예약 정보만 아래에서 펼쳐 확인하세요.</p>
    </div>
    <div class="travel-tool-list"></div>
  `;
  const list = wrapper.querySelector(".travel-tool-list");

  items.forEach(({ config, section }) => {
    const heading = section.querySelector(".section-heading");
    const form = section.querySelector("form");
    const result = section.querySelector(".flight-result, .stay-result, .tna-result");
    const panel = document.createElement("div");
    const panelId = `${config.id}Panel`;
    panel.className = "travel-tool-panel";
    panel.id = panelId;
    panel.hidden = true;

    if (form) panel.append(form);
    if (result) panel.append(result);

    section.classList.remove(config.className);
    section.classList.add("travel-tool-card");
    section.removeAttribute("aria-labelledby");
    section.setAttribute("aria-label", config.title);
    section.innerHTML = "";
    const summaryNode = heading || document.createElement("div");
    section.append(summaryNode);
    section.append(panel);

    const summary = section.querySelector(".section-heading") || summaryNode;
    summary.className = "travel-tool-summary";
    summary.innerHTML = `
      <span>
        <em>${escapeHtml(config.eyebrow)}</em>
        <strong>${escapeHtml(config.title)}</strong>
        <small>${escapeHtml(config.description)}</small>
      </span>
      <button class="tool-toggle" type="button" aria-expanded="false" aria-controls="${panelId}">${escapeHtml(config.button)}</button>
    `;

    summary.querySelector(".tool-toggle").addEventListener("click", () => {
      const isOpen = section.classList.toggle("is-open");
      panel.hidden = !isOpen;
      const toggle = summary.querySelector(".tool-toggle");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.textContent = isOpen ? "닫기" : config.button;
    });

    list.append(section);
  });

  const main = document.querySelector("main");
  const faq = $("#info");
  const visitCheck = $("#visitCheck");
  const categoryNews = $("#categoryNews");
  const myrealtrip = $("#myrealtrip");

  if (main && faq) {
    if (categoryNews) main.insertBefore(categoryNews, faq);
    if (visitCheck) main.insertBefore(visitCheck, faq);
    main.insertBefore(wrapper, faq);
    if (myrealtrip) main.insertBefore(myrealtrip, faq);
  } else {
    ($("#july") || main)?.after(wrapper);
  }
}

function renderFeed(places = null) {
  const feed = $("#newsFeedList");
  const status = $("#julyStatus") || $("#feedStatus");
  if (!feed) return;

  const localItems = activeCategory === categories[0]
    ? articles.filter((article) => article.category === "가볼 만한 곳").slice(0, 9)
    : visibleArticles();
  const feedHtml = localItems.map(sectionArticleCard).join("");

  feed.innerHTML = feedHtml || `<p class="empty-state">현재 선택한 카테고리의 제주 여행 정보가 없습니다.</p>`;
  const feedCount = $("#feedCount");
  const feedTitle = $("#feedListTitle");
  if (feedCount) feedCount.textContent = "더보기 +";
  if (feedTitle) feedTitle.textContent = activeCategory === categories[0] ? "가볼만한 곳" : activeCategory;
  if (status) {
    status.hidden = true;
    status.textContent = "";
  }
  hydrateArticleThumbnails();
}

function renderRecommended() {
  const row = $("#recommendedArticles");
  if (!row) return;
  const picks = visibleArticles().slice(0, 5);
  row.innerHTML = picks
    .map((article, index) => recommendedCard(article, index === 0))
    .join("");
  hydrateArticleThumbnails();
}

function renderCategoryView(places = []) {
  renderRecommended();
  renderVisualGallery();
  renderFeed(places);
  loadContextualMyRealTrip(myrealtripContextFromHome());
}

function shouldUseOfficialImage(article) {
  return officialImageSlugs.has(article.slug);
}

function articleImageKeywords(article) {
  const keyword = articleOfficialKeyword(article);
  return [
    keyword,
    article.title
  ]
    .map((keyword) => String(keyword || "").trim())
    .filter(Boolean)
    .filter((keyword, index, list) => list.findIndex((item) => normalizeText(item) === normalizeText(keyword)) === index);
}

function matchArticleImagePlace(article, places = []) {
  if (!shouldUseOfficialImage(article)) return null;
  const keywords = articleImageKeywords(article).map(normalizeText).filter(Boolean);
  const category = normalizeText(article.category);
  const scored = places
    .filter((place) => place?.image)
    .map((place) => {
      const title = normalizeText(place.title);
      const placeCategory = normalizeText(place.category);
      if (!title) return { place, score: 0 };
      if (category !== "맛집" && placeCategory.includes("음식점")) return { place, score: 0 };
      const score = keywords.reduce((best, keyword) => {
        if (!keyword || !title.includes(keyword)) return best;
        if (title === keyword) return Math.max(best, 100);
        if (title.startsWith(keyword)) return Math.max(best, 84);
        return Math.max(best, 70);
      }, 0) + (placeCategory.includes("관광지") ? 8 : 0);
      return { place, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.place || null;
}

function applyOfficialImagesToArticles(places = []) {
  let didUpdate = false;
  articles.forEach((article) => {
    if (!shouldUseOfficialImage(article)) return;
    if (articleThumbnailCache.has(article.slug)) return;
    const match = matchArticleImagePlace(article, places);
    if (!match?.image) return;
    articleThumbnailCache.set(article.slug, match.image);
    didUpdate = true;
  });
  return didUpdate;
}

function updateArticleThumbnailElements(article, image) {
  document
    .querySelectorAll(`img[data-article-thumb="${article.slug}"]`)
    .forEach((img) => {
      img.src = normalizeImageUrl(image);
    });
}

async function fetchArticleThumbnail(article) {
  if (!shouldUseOfficialImage(article)) return "";
  if (articleThumbnailCache.has(article.slug)) return articleThumbnailCache.get(article.slug);
  if (articleThumbnailRequests.has(article.slug)) return articleThumbnailRequests.get(article.slug);

  const keyword = articleOfficialKeyword(article);
  const request = (async () => {
    try {
      const query = new URLSearchParams({ keyword, category: "전체", v: tourismDataVersion });
      const response = await fetch(`/api/jeju?${query.toString()}`, { headers: { accept: "application/json" } });
      const payload = await response.json();
      const match = response.ok && payload.ok ? matchArticleImagePlace(article, payload.items || []) : null;
      if (!match?.image) return "";
      articleThumbnailCache.set(article.slug, match.image);
      updateArticleThumbnailElements(article, match.image);
      return match.image;
    } catch (error) {
      return "";
    }
  })();

  articleThumbnailRequests.set(article.slug, request);
  return request;
}

function hydrateArticleThumbnails() {
  const images = [...document.querySelectorAll("img[data-article-thumb]")];
  if (!images.length) return;

  const loadImage = (img) => {
    const article = articles.find((item) => item.slug === img.dataset.articleThumb);
    if (!article) return;
    const cached = articleThumbnailCache.get(article.slug);
    if (cached) {
      img.src = normalizeImageUrl(cached);
      return;
    }
    fetchArticleThumbnail(article);
  };

  if (!("IntersectionObserver" in window)) {
    images.forEach(loadImage);
    return;
  }

  if (!articleThumbnailObserver) {
    articleThumbnailObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        articleThumbnailObserver.unobserve(entry.target);
        loadImage(entry.target);
      });
    }, { rootMargin: "360px 0px" });
  }

  images.forEach((img) => {
    if (observedArticleThumbs.has(img)) return;
    observedArticleThumbs.add(img);
    articleThumbnailObserver.observe(img);
  });
}

function renderCategoryNews() {
  const wrapper = $("#categoryNewsSections");
  if (!wrapper) return;
  const sections = [
    {
      id: "latest-news",
      eyebrow: "LATEST",
      title: "최신 여행뉴스",
      items: articles.slice(0, 6)
    },
    ...categories
      .filter((category) => category !== categories[0] && category !== "가볼 만한 곳")
      .map((category) => ({
        id: `category-${encodeURIComponent(category)}`,
        eyebrow: "TRAVEL",
        title: category,
        items: articles.filter((article) => article.category === category).slice(0, 6)
      }))
  ];

  wrapper.innerHTML = sections
    .map((section) => {
      const items = section.items || [];
      if (!items.length) return "";
      return `
        <section class="news-section category-news-section" id="${section.id}">
          <div class="portal-section-head">
            <span>${escapeHtml(section.eyebrow)}</span>
            <h2>${escapeHtml(section.title)}</h2>
            <a href="#july" data-category="${escapeHtml(section.title)}">더보기 +</a>
          </div>
          <div class="section-card-grid">${items.map(sectionArticleCard).join("")}</div>
        </section>
      `;
    })
    .join("");
  hydrateArticleThumbnails();
}

function renderFaq() {
  const list = $("#faqList");
  if (!list) return;
  list.innerHTML = faqItems
    .map((item) => `
      <details class="faq-item">
        <summary>${escapeHtml(item.question)}</summary>
        <p>${escapeHtml(item.answer)}</p>
      </details>
    `)
    .join("");
}

function renderVisitCheck() {
  const grid = $("#visitCheckGrid");
  if (!grid) return;
  grid.innerHTML = visitCheckItems
    .map((item) => `
      <article class="visit-check-card">
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.text)}</p>
      </article>
    `)
    .join("");
}

function myrealtripCard(product, context = {}, index = 0) {
  const item = contextualProduct(product, context, index);
  const content = `
    ${imageTag(item.image, item.title)}
    <span>
      <em>${escapeHtml(item.category)}</em>
      <strong>${escapeHtml(item.title)}</strong>
      <small>${escapeHtml(String(item.priceText))}</small>
    </span>
  `;

  if (item.url) {
    return `
      <article class="mrt-card">
        <a href="${escapeHtml(item.url)}" target="_blank" rel="sponsored nofollow noopener noreferrer">${content}</a>
      </article>
    `;
  }

  return `<article class="mrt-card is-disabled">${content}</article>`;
}

function renderMyRealTrip(items = [], mode = "loading", context = {}, gridSelector = "#myrealtripGrid") {
  const grid = $(gridSelector);
  if (!grid) return;
  const label = cleanTravelKeyword(context.label || context.keyword || "제주");
  const heading = grid.closest(".mrt-section")?.querySelector(".section-heading h2");
  if (heading && gridSelector === "#myrealtripGrid") {
    heading.textContent = `${label} 여행 상품·제휴 추천`;
  }

  if (mode === "ready" && items.length) {
    grid.innerHTML = items.slice(0, 6).map((item, index) => myrealtripCard(item, context, index)).join("");
    return;
  }

  const message = mode === "not-configured"
    ? "마이리얼트립 광고 연결 정보가 아직 설정되지 않았습니다. API 키나 제휴 URL이 연결되면 이 영역에 실제 상품 광고가 표시됩니다."
    : `${label} 여행 상품 광고 정보를 확인하고 있습니다.`;

  grid.innerHTML = `
    <div class="mrt-status">
      <strong>${escapeHtml(message)}</strong>
      <p>${escapeHtml(label)} 일정과 가까운 투어, 숙소, 액티비티 중심으로 노출합니다.</p>
    </div>
    ${contextualMyRealTripFallbackItems(context).map((item, index) => myrealtripCard(item, context, index)).join("")}
  `;
}

async function loadMyRealTrip(context = myrealtripContextFromHome(), gridSelector = "#myrealtripGrid") {
  return loadContextualMyRealTrip(context, gridSelector);
}

async function loadContextualMyRealTrip(context = myrealtripContextFromHome(), gridSelector = "#myrealtripGrid") {
  const grid = $(gridSelector);
  if (!grid) return;

  const keyword = cleanTravelKeyword(context.keyword || "제주");
  const type = context.type || "tour";
  const requestKey = `${keyword}|${type}`;
  if (myrealtripRequestKeys.get(gridSelector) === requestKey) return;
  myrealtripRequestKeys.set(gridSelector, requestKey);
  renderMyRealTrip([], "loading", context, gridSelector);

  try {
    const query = new URLSearchParams({
      keyword,
      type,
      limit: "6",
      v: tourismDataVersion
    });
    const response = await fetch(`/api/myrealtrip?${query.toString()}`, {
      headers: { accept: "application/json" }
    });
    const payload = await response.json();
    if (!response.ok || payload?.ok === false) {
      renderMyRealTrip([], payload?.configured === false ? "not-configured" : "loading", context, gridSelector);
      return;
    }
    renderMyRealTrip(payload.items || [], "ready", context, gridSelector);
  } catch (error) {
    renderMyRealTrip([], "not-configured", context, gridSelector);
  }
}

function renderFlightResult(items = [], mode = "idle", message = "") {
  const result = $("#flightResult");
  if (!result) return;

  if (mode === "ready" && items.length) {
    result.innerHTML = `
      <div class="flight-calendar-list">
        ${items.slice(0, 8).map((item) => {
          const url = safeExternalUrl(item.url);
          const tag = url ? "a" : "article";
          const linkAttrs = url ? ` href="${escapeHtml(url)}" target="_blank" rel="sponsored nofollow noopener noreferrer"` : "";
          return `
            <${tag} class="flight-price-card"${linkAttrs}>
              <strong>${escapeHtml(item.date || "날짜 확인")}</strong>
              <span>${escapeHtml(priceText(item.price, item.currency || "KRW"))}</span>
              <small>${escapeHtml(item.airline || "최저가 캘린더")}</small>
            </${tag}>
          `;
        }).join("")}
      </div>
    `;
    return;
  }

  const fallbackMessage = mode === "not-configured"
    ? "MYREALTRIP_API_BASE 또는 항공권 엔드포인트 URL과 MYREALTRIP_API_KEY가 설정되면 공항 자동완성과 최저가 캘린더가 동작합니다."
    : message || "출발지와 목적지를 입력한 뒤 최저가를 조회하세요.";
  result.innerHTML = `<div class="flight-status">${escapeHtml(fallbackMessage)}</div>`;
}

async function postFlight(action, body) {
  const response = await fetch(`/api/myrealtrip-flight?action=${encodeURIComponent(action)}&v=${tourismDataVersion}`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json();
  if (!response.ok || payload?.ok === false) {
    const error = new Error(payload?.message || "항공권 정보를 불러오지 못했습니다.");
    error.payload = payload;
    throw error;
  }
  return payload;
}

async function loadAirportOptions(keyword, datalist) {
  const query = String(keyword || "").trim();
  if (!query || !datalist) return;
  if (airportCache.has(query)) {
    datalist.innerHTML = airportCache.get(query);
    return;
  }

  try {
    const payload = await postFlight("airport-autocomplete", { keyword: query, query });
    const html = (payload.items || [])
      .map(normalizeAirport)
      .filter((item) => item.code || item.label)
      .slice(0, 8)
      .map((item) => `<option value="${escapeHtml(`${item.label} (${item.code})`)}"></option>`)
      .join("");
    airportCache.set(query, html);
    datalist.innerHTML = html;
  } catch (error) {
    if (error.payload?.configured === false) renderFlightResult([], "not-configured");
  }
}

function bindFlightSearch() {
  const form = $("#flightSearchForm");
  if (!form) return;

  const originInput = $("#flightOrigin");
  const destinationInput = $("#flightDestination");
  const monthInput = $("#flightMonth");
  const originOptions = $("#flightOriginOptions");
  const destinationOptions = $("#flightDestinationOptions");
  if (monthInput && !monthInput.value) monthInput.value = flightMonthValue();

  const bindAutocomplete = (input, datalist) => {
    if (!input || !datalist) return;
    input.addEventListener("input", () => {
      if (input.value.trim().length >= 2) loadAirportOptions(input.value, datalist);
    });
    input.addEventListener("focus", () => {
      if (input.value.trim().length >= 2) loadAirportOptions(input.value, datalist);
    });
  };

  bindAutocomplete(originInput, originOptions);
  bindAutocomplete(destinationInput, destinationOptions);
  renderFlightResult();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const originCode = airportCodeFromInput(originInput?.value, "SEL");
    const destinationCode = airportCodeFromInput(destinationInput?.value, "CJU");
    const month = monthInput?.value || flightMonthValue();
    renderFlightResult([], "loading", "항공권 최저가 캘린더를 조회하고 있습니다.");

    try {
      const payload = await postFlight("lowest-price-calendar", {
        originAirportCode: originCode,
        destinationAirportCode: destinationCode,
        departureAirportCode: originCode,
        arrivalAirportCode: destinationCode,
        origin: originCode,
        destination: destinationCode,
        departure: originCode,
        arrival: destinationCode,
        yearMonth: month,
        month
      });
      renderFlightResult(payload.items || [], "ready", "표시할 최저가 데이터가 없습니다.");
    } catch (error) {
      renderFlightResult([], error.payload?.configured === false ? "not-configured" : "idle", error.message);
    }
  });
}

function renderStayResult(items = [], mode = "idle", message = "") {
  const result = $("#stayResult");
  if (!result) return;

  if (mode === "ready" && items.length) {
    result.innerHTML = `
      <div class="stay-card-list">
        ${items.slice(0, 6).map((item) => {
          const url = safeExternalUrl(item.url);
          const image = item.image || fallbackImage;
          const tag = url ? "a" : "article";
          const linkAttrs = url ? ` href="${escapeHtml(url)}" target="_blank" rel="sponsored nofollow noopener noreferrer"` : "";
          return `
            <${tag} class="stay-card"${linkAttrs}>
              ${imageTag(image, item.title)}
              <span>
                <em>${escapeHtml(item.region || item.rating || "마이리얼트립 숙소")}</em>
                <strong>${escapeHtml(item.title || "숙소 상품")}</strong>
                <small>${escapeHtml(String(item.priceText || "가격 확인"))}</small>
              </span>
            </${tag}>
          `;
        }).join("")}
      </div>
    `;
    return;
  }

  const fallbackMessage = mode === "not-configured"
    ? "MYREALTRIP_API_BASE 또는 숙소 엔드포인트 URL과 MYREALTRIP_API_KEY가 설정되면 지역 자동완성과 숙소 검색이 동작합니다."
    : message || "지역을 입력한 뒤 숙소를 조회하세요.";
  result.innerHTML = `<div class="stay-status">${escapeHtml(fallbackMessage)}</div>`;
}

async function postAccommodation(action, body) {
  const response = await fetch(`/api/myrealtrip-accommodation?action=${encodeURIComponent(action)}&v=${tourismDataVersion}`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json();
  if (!response.ok || payload?.ok === false) {
    const error = new Error(payload?.message || "숙소 정보를 불러오지 못했습니다.");
    error.payload = payload;
    throw error;
  }
  return payload;
}

async function findRegion(keyword, datalist = null) {
  const query = String(keyword || "").trim();
  if (!query) return null;
  if (regionCache.has(query)) {
    const cached = regionCache.get(query);
    if (datalist) datalist.innerHTML = cached.html;
    return cached.items[0] || null;
  }

  const payload = await postAccommodation("region-autocomplete", { keyword: query, query });
  const items = (payload.items || [])
    .map(normalizeRegion)
    .filter((item) => item.regionId || item.label)
    .slice(0, 8);
  const html = items
    .map((item) => `<option value="${escapeHtml(`${item.label} [${item.regionId}]`)}"></option>`)
    .join("");
  regionCache.set(query, { items, html });
  if (datalist) datalist.innerHTML = html;
  return items[0] || null;
}

async function loadRegionOptions(keyword, datalist) {
  try {
    await findRegion(keyword, datalist);
  } catch (error) {
    if (error.payload?.configured === false) renderStayResult([], "not-configured");
  }
}

function bindStaySearch() {
  const form = $("#staySearchForm");
  if (!form) return;

  const regionInput = $("#stayRegion");
  const regionOptions = $("#stayRegionOptions");
  const checkInInput = $("#stayCheckIn");
  const checkOutInput = $("#stayCheckOut");
  const guestsInput = $("#stayGuests");
  if (checkInInput && !checkInInput.value) checkInInput.value = dateValue(14);
  if (checkOutInput && !checkOutInput.value) checkOutInput.value = dateValue(15);

  if (regionInput && regionOptions) {
    regionInput.addEventListener("input", () => {
      if (regionInput.value.trim().length >= 2) loadRegionOptions(regionInput.value, regionOptions);
    });
    regionInput.addEventListener("focus", () => {
      if (regionInput.value.trim().length >= 2) loadRegionOptions(regionInput.value, regionOptions);
    });
  }

  renderStayResult();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const keyword = regionInput?.value || "제주";
    let regionId = regionIdFromInput(keyword);
    renderStayResult([], "loading", "숙소 지역 정보와 상품을 조회하고 있습니다.");

    try {
      if (!regionId) {
        const region = await findRegion(keyword, regionOptions);
        regionId = region?.regionId || "";
      }
      if (!regionId) {
        renderStayResult([], "idle", "지역 자동완성 결과에서 숙소 검색에 사용할 regionId를 찾지 못했습니다.");
        return;
      }

      const payload = await postAccommodation("search", {
        regionId,
        checkIn: checkInInput?.value || dateValue(14),
        checkOut: checkOutInput?.value || dateValue(15),
        adults: Number(guestsInput?.value || 2),
        guests: Number(guestsInput?.value || 2),
        rooms: 1
      });
      renderStayResult(payload.items || [], "ready", "표시할 숙소 상품이 없습니다.");
    } catch (error) {
      renderStayResult([], error.payload?.configured === false ? "not-configured" : "idle", error.message);
    }
  });
}

function renderTnaResult(items = [], mode = "idle", message = "") {
  const result = $("#tnaResult");
  if (!result) return;

  if (mode === "ready" && items.length) {
    result.innerHTML = `
      <div class="tna-card-list">
        ${items.slice(0, 6).map((product) => {
          const item = normalizeTnaProduct(product);
          const tag = item.url ? "a" : "article";
          const linkAttrs = item.url ? ` href="${escapeHtml(item.url)}" target="_blank" rel="sponsored nofollow noopener noreferrer"` : "";
          return `
            <${tag} class="tna-card"${linkAttrs}>
              ${imageTag(item.image || fallbackImage, item.title)}
              <span>
                <em>${escapeHtml(item.category || item.region || "투어·티켓")}</em>
                <strong>${escapeHtml(item.title)}</strong>
                <small>${escapeHtml(String(item.priceText))}</small>
              </span>
            </${tag}>
          `;
        }).join("")}
      </div>
    `;
    return;
  }

  const fallbackMessage = mode === "not-configured"
    ? "MYREALTRIP_API_BASE 또는 투어티켓 엔드포인트 URL과 MYREALTRIP_API_KEY가 설정되면 카테고리와 상품 검색이 동작합니다."
    : message || "도시와 검색어를 입력한 뒤 투어·티켓 상품을 조회하세요.";
  result.innerHTML = `<div class="tna-status">${escapeHtml(fallbackMessage)}</div>`;
}

async function postTna(action, body) {
  const response = await fetch(`/api/myrealtrip-tna?action=${encodeURIComponent(action)}&v=${tourismDataVersion}`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json();
  if (!response.ok || payload?.ok === false) {
    const error = new Error(payload?.message || "투어·티켓 정보를 불러오지 못했습니다.");
    error.payload = payload;
    throw error;
  }
  return payload;
}

async function loadTnaCategories(city, select) {
  const query = String(city || "").trim() || "제주";
  if (!select) return;
  if (tnaCategoryCache.has(query)) {
    select.innerHTML = tnaCategoryCache.get(query);
    return;
  }

  try {
    const payload = await postTna("categories", { city: query, cityName: query, keyword: query, query });
    const options = (payload.items || [])
      .map(normalizeTnaCategory)
      .filter((item) => item.value || item.label)
      .slice(0, 40)
      .map((item) => `<option value="${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>`)
      .join("");
    const html = `<option value="">전체</option>${options}`;
    tnaCategoryCache.set(query, html);
    select.innerHTML = html;
  } catch (error) {
    if (error.payload?.configured === false) renderTnaResult([], "not-configured");
  }
}

function bindTnaSearch() {
  const form = $("#tnaSearchForm");
  if (!form) return;

  const cityInput = $("#tnaCity");
  const categorySelect = $("#tnaCategory");
  const keywordInput = $("#tnaKeyword");
  renderTnaResult();
  loadTnaCategories(cityInput?.value || "제주", categorySelect);

  cityInput?.addEventListener("change", () => {
    loadTnaCategories(cityInput.value, categorySelect);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const city = cityInput?.value || "제주";
    const keyword = keywordInput?.value || "";
    const category = categorySelect?.value || "";
    renderTnaResult([], "loading", "투어·티켓 상품을 조회하고 있습니다.");

    try {
      const payload = await postTna("search", {
        city,
        cityName: city,
        keyword,
        query: keyword,
        category,
        page: 1,
        limit: 12
      });
      renderTnaResult(payload.items || [], "ready", "표시할 투어·티켓 상품이 없습니다.");
    } catch (error) {
      renderTnaResult([], error.payload?.configured === false ? "not-configured" : "idle", error.message);
    }
  });
}

function renderFooter() {
  const footer = $("#footerLinks");
  if (!footer) return;
  footer.innerHTML = footerGroups
    .map((group) => `
      <nav aria-label="${escapeHtml(group.title)}">
        <h2>${escapeHtml(group.title)}</h2>
        <ul>
          ${group.links.map((link) => `<li><a href="#top">${escapeHtml(link)}</a></li>`).join("")}
        </ul>
      </nav>
    `)
    .join("");
}

async function loadOfficialPlaces() {
  const requestCategory = activeCategory;
  const requestId = ++officialRequestId;

  if (officialCache.has(requestCategory)) {
    const places = officialCache.get(requestCategory);
    applyOfficialImagesToArticles(places);
    renderCategoryView(places);
    return;
  }

  renderCategoryView([]);

  try {
    const response = await fetch(`/api/jeju?category=${encodeURIComponent(requestCategory)}&v=${tourismDataVersion}`, {
      headers: { accept: "application/json" }
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || "관광정보를 불러오지 못했습니다.");
    const places = payload.items || [];
    applyOfficialImagesToArticles(places);
    officialCache.set(requestCategory, places);
  } catch (error) {
    officialCache.set(requestCategory, []);
  }

  if (requestId === officialRequestId && requestCategory === activeCategory) {
    renderCategoryView(officialCache.get(requestCategory));
  }
}

function setActiveCategory(category) {
  if (category && !categories.includes(category)) {
    activeCategory = categories[0];
  } else {
    activeCategory = category || categories[0];
  }
  renderPrimaryNav();
  renderTabs();
  renderCategoryView([]);
  loadOfficialPlaces();
}

function bindHeader() {
  const menuButton = $("#menuToggle") || $("#menuButton");
  const nav = $("#primaryNav");
  if (menuButton && nav) {
    const setOpen = (open) => {
      menuButton.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
    };

    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") === "true";
      setOpen(!open);
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("click", (event) => {
      if (!document.body.classList.contains("menu-open")) return;
      if (nav.contains(event.target) || menuButton.contains(event.target)) return;
      setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }
}

function bindHome() {
  const bindCategoryContainer = (container) => {
    if (!container) return;
    container.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      event.preventDefault();
      setActiveCategory(button.dataset.category);
      $("#july")?.scrollIntoView({ block: "start" });
    });
  };

  bindCategoryContainer($("#topCategoryTabs"));
  bindCategoryContainer($("#primaryNav"));
  bindCategoryContainer($(".today-keyword-bar"));
  bindCategoryContainer($("#categoryNewsSections"));
}

function renderHome() {
  if (!$("#newsFeedList")) return;
  renderTodayKeywords();
  renderPrimaryNav();
  renderTabs();
  renderCategoryView([]);
  compactTravelSearchSections();
  bindFlightSearch();
  bindStaySearch();
  bindTnaSearch();
  renderVisitCheck();
  renderCategoryNews();
  renderFaq();
  renderFooter();
  bindHome();
  loadOfficialPlaces();
}

function rowsFromPairs(pairs) {
  return pairs
    .map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value || "공식 안내 확인 필요")}</td></tr>`)
    .join("");
}

function usefulInfoValue(value) {
  const text = String(value || "").trim();
  if (!text || text === "정보 없음" || text.includes("공식 안내 확인 필요")) return "";
  return text;
}

function articleInfoRows(article, place = {}) {
  return rowsFromPairs([
    ["지역", article.region],
    ["주소", usefulInfoValue(place.address) || article.address],
    ["주차", usefulInfoValue(place.parking) || article.parking],
    ["운영시간", usefulInfoValue(place.operatingHours) || article.operatingHours],
    ["입장료", usefulInfoValue(place.fee) || article.fee]
  ]);
}

function staticInfoRows(article) {
  return articleInfoRows(article);
}

function updateArticleInfoTable(article, place) {
  const tableBody = $("#articleInfoRows");
  if (!tableBody) return;
  tableBody.innerHTML = articleInfoRows(article, place);
}

function articleOfficialKeyword(article) {
  const override = articleImageKeywordOverrides.get(article.slug);
  if (override) return override;
  const spot = ((article.course || []).find(Boolean) || article.title || "").trim();
  return spot
    .replace(/^\d일차\s*/g, "")
    .replace(/\s*(입구|매표소|전망대|전망|산책로|탐방로|안내소|주변)$/g, "")
    .split(/[·ㆍ]/)[0]
    .trim() || article.title;
}

function articleBodySections(article) {
  const course = (article.course || []).filter(Boolean);
  const nearby = (article.nearbySpots || []).filter(Boolean);
  const firstCourse = course[0] || article.title;
  const secondCourse = course[1] || article.region || "주변 코스";
  const lastCourse = course[course.length - 1] || nearby[0] || article.region || article.title;
  const routeText = course.length ? course.slice(0, 5).join(" → ") : article.title;
  const nearbyText = nearby.length ? nearby.slice(0, 4).join(", ") : "주변 관광지";
  const baseContent = (article.content || []).filter(Boolean);
  const intro = baseContent[0] || `${article.title}은 ${article.region || "제주"}에서 일정에 넣기 좋은 ${article.category || "여행지"}입니다.`;
  const localTip = baseContent[1] || `${article.region || "제주"} 권역은 날씨와 교통 상황에 따라 체감 이동 시간이 달라질 수 있으니 여유 시간을 두고 움직이는 편이 좋습니다.`;

  return [
    {
      title: "여행 포인트",
      paragraphs: [
        intro,
        `${article.title}은 한 장소만 빠르게 보고 이동하기보다 주변 흐름을 함께 잡을 때 만족도가 높습니다. ${article.category || "여행"} 일정이라면 사진을 찍는 시간, 식사 시간, 주차장에서 목적지까지 걷는 시간을 같이 계산해 두세요.`
      ]
    },
    {
      title: "추천 동선",
      paragraphs: [
        `기본 동선은 ${routeText} 순서로 잡으면 무리 없이 이어집니다. 시작 지점은 ${firstCourse}, 중간에 여유를 두고 볼 곳은 ${secondCourse}, 마무리 지점은 ${lastCourse}로 생각하면 전체 흐름이 단순해집니다.`,
        `일정이 짧다면 모든 장소를 다 넣기보다 핵심 2~3곳만 고르는 편이 낫습니다. 반대로 반나절 이상 시간이 있다면 ${nearbyText}까지 묶어 같은 권역 안에서 천천히 움직이는 구성이 좋습니다.`
      ]
    },
    {
      title: "머무는 시간과 이동 팁",
      paragraphs: [
        localTip,
        `렌터카 이동이라면 주차 위치를 먼저 확인하세요. ${article.parking} 도보 이동이 길어질 수 있는 날에는 목적지 바로 앞 주차만 고집하지 말고 가까운 공영 주차장이나 대체 코스를 함께 보는 편이 편합니다.`
      ]
    },
    {
      title: "방문 전 확인",
      paragraphs: [
        `운영시간과 입장료는 계절, 날씨, 현장 사정에 따라 달라질 수 있습니다. ${article.operatingHours} ${article.fee} 출발 전에는 지도 위치와 공식 안내를 한 번 더 확인하는 것이 안전합니다.`,
        `해변, 오름, 숲길처럼 야외 비중이 큰 일정은 바람과 비 예보에 영향을 많이 받습니다. 아이와 함께 가거나 부모님을 모시고 간다면 화장실, 그늘, 편의점, 식사 장소를 먼저 확인하고 이동하세요.`
      ]
    }
  ];
}

function articleReadableLead(article) {
  const course = (article.course || []).filter(Boolean);
  const firstCourse = course[0] || article.title;
  const lastCourse = course[course.length - 1] || article.region || article.title;
  const nearby = (article.nearbySpots || []).filter(Boolean);
  const nearbyText = nearby.length ? `${nearby.slice(0, 3).join(", ")}까지` : "주변 코스까지";
  return `${firstCourse}에서 시작해 ${lastCourse}로 이어지는 흐름을 기준으로 정리했습니다. ${article.region || "제주"} 권역에서 ${article.category || "여행"} 일정을 잡을 때 필요한 동선, 체류 시간, 방문 전 확인 사항을 함께 보세요. 여유가 있으면 ${nearbyText} 묶어 보면 좋습니다.`;
}

function renderArticleBodySection(article) {
  return `
    <section class="article-readable-section">
      <div class="section-kicker">TRAVEL NOTE</div>
      <h2>본문 정보</h2>
      <div class="readable-lead">
        <strong>읽기 전 핵심</strong>
        <p>${escapeHtml(articleReadableLead(article))}</p>
      </div>
      <div class="article-note-list">
        ${articleBodySections(article).map((section) => `
          <article class="article-note-block">
            <h3>${escapeHtml(section.title)}</h3>
            ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function articleAudienceItems(article) {
  const region = article.region || "제주";
  const category = article.category || "여행지";
  return [
    `${region} 권역에서 ${category} 중심 일정을 잡고 싶은 여행자`,
    "주차, 운영시간, 입장료를 먼저 확인하고 움직이고 싶은 초행 여행자",
    "한 곳만 보고 끝내기보다 주변 장소까지 자연스럽게 묶고 싶은 여행자"
  ];
}

function articlePlanningRows(article) {
  const course = (article.course || []).filter(Boolean);
  const first = course[0] || article.title;
  const last = course[course.length - 1] || article.region;
  const duration = course.length >= 4 ? "반나절 이상" : "1~2시간";
  const pace = course.length >= 4 ? "장소를 모두 넣기보다 핵심 2~3곳을 먼저 정하세요." : "주변 추천 한두 곳만 더해도 일정이 자연스럽습니다.";

  return [
    ["추천 체류", duration],
    ["시작 지점", first],
    ["마무리 지점", last],
    ["동선 팁", pace]
  ];
}

function renderAudienceSection(article) {
  return `
    <section class="template-card">
      <h2>이런 사람에게 추천</h2>
      <ul class="recommend-list">
        ${articleAudienceItems(article).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </section>
  `;
}

function renderPlanningSection(article) {
  return `
    <section class="template-card">
      <h2>권장 동선</h2>
      <dl class="planning-grid">
        ${articlePlanningRows(article).map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}
      </dl>
    </section>
  `;
}

function placeInfoRows(place) {
  return rowsFromPairs([
    ["분류", place.category],
    ["주소", place.address],
    ["연락처", place.tel],
    ["휴무일", place.restDate],
    ["운영시간", place.operatingHours],
    ["주차", place.parking],
    ["입장료", place.fee]
  ]);
}

function updateMeta(title, description) {
  document.title = `${title} | 제주여행뉴스`;
  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) descriptionMeta.setAttribute("content", description);
}

function articleSeoTitle(article) {
  const suffix = "주차 운영시간 입장료 코스 정리";
  return article.title.includes("주차") ? article.title : `${article.title} ${suffix}`;
}

function articleSeoDescription(article) {
  return `${article.summary} 주소, 주차, 운영시간, 입장료, 추천 동선과 주변 여행지를 함께 정리했습니다.`;
}

function renderRelated(article) {
  const relatedBox = $("#relatedArticles");
  if (!relatedBox) return;
  const related = articles
    .filter((item) => item.slug !== article.slug && (item.category === article.category || item.region === article.region))
    .slice(0, 4);
  relatedBox.innerHTML = related.map(newsCard).join("");
}

function renderInlineOfficialShell(article) {
  const spot = articleOfficialKeyword(article);
  return `
    <section class="map-card official-inline-card" id="articleOfficialInfo" aria-live="polite">
      <h2>공식 확인 정보</h2>
      <p>${escapeHtml(spot)}의 운영시간, 주차, 요금 정보를 본문에서 바로 확인합니다.</p>
      <div class="official-inline-status">공식 관광정보를 불러오는 중입니다.</div>
    </section>
  `;
}

function officialActionButtons(place, fallbackKeyword = "") {
  const homepage = safeExternalUrl(place.homepageUrl || place.homepage);
  const map = mapUrl(place) || mapSearchUrl(place.title || place.address || fallbackKeyword);
  const phone = phoneUrl(place.tel);
  return [
    homepage ? `<a class="primary-link" href="${escapeHtml(homepage)}" target="_blank" rel="noreferrer">공식 안내</a>` : "",
    map ? `<a class="primary-link" href="${escapeHtml(map)}" target="_blank" rel="noreferrer">지도에서 보기</a>` : "",
    phone ? `<a class="primary-link is-secondary" href="${escapeHtml(phone)}">전화하기</a>` : ""
  ].filter(Boolean).join("");
}

function officialInlineFacts(place, keyword) {
  const facts = [
    ["공식 명칭", normalizeText(place.title) !== normalizeText(keyword) ? place.title : ""],
    ["분류", place.category],
    ["문의", usefulInfoValue(place.tel)],
    ["휴무일", usefulInfoValue(place.restDate)]
  ].filter(([, value]) => usefulInfoValue(value));

  if (!facts.length) return "";

  return `
    <dl class="official-facts">
      ${facts.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}
    </dl>
  `;
}

function renderOfficialInlineContent(place, keyword) {
  const buttons = officialActionButtons(place, keyword);
  const facts = officialInlineFacts(place, keyword);
  return `
    <h2>방문 전 확인</h2>
    <p>상단 기본 정보에 공식 관광정보를 반영했습니다. 출발 전에는 최신 공지와 지도 위치만 한 번 더 확인하세요.</p>
    ${facts}
    ${buttons ? `<div class="detail-link-row">${buttons}</div>` : ""}
    <p class="source-note">자료 출처: 한국관광공사 관광정보. 운영시간과 요금은 현장 사정에 따라 달라질 수 있습니다.</p>
  `;
}

function renderOfficialInlineFallback(article, keyword) {
  const map = mapSearchUrl(`${keyword || article.title} ${article.address || "제주"}`);
  return `
    <h2>방문 전 확인</h2>
    <p>공식 상세값을 불러오지 못했습니다. 상단 기본 정보를 기준으로 보고, 출발 전 지도 위치와 현장 안내를 확인하세요.</p>
    <div class="detail-link-row">
      <a class="primary-link" href="${escapeHtml(map)}" target="_blank" rel="noreferrer">지도에서 보기</a>
    </div>
  `;
}

async function hydrateStaticOfficialInfo(article) {
  const container = $("#articleOfficialInfo");
  if (!container) return;
  const keyword = articleOfficialKeyword(article);

  try {
    const listQuery = new URLSearchParams({ keyword, category: "전체", v: tourismDataVersion });
    const listResponse = await fetch(`/api/jeju?${listQuery.toString()}`, { headers: { accept: "application/json" } });
    const listPayload = await listResponse.json();
    const placeFromList = listPayload?.items?.find((item) => normalizeText(item.title).includes(normalizeText(keyword))) || listPayload?.items?.[0];
    if (!listResponse.ok || !listPayload.ok || !placeFromList) throw new Error("공식 관광정보를 찾지 못했습니다.");

    const detailQuery = new URLSearchParams({
      contentId: placeFromList.contentId,
      v: tourismDataVersion,
      title: placeFromList.title || keyword
    });
    if (placeFromList.contentTypeId) detailQuery.set("contentTypeId", placeFromList.contentTypeId);
    const detailResponse = await fetch(`/api/jeju?${detailQuery.toString()}`, { headers: { accept: "application/json" } });
    const detailPayload = await detailResponse.json();
    const detailItem = detailResponse.ok && detailPayload.ok ? detailPayload.item || {} : {};
    const place = {
      ...fallbackPlace(placeFromList.contentId, placeFromList.contentTypeId || ""),
      ...placeFromList,
      ...detailItem
    };
    updateArticleInfoTable(article, place);
    container.innerHTML = renderOfficialInlineContent(place, keyword);
  } catch (error) {
    container.innerHTML = renderOfficialInlineFallback(article, keyword);
  }
}

function renderStaticDetail(detail) {
  const slug = params.get("slug") || articles[0].slug;
  const article = articles.find((item) => item.slug === slug) || articles[0];
  const myrealtripContext = myrealtripContextFromArticle(article);
  updateMeta(articleSeoTitle(article), articleSeoDescription(article));
  detail.innerHTML = `
    ${imageTag(thumbnailForArticle(article, true), article.title, "detail-hero", `data-article-thumb="${escapeHtml(article.slug)}"`)}
    <div class="detail-body">
      <div class="meta">${metaLine([article.category, article.region, article.date])}</div>
      <h1>${escapeHtml(article.title)}</h1>
      <p class="summary">${escapeHtml(article.summary)}</p>
      <table class="info-table article-info-table"><tbody id="articleInfoRows">${staticInfoRows(article)}</tbody></table>
      ${renderArticleGallery(article)}
      ${renderInlineOfficialShell(article)}
      ${renderAudienceSection(article)}
      ${renderPlanningSection(article)}
      ${renderArticleBodySection(article)}
      <section>
        <h2>여행 코스 요약</h2>
        <ol class="course-list">${(article.course || []).map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
      </section>
      <section>
        <h2>방문 전 체크포인트</h2>
        <ul class="check-list">
          <li>운영시간과 입장료는 현장 사정에 따라 달라질 수 있습니다.</li>
          <li>해변과 오름은 바람, 비, 안개 예보를 먼저 확인하세요.</li>
          <li>주차장이 혼잡하면 가까운 대체 코스를 준비하는 편이 좋습니다.</li>
        </ul>
      </section>
      <section>
        <h2>주변 추천</h2>
        <div class="spot-tags">${(article.nearbySpots || []).map((spot) => `<a href="${escapeHtml(spotUrl(spot, article.slug))}">${escapeHtml(spot)}</a>`).join("")}</div>
      </section>
      <section class="mrt-section article-mrt-section" aria-labelledby="articleMyRealTripTitle">
        <div class="section-heading">
          <p class="eyebrow">MYREALTRIP</p>
          <h2 id="articleMyRealTripTitle">${escapeHtml(myrealtripContext.label)} 여행 상품</h2>
          <p>${escapeHtml(myrealtripContext.keyword)} 기준으로 관련 투어, 숙소, 액티비티를 보여줍니다.</p>
        </div>
        <div class="mrt-grid" id="articleMyRealTripGrid"></div>
      </section>
    </div>
  `;
  hydrateStaticOfficialInfo(article);
  loadContextualMyRealTrip(myrealtripContext, "#articleMyRealTripGrid");
  renderRelated(article);
}

async function renderSpotDetail(detail, spot) {
  const title = `${spot} 여행 정보`;
  updateMeta(title, `${spot}의 제주 여행 정보를 정리했습니다.`);
  detail.innerHTML = `<div class="detail-loading">${escapeHtml(spot)} 정보를 불러오고 있습니다.</div>`;

  try {
    const query = new URLSearchParams({ keyword: spot, category: "전체", v: tourismDataVersion });
    const response = await fetch(`/api/jeju?${query.toString()}`, { headers: { accept: "application/json" } });
    const payload = await response.json();
    const first = payload?.items?.[0];
    if (!response.ok || !payload.ok || !first) throw new Error("장소 정보를 찾지 못했습니다.");
    await renderOfficialDetail(detail, first.contentId, first.contentTypeId || "", {
      ...fallbackPlace(first.contentId, first.contentTypeId || ""),
      ...first,
      restDate: "공식 안내 확인 필요",
      operatingHours: "공식 안내 확인 필요",
      parking: "공식 안내 확인 필요",
      fee: "공식 안내 확인 필요",
      checkPoint: "운영시간, 입장료, 주차 정보는 공식 안내와 현장 공지를 함께 확인하세요."
    });
  } catch (error) {
    const fallback = {
      contentId: "",
      contentTypeId: "",
      title,
      category: "주변 추천",
      address: `제주 ${spot}`,
      region: `제주 ${spot}`,
      tel: "정보 없음",
      image: fallbackImage,
      mapx: "",
      mapy: "",
      homepageUrl: "",
      restDate: "공식 안내 확인 필요",
      operatingHours: "공식 안내 확인 필요",
      parking: "공식 안내 확인 필요",
      fee: "공식 안내 확인 필요",
      checkPoint: "운영시간, 입장료, 주차 정보는 공식 안내와 현장 공지를 함께 확인하세요."
    };
    detail.innerHTML = renderPlaceDetailHtml(fallback, "주변 추천", `${spot}은 제주 여행 중 함께 묶어 보기 좋은 주변 장소입니다. 정확한 운영 정보가 필요한 경우 지도와 공식 안내를 함께 확인하세요.`);
  }
}

function fallbackPlace(contentId, contentTypeId) {
  return {
    contentId,
    contentTypeId,
    title: params.get("title") || "제주 관광정보",
    category: params.get("category") || "관광정보",
    address: params.get("address") || "",
    region: params.get("address") || "제주",
    tel: "정보 없음",
    image: params.get("image") || fallbackImage,
    mapx: params.get("mapx") || "",
    mapy: params.get("mapy") || "",
    homepageUrl: "",
    restDate: "공식 안내 확인 필요",
    operatingHours: "공식 안내 확인 필요",
    parking: "공식 안내 확인 필요",
    fee: "공식 안내 확인 필요",
    checkPoint: "방문 전 운영시간, 휴무일, 요금 안내를 다시 확인하세요."
  };
}

function phoneUrl(value) {
  const primaryNumber = String(value || "").split(/[~,/]/)[0];
  const digits = primaryNumber.replace(/[^\d+]/g, "");
  if (digits.replace(/\D/g, "").length < 7) return "";
  return `tel:${digits}`;
}

function renderOfficialLinks(place) {
  const links = officialActionButtons(place);

  if (!links) return "";
  return `
    <section class="map-card">
      <h2>공식 확인 링크</h2>
      <p>운영시간, 입장료, 휴무일은 변경될 수 있으니 출발 전 공식 안내를 한 번 더 확인하세요.</p>
      <div class="detail-link-row">${links}</div>
    </section>
  `;
}

function renderPlaceDetailHtml(place, sourceLabel, overview = "") {
  return `
    ${imageTag(place.image, place.title, "detail-hero")}
    <div class="detail-body">
      <div class="meta">${metaLine([sourceLabel, place.category])}</div>
      <h1>${escapeHtml(place.title)}</h1>
      <p class="summary">${escapeHtml(place.address || place.region || "제주")}</p>
      <table class="info-table"><tbody>${placeInfoRows(place)}</tbody></table>
      <section>
        <h2>장소 소개</h2>
        <p>${escapeHtml(overview || "목록에서 확인한 주소와 위치 정보를 먼저 표시합니다.")}</p>
      </section>
      <section>
        <h2>방문 전 체크포인트</h2>
        <ul class="check-list">
          <li>운영시간, 휴무일, 요금은 현장 사정에 따라 달라질 수 있습니다.</li>
          <li>${escapeHtml(place.checkPoint || "방문 전 최신 안내를 다시 확인하세요.")}</li>
          <li>주소와 주차 정보를 확인한 뒤 주변 대체 코스도 함께 준비하세요.</li>
        </ul>
      </section>
      ${renderOfficialLinks(place)}
      <p class="source-note">자료 출처: 한국관광공사 관광정보</p>
    </div>
  `;
}

async function renderOfficialDetail(detail, contentId, contentTypeId, fallbackOverride = null) {
  const fallback = fallbackOverride || fallbackPlace(contentId, contentTypeId);
  detail.innerHTML = `<div class="detail-loading">관광정보를 불러오고 있습니다.</div>`;

  try {
    const query = new URLSearchParams({ contentId, v: tourismDataVersion });
    if (contentTypeId) query.set("contentTypeId", contentTypeId);
    if (fallback.title) query.set("title", fallback.title);
    const response = await fetch(`/api/jeju?${query.toString()}`, { headers: { accept: "application/json" } });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || "관광정보를 불러오지 못했습니다.");
    const place = { ...fallback, ...payload.item };
    updateMeta(place.title, `${place.title}의 주소와 방문 정보를 정리했습니다.`);
    detail.innerHTML = renderPlaceDetailHtml(place, "관광정보", place.overview);
  } catch (error) {
    updateMeta(fallback.title, `${fallback.title}의 주소와 위치 정보를 정리했습니다.`);
    detail.innerHTML = renderPlaceDetailHtml(fallback, "관광정보 목록");
  }

  const relatedBox = $("#relatedArticles");
  if (relatedBox) {
    relatedBox.innerHTML = articles.slice(0, 4).map(newsCard).join("");
  }
}

function renderDetail() {
  const detail = $("#articleDetail");
  if (!detail) return;

  const contentId = params.get("contentId") || params.get("id");
  const spot = params.get("spot");
  if (spot) {
    renderSpotDetail(detail, spot);
    return;
  }

  if (contentId) {
    renderOfficialDetail(detail, contentId, params.get("contentTypeId") || "");
    return;
  }

  renderStaticDetail(detail);
}

bindImageFallbacks();
bindHeader();
renderHome();
renderDetail();

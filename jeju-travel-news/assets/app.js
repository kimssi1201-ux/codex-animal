import { articles, categories } from "./articles.js?v=20260710-official-info-2";

const $ = (selector) => document.querySelector(selector);
const params = new URLSearchParams(window.location.search);
const fallbackImage = "https://tong.visitkorea.or.kr/cms/resource/91/3481291_image2_1.jpg";
const tourismDataVersion = "20260710-official-info-2";
const detailPath = window.location.pathname.includes("/jeju-travel-news/") ? "article.html" : "/article.html";
const officialCache = new Map();
const airportCache = new Map();
const regionCache = new Map();
const tnaCategoryCache = new Map();

let activeCategory = "전체";
let officialRequestId = 0;

const faqItems = [
  {
    question: "제주여행뉴스에서는 무엇을 먼저 보면 좋나요?",
    answer: "상단 카테고리를 고른 뒤 추천 기사와 세로형 뉴스 피드를 보면 됩니다. 처음 방문이라면 전체, 해변, 가볼 만한 곳 순서로 보는 편이 쉽습니다."
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

function imageTag(src, alt, className = "") {
  const classAttribute = className ? ` class="${escapeHtml(className)}"` : "";
  return `<img${classAttribute} src="${escapeHtml(normalizeImageUrl(src))}" alt="${escapeHtml(alt)}" loading="lazy">`;
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
  return activeCategory === "전체" ? articles : articles.filter((article) => article.category === activeCategory);
}

function metaLine(parts) {
  return parts
    .filter(Boolean)
    .map((part) => `<span>${escapeHtml(part)}</span>`)
    .join("");
}

function recommendedCard(article) {
  return `
    <article class="recommend-card">
      <a href="${articleUrl(article)}">
        ${imageTag(article.image, article.title)}
        <span>${escapeHtml(article.category)}</span>
        <strong>${escapeHtml(article.title)}</strong>
      </a>
    </article>
  `;
}

function newsCard(article) {
  return `
    <article class="news-feed-card">
      <a class="news-thumb" href="${articleUrl(article)}">
        ${imageTag(article.image, article.title)}
      </a>
      <div class="news-copy">
        <div class="meta">${metaLine(["장소 포스팅", article.category, article.region, article.date])}</div>
        <h2><a href="${articleUrl(article)}">${escapeHtml(article.title)}</a></h2>
        <p>${escapeHtml(article.summary)}</p>
      </div>
    </article>
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
  tabs.innerHTML = categories
    .map((category) => `
      <button type="button" class="${category === activeCategory ? "is-active" : ""}" data-category="${escapeHtml(category)}">
        ${escapeHtml(category)}
      </button>
    `)
    .join("");
}

function renderFeed(places = null) {
  const feed = $("#newsFeedList");
  const status = $("#julyStatus") || $("#feedStatus");
  if (!feed) return;

  const localItems = visibleArticles();
  const placeItems = Array.isArray(places) ? places : [];
  const feedHtml = [
    ...localItems.map(newsCard),
    ...placeItems.slice(0, 8).map(placeCard)
  ].join("");

  feed.innerHTML = feedHtml || `<p class="empty-state">현재 선택한 카테고리의 제주 여행 정보가 없습니다.</p>`;
  if (status) {
    status.textContent = activeCategory === "전체"
      ? `장소 가이드 ${localItems.length}건 · 공식 관광정보 ${placeItems.length}건`
      : `${activeCategory} 가이드 ${localItems.length}건 · 공식 관광정보 ${placeItems.length}건`;
  }
}

function renderRecommended() {
  const row = $("#recommendedArticles");
  if (!row) return;
  row.innerHTML = articles.slice(0, 3).map(recommendedCard).join("");
}

function renderCategoryNews() {
  const wrapper = $("#categoryNewsSections");
  if (!wrapper) return;
  wrapper.innerHTML = categories
    .filter((category) => category !== "전체")
    .map((category) => {
      const items = articles.filter((article) => article.category === category).slice(0, 3);
      if (!items.length) return "";
      return `
        <section class="category-news-section" id="${category === "가볼 만한 곳" ? "places" : ""}">
          <div class="section-heading">
            <p class="eyebrow">Category</p>
            <h2>${escapeHtml(category)}</h2>
          </div>
          <div class="news-list-feed compact-feed">${items.map(newsCard).join("")}</div>
        </section>
      `;
    })
    .join("");
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
    return `
      <article class="mrt-card">
        <a href="${escapeHtml(item.url)}" target="_blank" rel="sponsored nofollow noopener noreferrer">${content}</a>
      </article>
    `;
  }

  return `<article class="mrt-card is-disabled">${content}</article>`;
}

function renderMyRealTrip(items = [], mode = "loading") {
  const grid = $("#myrealtripGrid");
  if (!grid) return;

  if (mode === "ready" && items.length) {
    grid.innerHTML = items.slice(0, 6).map(myrealtripCard).join("");
    return;
  }

  const message = mode === "not-configured"
    ? "마이리얼트립 광고 연결 정보가 아직 설정되지 않았습니다. API 키나 제휴 URL이 연결되면 이 영역에 실제 상품 광고가 표시됩니다."
    : "제주 여행 상품 광고 정보를 확인하고 있습니다.";

  grid.innerHTML = `
    <div class="mrt-status">
      <strong>${escapeHtml(message)}</strong>
      <p>모바일 뉴스 피드 흐름을 해치지 않도록 여행 상품 카드 영역으로 정리했습니다.</p>
    </div>
    ${myrealtripFallbackItems.map(myrealtripCard).join("")}
  `;
}

async function loadMyRealTrip() {
  const grid = $("#myrealtripGrid");
  if (!grid) return;
  renderMyRealTrip([], "loading");

  try {
    const response = await fetch(`/api/myrealtrip?keyword=${encodeURIComponent("제주")}&type=tour&v=${tourismDataVersion}`, {
      headers: { accept: "application/json" }
    });
    const payload = await response.json();
    if (!response.ok || payload?.ok === false) {
      renderMyRealTrip([], payload?.configured === false ? "not-configured" : "loading");
      return;
    }
    renderMyRealTrip(payload.items || [], "ready");
  } catch (error) {
    renderMyRealTrip([], "not-configured");
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
    renderFeed(officialCache.get(requestCategory));
    return;
  }

  renderFeed([]);

  try {
    const response = await fetch(`/api/jeju?category=${encodeURIComponent(requestCategory)}&v=${tourismDataVersion}`, {
      headers: { accept: "application/json" }
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || "관광정보를 불러오지 못했습니다.");
    officialCache.set(requestCategory, payload.items || []);
  } catch (error) {
    officialCache.set(requestCategory, []);
  }

  if (requestId === officialRequestId && requestCategory === activeCategory) {
    renderFeed(officialCache.get(requestCategory));
  }
}

function setActiveCategory(category) {
  activeCategory = category;
  renderTabs();
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
  const tabs = $("#topCategoryTabs");
  if (!tabs) return;
  tabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    setActiveCategory(button.dataset.category);
  });
}

function renderHome() {
  if (!$("#newsFeedList")) return;
  renderTabs();
  renderRecommended();
  renderFeed([]);
  renderMyRealTrip([], "loading");
  bindFlightSearch();
  bindStaySearch();
  bindTnaSearch();
  renderVisitCheck();
  renderCategoryNews();
  renderFaq();
  renderFooter();
  bindHome();
  loadOfficialPlaces();
  loadMyRealTrip();
}

function rowsFromPairs(pairs) {
  return pairs
    .map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value || "공식 안내 확인 필요")}</td></tr>`)
    .join("");
}

function staticInfoRows(article) {
  return rowsFromPairs([
    ["지역", article.region],
    ["주소", article.address],
    ["주차", article.parking],
    ["운영시간", article.operatingHours],
    ["입장료", article.fee]
  ]);
}

function extendedArticleParagraphs(article) {
  const course = (article.course || []).filter(Boolean);
  const nearby = (article.nearbySpots || []).filter(Boolean);
  const firstCourse = course[0] || article.title;
  const lastCourse = course[course.length - 1] || nearby[0] || article.region;
  const nearbyText = nearby.length ? nearby.slice(0, 4).join(", ") : "주변 관광지";

  return [
    `${article.title}을 일정에 넣을 때는 ${firstCourse}에서 시작해 ${lastCourse}까지 이어지는 흐름으로 잡으면 이동이 자연스럽습니다. 사진을 찍는 시간, 식사 시간, 주차장에서 목적지까지 걷는 시간을 함께 계산하면 실제 체류 시간이 부족하지 않습니다.`,
    `초행이라면 장소를 많이 넣기보다 핵심 포인트를 두세 곳으로 줄이는 편이 좋습니다. ${article.region} 권역은 날씨와 도로 상황에 따라 체감 이동 시간이 달라질 수 있으니, 오전에는 야외 코스, 오후에는 카페나 시장처럼 쉬어갈 수 있는 곳을 섞어 두면 일정이 안정적입니다.`,
    `방문 전에는 운영시간, 입장료, 주차 가능 여부를 다시 확인하세요. ${article.parking} ${article.operatingHours} 현장 상황이 바뀌면 가까운 대체 코스로 ${nearbyText} 중 한두 곳을 준비해 두는 것도 좋습니다.`,
    `가족 여행이나 렌터카 여행이라면 화장실, 그늘, 편의점, 식사 장소 위치를 먼저 보는 편이 편합니다. 도보 이동이 긴 날에는 얇은 겉옷과 물을 준비하고, 바람이 강한 해안이나 오름은 사진보다 안전한 이동 동선을 우선하세요.`
  ];
}

function articleBodyParagraphs(article) {
  return [...(article.content || []), ...extendedArticleParagraphs(article)];
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

function renderRelated(article) {
  const relatedBox = $("#relatedArticles");
  if (!relatedBox) return;
  const related = articles
    .filter((item) => item.slug !== article.slug && (item.category === article.category || item.region === article.region))
    .slice(0, 4);
  relatedBox.innerHTML = related.map(newsCard).join("");
}

function renderStaticOfficialCheck(article) {
  const spot = (article.course || []).find(Boolean) || article.title;
  if (!spot) return "";
  return `
    <section class="map-card">
      <h2>공식 정보 확인</h2>
      <p>운영시간, 입장료, 주차 정보는 현장 사정에 따라 바뀔 수 있습니다. 관광정보 상세에서 최신 안내와 지도 링크를 함께 확인하세요.</p>
      <div class="detail-link-row">
        <a class="primary-link" href="${escapeHtml(spotUrl(spot, article.slug))}">운영시간·입장료 확인</a>
      </div>
    </section>
  `;
}

function renderStaticDetail(detail) {
  const slug = params.get("slug") || articles[0].slug;
  const article = articles.find((item) => item.slug === slug) || articles[0];
  updateMeta(article.title, article.summary);
  detail.innerHTML = `
    ${imageTag(article.image, article.title, "detail-hero")}
    <div class="detail-body">
      <div class="meta">${metaLine([article.category, article.region, article.date])}</div>
      <h1>${escapeHtml(article.title)}</h1>
      <p class="summary">${escapeHtml(article.summary)}</p>
      <table class="info-table"><tbody>${staticInfoRows(article)}</tbody></table>
      ${renderStaticOfficialCheck(article)}
      <section>
        <h2>본문 정보</h2>
        ${articleBodyParagraphs(article).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      </section>
      <section>
        <h2>여행 코스 요약</h2>
        <ol class="course-list">${article.course.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
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
    </div>
  `;
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
  const digits = String(value || "").replace(/[^\d+]/g, "");
  if (digits.replace(/\D/g, "").length < 7) return "";
  return `tel:${digits}`;
}

function renderOfficialLinks(place) {
  const homepage = safeExternalUrl(place.homepageUrl || place.homepage);
  const map = mapUrl(place);
  const phone = phoneUrl(place.tel);
  const links = [
    homepage ? `<a class="primary-link" href="${escapeHtml(homepage)}" target="_blank" rel="noreferrer">공식 안내 보기</a>` : "",
    map ? `<a class="primary-link" href="${escapeHtml(map)}" target="_blank" rel="noreferrer">지도에서 보기</a>` : "",
    phone ? `<a class="primary-link is-secondary" href="${escapeHtml(phone)}">전화하기</a>` : ""
  ].filter(Boolean);

  if (!links.length) return "";
  return `
    <section class="map-card">
      <h2>공식 확인 링크</h2>
      <p>운영시간, 입장료, 휴무일은 변경될 수 있으니 출발 전 공식 안내를 한 번 더 확인하세요.</p>
      <div class="detail-link-row">${links.join("")}</div>
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

import { articles, categories } from "./articles.js";

const $ = (selector) => document.querySelector(selector);
const params = new URLSearchParams(window.location.search);
const fallbackImage = "https://images.unsplash.com/photo-1592828064575-70ed626d3a0e?auto=format&fit=crop&w=1200&q=82";
const tourismDataVersion = "20260708-view1-1";
const officialCache = new Map();

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
    question: "예약이나 광고 영역이 있나요?",
    answer: "이 제주 사이트에는 광고성 상품이나 구매 유도 영역을 넣지 않았습니다. 글과 장소 정보 중심으로만 구성했습니다."
  }
];

const footerGroups = [
  { title: "제주 여행", links: ["가볼 만한 곳", "해변", "오름", "계절 코스"] },
  { title: "여행 준비", links: ["방문 전 체크", "숙소 위치", "비 오는 날", "가족 여행"] },
  { title: "지역", links: ["제주시", "서귀포", "성산", "애월"] },
  { title: "언어", links: ["한국어", "English", "日本語", "中文"] }
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
  return `article.html?slug=${encodeURIComponent(article.slug)}`;
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
  return `article.html?${query.toString()}`;
}

function mapUrl(place) {
  if (!place.mapx || !place.mapy) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.mapy},${place.mapx}`)}`;
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
        <img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.title)}" loading="lazy">
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
        <img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.title)}" loading="lazy">
      </a>
      <div class="news-copy">
        <div class="meta">${metaLine([article.category, article.region, article.date])}</div>
        <h2><a href="${articleUrl(article)}">${escapeHtml(article.title)}</a></h2>
        <p>${escapeHtml(article.summary)}</p>
      </div>
    </article>
  `;
}

function placeCard(place) {
  const image = place.image || fallbackImage;
  return `
    <article class="news-feed-card place-feed-card">
      <a class="news-thumb" href="${officialUrl(place)}">
        <img src="${escapeHtml(image)}" alt="${escapeHtml(place.title)}" loading="lazy">
      </a>
      <div class="news-copy">
        <div class="meta">${metaLine(["관광정보", place.category])}</div>
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
  const status = $("#feedStatus");
  if (!feed) return;

  const localItems = visibleArticles();
  const placeItems = Array.isArray(places) ? places : [];
  const feedHtml = [
    ...placeItems.slice(0, 10).map(placeCard),
    ...localItems.map(newsCard)
  ].join("");

  feed.innerHTML = feedHtml || `<p class="empty-state">현재 선택한 카테고리의 제주 여행 정보가 없습니다.</p>`;
  if (status) {
    const count = placeItems.length + localItems.length;
    status.textContent = activeCategory === "전체"
      ? `오늘 확인할 제주 여행 뉴스 ${count}건`
      : `${activeCategory} 관련 제주 여행 뉴스 ${count}건`;
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
  const menuButton = $("#menuButton");
  const nav = $("#primaryNav");
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
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
  renderCategoryNews();
  renderFaq();
  renderFooter();
  bindHome();
  loadOfficialPlaces();
}

function rowsFromPairs(pairs) {
  return pairs
    .map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value || "정보 없음")}</td></tr>`)
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

function renderStaticDetail(detail) {
  const slug = params.get("slug") || articles[0].slug;
  const article = articles.find((item) => item.slug === slug) || articles[0];
  updateMeta(article.title, article.summary);
  detail.innerHTML = `
    <img class="detail-hero" src="${escapeHtml(article.image)}" alt="${escapeHtml(article.title)}">
    <div class="detail-body">
      <div class="meta">${metaLine([article.category, article.region, article.date])}</div>
      <h1>${escapeHtml(article.title)}</h1>
      <p class="summary">${escapeHtml(article.summary)}</p>
      <table class="info-table"><tbody>${staticInfoRows(article)}</tbody></table>
      <section>
        <h2>본문 정보</h2>
        ${article.content.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
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
        <div class="spot-tags">${article.nearbySpots.map((spot) => `<span>${escapeHtml(spot)}</span>`).join("")}</div>
      </section>
    </div>
  `;
  renderRelated(article);
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
    restDate: "정보 없음",
    operatingHours: "정보 없음",
    parking: "정보 없음",
    fee: "정보 없음",
    checkPoint: "방문 전 운영시간, 휴무일, 요금 안내를 다시 확인하세요."
  };
}

function renderMapLink(place) {
  const url = mapUrl(place);
  if (!url) return "";
  return `
    <section class="map-card">
      <h2>위치 확인</h2>
      <p>${escapeHtml(place.title)}의 좌표 기준으로 지도를 열 수 있습니다.</p>
      <a class="primary-link" href="${url}" target="_blank" rel="noreferrer">지도에서 보기</a>
    </section>
  `;
}

function renderPlaceDetailHtml(place, sourceLabel, overview = "") {
  const image = place.image || fallbackImage;
  return `
    <img class="detail-hero" src="${escapeHtml(image)}" alt="${escapeHtml(place.title)}">
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
      ${renderMapLink(place)}
      <p class="source-note">자료 출처: 한국관광공사 관광정보</p>
    </div>
  `;
}

async function renderOfficialDetail(detail, contentId, contentTypeId) {
  const fallback = fallbackPlace(contentId, contentTypeId);
  detail.innerHTML = `<div class="detail-loading">관광정보를 불러오고 있습니다.</div>`;

  try {
    const query = new URLSearchParams({ contentId, contentTypeId, v: tourismDataVersion });
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
  if (contentId) {
    renderOfficialDetail(detail, contentId, params.get("contentTypeId") || "");
    return;
  }

  renderStaticDetail(detail);
}

bindHeader();
renderHome();
renderDetail();

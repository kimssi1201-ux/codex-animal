import { articles, categories } from "./articles.js";

const $ = (selector) => document.querySelector(selector);
const params = new URLSearchParams(window.location.search);
const officialCache = new Map();
const fallbackImage = "https://images.unsplash.com/photo-1592828064575-70ed626d3a0e?auto=format&fit=crop&w=1200&q=82";

let activeCategory = "전체";
let officialRequestId = 0;

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
    contentTypeId: place.contentTypeId || ""
  });
  return `article.html?${query.toString()}`;
}

function mapUrl(place) {
  if (!place.mapx || !place.mapy) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.mapy},${place.mapx}`)}`;
}

function meta(article) {
  return `<span>${escapeHtml(article.category)}</span><span>${escapeHtml(article.region)}</span><span>${escapeHtml(article.date)}</span>`;
}

function card(article, className = "") {
  return `
    <article class="news-card ${className}">
      <a class="thumb" href="${articleUrl(article)}">
        <img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.title)}" loading="lazy">
      </a>
      <div class="card-copy">
        <div class="meta">${meta(article)}</div>
        <h3><a href="${articleUrl(article)}">${escapeHtml(article.title)}</a></h3>
        <p>${escapeHtml(article.summary)}</p>
      </div>
    </article>
  `;
}

function officialCard(place) {
  const image = place.image || fallbackImage;
  const facts = [
    ["분류", place.category],
    ["주소", place.address || place.region],
    ["연락처", place.tel || "정보 없음"]
  ];

  return `
    <article class="official-card">
      <a class="thumb" href="${officialUrl(place)}">
        <img src="${escapeHtml(image)}" alt="${escapeHtml(place.title)}" loading="lazy">
      </a>
      <div class="card-copy">
        <div class="meta"><span>공식 관광정보</span><span>${escapeHtml(place.category)}</span></div>
        <h3><a href="${officialUrl(place)}">${escapeHtml(place.title)}</a></h3>
        <dl class="place-facts">
          ${facts.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}
        </dl>
      </div>
    </article>
  `;
}

function setActiveCategory(category) {
  activeCategory = category;
  renderHome();
  loadOfficialPlaces();
}

function renderTabs() {
  const tabs = $("#categoryTabs");
  if (!tabs) return;
  tabs.innerHTML = categories
    .map((category) => `<button type="button" class="${category === activeCategory ? "active" : ""}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`)
    .join("");
}

function visibleArticles() {
  return activeCategory === "전체" ? articles : articles.filter((article) => article.category === activeCategory);
}

function renderTopStories() {
  const topStories = $("#topStories");
  if (!topStories) return;
  topStories.innerHTML = articles.slice(0, 3).map((article) => card(article, "top-card")).join("");
}

function renderNewsList() {
  const newsList = $("#newsList");
  if (!newsList) return;
  const list = visibleArticles();
  $("#feedCount").textContent = `${list.length}개 기사`;
  newsList.innerHTML = list.map((article) => card(article, "list-card")).join("");
}

function renderCategorySections() {
  const categorySections = $("#categorySections");
  if (!categorySections) return;
  const groups = categories.filter((category) => category !== "전체");
  categorySections.innerHTML = groups
    .map((category) => {
      const items = articles.filter((article) => article.category === category).slice(0, 3);
      if (!items.length) return "";
      return `
        <section class="category-block">
          <div class="category-title">
            <span>${escapeHtml(category)}</span>
            <a href="#tabs" data-jump-category="${escapeHtml(category)}">더 보기</a>
          </div>
          <div class="mini-grid">${items.map((article) => card(article, "mini-card")).join("")}</div>
        </section>
      `;
    })
    .join("");
}

function renderOfficialPlaces() {
  const container = $("#officialPlaces");
  if (!container) return;
  const status = $("#officialStatus");
  const cached = officialCache.get(activeCategory);

  if (!cached) {
    if (status) status.textContent = "불러오는 중";
    container.innerHTML = `
      <article class="official-card placeholder-card"><div class="card-copy"><h3>제주 관광정보를 불러오고 있습니다.</h3><p>잠시 후 주소와 기본 정보를 표시합니다.</p></div></article>
      <article class="official-card placeholder-card"><div class="card-copy"><h3>공식 정보 확인 중</h3><p>관광지, 음식점, 숙소 정보를 정리합니다.</p></div></article>
    `;
    return;
  }

  if (cached.error) {
    if (status) status.textContent = "기본 기사 표시 중";
    container.innerHTML = `<p class="notice">공식 관광정보를 잠시 불러오지 못해 기본 기사만 표시합니다.</p>`;
    return;
  }

  const items = cached.items || [];
  if (status) status.textContent = `${items.length}곳`;
  if (!items.length) {
    container.innerHTML = `<p class="notice">현재 선택한 분류의 공식 관광정보가 없습니다.</p>`;
    return;
  }

  container.innerHTML = items.slice(0, 12).map(officialCard).join("");
}

async function loadOfficialPlaces() {
  const container = $("#officialPlaces");
  if (!container) return;
  if (officialCache.has(activeCategory)) {
    renderOfficialPlaces();
    return;
  }

  const requestCategory = activeCategory;
  const requestId = ++officialRequestId;
  renderOfficialPlaces();

  try {
    const response = await fetch(`/api/jeju?category=${encodeURIComponent(requestCategory)}`, {
      headers: { accept: "application/json" }
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "관광정보를 불러오지 못했습니다.");
    }
    officialCache.set(requestCategory, { items: payload.items || [], updatedAt: payload.updatedAt });
  } catch (error) {
    officialCache.set(requestCategory, { error: true, message: error.message });
  }

  if (requestId === officialRequestId && requestCategory === activeCategory) {
    renderOfficialPlaces();
  }
}

function bindHeader() {
  const menuButton = $("#menuButton");
  const nav = $("#mainNav");
  const langButton = $("#langButton");
  const languageMenu = $("#languageMenu");
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("open", !open);
    });
  }
  if (langButton && languageMenu) {
    langButton.addEventListener("click", () => {
      const open = langButton.getAttribute("aria-expanded") === "true";
      langButton.setAttribute("aria-expanded", String(!open));
      languageMenu.classList.toggle("open", !open);
    });
  }
}

function bindHomeControls() {
  const tabs = $("#categoryTabs");
  const categorySections = $("#categorySections");

  if (tabs) {
    tabs.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      setActiveCategory(button.dataset.category);
    });
  }

  if (categorySections) {
    categorySections.addEventListener("click", (event) => {
      const link = event.target.closest("[data-jump-category]");
      if (!link) return;
      setActiveCategory(link.dataset.jumpCategory);
    });
  }
}

function renderHome() {
  if (!$("#newsList")) return;
  renderTabs();
  renderTopStories();
  renderNewsList();
  renderCategorySections();
  renderOfficialPlaces();
}

function rowsFromPairs(pairs) {
  return pairs
    .map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value || "정보 없음")}</td></tr>`)
    .join("");
}

function infoRows(article) {
  return rowsFromPairs([
    ["지역", article.region],
    ["주소", article.address],
    ["주차", article.parking],
    ["운영시간", article.operatingHours],
    ["입장료", article.fee]
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
  relatedBox.innerHTML = related.map((item) => card(item, "related-card")).join("");
}

function renderStaticDetail(detail) {
  const slug = params.get("slug") || articles[0].slug;
  const article = articles.find((item) => item.slug === slug) || articles[0];
  updateMeta(article.title, article.summary);
  detail.innerHTML = `
    <img class="detail-hero" src="${escapeHtml(article.image)}" alt="${escapeHtml(article.title)}">
    <div class="detail-body">
      <div class="meta">${meta(article)}</div>
      <h1>${escapeHtml(article.title)}</h1>
      <p class="summary">${escapeHtml(article.summary)}</p>
      <table class="info-table"><tbody>${infoRows(article)}</tbody></table>
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
          <li>운영시간과 입장료는 계절과 현장 사정에 따라 달라질 수 있습니다.</li>
          <li>해변과 오름은 바람, 비, 안개 예보를 먼저 확인하세요.</li>
          <li>주차장이 혼잡하면 가까운 대체 코스를 준비하는 편이 좋습니다.</li>
        </ul>
      </section>
      <section>
        <h2>주변 맛집·카페 추천</h2>
        <div class="spot-tags">${article.nearbySpots.map((spot) => `<span>${escapeHtml(spot)}</span>`).join("")}</div>
      </section>
    </div>
  `;
  renderRelated(article);
}

function officialInfoRows(place) {
  return rowsFromPairs([
    ["분류", place.category],
    ["주소", place.address],
    ["연락처", place.tel],
    ["휴무일", place.restDate],
    ["운영시간", place.operatingHours],
    ["주차", place.parking],
    ["입장료", place.fee],
    ["우편번호", place.zipcode]
  ]);
}

function renderOfficialMap(place) {
  const url = mapUrl(place);
  if (!url) return "";
  return `
    <section class="map-card">
      <h2>위치 확인</h2>
      <p>${escapeHtml(place.title)}의 좌표를 기준으로 지도를 열 수 있습니다.</p>
      <a class="primary-link" href="${url}" target="_blank" rel="noreferrer">지도에서 보기</a>
    </section>
  `;
}

function renderOfficialRelated(place) {
  const relatedBox = $("#relatedArticles");
  if (!relatedBox) return;
  const related = articles
    .filter((item) => item.category === "가볼 만한 곳" || item.category === "계절 코스")
    .slice(0, 4);
  relatedBox.innerHTML = related.map((item) => card(item, "related-card")).join("");
}

async function renderOfficialDetail(detail, contentId, contentTypeId) {
  detail.innerHTML = `<div class="detail-loading">관광정보를 불러오고 있습니다.</div>`;

  try {
    const query = new URLSearchParams({ contentId, contentTypeId });
    const response = await fetch(`/api/jeju?${query.toString()}`, {
      headers: { accept: "application/json" }
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "관광정보를 불러오지 못했습니다.");
    }

    const place = payload.item;
    const image = place.image || fallbackImage;
    const overview = place.overview || `${place.title}의 주소, 운영시간, 주차 정보를 정리했습니다. 방문 전 최신 안내를 한 번 더 확인하세요.`;
    updateMeta(place.title, `${place.title}의 주소, 운영시간, 주차, 입장료 정보를 정리했습니다.`);

    detail.innerHTML = `
      <img class="detail-hero" src="${escapeHtml(image)}" alt="${escapeHtml(place.title)}">
      <div class="detail-body">
        <div class="meta"><span>공식 관광정보</span><span>${escapeHtml(place.category)}</span></div>
        <h1>${escapeHtml(place.title)}</h1>
        <p class="summary">${escapeHtml(place.address || place.region)}</p>
        <table class="info-table"><tbody>${officialInfoRows(place)}</tbody></table>
        <section>
          <h2>장소 소개</h2>
          <p>${escapeHtml(overview)}</p>
        </section>
        <section>
          <h2>방문 전 체크포인트</h2>
          <ul class="check-list">
            <li>운영시간, 휴무일, 요금은 현장 사정에 따라 달라질 수 있습니다.</li>
            <li>${escapeHtml(place.checkPoint || "비가 오거나 바람이 강한 날은 이동 시간을 여유 있게 잡으세요.")}</li>
            <li>주소와 주차 정보를 확인한 뒤 주변 대체 코스도 함께 준비하세요.</li>
          </ul>
        </section>
        ${renderOfficialMap(place)}
        <p class="source-note">자료 출처: 한국관광공사 관광정보</p>
      </div>
    `;
    renderOfficialRelated(place);
  } catch (error) {
    detail.innerHTML = `
      <div class="detail-body">
        <h1>관광정보를 불러오지 못했습니다</h1>
        <p class="summary">${escapeHtml(error.message)}</p>
        <a class="primary-link" href="./">목록으로 돌아가기</a>
      </div>
    `;
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
bindHomeControls();
renderHome();
loadOfficialPlaces();
renderDetail();

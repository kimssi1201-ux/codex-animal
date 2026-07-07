import { articles, categories } from "./articles.js";

const $ = (selector) => document.querySelector(selector);
const params = new URLSearchParams(window.location.search);
let activeCategory = "전체";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function articleUrl(article) {
  return `article.html?slug=${encodeURIComponent(article.slug)}`;
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

function renderTabs() {
  const tabs = $("#categoryTabs");
  if (!tabs) return;
  tabs.innerHTML = categories
    .map((category) => `<button type="button" class="${category === activeCategory ? "active" : ""}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`)
    .join("");
  tabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    renderHome();
  });
}

function visibleArticles() {
  return activeCategory === "전체" ? articles : articles.filter((article) => article.category === activeCategory);
}

function renderTopStories() {
  $("#topStories").innerHTML = articles.slice(0, 3).map((article) => card(article, "top-card")).join("");
}

function renderNewsList() {
  const list = visibleArticles();
  $("#feedCount").textContent = `${list.length}개 기사`;
  $("#newsList").innerHTML = list.map((article) => card(article, "list-card")).join("");
  $("#categoryTabs").querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.category === activeCategory);
  });
}

function renderCategorySections() {
  const groups = categories.filter((category) => category !== "전체");
  $("#categorySections").innerHTML = groups
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
  $("#categorySections").addEventListener("click", (event) => {
    const link = event.target.closest("[data-jump-category]");
    if (!link) return;
    activeCategory = link.dataset.jumpCategory;
    renderHome();
  }, { once: true });
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

function renderHome() {
  if (!$("#newsList")) return;
  renderTabs();
  renderTopStories();
  renderNewsList();
  renderCategorySections();
}

function infoRows(article) {
  const rows = [
    ["지역", article.region],
    ["주소", article.address],
    ["주차", article.parking],
    ["운영시간", article.operatingHours],
    ["입장료", article.fee]
  ];
  return rows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join("");
}

function renderDetail() {
  const detail = $("#articleDetail");
  if (!detail) return;
  const slug = params.get("slug") || articles[0].slug;
  const article = articles.find((item) => item.slug === slug) || articles[0];
  document.title = `${article.title} | 제주여행뉴스`;
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
  const related = articles
    .filter((item) => item.slug !== article.slug && (item.category === article.category || item.region === article.region))
    .slice(0, 4);
  $("#relatedArticles").innerHTML = related.map((item) => card(item, "related-card")).join("");
}

bindHeader();
renderHome();
renderDetail();

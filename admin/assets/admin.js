import { articles, categories } from "../../jeju-travel-news/assets/articles.js?v=20260714-admin-1";

const storageKey = "jeju-admin-posts-v1";
const tokenKey = "jeju-admin-token";
const fallbackImage = "https://tong.visitkorea.or.kr/cms/resource/91/3481291_image2_1.jpg";

const $ = (selector) => document.querySelector(selector);
const form = $("#editorForm");
const table = $("#postTable");
const message = $("#editorMessage");

const state = {
  articles: loadArticles(),
  selectedSlug: "",
  query: "",
  category: "",
  status: ""
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadArticles() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (error) {
    localStorage.removeItem(storageKey);
  }
  return clone(articles);
}

function persistLocal() {
  localStorage.setItem(storageKey, JSON.stringify(state.articles));
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toLines(value) {
  return Array.isArray(value) ? value.join("\n") : String(value || "");
}

function fromLines(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

function statusOf(article) {
  const explicit = String(article.status || "").toLowerCase();
  if (explicit === "draft") return "draft";
  const dateValue = article.publishAt || article.date || "";
  const time = Date.parse(dateValue);
  if (explicit === "scheduled" || (Number.isFinite(time) && time > Date.now())) return "scheduled";
  return "published";
}

function statusText(status) {
  if (status === "scheduled") return "예약됨";
  if (status === "draft") return "임시저장";
  return "발행됨";
}

function statusClass(status) {
  if (status === "scheduled") return " is-scheduled";
  if (status === "draft") return " is-draft";
  return "";
}

function readMinutes(article) {
  const text = [article.summary, ...(article.content || [])].join(" ");
  const length = text.replace(/\s/g, "").length;
  return `${Math.max(2, Math.ceil(length / 450))}분`;
}

function normalizeImage(value) {
  const url = String(value || "").trim();
  return url || fallbackImage;
}

function filteredArticles() {
  const query = state.query.trim().toLowerCase();
  return state.articles
    .filter((article) => {
      const status = statusOf(article);
      if (state.category && article.category !== state.category) return false;
      if (state.status && status !== state.status) return false;
      if (!query) return true;
      return [article.title, article.slug, article.region, article.summary]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
}

function updateStats() {
  const totals = state.articles.reduce((acc, article) => {
    acc.total += 1;
    acc[statusOf(article)] += 1;
    return acc;
  }, { total: 0, published: 0, scheduled: 0, draft: 0 });

  $("#statTotal").textContent = totals.total;
  $("#statPublished").textContent = totals.published;
  $("#statScheduled").textContent = totals.scheduled;
  $("#statDraft").textContent = totals.draft;
}

function renderCategoryOptions() {
  const filter = $("#categoryFilter");
  const editor = $("#editorCategory");
  const editableCategories = categories.filter((category) => category !== "전체");

  filter.innerHTML = [
    `<option value="">전체 카테고리</option>`,
    ...editableCategories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
  ].join("");
  filter.value = state.category;

  editor.innerHTML = editableCategories
    .map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
    .join("");
}

function renderTable() {
  const items = filteredArticles();
  if (!items.length) {
    table.innerHTML = `<p class="empty-state">조건에 맞는 포스트가 없습니다.</p>`;
    return;
  }

  table.innerHTML = items.map((article) => {
    const status = statusOf(article);
    const selected = article.slug === state.selectedSlug ? " is-selected" : "";
    return `
      <article class="post-row${selected}">
        <button type="button" data-slug="${escapeHtml(article.slug)}" aria-label="${escapeHtml(article.title)} 편집">
          <img class="thumb" src="${escapeHtml(normalizeImage(article.image))}" alt="" loading="lazy">
          <span class="post-title">
            <strong>${escapeHtml(article.title)}</strong>
            <small>/${escapeHtml(article.slug)} · ${escapeHtml(readMinutes(article))}</small>
          </span>
          <span class="cell-muted">${escapeHtml(article.category)}</span>
          <span class="cell-muted">${escapeHtml(article.region || "-")}</span>
          <span class="status-pill${statusClass(status)}">${statusText(status)}</span>
          <span class="cell-muted">0</span>
          <span class="cell-muted">${escapeHtml(article.publishAt || article.date || "-")}</span>
        </button>
      </article>
    `;
  }).join("");
}

function render() {
  updateStats();
  renderTable();
}

function selectedArticle() {
  return state.articles.find((article) => article.slug === state.selectedSlug) || null;
}

function fillEditor(article) {
  const target = article || state.articles[0] || createEmptyArticle();
  state.selectedSlug = target.slug;
  form.elements.title.value = target.title || "";
  form.elements.slug.value = target.slug || "";
  form.elements.category.value = target.category || categories[1] || "";
  form.elements.status.value = statusOf(target);
  form.elements.region.value = target.region || "";
  form.elements.date.value = target.date || todayValue();
  form.elements.image.value = target.image || "";
  form.elements.summary.value = target.summary || "";
  form.elements.course.value = toLines(target.course);
  form.elements.content.value = toLines(target.content);
  form.elements.nearbySpots.value = toLines(target.nearbySpots);
  form.elements.address.value = target.address || "";
  form.elements.parking.value = target.parking || "";
  form.elements.operatingHours.value = target.operatingHours || "";
  form.elements.fee.value = target.fee || "";
  $("#editorTitle").textContent = target.title || "새 글";
  const status = statusOf(target);
  $("#editorStatus").textContent = statusText(status);
  $("#editorStatus").className = `status-pill${statusClass(status)}`;
  render();
}

function createSlug(title) {
  const slug = String(title || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `jeju-post-${Date.now()}`;
}

function createEmptyArticle() {
  return {
    title: "새 제주 여행 글",
    slug: `jeju-post-${Date.now()}`,
    category: categories.find((category) => category !== "전체") || "가볼 만한 곳",
    status: "draft",
    region: "제주",
    image: "",
    summary: "",
    date: todayValue(),
    course: [],
    address: "",
    parking: "",
    fee: "",
    operatingHours: "",
    content: [],
    nearbySpots: []
  };
}

function collectEditorArticle() {
  const title = form.elements.title.value.trim();
  const slug = createSlug(form.elements.slug.value || title);
  return {
    title,
    slug,
    category: form.elements.category.value,
    status: form.elements.status.value,
    region: form.elements.region.value.trim(),
    image: form.elements.image.value.trim(),
    summary: form.elements.summary.value.trim(),
    date: form.elements.date.value || todayValue(),
    course: fromLines(form.elements.course.value),
    address: form.elements.address.value.trim(),
    parking: form.elements.parking.value.trim(),
    fee: form.elements.fee.value.trim(),
    operatingHours: form.elements.operatingHours.value.trim(),
    content: fromLines(form.elements.content.value),
    nearbySpots: fromLines(form.elements.nearbySpots.value)
  };
}

function showMessage(text, type = "") {
  message.textContent = text;
  message.className = `message${type ? ` is-${type}` : ""}`;
}

function saveCurrentLocally() {
  const article = collectEditorArticle();
  if (!article.title) {
    showMessage("제목을 입력하세요.", "error");
    return false;
  }
  const duplicate = state.articles.find((item) => item.slug === article.slug && item.slug !== state.selectedSlug);
  if (duplicate) {
    showMessage("같은 slug가 이미 있습니다.", "error");
    return false;
  }

  const index = state.articles.findIndex((item) => item.slug === state.selectedSlug);
  if (index >= 0) {
    state.articles[index] = article;
  } else {
    state.articles.unshift(article);
  }
  state.selectedSlug = article.slug;
  persistLocal();
  fillEditor(article);
  showMessage("로컬에 저장했습니다.", "success");
  return true;
}

function exportArticles() {
  const source = buildArticlesSource(state.articles);
  const blob = new Blob([source], { type: "text/javascript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "articles.js";
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildArticlesSource(items) {
  return `export const categories = ${JSON.stringify(categories, null, 2)};\n\nexport const articles = ${JSON.stringify(items, null, 2)};\n`;
}

async function publishToGitHub() {
  if (!saveCurrentLocally()) return;
  const token = $("#adminToken").value.trim();
  sessionStorage.setItem(tokenKey, token);
  showMessage("GitHub 저장 요청 중입니다.");

  try {
    const response = await fetch("/api/admin-posts", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        categories,
        articles: state.articles
      })
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.message || payload.error || "저장에 실패했습니다.");
    localStorage.removeItem(storageKey);
    showMessage("GitHub에 저장했습니다. Cloudflare 배포가 곧 시작됩니다.", "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function bindEvents() {
  $("#searchInput").addEventListener("input", (event) => {
    state.query = event.target.value;
    render();
  });
  $("#categoryFilter").addEventListener("change", (event) => {
    state.category = event.target.value;
    render();
  });
  $("#statusFilter").addEventListener("change", (event) => {
    state.status = event.target.value;
    render();
  });
  table.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-slug]");
    if (!button) return;
    const article = state.articles.find((item) => item.slug === button.dataset.slug);
    if (article) fillEditor(article);
  });
  $("#newPostButton").addEventListener("click", () => {
    const article = createEmptyArticle();
    state.articles.unshift(article);
    persistLocal();
    fillEditor(article);
    showMessage("새 글 초안을 만들었습니다.", "success");
  });
  $("#duplicateButton").addEventListener("click", () => {
    const article = selectedArticle();
    if (!article) return;
    const copy = {
      ...clone(article),
      title: `${article.title} 복사본`,
      slug: `${article.slug}-copy-${Date.now()}`,
      status: "draft"
    };
    state.articles.unshift(copy);
    persistLocal();
    fillEditor(copy);
    showMessage("복제한 글을 임시저장으로 만들었습니다.", "success");
  });
  $("#saveLocalButton").addEventListener("click", saveCurrentLocally);
  $("#exportButton").addEventListener("click", exportArticles);
  $("#resetDraftsButton").addEventListener("click", () => {
    localStorage.removeItem(storageKey);
    state.articles = clone(articles);
    fillEditor(state.articles[0]);
    showMessage("로컬 변경을 초기화했습니다.", "success");
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    publishToGitHub();
  });
  form.elements.title.addEventListener("input", () => {
    if (!form.elements.slug.value.trim()) form.elements.slug.value = createSlug(form.elements.title.value);
  });
}

function init() {
  renderCategoryOptions();
  $("#adminToken").value = sessionStorage.getItem(tokenKey) || "";
  bindEvents();
  fillEditor(state.articles[0]);
}

init();

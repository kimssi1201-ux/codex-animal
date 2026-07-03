import {
  bookingChecks,
  categoryGroups,
  curationArticles,
  faqs,
  featuredArticle,
  footerLinks,
  latestArticles,
  placeArticles,
  todayKeywords
} from "./travel-content.js";

const $ = (selector) => document.querySelector(selector);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function metaLine(item) {
  return `<span>${escapeHtml(item.date)}</span><span>${escapeHtml(item.readTime)}</span>`;
}

function articleCard(item, variant = "standard") {
  const hasImage = Boolean(item.image);
  return `
    <article class="article-card ${variant}">
      ${hasImage ? `
        <a class="card-image" href="${escapeHtml(item.href)}" aria-label="${escapeHtml(item.title)}">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.alt || item.title)}" loading="lazy">
        </a>` : ""}
      <div class="card-content">
        <a class="category-label" href="/category/${encodeURIComponent(item.category)}/">${escapeHtml(item.category)}</a>
        <h3><a href="${escapeHtml(item.href)}">${escapeHtml(item.title)}</a></h3>
        ${item.excerpt ? `<p>${escapeHtml(item.excerpt)}</p>` : ""}
        <div class="article-meta">${metaLine(item)}</div>
      </div>
    </article>
  `;
}

function makeId(value) {
  return String(value)
    .toLowerCase()
    .replaceAll(/[^a-z0-9가-힣]+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

function renderTodayKeywords() {
  $("#todayKeywords").innerHTML = todayKeywords
    .map((keyword) => `<a href="${escapeHtml(keyword.href)}">${escapeHtml(keyword.label)}</a>`)
    .join("");
}

function renderHero() {
  $("#featuredArticle").innerHTML = `
    <a class="hero-image" href="${escapeHtml(featuredArticle.href)}">
      <img src="${escapeHtml(featuredArticle.image)}" alt="${escapeHtml(featuredArticle.alt)}">
    </a>
    <div class="hero-copy">
      <a class="category-label" href="/category/${encodeURIComponent(featuredArticle.category)}/">${escapeHtml(featuredArticle.category)}</a>
      <h2><a href="${escapeHtml(featuredArticle.href)}">${escapeHtml(featuredArticle.title)}</a></h2>
      <p>${escapeHtml(featuredArticle.excerpt)}</p>
      <div class="article-meta">${metaLine(featuredArticle)}</div>
    </div>
  `;

  $("#latestArticles").innerHTML = latestArticles
    .map((item) => `
      <article class="latest-item">
        <a class="category-label" href="/category/${encodeURIComponent(item.category)}/">${escapeHtml(item.category)}</a>
        <h3><a href="${escapeHtml(item.href)}">${escapeHtml(item.title)}</a></h3>
        <div class="article-meta">${metaLine(item)}</div>
      </article>
    `)
    .join("");
}

function renderPlaces() {
  $("#placesGrid").innerHTML = placeArticles
    .map((item) => articleCard(item))
    .join("");
}

function renderBooking() {
  $("#bookingCards").innerHTML = bookingChecks
    .map((item) => `
      <article class="booking-card">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.excerpt)}</p>
        <a href="${escapeHtml(item.href)}" aria-label="${escapeHtml(item.title)} ${escapeHtml(item.action)}">${escapeHtml(item.action)}</a>
      </article>
    `)
    .join("");
}

function renderCuration() {
  $("#curationList").innerHTML = curationArticles
    .map((item) => articleCard(item, "compact-card"))
    .join("");
}

function renderCategories() {
  $("#categoryGroups").innerHTML = categoryGroups
    .map((group) => {
      const titleId = `category-${makeId(group.title)}`;
      return `
      <section class="category-box" aria-labelledby="${escapeHtml(titleId)}">
        <h3 id="${escapeHtml(titleId)}">${escapeHtml(group.title)}</h3>
        <p>${escapeHtml(group.description)}</p>
        <div class="tag-links">
          ${group.links.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join("")}
        </div>
      </section>
    `;
    })
    .join("");
}

function renderFaq() {
  $("#faqList").innerHTML = faqs
    .map((faq, index) => `
      <details class="faq-item" ${index === 0 ? "open" : ""}>
        <summary>${escapeHtml(faq.question)}</summary>
        <p>${escapeHtml(faq.answer)}</p>
      </details>
    `)
    .join("");
}

function renderFooterList(id, links) {
  $(id).innerHTML = links
    .map((link) => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`)
    .join("");
}

function renderFooter() {
  renderFooterList("#footerBooking", footerLinks.booking);
  renderFooterList("#footerHub", footerLinks.hub);
  renderFooterList("#footerCategories", footerLinks.categories);
  renderFooterList("#footerPopular", footerLinks.popular);
  renderFooterList("#footerLanguages", footerLinks.languages);
}

function bindMenu() {
  const button = $(".menu-button");
  const nav = $("#siteNav");
  button.addEventListener("click", () => {
    const isOpen = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isOpen));
    nav.classList.toggle("is-open", !isOpen);
  });
}

function renderJsonLd() {
  const items = [featuredArticle, ...latestArticles, ...placeArticles, ...curationArticles].map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: new URL(item.href, "https://www.moneyarchive.kr/").href,
    name: item.title
  }));
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items
  });
  document.head.append(script);
}

renderTodayKeywords();
renderHero();
renderPlaces();
renderBooking();
renderCuration();
renderCategories();
renderFaq();
renderFooter();
bindMenu();
renderJsonLd();

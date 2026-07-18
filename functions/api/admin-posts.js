const DEFAULT_OWNER = "kimssi1201-ux";
const DEFAULT_REPO = "codex-animal";
const DEFAULT_BRANCH = "main";
const ARTICLES_PATH = "jeju-travel-news/assets/articles.js";
const DEFAULT_TIMEOUT_MS = 10000;
const MAX_BODY_LENGTH = 2 * 1024 * 1024;

function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-cache, max-age=0");
  return new Response(JSON.stringify(data), {
    status: init.status || 200,
    headers
  });
}

function tokenFromRequest(request) {
  const header = request.headers.get("authorization") || "";
  if (header.toLowerCase().startsWith("bearer ")) return header.slice(7).trim();
  return request.headers.get("x-admin-token") || "";
}

function requireConfig(env, request) {
  const adminToken = (env.ADMIN_TOKEN || "").trim();
  if (!adminToken) {
    return {
      ok: false,
      response: json({
        ok: false,
        configured: false,
        message: "Cloudflare 환경변수 ADMIN_TOKEN이 필요합니다."
      }, { status: 501 })
    };
  }

  if (tokenFromRequest(request) !== adminToken) {
    return {
      ok: false,
      response: json({ ok: false, message: "관리 토큰이 올바르지 않습니다." }, { status: 401 })
    };
  }

  const githubToken = (env.GITHUB_TOKEN || env.GH_TOKEN || "").trim();
  if (!githubToken) {
    return {
      ok: false,
      response: json({
        ok: false,
        configured: false,
        message: "Cloudflare 환경변수 GITHUB_TOKEN이 필요합니다."
      }, { status: 501 })
    };
  }

  return {
    ok: true,
    githubToken,
    owner: env.GITHUB_OWNER || DEFAULT_OWNER,
    repo: env.GITHUB_REPO || DEFAULT_REPO,
    branch: env.GITHUB_BRANCH || DEFAULT_BRANCH
  };
}

function sanitizeString(value, fallback = "", maxLength = 2000) {
  return String(value || fallback).trim().slice(0, maxLength);
}

function sanitizeList(value, maxItems = 50, maxLength = 2000) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, maxItems).map((item) => sanitizeString(item, "", maxLength)).filter(Boolean);
}

function sanitizeArticle(value = {}) {
  const title = sanitizeString(value.title, "", 200);
  const slug = sanitizeString(value.slug, "", 120)
    .toLowerCase()
    .replace(/[^a-z0-9가-힣-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  const status = ["published", "scheduled", "draft"].includes(value.status) ? value.status : "published";

  if (!title || !slug) return null;

  return {
    title,
    slug,
    category: sanitizeString(value.category, "가볼 만한 곳"),
    status,
    region: sanitizeString(value.region),
    image: sanitizeString(value.image),
    summary: sanitizeString(value.summary),
    date: sanitizeString(value.date),
    course: sanitizeList(value.course),
    address: sanitizeString(value.address),
    parking: sanitizeString(value.parking),
    fee: sanitizeString(value.fee),
    operatingHours: sanitizeString(value.operatingHours),
    content: sanitizeList(value.content),
    nearbySpots: sanitizeList(value.nearbySpots)
  };
}

function sanitizePayload(payload = {}) {
  const categories = sanitizeList(payload.categories, 30, 80);
  const articles = Array.isArray(payload.articles)
    ? payload.articles.slice(0, 100).map(sanitizeArticle).filter(Boolean)
    : [];
  const unique = new Set();

  const deduped = articles.filter((article) => {
    if (unique.has(article.slug)) return false;
    unique.add(article.slug);
    return true;
  });

  if (!categories.length || !deduped.length) {
    throw new Error("저장할 카테고리와 글 데이터가 필요합니다.");
  }

  return { categories, articles: deduped };
}

function buildArticlesSource(payload) {
  return `export const categories = ${JSON.stringify(payload.categories, null, 2)};\n\nexport const articles = ${JSON.stringify(payload.articles, null, 2)};\n`;
}

function utf8Base64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(index, index + chunkSize));
  }
  return btoa(binary);
}

async function githubJson(url, token, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        "x-github-api-version": "2022-11-28",
        "user-agent": "moneyarchive-admin",
        ...(init.headers || {})
      }
    });
  } finally {
    clearTimeout(timeout);
  }
  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch (error) {
    payload = { message: text };
  }
  if (!response.ok) {
    throw new Error(payload.message || `GitHub 요청 실패: HTTP ${response.status}`);
  }
  return payload;
}

export async function onRequestPost({ request, env }) {
  const config = requireConfig(env, request);
  if (!config.ok) return config.response;

  let payload;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_LENGTH) throw new Error("요청 본문이 너무 큽니다.");
    payload = sanitizePayload(JSON.parse(text));
  } catch (error) {
    return json({ ok: false, message: error.message }, { status: 400 });
  }

  const content = buildArticlesSource(payload);
  const encodedPath = ARTICLES_PATH.split("/").map(encodeURIComponent).join("/");
  const baseUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${encodedPath}`;

  try {
    const current = await githubJson(`${baseUrl}?ref=${encodeURIComponent(config.branch)}`, config.githubToken);
    const saved = await githubJson(baseUrl, config.githubToken, {
      method: "PUT",
      body: JSON.stringify({
        message: `Update travel posts from admin (${new Date().toISOString()})`,
        content: utf8Base64(content),
        sha: current.sha,
        branch: config.branch
      })
    });

    return json({
      ok: true,
      path: ARTICLES_PATH,
      commit: saved.commit?.sha || "",
      message: "포스트 데이터를 GitHub에 저장했습니다."
    });
  } catch (error) {
    return json({ ok: false, message: error.message }, { status: 502 });
  }
}

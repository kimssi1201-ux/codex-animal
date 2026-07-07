const DEFAULT_TIMEOUT_MS = 9000;

function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", init.cacheControl || "public, max-age=300, s-maxage=900");
  return new Response(JSON.stringify(data), {
    status: init.status || 200,
    headers
  });
}

function getConfig(env = {}) {
  const apiUrl = (
    env.MYREALTRIP_API_URL ||
    env.MRT_API_URL ||
    ""
  ).trim();
  const apiBase = (
    env.MYREALTRIP_API_BASE ||
    env.MRT_API_BASE ||
    ""
  ).trim();
  const apiKey = (
    env.MYREALTRIP_API_KEY ||
    env.MYREALTRIP_ACCESS_TOKEN ||
    env.MRT_API_KEY ||
    env.MRT_ACCESS_TOKEN ||
    ""
  ).trim();
  const partnerId = (
    env.MYREALTRIP_PARTNER_ID ||
    env.MRT_PARTNER_ID ||
    ""
  ).trim();

  return { apiUrl, apiBase, apiKey, partnerId };
}

function buildTargetUrl(config, requestUrl) {
  const keyword = requestUrl.searchParams.get("keyword") || "제주";
  const type = requestUrl.searchParams.get("type") || "tour";
  const page = requestUrl.searchParams.get("page") || "1";
  const limit = requestUrl.searchParams.get("limit") || "12";

  const base = config.apiUrl || (config.apiBase ? `${config.apiBase.replace(/\/$/, "")}/search` : "");
  if (!base) return "";

  const target = new URL(base);
  if (!target.searchParams.has("keyword")) target.searchParams.set("keyword", keyword);
  if (!target.searchParams.has("q")) target.searchParams.set("q", keyword);
  if (!target.searchParams.has("type")) target.searchParams.set("type", type);
  if (!target.searchParams.has("page")) target.searchParams.set("page", page);
  if (!target.searchParams.has("limit")) target.searchParams.set("limit", limit);
  return target.href;
}

function normalizeUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const normalized = text.startsWith("//") ? `https:${text}` : text;
  if (normalized.startsWith("http://")) return normalized.replace(/^http:\/\//i, "https://");
  if (!/^https:\/\//i.test(normalized)) return "";
  try {
    return new URL(normalized).href;
  } catch (error) {
    return "";
  }
}

function normalizeImage(value) {
  return normalizeUrl(value);
}

function asArray(payload) {
  const candidates = [
    payload?.items,
    payload?.products,
    payload?.results,
    payload?.data?.items,
    payload?.data?.products,
    payload?.data?.results,
    payload?.data
  ];
  const list = candidates.find(Array.isArray);
  return list || [];
}

function normalizeItem(item = {}) {
  const image = normalizeImage(
    item.image ||
    item.imageUrl ||
    item.thumbnail ||
    item.thumbnailUrl ||
    item.mainImage ||
    item.coverImage ||
    item?.images?.[0]?.url ||
    item?.images?.[0]
  );

  return {
    id: String(item.id || item.productId || item.offerId || item.uuid || ""),
    title: String(item.title || item.name || item.productName || item.displayName || "제주 여행 상품"),
    category: String(item.category || item.type || item.productType || item.kind || "여행 상품"),
    priceText: String(item.priceText || item.displayPrice || item.priceLabel || item.salePrice || item.price || "가격 확인"),
    image,
    url: normalizeUrl(item.url || item.link || item.deepLink || item.webUrl || item.shareUrl)
  };
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "content-type"
    }
  });
}

export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const config = getConfig(context.env || {});
  const targetUrl = buildTargetUrl(config, requestUrl);

  if (!targetUrl || !config.apiKey) {
    return json({
      ok: false,
      configured: false,
      items: [],
      message: "MYREALTRIP_API_URL 또는 MYREALTRIP_API_KEY가 설정되지 않았습니다."
    }, { cacheControl: "no-store" });
  }

  try {
    const headers = new Headers({ accept: "application/json" });
    headers.set("authorization", `Bearer ${config.apiKey}`);
    headers.set("x-api-key", config.apiKey);
    if (config.partnerId) headers.set("x-partner-id", config.partnerId);

    const response = await fetchWithTimeout(targetUrl, { headers });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.message || `MyRealTrip HTTP ${response.status}`);
    }

    const items = asArray(payload)
      .map(normalizeItem)
      .filter((item) => item.title)
      .slice(0, 12);

    return json({
      ok: true,
      configured: true,
      items,
      totalCount: items.length,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    return json({
      ok: false,
      configured: true,
      items: [],
      message: error instanceof Error ? error.message : "마이리얼트립 정보를 불러오지 못했습니다."
    }, { status: 502, cacheControl: "no-store" });
  }
}

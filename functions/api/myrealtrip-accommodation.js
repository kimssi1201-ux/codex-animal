const DEFAULT_TIMEOUT_MS = 9000;
const DEFAULT_REGION_AUTOCOMPLETE_PATH = "/v1/products/accommodation/region-autocomplete";
const DEFAULT_SEARCH_PATH = "/v1/products/accommodation/search";

function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", init.cacheControl || "public, max-age=120, s-maxage=300");
  return new Response(JSON.stringify(data), {
    status: init.status || 200,
    headers
  });
}

function getConfig(env = {}) {
  const apiBase = (
    env.MYREALTRIP_ACCOMMODATION_API_BASE ||
    env.MYREALTRIP_API_BASE ||
    env.MRT_ACCOMMODATION_API_BASE ||
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
  const regionAutocompletePath = (
    env.MYREALTRIP_ACCOMMODATION_REGION_AUTOCOMPLETE_PATH ||
    env.MRT_ACCOMMODATION_REGION_AUTOCOMPLETE_PATH ||
    DEFAULT_REGION_AUTOCOMPLETE_PATH
  ).trim();
  const regionAutocompleteUrl = (
    env.MYREALTRIP_ACCOMMODATION_REGION_AUTOCOMPLETE_URL ||
    env.MRT_ACCOMMODATION_REGION_AUTOCOMPLETE_URL ||
    ""
  ).trim();
  const searchPath = (
    env.MYREALTRIP_ACCOMMODATION_SEARCH_PATH ||
    env.MRT_ACCOMMODATION_SEARCH_PATH ||
    DEFAULT_SEARCH_PATH
  ).trim();
  const searchUrl = (
    env.MYREALTRIP_ACCOMMODATION_SEARCH_URL ||
    env.MRT_ACCOMMODATION_SEARCH_URL ||
    ""
  ).trim();

  return { apiBase, apiKey, partnerId, regionAutocompletePath, regionAutocompleteUrl, searchPath, searchUrl };
}

function absoluteUrl(value) {
  if (!value) return "";
  try {
    return new URL(value).href;
  } catch (error) {
    return "";
  }
}

function targetUrl(apiBase, path) {
  if (!apiBase) return "";
  try {
    return new URL(path, apiBase.endsWith("/") ? apiBase : `${apiBase}/`).href;
  } catch (error) {
    return "";
  }
}

function asArray(payload) {
  const candidates = [
    payload?.items,
    payload?.regions,
    payload?.products,
    payload?.accommodations,
    payload?.hotels,
    payload?.results,
    payload?.data?.items,
    payload?.data?.regions,
    payload?.data?.products,
    payload?.data?.accommodations,
    payload?.data?.hotels,
    payload?.data?.results,
    payload?.data
  ];
  return candidates.find(Array.isArray) || [];
}

function normalizeRegion(item = {}) {
  const regionId = String(item.regionId || item.id || item.value || item.code || "");
  const name = String(item.name || item.regionName || item.displayName || item.title || "");
  const country = String(item.countryName || item.country || "");
  const label = [country, name].filter(Boolean).join(" ") || name || regionId || "지역";
  return { regionId, name: name || label, country, label };
}

function normalizeAccommodation(item = {}) {
  const image = (
    item.image ||
    item.imageUrl ||
    item.thumbnail ||
    item.thumbnailUrl ||
    item.mainImage ||
    item.coverImage ||
    item?.images?.[0]?.url ||
    item?.images?.[0] ||
    ""
  );
  const price = item.priceText || item.displayPrice || item.priceLabel || item.salePrice || item.price || item.minPrice || "가격 확인";
  return {
    id: String(item.id || item.productId || item.accommodationId || item.hotelId || ""),
    title: String(item.title || item.name || item.productName || item.hotelName || "숙소 상품"),
    region: String(item.regionName || item.region || item.location || ""),
    priceText: String(price),
    image: String(image),
    rating: String(item.rating || item.reviewScore || item.starRating || ""),
    url: String(item.url || item.link || item.deepLink || item.webUrl || item.shareUrl || "")
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

function requestHeaders(config) {
  const headers = new Headers({ accept: "application/json", "content-type": "application/json" });
  headers.set("authorization", `Bearer ${config.apiKey}`);
  headers.set("x-api-key", config.apiKey);
  if (config.partnerId) headers.set("x-partner-id", config.partnerId);
  return headers;
}

async function readBody(request) {
  try {
    return await request.json();
  } catch (error) {
    return {};
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "content-type"
    }
  });
}

export async function onRequestPost(context) {
  const requestUrl = new URL(context.request.url);
  const config = getConfig(context.env || {});
  const action = requestUrl.searchParams.get("action") || "region-autocomplete";
  const body = await readBody(context.request);
  const isSearch = action === "search";
  const path = isSearch ? config.searchPath : config.regionAutocompletePath;
  const explicitUrl = isSearch ? config.searchUrl : config.regionAutocompleteUrl;
  const url = absoluteUrl(explicitUrl) || targetUrl(config.apiBase, path);

  if (!url || !config.apiKey) {
    return json({
      ok: false,
      configured: false,
      action,
      items: [],
      message: "MYREALTRIP_API_BASE 또는 숙소 엔드포인트 URL과 MYREALTRIP_API_KEY가 설정되면 숙소 API를 호출합니다."
    }, { cacheControl: "no-store" });
  }

  try {
    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: requestHeaders(config),
      body: JSON.stringify(body)
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.message || `MyRealTrip accommodation HTTP ${response.status}`);
    }

    const items = isSearch
      ? asArray(payload).map(normalizeAccommodation).filter((item) => item.title)
      : asArray(payload).map(normalizeRegion).filter((item) => item.regionId || item.name);

    return json({ ok: true, configured: true, action, items, raw: payload });
  } catch (error) {
    return json({
      ok: false,
      configured: true,
      action,
      items: [],
      message: error instanceof Error ? error.message : "숙소 정보를 불러오지 못했습니다."
    }, { status: 502, cacheControl: "no-store" });
  }
}

export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const keyword = requestUrl.searchParams.get("keyword") || "제주";
  const request = new Request(context.request.url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ keyword, query: keyword })
  });
  return onRequestPost({ ...context, request });
}

import { rankAffiliateItems } from "../lib/affiliate-match.js";

const DEFAULT_TIMEOUT_MS = 9000;
const DEFAULT_MCP_URL = "https://mcp-servers.myrealtrip.com/mcp";
const DEFAULT_REGION_AUTOCOMPLETE_PATH = "/v1/products/accommodation/region-autocomplete";
const DEFAULT_SEARCH_PATH = "/v1/products/accommodation/search";
const MAX_BODY_LENGTH = 32768;
const MAX_TEXT_LENGTH = 80;
const MAX_PAGE = 20;

function boundedText(value, fallback = "", maxLength = MAX_TEXT_LENGTH) {
  const text = String(value ?? fallback).trim();
  return text.slice(0, maxLength);
}

function boundedInteger(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(number)));
}

function boundedDate(value, fallback = "") {
  const date = boundedText(value, fallback, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : fallback;
}

function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", init.cacheControl || "no-store");
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
  const mcpUrl = (
    env.MYREALTRIP_MCP_URL ||
    env.MRT_MCP_URL ||
    DEFAULT_MCP_URL
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

  return { apiBase, apiKey, mcpUrl, partnerId, regionAutocompletePath, regionAutocompleteUrl, searchPath, searchUrl };
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

function firstMappedImage(value, allowGenericUrl = false, seen = new WeakSet()) {
  if (!value) return "";
  if (typeof value === "string") return allowGenericUrl ? normalizeUrl(value) : "";
  if (typeof value !== "object") return "";
  if (seen.has(value)) return "";
  seen.add(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = firstMappedImage(item, allowGenericUrl, seen);
      if (found) return found;
    }
    return "";
  }

  if (value.type === "Image") {
    const image = normalizeUrl(value.src || value.url || value.imageUrl || value.thumbnailUrl || "");
    if (image) return image;
  }

  const directKeys = [
    "image",
    "imageUrl",
    "thumbnail",
    "thumbnailUrl",
    "mainImage",
    "mainImageUrl",
    "coverImage",
    "coverImageUrl",
    "representativeImage",
    "representativeImageUrl",
    "hotelImage",
    "hotelImageUrl",
    "accommodationImage",
    "accommodationImageUrl",
    "photo",
    "photoUrl",
    "picture",
    "pictureUrl"
  ];

  for (const key of directKeys) {
    const found = firstMappedImage(value[key], true, seen);
    if (found) return found;
  }

  if (allowGenericUrl) {
    const generic = normalizeUrl(value.url || value.src || value.href || "");
    if (generic) return generic;
  }

  for (const [key, child] of Object.entries(value)) {
    if (/(image|thumbnail|photo|picture|cover|media|gallery)/i.test(key)) {
      const found = firstMappedImage(child, true, seen);
      if (found) return found;
    }
  }

  return "";
}

function asArray(payload) {
  const candidates = [
    payload?.items,
    payload?.regions,
    payload?.stays,
    payload?.products,
    payload?.accommodations,
    payload?.hotels,
    payload?.results,
    payload?.list,
    payload?.productList,
    payload?.result?.items,
    payload?.result?.regions,
    payload?.result?.stays,
    payload?.result?.products,
    payload?.result?.accommodations,
    payload?.result?.hotels,
    payload?.result?.results,
    payload?.result?.data?.items,
    payload?.result?.data?.regions,
    payload?.result?.data?.stays,
    payload?.result?.data?.products,
    payload?.result?.data?.accommodations,
    payload?.result?.data?.hotels,
    payload?.result?.data?.results,
    payload?.body?.items,
    payload?.body?.products,
    payload?.content?.items,
    payload?.content?.products,
    payload?.data?.items,
    payload?.data?.regions,
    payload?.data?.stays,
    payload?.data?.products,
    payload?.data?.accommodations,
    payload?.data?.hotels,
    payload?.data?.results,
    payload?.data?.list,
    payload?.data?.productList,
    payload?.data?.content,
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
  const image = firstMappedImage(item, false);
  const price = item.priceText || item.displayPrice || item.priceLabel || item.salePrice || item.price || item.minPrice || "가격 확인";
  return {
    id: String(item.id || item.gid || item.productId || item.accommodationId || item.hotelId || ""),
    title: String(item.title || item.name || item.productName || item.hotelName || "숙소 상품"),
    category: "숙소",
    region: String(item.description || item.regionName || item.region || item.location || ""),
    description: String(item.description || ""),
    priceText: String(price),
    image: String(image || normalizeUrl(item.thumbnailUrl || "")),
    rating: String(item.rating || item.reviewScore || item.starRating || ""),
    url: String(normalizeUrl(item.url || item.link || item.deepLink || item.webUrl || item.shareUrl || ""))
  };
}

function parseMcpContent(payload) {
  const content = payload?.result?.content || [];
  const text = content.find((item) => item?.type === "text")?.text || "";
  const structured = payload?.result?.structuredContent || {};
  if (!text) return structured || payload?.result || {};
  try {
    return { ...structured, ...JSON.parse(text) };
  } catch (error) {
    return { ...structured, text };
  }
}

function firstImage(node) {
  if (!node || typeof node !== "object") return "";
  const mapped = firstMappedImage(node, false);
  if (mapped) return mapped;
  for (const child of node.children || []) {
    const found = firstImage(child);
    if (found) return found;
  }
  return "";
}

function textValues(node, values = []) {
  if (!node || typeof node !== "object") return values;
  if (node.type === "Text" && node.value) values.push(String(node.value));
  for (const child of node.children || []) textValues(child, values);
  return values;
}

function firstOpenUrl(node) {
  if (!node || typeof node !== "object") return "";
  const direct = node.onClickAction?.url || node.onClickAction?.payload?.target?.url || "";
  if (direct) return String(direct);
  for (const child of node.children || []) {
    const found = firstOpenUrl(child);
    if (found) return found;
  }
  return "";
}

function productsFromWidget(widget = {}) {
  const children = Array.isArray(widget.children) ? widget.children : [];
  return children
    .map((item) => {
      const texts = textValues(item);
      const price = texts.find((value) => /[\d,]+원|₩\s*[\d,]+|price/i.test(value)) || "";
      const rating = texts.find((value) => /^[\u2605\u2b50]\s*\d/.test(value) || /^\d(?:\.\d)?\s*\(\d+\)$/.test(value)) || "";
      const title = texts.find((value) => value && value !== price && value !== rating) || "숙소 상품";
      return {
        id: "",
        title,
        category: "숙소",
        region: "마이리얼트립 숙소",
        description: "",
        priceText: price || "가격 확인",
        image: firstImage(item),
        rating,
        url: normalizeUrl(firstOpenUrl(item))
      };
    })
    .filter((item) => item.title && item.url && !/검색 결과 없음|no results?/i.test(item.title));
}

function normalizeMcpAccommodations(parsed = {}) {
  const widgetItems = productsFromWidget(parsed.widget);
  const structuredItems = asArray(parsed).map(normalizeAccommodation).filter((item) => item.title);
  if (!structuredItems.length) return widgetItems;
  return structuredItems.map((item, index) => ({
    ...item,
    image: item.image || widgetItems[index]?.image || "",
    url: item.url || widgetItems[index]?.url || "",
    priceText: item.priceText || widgetItems[index]?.priceText || "가격 확인",
    rating: item.rating || widgetItems[index]?.rating || ""
  }));
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function defaultStayDates() {
  const checkIn = new Date();
  checkIn.setUTCDate(checkIn.getUTCDate() + 7);
  const checkOut = new Date(checkIn);
  checkOut.setUTCDate(checkOut.getUTCDate() + 1);
  return { checkIn: isoDate(checkIn), checkOut: isoDate(checkOut) };
}

function accommodationMatchContext(body = {}) {
  const region = [body.region, body.regionName, body.keyword || body.query]
    .map((value) => boundedText(value, "", 80))
    .filter(Boolean)
    .join(" ");
  return {
    title: boundedText(body.title, "", 140),
    spot: boundedText(body.spot, "", 80),
    category: "숙소",
    region: boundedText(region, "", 240),
    nearby: boundedText(body.nearby, "", 240),
    scope: boundedText(body.scope, "home", 20)
  };
}

async function callMcpTool(config, name, args) {
  const response = await fetchWithTimeout(config.mcpUrl, {
    method: "POST",
    headers: {
      accept: "application/json, text/event-stream",
      "content-type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: { name, arguments: args }
    })
  });
  const payload = await response.json();
  if (!response.ok || payload?.error) {
    throw new Error(payload?.error?.message || `MyRealTrip MCP HTTP ${response.status}`);
  }
  return parseMcpContent(payload);
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
    const text = await request.text();
    if (text.length > MAX_BODY_LENGTH) return null;
    const body = JSON.parse(text);
    return body && typeof body === "object" && !Array.isArray(body) ? body : {};
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
  const action = boundedText(requestUrl.searchParams.get("action"), "region-autocomplete", 40);
  if (!["region-autocomplete", "search"].includes(action)) {
    return json({ ok: false, error: "지원하지 않는 숙소 조회 방식입니다." }, { status: 400, cacheControl: "no-store" });
  }
  const body = await readBody(context.request);
  if (body === null) {
    return json({ ok: false, error: "요청 본문이 너무 큽니다." }, { status: 413, cacheControl: "no-store" });
  }
  const isSearch = action === "search";
  const path = isSearch ? config.searchPath : config.regionAutocompletePath;
  const explicitUrl = isSearch ? config.searchUrl : config.regionAutocompleteUrl;
  const url = absoluteUrl(explicitUrl) || targetUrl(config.apiBase, path);

  if ((!url || !config.apiKey) && config.mcpUrl) {
    try {
      if (!isSearch) {
        const keyword = boundedText(body.keyword || body.query, "제주");
        return json({
          ok: true,
          configured: true,
          mcp: true,
          action,
          items: [{ regionId: keyword, name: keyword, country: "대한민국", label: keyword }]
        });
      }

      const keyword = boundedText(body.keyword || body.query || body.regionName || body.regionId, "제주");
      const defaults = defaultStayDates();
      const checkIn = boundedDate(body.checkIn) || defaults.checkIn;
      const checkOut = boundedDate(body.checkOut) || defaults.checkOut;
      const limit = boundedInteger(body.limit, 4, 1, 12);
      const parsed = await callMcpTool(config, "searchStays", {
        keyword,
        checkIn,
        checkOut,
        adultCount: boundedInteger(body.adults || body.guests || body.adultCount, 2, 1, 9),
        childCount: boundedInteger(body.children || body.childCount, 0, 0, 9),
        isDomestic: true,
        page: boundedInteger(body.page, 1, 1, MAX_PAGE),
        size: Math.max(limit, 12)
      });
      const contextMatch = accommodationMatchContext(body);
      const items = rankAffiliateItems(normalizeMcpAccommodations(parsed), contextMatch, {
        limit,
        allowUnmatched: contextMatch.scope === "home"
      });
      return json({
        ok: true,
        configured: true,
        mcp: true,
        action,
        matched: items.length > 0,
        searchDates: { checkIn, checkOut },
        items
      });
    } catch (error) {
      return json({
        ok: false,
        configured: true,
        mcp: true,
        action,
        items: [],
        message: error instanceof Error ? error.message : "숙소 정보를 불러오지 못했습니다."
      }, { status: 502, cacheControl: "no-store" });
    }
  }

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

    const normalizedItems = isSearch
      ? asArray(payload).map(normalizeAccommodation).filter((item) => item.title)
      : asArray(payload).map(normalizeRegion).filter((item) => item.regionId || item.name);
    const items = isSearch
      ? rankAffiliateItems(normalizedItems, accommodationMatchContext(body), {
          limit: boundedInteger(body.limit, 4, 1, 12),
          allowUnmatched: body.scope === "home"
        })
      : normalizedItems;

    return json({ ok: true, configured: true, action, matched: isSearch ? items.length > 0 : undefined, items });
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
  const keyword = boundedText(requestUrl.searchParams.get("keyword"), "제주");
  const request = new Request(context.request.url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ keyword, query: keyword })
  });
  return onRequestPost({ ...context, request });
}

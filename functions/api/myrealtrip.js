const DEFAULT_TIMEOUT_MS = 9000;
const DEFAULT_MCP_URL = "https://mcp-servers.myrealtrip.com/mcp";

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
  const affiliateUrl = (
    env.MYREALTRIP_AFFILIATE_URL ||
    env.MRT_AFFILIATE_URL ||
    ""
  ).trim();
  const tourUrl = (
    env.MYREALTRIP_TOUR_URL ||
    env.MRT_TOUR_URL ||
    ""
  ).trim();
  const ticketUrl = (
    env.MYREALTRIP_TICKET_URL ||
    env.MRT_TICKET_URL ||
    ""
  ).trim();
  const hotelUrl = (
    env.MYREALTRIP_HOTEL_URL ||
    env.MRT_HOTEL_URL ||
    ""
  ).trim();

  return { apiUrl, apiBase, apiKey, mcpUrl, partnerId, affiliateUrl, tourUrl, ticketUrl, hotelUrl };
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

function firstMappedImage(value, allowGenericUrl = false, seen = new WeakSet()) {
  if (!value) return "";
  if (typeof value === "string") return allowGenericUrl ? normalizeImage(value) : "";
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
    const image = normalizeImage(value.src || value.url || value.imageUrl || value.thumbnailUrl || "");
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
    "productImage",
    "productImageUrl",
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
    const generic = normalizeImage(value.url || value.src || value.href || "");
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

function parseMcpContent(payload) {
  const content = payload?.result?.content || [];
  const text = content.find((item) => item?.type === "text")?.text || "";
  if (!text) return payload?.result?.structuredContent || payload?.result || {};
  try {
    return JSON.parse(text);
  } catch (error) {
    return { text };
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
      const title = texts.find((value) => value && value !== price && value !== rating) || "제주 여행 상품";
      return {
        id: "",
        title,
        category: rating || "마이리얼트립",
        priceText: price || "가격 확인",
        image: firstImage(item),
        url: normalizeUrl(firstOpenUrl(item))
      };
    })
    .filter((item) => item.title);
}

async function mcpSearchItems(config, keyword, limit = 6) {
  if (!config.mcpUrl) return [];
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
      params: {
        name: "searchTnas",
        arguments: {
          query: keyword || "제주 액티비티",
          page: 1,
          perPage: limit
        }
      }
    })
  });
  const payload = await response.json();
  if (!response.ok || payload?.error) {
    throw new Error(payload?.error?.message || `MyRealTrip MCP HTTP ${response.status}`);
  }
  const parsed = parseMcpContent(payload);
  const explicitItems = asArray(parsed).map(normalizeItem).filter((item) => item.title);
  if (explicitItems.length) return explicitItems.slice(0, limit);
  return productsFromWidget(parsed.widget).slice(0, limit);
}

function addKeyword(value, keyword) {
  const normalized = normalizeUrl(value);
  if (!normalized) return "";
  try {
    const url = new URL(normalized);
    if (!url.searchParams.has("keyword") && !url.searchParams.has("q")) {
      url.searchParams.set("keyword", keyword || "제주");
    }
    return url.href;
  } catch (error) {
    return normalized;
  }
}

function affiliateItems(config, keyword) {
  const fallback = config.affiliateUrl;
  const candidates = [
    {
      id: "mrt-jeju-tour",
      title: "제주 투어·티켓 보기",
      category: "마이리얼트립",
      priceText: "제휴 상품 확인",
      image: "https://tong.visitkorea.or.kr/cms/resource/75/3400775_image2_1.jpg",
      url: config.tourUrl || fallback
    },
    {
      id: "mrt-jeju-activity",
      title: "제주 액티비티 예약",
      category: "마이리얼트립",
      priceText: "제휴 상품 확인",
      image: "https://tong.visitkorea.or.kr/cms/resource/81/3037781_image2_1.jpg",
      url: config.ticketUrl || fallback
    },
    {
      id: "mrt-jeju-stay",
      title: "제주 숙소 둘러보기",
      category: "마이리얼트립",
      priceText: "제휴 상품 확인",
      image: "https://tong.visitkorea.or.kr/cms/resource/36/3421436_image2_1.jpg",
      url: config.hotelUrl || fallback
    }
  ];

  return candidates
    .map((item) => ({ ...item, url: addKeyword(item.url, keyword) }))
    .filter((item) => item.url);
}

function asArray(payload) {
  const candidates = [
    payload?.items,
    payload?.products,
    payload?.results,
    payload?.list,
    payload?.productList,
    payload?.result?.items,
    payload?.result?.products,
    payload?.result?.results,
    payload?.result?.data?.items,
    payload?.result?.data?.products,
    payload?.result?.data?.results,
    payload?.body?.items,
    payload?.body?.products,
    payload?.content?.items,
    payload?.content?.products,
    payload?.data?.items,
    payload?.data?.products,
    payload?.data?.results,
    payload?.data?.list,
    payload?.data?.productList,
    payload?.data?.content,
    payload?.data
  ];
  const list = candidates.find(Array.isArray);
  return list || [];
}

function normalizeItem(item = {}) {
  const image = firstMappedImage(item, false);

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
  const keyword = requestUrl.searchParams.get("keyword") || "제주";
  const fallbackAffiliateItems = affiliateItems(config, keyword);

  if (!targetUrl || !config.apiKey) {
    try {
      const mcpItems = await mcpSearchItems(config, `${keyword} 액티비티`, Number(requestUrl.searchParams.get("limit") || 6));
      if (mcpItems.length) {
        return json({
          ok: true,
          configured: true,
          mcp: true,
          items: mcpItems,
          totalCount: mcpItems.length,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      // Continue to affiliate fallback or configuration guidance.
    }

    if (fallbackAffiliateItems.length) {
      return json({
        ok: true,
        configured: true,
        affiliateOnly: true,
        items: fallbackAffiliateItems,
        totalCount: fallbackAffiliateItems.length,
        updatedAt: new Date().toISOString()
      });
    }

    return json({
      ok: false,
      configured: false,
      items: [],
      message: "MYREALTRIP_API_URL 또는 MYREALTRIP_API_KEY, MYREALTRIP_AFFILIATE_URL이 설정되지 않았습니다."
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
    try {
      const mcpItems = await mcpSearchItems(config, `${keyword} 액티비티`, Number(requestUrl.searchParams.get("limit") || 6));
      if (mcpItems.length) {
        return json({
          ok: true,
          configured: true,
          mcp: true,
          items: mcpItems,
          totalCount: mcpItems.length,
          message: "API 응답 실패로 MCP 상품 카드를 표시합니다.",
          updatedAt: new Date().toISOString()
        });
      }
    } catch (mcpError) {
      // Continue to affiliate fallback or error response.
    }

    if (fallbackAffiliateItems.length) {
      return json({
        ok: true,
        configured: true,
        affiliateOnly: true,
        items: fallbackAffiliateItems,
        totalCount: fallbackAffiliateItems.length,
        message: "API 응답 실패로 제휴 URL 카드를 표시합니다.",
        updatedAt: new Date().toISOString()
      });
    }

    return json({
      ok: false,
      configured: true,
      items: [],
      message: error instanceof Error ? error.message : "마이리얼트립 정보를 불러오지 못했습니다."
    }, { status: 502, cacheControl: "no-store" });
  }
}

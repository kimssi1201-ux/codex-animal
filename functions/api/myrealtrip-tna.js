const DEFAULT_TIMEOUT_MS = 9000;
const DEFAULT_MCP_URL = "https://mcp-servers.myrealtrip.com/mcp";
const DEFAULT_CATEGORIES_PATH = "/v1/products/tna/categories";
const DEFAULT_SEARCH_PATH = "/v1/products/tna/search";
const DEFAULT_DETAIL_PATH = "/v1/products/tna/detail";

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
    env.MYREALTRIP_TNA_API_BASE ||
    env.MYREALTRIP_API_BASE ||
    env.MRT_TNA_API_BASE ||
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
  const categoriesPath = (
    env.MYREALTRIP_TNA_CATEGORIES_PATH ||
    env.MRT_TNA_CATEGORIES_PATH ||
    DEFAULT_CATEGORIES_PATH
  ).trim();
  const categoriesUrl = (
    env.MYREALTRIP_TNA_CATEGORIES_URL ||
    env.MRT_TNA_CATEGORIES_URL ||
    ""
  ).trim();
  const searchPath = (
    env.MYREALTRIP_TNA_SEARCH_PATH ||
    env.MRT_TNA_SEARCH_PATH ||
    DEFAULT_SEARCH_PATH
  ).trim();
  const searchUrl = (
    env.MYREALTRIP_TNA_SEARCH_URL ||
    env.MRT_TNA_SEARCH_URL ||
    ""
  ).trim();
  const detailPath = (
    env.MYREALTRIP_TNA_DETAIL_PATH ||
    env.MRT_TNA_DETAIL_PATH ||
    DEFAULT_DETAIL_PATH
  ).trim();
  const detailUrl = (
    env.MYREALTRIP_TNA_DETAIL_URL ||
    env.MRT_TNA_DETAIL_URL ||
    ""
  ).trim();

  return { apiBase, apiKey, mcpUrl, partnerId, categoriesPath, categoriesUrl, searchPath, searchUrl, detailPath, detailUrl };
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
    payload?.categories,
    payload?.products,
    payload?.tours,
    payload?.tickets,
    payload?.results,
    payload?.data?.items,
    payload?.data?.categories,
    payload?.data?.products,
    payload?.data?.tours,
    payload?.data?.tickets,
    payload?.data?.results,
    payload?.data
  ];
  return candidates.find(Array.isArray) || [];
}

function normalizeCategory(item = {}) {
  const value = String(item.value || item.category || item.id || item.code || "");
  const label = String(item.label || item.name || item.title || item.displayName || value || "카테고리");
  return { value, label };
}

function normalizeProduct(item = {}) {
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
    id: String(item.id || item.productId || item.tnaProductId || item.offerId || ""),
    title: String(item.title || item.name || item.productName || item.displayName || "투어·티켓 상품"),
    category: String(item.categoryName || item.category || item.type || "투어·티켓"),
    region: String(item.cityName || item.regionName || item.region || item.location || ""),
    priceText: String(price),
    image: String(image),
    url: String(item.url || item.link || item.deepLink || item.webUrl || item.shareUrl || "")
  };
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
  if (node.type === "Image" && node.src) return String(node.src);
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
      const rating = texts.find((value) => /★|⭐|\d+\.\d/.test(value)) || "";
      const title = texts.find((value) => value && value !== price && value !== rating) || "투어·티켓 상품";
      return {
        id: "",
        title,
        category: rating || "투어·티켓",
        region: "",
        priceText: price || "가격 확인",
        image: firstImage(item),
        url: firstOpenUrl(item)
      };
    })
    .filter((item) => item.title);
}

function normalizeMcpCategories(parsed = {}) {
  return (parsed.categories || parsed.items || [])
    .map(normalizeCategory)
    .filter((item) => item.value || item.label);
}

function normalizeMcpProducts(parsed = {}) {
  const explicitItems = asArray(parsed).map(normalizeProduct).filter((item) => item.title);
  if (explicitItems.length) return explicitItems;
  return productsFromWidget(parsed.widget);
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
    return await request.json();
  } catch (error) {
    return {};
  }
}

function actionConfig(config, action) {
  if (action === "search") {
    return { path: config.searchPath, explicitUrl: config.searchUrl, normalize: normalizeProduct };
  }
  if (action === "detail") {
    return { path: config.detailPath, explicitUrl: config.detailUrl, normalize: normalizeProduct };
  }
  return { path: config.categoriesPath, explicitUrl: config.categoriesUrl, normalize: normalizeCategory };
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
  const action = requestUrl.searchParams.get("action") || "categories";
  const body = await readBody(context.request);

  if (config.mcpUrl) {
    try {
      if (action === "categories") {
        const city = body.city || body.cityName || body.query || "제주";
        const parsed = await callMcpTool(config, "getCategoryList", { city });
        const items = normalizeMcpCategories(parsed);
        return json({ ok: true, configured: true, mcp: true, action, items, raw: parsed });
      }

      if (action === "search") {
        const city = body.city || body.cityName || "";
        const keyword = body.keyword || body.query || "";
        const query = [city, keyword].filter(Boolean).join(" ").trim() || "제주";
        const args = {
          query,
          page: Number(body.page || 1),
          perPage: Number(body.perPage || body.limit || 12)
        };
        if (body.category) args.category = body.category;
        if (body.sort) args.sort = body.sort;
        const parsed = await callMcpTool(config, "searchTnas", args);
        const items = normalizeMcpProducts(parsed);
        return json({ ok: true, configured: true, mcp: true, action, items, raw: parsed });
      }

      if (action === "detail") {
        const parsed = await callMcpTool(config, "getTnaDetail", {
          gid: String(body.gid || body.id || ""),
          url: String(body.url || "")
        });
        const items = normalizeMcpProducts(parsed);
        return json({ ok: true, configured: true, mcp: true, action, items, raw: parsed });
      }
    } catch (error) {
      return json({
        ok: false,
        configured: true,
        mcp: true,
        action,
        items: [],
        message: error instanceof Error ? error.message : "마이리얼트립 MCP 호출에 실패했습니다."
      }, { status: 502, cacheControl: "no-store" });
    }
  }

  const target = actionConfig(config, action);
  const url = absoluteUrl(target.explicitUrl) || targetUrl(config.apiBase, target.path);

  if (!url || !config.apiKey) {
    return json({
      ok: false,
      configured: false,
      action,
      items: [],
      message: "MYREALTRIP_API_BASE 또는 투어티켓 엔드포인트 URL과 MYREALTRIP_API_KEY가 설정되면 투어·티켓 API를 호출합니다."
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
      throw new Error(payload?.message || `MyRealTrip TNA HTTP ${response.status}`);
    }

    if (action === "detail") {
      const item = target.normalize(payload?.item || payload?.data || payload);
      return json({ ok: true, configured: true, action, item, items: item.title ? [item] : [], raw: payload });
    }

    const items = asArray(payload).map(target.normalize).filter((item) => item.value || item.title);
    return json({ ok: true, configured: true, action, items, raw: payload });
  } catch (error) {
    return json({
      ok: false,
      configured: true,
      action,
      items: [],
      message: error instanceof Error ? error.message : "투어·티켓 정보를 불러오지 못했습니다."
    }, { status: 502, cacheControl: "no-store" });
  }
}

export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const city = requestUrl.searchParams.get("city") || "제주";
  const keyword = requestUrl.searchParams.get("keyword") || "";
  const request = new Request(context.request.url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ city, cityName: city, keyword, query: keyword })
  });
  return onRequestPost({ ...context, request });
}

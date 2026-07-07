const DEFAULT_TIMEOUT_MS = 9000;
const DEFAULT_AIRPORT_AUTOCOMPLETE_PATH = "/v1/products/flight/airport-autocomplete";
const DEFAULT_CALENDAR_PATH = "/v1/products/flight/lowest-price-calendar";

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
    env.MYREALTRIP_FLIGHT_API_BASE ||
    env.MYREALTRIP_API_BASE ||
    env.MRT_FLIGHT_API_BASE ||
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
  const airportAutocompletePath = (
    env.MYREALTRIP_FLIGHT_AIRPORT_AUTOCOMPLETE_PATH ||
    env.MRT_FLIGHT_AIRPORT_AUTOCOMPLETE_PATH ||
    DEFAULT_AIRPORT_AUTOCOMPLETE_PATH
  ).trim();
  const airportAutocompleteUrl = (
    env.MYREALTRIP_FLIGHT_AIRPORT_AUTOCOMPLETE_URL ||
    env.MRT_FLIGHT_AIRPORT_AUTOCOMPLETE_URL ||
    ""
  ).trim();
  const calendarPath = (
    env.MYREALTRIP_FLIGHT_CALENDAR_PATH ||
    env.MRT_FLIGHT_CALENDAR_PATH ||
    DEFAULT_CALENDAR_PATH
  ).trim();
  const calendarUrl = (
    env.MYREALTRIP_FLIGHT_CALENDAR_URL ||
    env.MRT_FLIGHT_CALENDAR_URL ||
    ""
  ).trim();

  return { apiBase, apiKey, partnerId, airportAutocompletePath, airportAutocompleteUrl, calendarPath, calendarUrl };
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
    payload?.airports,
    payload?.results,
    payload?.data?.items,
    payload?.data?.airports,
    payload?.data?.results,
    payload?.data
  ];
  return candidates.find(Array.isArray) || [];
}

function airportLabel(item = {}) {
  const city = item.cityName || item.city || item.regionName || "";
  const name = item.name || item.airportName || item.displayName || "";
  const code = item.code || item.iataCode || item.airportCode || item.id || "";
  return [city, name].filter(Boolean).join(" ") || code || "공항";
}

function normalizeAirport(item = {}) {
  const code = String(item.code || item.iataCode || item.airportCode || item.id || "").toUpperCase();
  return {
    code,
    name: String(item.name || item.airportName || item.displayName || airportLabel(item)),
    city: String(item.cityName || item.city || item.regionName || ""),
    country: String(item.countryName || item.country || ""),
    label: airportLabel(item)
  };
}

function normalizeCalendarItem(item = {}) {
  const price = item.price || item.minPrice || item.lowestPrice || item.amount || item.fare || "";
  const currency = item.currency || item.currencyCode || "KRW";
  return {
    date: String(item.date || item.departureDate || item.travelDate || item.day || ""),
    price: String(price),
    currency: String(currency),
    airline: String(item.airline || item.airlineName || item.carrierName || ""),
    url: String(item.url || item.link || item.deepLink || item.webUrl || "")
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
  const action = requestUrl.searchParams.get("action") || "airport-autocomplete";
  const body = await readBody(context.request);
  const path = action === "lowest-price-calendar" ? config.calendarPath : config.airportAutocompletePath;
  const explicitUrl = action === "lowest-price-calendar" ? config.calendarUrl : config.airportAutocompleteUrl;
  const url = absoluteUrl(explicitUrl) || targetUrl(config.apiBase, path);

  if (!url || !config.apiKey) {
    return json({
      ok: false,
      configured: false,
      action,
      items: [],
      message: "MYREALTRIP_API_BASE 또는 항공권 엔드포인트 URL과 MYREALTRIP_API_KEY가 설정되면 항공권 API를 호출합니다."
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
      throw new Error(payload?.message || `MyRealTrip flight HTTP ${response.status}`);
    }

    if (action === "lowest-price-calendar") {
      const items = asArray(payload).map(normalizeCalendarItem).filter((item) => item.date || item.price);
      return json({ ok: true, configured: true, action, items, raw: payload });
    }

    const items = asArray(payload).map(normalizeAirport).filter((item) => item.code || item.name);
    return json({ ok: true, configured: true, action, items, raw: payload });
  } catch (error) {
    return json({
      ok: false,
      configured: true,
      action,
      items: [],
      message: error instanceof Error ? error.message : "항공권 정보를 불러오지 못했습니다."
    }, { status: 502, cacheControl: "no-store" });
  }
}

export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const keyword = requestUrl.searchParams.get("keyword") || "제주";
  const request = new Request(context.request.url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ keyword })
  });
  return onRequestPost({ ...context, request });
}

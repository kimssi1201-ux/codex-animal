import { affiliateItems as withAffiliateLinks } from "../lib/myrealtrip-link.js";

const DEFAULT_TIMEOUT_MS = 9000;
const DEFAULT_MCP_URL = "https://mcp-servers.myrealtrip.com/mcp";
const DEFAULT_AIRPORT_AUTOCOMPLETE_PATH = "/v1/products/flight/airport-autocomplete";
const DEFAULT_CALENDAR_PATH = "/v1/products/flight/lowest-price-calendar";
const MAX_BODY_LENGTH = 32768;
const MAX_TEXT_LENGTH = 80;
const MAX_RESULT_COUNT = 20;
const DOMESTIC_AIRPORTS = [
  { code: "GMP", city: "서울", name: "김포국제공항", country: "대한민국" },
  { code: "ICN", city: "인천", name: "인천국제공항", country: "대한민국" },
  { code: "CJU", city: "제주", name: "제주국제공항", country: "대한민국" },
  { code: "PUS", city: "부산", name: "김해국제공항", country: "대한민국" },
  { code: "TAE", city: "대구", name: "대구국제공항", country: "대한민국" },
  { code: "KWJ", city: "광주", name: "광주공항", country: "대한민국" },
  { code: "RSU", city: "여수", name: "여수공항", country: "대한민국" },
  { code: "USN", city: "울산", name: "울산공항", country: "대한민국" },
  { code: "WJU", city: "원주", name: "원주공항", country: "대한민국" }
];

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

  return { apiBase, apiKey, mcpUrl, partnerId, airportAutocompletePath, airportAutocompleteUrl, calendarPath, calendarUrl };
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

function airportItems(keyword = "") {
  const query = boundedText(keyword).toLowerCase();
  const items = DOMESTIC_AIRPORTS.filter((airport) => {
    if (!query) return true;
    return [airport.code, airport.city, airport.name, airport.country]
      .some((value) => String(value).toLowerCase().includes(query));
  });
  return items.map((airport) => ({
    ...airport,
    label: `${airport.city} ${airport.name}`
  }));
}

function normalizeAirportCode(value, fallback = "GMP") {
  const code = boundedText(value, "", 6).toUpperCase().replace(/[^A-Z]/g, "");
  if (code === "SEL") return "GMP";
  return code || fallback;
}

function nextDepartDate(monthValue = "") {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const monthMatch = String(monthValue || "").match(/^(\d{4})-(\d{2})/);
  const date = monthMatch
    ? new Date(Date.UTC(Number(monthMatch[1]), Number(monthMatch[2]) - 1, 1))
    : tomorrow;
  if (date <= today) date.setTime(tomorrow.getTime());
  return date.toISOString().slice(0, 10);
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

function mcpFlightItems(parsed = {}) {
  const items = parsed?.result?.items || parsed?.items || [];
  return items.map((item = {}) => {
    const outbound = item.outbound || {};
    const price = item.price?.total || outbound.legPrice || item.totalPrice || "";
    const airline = item.airline?.name || outbound.airlineName || outbound.airlineCode || item.airline || "";
    const time = [outbound.departTime, outbound.arriveTime].filter(Boolean).join(" -> ");
    return {
      date: [outbound.departDate || item.departureDate || item.date || "", time].filter(Boolean).join(" "),
      price,
      currency: item.price?.currency || "KRW",
      airline,
      url: item.reservationUrl || item.url || item.link || ""
    };
  }).filter((item) => item.date || item.price);
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
  const action = boundedText(requestUrl.searchParams.get("action"), "airport-autocomplete", 40);
  if (!["airport-autocomplete", "lowest-price-calendar"].includes(action)) {
    return json({ ok: false, error: "지원하지 않는 항공권 조회 방식입니다." }, { status: 400, cacheControl: "no-store" });
  }
  const body = await readBody(context.request);
  if (body === null) {
    return json({ ok: false, error: "요청 본문이 너무 큽니다." }, { status: 413, cacheControl: "no-store" });
  }
  const path = action === "lowest-price-calendar" ? config.calendarPath : config.airportAutocompletePath;
  const explicitUrl = action === "lowest-price-calendar" ? config.calendarUrl : config.airportAutocompleteUrl;
  const url = absoluteUrl(explicitUrl) || targetUrl(config.apiBase, path);

  if ((!url || !config.apiKey) && config.mcpUrl) {
    try {
      if (action === "airport-autocomplete") {
        return json({
          ok: true,
          configured: true,
          mcp: true,
          action,
          items: airportItems(body.keyword || body.query)
        });
      }

      const origin = normalizeAirportCode(
        body.originAirportCode || body.departureAirportCode || body.origin || body.departure,
        "GMP"
      );
      const destination = normalizeAirportCode(
        body.destinationAirportCode || body.arrivalAirportCode || body.destination || body.arrival,
        "CJU"
      );
      const departDate = boundedDate(
        body.departureDate || body.departDate,
        nextDepartDate(body.yearMonth || body.month)
      );
      const parsed = await callMcpTool(config, "searchDomesticFlights", {
        tripType: "ONE_WAY",
        origin,
        destination,
        departDate,
        passengers: {
          adults: boundedInteger(body.adults || body.guests, 1, 1, 9),
          children: boundedInteger(body.children, 0, 0, 9)
        },
        maxResults: boundedInteger(body.limit, 8, 1, MAX_RESULT_COUNT)
      });
      const items = mcpFlightItems(parsed);
      return json({
        ok: true,
        configured: true,
        mcp: true,
        action,
        items: withAffiliateLinks(items, context.request.url, context.env || {})
      });
    } catch (error) {
      return json({
        ok: false,
        configured: true,
        mcp: true,
        action,
        items: [],
        message: error instanceof Error ? error.message : "항공권 정보를 불러오지 못했습니다."
      }, { status: 502, cacheControl: "no-store" });
    }
  }

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
      return json({
        ok: true,
        configured: true,
        action,
        items: withAffiliateLinks(items, context.request.url, context.env || {})
      });
    }

    const items = asArray(payload).map(normalizeAirport).filter((item) => item.code || item.name);
    return json({ ok: true, configured: true, action, items });
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
  const keyword = boundedText(requestUrl.searchParams.get("keyword"), "제주");
  const request = new Request(context.request.url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ keyword })
  });
  return onRequestPost({ ...context, request });
}

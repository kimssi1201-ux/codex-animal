const BEACH_API_URL = "https://apis.data.go.kr/1192000/service/OceansBeachInfoService1/getOceansBeachInfo1";
const DEFAULT_SIDO = "제주";
const DEFAULT_ROWS = 30;
const MAX_ROWS = 30;
const MAX_PAGE = 10;
const TIMEOUT_MS = 9000;

const KMA_BEACH_STATIONS = [
  { code: "344", title: "신양섭지코지 해수욕장", aliases: ["신양섭지코지", "섭지코지"] },
  { code: "347", title: "중문ㆍ색달 해수욕장", aliases: ["중문색달", "중문색달해수욕장"] },
  { code: "342", title: "표선해비치", aliases: ["표선해비치", "표선해수욕장"] },
  { code: "343", title: "화순금모래 해수욕장", aliases: ["화순금모래", "화순금모래해수욕장"] },
  { code: "345", title: "곽지과물 해수욕장", aliases: ["곽지과물", "곽지과물해수욕장"] },
  { code: "355", title: "금능으뜸원 해수욕장", aliases: ["금능으뜸원", "금능해수욕장"] },
  { code: "354", title: "김녕성세기 해수욕장", aliases: ["김녕성세기", "김녕해수욕장"] },
  { code: "349", title: "삼양검은모래 해수욕장", aliases: ["삼양검은모래", "삼양해수욕장"] },
  { code: "348", title: "이호테우 해수욕장", aliases: ["이호테우", "이호해수욕장"] },
  { code: "352", title: "함덕서우봉 해수욕장", aliases: ["함덕서우봉", "함덕해수욕장"] },
  { code: "346", title: "협재 해수욕장", aliases: ["협재", "협재해수욕장"] }
];

function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", init.cacheControl || "public, max-age=900, s-maxage=1800");
  return new Response(JSON.stringify(data), {
    status: init.status || 200,
    headers
  });
}

function getApiKey(env) {
  return String(env.OCEANS_BEACH_API_KEY || env.MOF_BEACH_API_KEY || "").trim();
}

function encodedServiceKey(value) {
  return /%[0-9a-f]{2}/i.test(value) ? value : encodeURIComponent(value);
}

function boundedPage(value) {
  const page = Number(value);
  if (!Number.isFinite(page)) return 1;
  return Math.min(MAX_PAGE, Math.max(1, Math.trunc(page)));
}

function boundedRows(value) {
  const rows = Number(value);
  if (!Number.isFinite(rows)) return DEFAULT_ROWS;
  return Math.min(MAX_ROWS, Math.max(1, Math.trunc(rows)));
}

function text(value, maxLength = 300) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function compactBeachName(value) {
  return text(value, 100).replace(/[\sㆍ·().]/g, "");
}

function findKmaStation(title) {
  const compactTitle = compactBeachName(title);
  return KMA_BEACH_STATIONS.find((station) =>
    station.aliases.some((alias) => compactTitle.includes(compactBeachName(alias)))
  ) || null;
}

function numberOrEmpty(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : "";
}

function normalizeImage(value) {
  const image = text(value, 500);
  if (!image) return "";
  if (image.startsWith("//")) return `https:${image}`;
  if (image.startsWith("http://")) return image.replace(/^http:\/\//i, "https://");
  return /^https:\/\//i.test(image) ? image : "";
}

function normalizeExternalUrl(value) {
  const url = text(value, 500).replace(/^http:\/\//i, "https://");
  return /^https:\/\//i.test(url) ? url : "";
}

function asItems(payload) {
  const items = payload?.getOceansBeachInfo?.item ?? payload?.response?.body?.items?.item ?? [];
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}

function normalizeItem(item) {
  const title = text(item.sta_nm, 100);
  const weatherStation = findKmaStation(title);
  return {
    number: text(item.num, 20),
    sido: text(item.sido_nm, 50),
    district: text(item.gugun_nm, 80),
    title,
    width: numberOrEmpty(item.beach_wid),
    length: numberOrEmpty(item.beach_len),
    feature: text(item.beach_knd, 100),
    sourceName: text(item.link_nm, 80),
    sourceUrl: normalizeExternalUrl(item.link_addr),
    image: normalizeImage(item.beach_img),
    emergencyPhone: text(item.link_tel, 100),
    latitude: text(item.lat, 30),
    longitude: text(item.lon, 30),
    weatherCode: weatherStation?.code || "",
    weatherTitle: weatherStation?.title || ""
  };
}

function apiUrl(serviceKey, page, rows, sido) {
  const params = new URLSearchParams({
    pageNo: String(page),
    numOfRows: String(rows),
    SIDO_NM: sido,
    resultType: "json"
  });
  return `${BEACH_API_URL}?${params.toString()}&ServiceKey=${encodedServiceKey(serviceKey)}`;
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      headers: { accept: "application/json" },
      signal: controller.signal
    });
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
  const serviceKey = getApiKey(context.env || {});
  if (!serviceKey) {
    return json({
      ok: false,
      configured: false,
      error: "Cloudflare 환경변수에 OCEANS_BEACH_API_KEY가 없습니다."
    }, { status: 503, cacheControl: "no-store" });
  }

  const requestUrl = new URL(context.request.url);
  const sido = text(requestUrl.searchParams.get("sido") || DEFAULT_SIDO, 30);
  if (sido !== DEFAULT_SIDO) {
    return json({ ok: false, error: "현재는 제주 해수욕장 정보만 제공합니다." }, { status: 400, cacheControl: "no-store" });
  }

  const page = boundedPage(requestUrl.searchParams.get("page"));
  const rows = boundedRows(requestUrl.searchParams.get("rows"));

  try {
    const response = await fetchWithTimeout(apiUrl(serviceKey, page, rows, sido));
    const raw = await response.text();
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch (error) {
      throw new Error(`해수욕장 API 응답을 해석하지 못했습니다. HTTP ${response.status}`);
    }

    const body = payload?.getOceansBeachInfo;
    const header = body?.header || payload?.response?.header;
    const resultCode = String(header?.code || header?.resultCode || "");
    if (!response.ok || (resultCode && resultCode !== "00" && resultCode !== "0000")) {
      throw new Error(header?.message || header?.resultMsg || `해수욕장 API 호출 실패: HTTP ${response.status}`);
    }

    const items = asItems(payload).map(normalizeItem).filter((item) => item.title);
    return json({
      ok: true,
      source: "해양수산부 해수욕장정보 서비스",
      sido,
      page,
      rows,
      totalCount: Number(body?.totalCount || items.length),
      items,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    return json({
      ok: false,
      error: error instanceof Error ? error.message : "해수욕장 정보를 불러오지 못했습니다."
    }, { status: 502, cacheControl: "no-store" });
  }
}

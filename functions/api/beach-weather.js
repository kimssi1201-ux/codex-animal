const KMA_API_BASE = "https://apis.data.go.kr/1360000/BeachInfoservice";
const TIMEOUT_MS = 9000;
const MAX_ROWS = 100;

const BEACH_STATIONS = new Map([
  ["342", "표선해비치"],
  ["343", "화순금모래"],
  ["344", "신양섭지코지"],
  ["345", "곽지과물"],
  ["346", "협재"],
  ["347", "중문색달"],
  ["348", "이호테우"],
  ["349", "삼양검은모래"],
  ["352", "함덕서우봉"],
  ["354", "김녕성세기"],
  ["355", "금능으뜸원"]
]);

function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", init.cacheControl || "public, max-age=300, s-maxage=600");
  return new Response(JSON.stringify(data), {
    status: init.status || 200,
    headers
  });
}

function text(value, maxLength = 300) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function getApiKey(env) {
  return String(env.KMA_BEACH_API_KEY || env.KMA_WEATHER_API_KEY || "").trim();
}

function asItems(payload) {
  const items = payload?.response?.body?.items?.item || [];
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}

function kstParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute)
  };
}

function dateString(date) {
  return `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(date.getUTCDate()).padStart(2, "0")}`;
}

function timeString(date) {
  return `${String(date.getUTCHours()).padStart(2, "0")}${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

function currentKstStamp() {
  const now = kstParts();
  return `${now.year}${String(now.month).padStart(2, "0")}${String(now.day).padStart(2, "0")}${String(now.hour).padStart(2, "0")}${String(now.minute).padStart(2, "0")}`;
}

function baseTimeCandidates() {
  const now = kstParts();
  const roundedMinute = now.minute >= 30 ? 30 : 0;
  const current = new Date(Date.UTC(now.year, now.month - 1, now.day, now.hour, roundedMinute));
  const midnight = new Date(Date.UTC(now.year, now.month - 1, now.day, 0, 0));
  const previousEvening = new Date(midnight.getTime() - 30 * 60 * 1000);
  const previousMidnight = new Date(midnight.getTime() - 24 * 60 * 60 * 1000);
  return [...new Map([
    [dateString(current) + timeString(current), current],
    [dateString(new Date(current.getTime() - 30 * 60 * 1000)) + timeString(new Date(current.getTime() - 30 * 60 * 1000)), new Date(current.getTime() - 30 * 60 * 1000)],
    [dateString(midnight) + timeString(midnight), midnight],
    [dateString(previousEvening) + timeString(previousEvening), previousEvening],
    [dateString(previousMidnight) + timeString(previousMidnight), previousMidnight]
  ]).entries()].map(([, value]) => ({ baseDate: dateString(value), baseTime: timeString(value) }));
}

function apiUrl(operation, serviceKey, params) {
  const query = new URLSearchParams({
    numOfRows: String(params.numOfRows || MAX_ROWS),
    pageNo: "1",
    dataType: "JSON",
    ...params,
    ServiceKey: serviceKey
  });
  return `${KMA_API_BASE}/${operation}?${query.toString()}`;
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      signal: controller.signal
    });
    const raw = await response.text();
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return { ok: false, error: `기상청 응답을 해석하지 못했습니다. HTTP ${response.status}` };
    }
    const header = payload?.response?.header;
    const resultCode = String(header?.resultCode || "");
    if (!response.ok || (resultCode && resultCode !== "00" && resultCode !== "0000")) {
      return { ok: false, error: text(header?.resultMsg || `기상청 API 호출 실패: HTTP ${response.status}`, 180) };
    }
    return { ok: true, payload };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "기상청 API 요청에 실패했습니다." };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchUltraForecast(serviceKey, beachNum) {
  let lastError = "초단기예보가 아직 제공되지 않습니다.";
  for (const base of baseTimeCandidates()) {
    const result = await fetchJson(apiUrl("getUltraSrtFcstBeach", serviceKey, {
      numOfRows: MAX_ROWS,
      base_date: base.baseDate,
      base_time: base.baseTime,
      beach_num: beachNum
    }));
    if (result.ok && asItems(result.payload).length) {
      return { ...result, base };
    }
    lastError = result.error || lastError;
  }
  return { ok: false, error: lastError };
}

function numericOrEmpty(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : "";
}

function forecastLabel(sky, precipitation) {
  const rainType = {
    "0": "강수 없음",
    "1": "비",
    "2": "비 또는 눈",
    "3": "눈",
    "4": "소나기"
  }[String(precipitation ?? "0")];
  if (rainType && rainType !== "강수 없음") return rainType;
  return {
    "1": "맑음",
    "3": "구름 많음",
    "4": "흐림"
  }[String(sky ?? "")] || "날씨 정보 확인 필요";
}

function normalizeForecast(items) {
  const groups = new Map();
  for (const item of items) {
    const key = `${text(item.fcstDate, 8)}${text(item.fcstTime, 4)}`;
    if (!/^\d{12}$/.test(key)) continue;
    const group = groups.get(key) || { date: text(item.fcstDate, 8), time: text(item.fcstTime, 4) };
    group[text(item.category, 10)] = text(item.fcstValue, 80);
    groups.set(key, group);
  }
  const current = currentKstStamp();
  const candidates = [...groups.values()].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const selected = candidates.find((item) => `${item.date}${item.time}` >= current) || candidates.at(-1);
  if (!selected) return null;
  return {
    date: selected.date,
    time: selected.time,
    temperature: numericOrEmpty(selected.T1H),
    humidity: numericOrEmpty(selected.REH),
    windSpeed: numericOrEmpty(selected.WSD),
    rain: selected.RN1 || "",
    precipitation: selected.PTY || "0",
    sky: selected.SKY || "",
    label: forecastLabel(selected.SKY, selected.PTY)
  };
}

function normalizeObservation(items, valueKey) {
  const item = items[0];
  if (!item) return null;
  const value = text(item[valueKey], 40);
  return value && !["-", ":", "없음"].includes(value)
    ? { value, observedAt: text(item.tm || item.searchTime, 20) }
    : null;
}

function normalizeSun(items) {
  const item = items[0];
  if (!item) return null;
  const sunrise = text(item.sunrise, 10);
  const sunset = text(item.sunset, 10);
  if ([sunrise, sunset].every((value) => !value || ["-", ":"].includes(value))) return null;
  return { sunrise, sunset };
}

function normalizeTides(items) {
  return items
    .map((item) => ({
      type: text(item.tiType, 10),
      time: text(item.tiTime, 20),
      level: text(item.tilevel, 20)
    }))
    .filter((item) => item.type && !["-", ":"].includes(item.type) && (item.time || item.level))
    .slice(0, 8);
}

async function fetchOptional(operation, serviceKey, params) {
  const result = await fetchJson(apiUrl(operation, serviceKey, params));
  return result.ok ? asItems(result.payload) : [];
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
      error: "Cloudflare 환경변수에 KMA_BEACH_API_KEY가 없습니다."
    }, { status: 503, cacheControl: "no-store" });
  }

  const requestUrl = new URL(context.request.url);
  const beachNum = text(requestUrl.searchParams.get("beach_num"), 10);
  const beachName = BEACH_STATIONS.get(beachNum);
  if (!beachName) {
    return json({ ok: false, error: "지원하지 않는 제주 해수욕장 지점입니다." }, { status: 400, cacheControl: "no-store" });
  }

  const now = kstParts();
  const baseDate = `${now.year}${String(now.month).padStart(2, "0")}${String(now.day).padStart(2, "0")}`;
  const searchTime = `${baseDate}${String(now.hour).padStart(2, "0")}${String(Math.floor(now.minute / 10) * 10).padStart(2, "0")}`;
  try {
    const ultra = await fetchUltraForecast(serviceKey, beachNum);
    const [waveItems, waterItems, sunItems, tideItems] = await Promise.all([
      fetchOptional("getWhBuoyBeach", serviceKey, { numOfRows: 10, beach_num: beachNum, searchTime }),
      fetchOptional("getTwBuoyBeach", serviceKey, { numOfRows: 10, beach_num: beachNum, searchTime }),
      fetchOptional("getSunInfoBeach", serviceKey, { numOfRows: 10, beach_num: beachNum, base_date: baseDate }),
      fetchOptional("getTideInfoBeach", serviceKey, { numOfRows: 10, beach_num: beachNum, base_date: baseDate })
    ]);
    const forecast = ultra.ok ? normalizeForecast(asItems(ultra.payload)) : null;
    const wave = normalizeObservation(waveItems, "wh");
    const waterTemperature = normalizeObservation(waterItems, "tw");
    const sun = normalizeSun(sunItems);
    const tides = normalizeTides(tideItems);
    if (!forecast && !wave && !waterTemperature && !sun && !tides.length) {
      return json({ ok: false, error: "현재 확인할 수 있는 해수욕장 날씨 정보가 없습니다." }, { status: 502, cacheControl: "no-store" });
    }
    return json({
      ok: true,
      source: "기상청 전국 해수욕장 날씨 조회서비스",
      beachNum,
      beachName,
      forecast,
      wave,
      waterTemperature,
      sun,
      tides,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    return json({
      ok: false,
      error: error instanceof Error ? error.message : "해수욕장 날씨 정보를 불러오지 못했습니다."
    }, { status: 502, cacheControl: "no-store" });
  }
}

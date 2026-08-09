const DEFAULT_MYREALTRIP_PARTNER_API_BASE = "https://partner-ext-api.myrealtrip.com";
const MYLINK_PATH = "/v1/mylink";
const DEFAULT_TIMEOUT_MS = 5000;
const MAX_TARGET_LENGTH = 4096;

function text(value) {
  return String(value || "").trim();
}

export function isMyRealTripUrl(value) {
  const raw = text(value);
  if (!raw || raw.length > MAX_TARGET_LENGTH) return false;

  try {
    const url = new URL(raw);
    const hostname = url.hostname.toLowerCase();
    return url.protocol === "https:" && (
      hostname === "myrealtrip.com" ||
      hostname.endsWith(".myrealtrip.com")
    );
  } catch (error) {
    return false;
  }
}

function apiKey(env = {}) {
  return text(
    env.MYREALTRIP_API_KEY ||
    env.MYREALTRIP_ACCESS_TOKEN ||
    env.MRT_API_KEY ||
    env.MRT_ACCESS_TOKEN
  );
}

function partnerId(env = {}) {
  return text(env.MYREALTRIP_PARTNER_ID || env.MRT_PARTNER_ID);
}

function mylinkApiUrl(env = {}) {
  const explicit = text(env.MYREALTRIP_MYLINK_API_URL || env.MRT_MYLINK_API_URL);
  if (explicit) {
    try {
      return new URL(explicit).href;
    } catch (error) {
      return "";
    }
  }

  const base = text(
    env.MYREALTRIP_PARTNER_API_BASE ||
    env.MRT_PARTNER_API_BASE ||
    env.MYREALTRIP_API_BASE ||
    env.MRT_API_BASE ||
    DEFAULT_MYREALTRIP_PARTNER_API_BASE
  );
  try {
    return new URL(MYLINK_PATH, base.endsWith("/") ? base : `${base}/`).href;
  } catch (error) {
    return "";
  }
}

function httpsUrl(value) {
  try {
    const url = new URL(text(value));
    return url.protocol === "https:" ? url.href : "";
  } catch (error) {
    return "";
  }
}

function targetWithPartnerId(target, id) {
  if (!id) return target;
  const url = new URL(target);
  if (!url.searchParams.has("mylink_id")) url.searchParams.set("mylink_id", id);
  return url.href;
}

export function affiliateUrl(targetValue, requestUrl, env = {}) {
  if (!isMyRealTripUrl(targetValue)) return text(targetValue);

  const target = new URL(targetValue).href;
  if (new URL(target).searchParams.has("mylink_id")) return target;

  if (apiKey(env)) {
    try {
      const redirect = new URL("/api/myrealtrip-link", requestUrl);
      redirect.searchParams.set("target", target);
      return redirect.href;
    } catch (error) {
      return target;
    }
  }

  return targetWithPartnerId(target, partnerId(env));
}

export function affiliateItems(items, requestUrl, env = {}) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    if (!item || typeof item !== "object" || !item.url) return item;
    return { ...item, url: affiliateUrl(item.url, requestUrl, env) };
  });
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function createMylink(targetValue, env = {}) {
  const target = isMyRealTripUrl(targetValue) ? new URL(targetValue).href : "";
  if (!target) return { url: "", tracked: false, reason: "invalid-target" };

  const key = apiKey(env);
  if (!key) {
    return {
      url: targetWithPartnerId(target, partnerId(env)),
      tracked: Boolean(partnerId(env)),
      reason: partnerId(env) ? "partner-id" : "missing-key"
    };
  }

  const url = mylinkApiUrl(env);
  if (!url) return { url: target, tracked: false, reason: "invalid-api-url" };

  try {
    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${key}`,
        "content-type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({ targetUrl: target })
    });
    const payload = await response.json().catch(() => ({}));
    const mylink = httpsUrl(payload?.mylink || payload?.data?.mylink || payload?.result?.mylink);
    if (!response.ok || !mylink) {
      return { url: target, tracked: false, reason: `upstream-${response.status}` };
    }
    return { url: mylink, tracked: true, reason: "mylink" };
  } catch (error) {
    return { url: target, tracked: false, reason: error?.name === "AbortError" ? "timeout" : "network" };
  }
}

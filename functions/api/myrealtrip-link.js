import { createMylink, isMyRealTripUrl } from "../lib/myrealtrip-link.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8"
    }
  });
}

function redirect(url, tracked) {
  return new Response(null, {
    status: 302,
    headers: {
      location: url,
      "cache-control": tracked
        ? "public, max-age=300, s-maxage=86400"
        : "no-store",
      "referrer-policy": "strict-origin-when-cross-origin",
      "x-affiliate-tracking": tracked ? "mylink" : "fallback"
    }
  });
}

export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const target = requestUrl.searchParams.get("target") || "";
  if (!target) return json({ ok: false, error: "상품 링크가 필요합니다." }, 400);
  if (!isMyRealTripUrl(target)) {
    return json({ ok: false, error: "마이리얼트립 상품 링크만 사용할 수 있습니다." }, 400);
  }

  const result = await createMylink(target, context.env || {});
  return redirect(result.url || target, result.tracked);
}

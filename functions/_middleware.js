const SITE_URL = "https://www.moneyarchive.kr";
const ADS_TXT = "google.com, pub-5751319666030430, DIRECT, f08c47fec0942fa0\n";
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data: https:",
  "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net https://*.googleadservices.com https://*.googletagservices.com https://*.google.com https://ads-partners.coupang.com https://*.coupang.com",
  "connect-src 'self' https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://*.coupang.com",
  "frame-src https://*.googlesyndication.com https://*.doubleclick.net https://*.coupang.com",
  "worker-src 'self' blob:"
].join("; ");

const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "content-security-policy": CONTENT_SECURITY_POLICY
};

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.pathname === "/ads.txt") {
    return new Response(ADS_TXT, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-cache, max-age=0",
        ...SECURITY_HEADERS
      }
    });
  }

  const response = await context.next();
  const headers = new Headers(response.headers);
  const contentType = headers.get("content-type") || "";

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }

  if (!contentType.toLowerCase().includes("text/html")) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  let html = await response.text();
  html = html.replace(/ca-pub-\d+/g, "ca-pub-5751319666030430");

  if (!html.includes('rel="canonical"') && !html.includes("rel='canonical'")) {
    const canonical = `${SITE_URL}${url.pathname === "/" ? "/" : url.pathname.replace(/\/index\.html$/i, "")}`;
    html = html.replace("</head>", `<link rel="canonical" href="${canonical}">\n</head>`);
  }

  headers.delete("content-length");
  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

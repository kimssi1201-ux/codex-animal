const SITE_URL = "https://www.moneyarchive.kr";
const ADS_TXT = "google.com, pub-8468106244002167, DIRECT, f08c47fec0942fa0\n";

const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()"
};

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

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
  html = html.replace(/ca-pub-\d+/g, "ca-pub-8468106244002167");

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

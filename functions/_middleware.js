const ADSENSE_SNIPPET =
  '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6066428844912614" crossorigin="anonymous"></script>';
const SITE_URL = "https://www.moneyarchive.kr";
const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}/</loc><lastmod>2026-06-08</lastmod></url>
  <url><loc>${SITE_URL}/privacy</loc><lastmod>2026-06-08</lastmod></url>
</urlset>
`;
const ROBOTS_TXT = `User-agent: *
Allow: /
Sitemap: ${SITE_URL}/sitemap.xml
`;
const ADS_TXT = `google.com, pub-6066428844912614, DIRECT, f08c47fec0942fa0
`;

function canonicalUrl(requestUrl) {
  const url = new URL(requestUrl);
  let path = url.pathname.replace(/\/index\.html$/i, "/");

  if (path.endsWith(".html")) {
    path = path.slice(0, -5);
  }

  if (path !== "/" && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  return `${SITE_URL}${path}`;
}

export async function onRequest(context) {
  const requestUrl = new URL(context.request.url);

  if (requestUrl.pathname === "/sitemap.xml") {
    return new Response(SITEMAP_XML, {
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "no-cache, max-age=0",
      },
    });
  }

  if (requestUrl.pathname === "/robots.txt") {
    return new Response(ROBOTS_TXT, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-cache, max-age=0",
      },
    });
  }

  if (requestUrl.pathname === "/ads.txt") {
    return new Response(ADS_TXT, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-cache, max-age=0",
      },
    });
  }

  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("text/html")) {
    return response;
  }

  const html = await response.text();

  const headers = new Headers(response.headers);
  headers.delete("content-length");

  const canonical = canonicalUrl(context.request.url);
  const headAdditions = [];

  if (!html.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js")) {
    headAdditions.push(ADSENSE_SNIPPET);
  }

  if (!html.includes('rel="canonical"') && !html.includes("rel='canonical'")) {
    headAdditions.push(`<link rel="canonical" href="${canonical}">`);
  }

  if (!html.includes('property="og:url"') && !html.includes("property='og:url'")) {
    headAdditions.push(`<meta property="og:url" content="${canonical}">`);
  }

  if (!headAdditions.length) {
    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const injected = html.replace(/<\/head>/i, `${headAdditions.join("\n")}\n</head>`);

  return new Response(injected, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

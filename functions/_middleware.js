const ADSENSE_SNIPPET =
  '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6066428844912614" crossorigin="anonymous"></script>';
const NAVER_VERIFICATION =
  '<meta name="naver-site-verification" content="74a2206ab416200464688bbb207be6e25e76bc7c" />';
const RSS_LINK =
  '<link rel="alternate" type="application/rss+xml" title="RSS" href="https://www.moneyarchive.kr/feed.xml">';
const DETAIL_COMPACT_CSS =
  ".detail h2{font-size:24px;margin:0}.detail p{margin:0}.detail .compact-note{color:var(--muted)}.detail .meta-list{grid-template-columns:1fr}.detail .actions a,.detail .actions button{flex:1 1 130px}";
const DETAIL_COPY =
  "마커별 위치, 주요 어종, 길찾기, 현재 예보를 짧게 정리했습니다.";
const DETAIL_PANEL_COMPACT =
  "function renderDetail(){const p=byId(selected);els.detail.innerHTML=`${tags(p)}<div><h2>${p.n}</h2><p class='muted'>${p.a} · 위도 ${p.lat.toFixed(4)}, 경도 ${p.lng.toFixed(4)}</p></div><p class='compact-note'>${p.note}</p><div class='fish'>${p.fish.map(f=>`<span>${f}</span>`).join('')}</div><div class='meta-list'><div><small>추천 시간</small><b>${p.best}</b></div><div><small>주의</small><b>${p.warn}</b></div></div>${miniForecast(p)}<div class='actions'><a class='btn primary' href='${nmap(p)}' target='_blank' rel='noreferrer'>네이버 지도</a><a class='btn secondary' href='${gmap(p)}' target='_blank' rel='noreferrer'>구글 지도</a></div>`}function renderGrid()";
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
const FEED_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>서해낚시맵</title>
    <link>${SITE_URL}/</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>서해안 낚시 포인트, 지도, 바다 예보, 안전 정보를 정리한 가이드입니다.</description>
    <language>ko-KR</language>
    <lastBuildDate>Mon, 08 Jun 2026 00:00:00 +0900</lastBuildDate>
    <pubDate>Mon, 08 Jun 2026 00:00:00 +0900</pubDate>
    <ttl>60</ttl>
    <item>
      <title>서해안 낚시 포인트 지도</title>
      <link>${SITE_URL}/</link>
      <guid isPermaLink="true">${SITE_URL}/</guid>
      <description>궁평항, 오이도, 태안, 격포 등 서해안 낚시 포인트의 위치, 추천 시간, 주의사항, 바다 예보를 한눈에 비교할 수 있습니다.</description>
      <category>서해안 낚시</category>
      <pubDate>Mon, 08 Jun 2026 00:00:00 +0900</pubDate>
    </item>
  </channel>
</rss>
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

  if (requestUrl.pathname === "/feed.xml") {
    return new Response(FEED_XML, {
      headers: {
        "content-type": "application/rss+xml; charset=utf-8",
        "cache-control": "no-cache, max-age=0",
      },
    });
  }

  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("text/html")) {
    return response;
  }

  let html = await response.text();

  html = html.replace(
    "마커를 누르면 사진, 좌표, 길찾기, 바다 예보가 함께 바뀝니다.",
    DETAIL_COPY,
  );

  if (!html.includes(".detail .compact-note")) {
    html = html.replace("</style>", `${DETAIL_COMPACT_CSS}</style>`);
  }

  html = html.replace(
    /function renderDetail\(\)\{[\s\S]*?function renderGrid\(\)/,
    DETAIL_PANEL_COMPACT,
  );

  const headers = new Headers(response.headers);
  headers.delete("content-length");

  const canonical = canonicalUrl(context.request.url);
  const headAdditions = [];

  if (!html.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js")) {
    headAdditions.push(ADSENSE_SNIPPET);
  }

  if (!html.includes("naver-site-verification")) {
    headAdditions.push(NAVER_VERIFICATION);
  }

  if (!html.includes("application/rss+xml")) {
    headAdditions.push(RSS_LINK);
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

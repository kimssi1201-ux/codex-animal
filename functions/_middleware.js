const ADSENSE_SNIPPET =
  '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8468106244002167" crossorigin="anonymous"></script>';
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
const REGION_OPTIONS =
  "<option value='all'>전체</option><option>인천·경기</option><option>충남</option><option>전북</option><option>강원·경북</option><option>부산·경남</option><option>전남</option><option>제주</option>";
const TYPE_OPTIONS =
  "<option value='all'>전체</option><option>잔교</option><option>방파제</option><option>항구</option><option>포구</option><option>갯바위</option><option>갯벌</option><option>해변</option>";
const EXTRA_POINTS =
  "{id:'jumunjin',n:'주문진항 방파제',r:'강원·경북',a:'강원 강릉',l:'초보',t:'방파제',lat:37.8925,lng:128.8300,img:0,fish:['고등어','전갱이','우럭'],best:'새벽과 해 질 무렵',note:'동해권에서 접근성이 좋은 항구형 포인트로 생활낚시와 짧은 출조에 맞습니다.',warn:'너울이 들어오는 날에는 외항 끝단 접근을 피하세요.'},{id:'anmok',n:'강릉항·안목 방파제',r:'강원·경북',a:'강원 강릉',l:'초보',t:'방파제',lat:37.7717,lng:128.9514,img:1,fish:['고등어','전갱이','가자미'],best:'동틀 무렵과 만조 전후',note:'카페거리와 항구가 가까워 초행자도 동선을 잡기 쉽습니다.',warn:'관광객이 많은 시간에는 캐스팅 방향과 보행 동선을 분리하세요.'},{id:'mukho',n:'묵호항 방파제',r:'강원·경북',a:'강원 동해',l:'보통',t:'항구',lat:37.5507,lng:129.1155,img:2,fish:['가자미','우럭','도다리'],best:'물색이 안정된 아침 시간',note:'항구와 방파제 구간을 나눠 탐색하기 좋은 동해 중부권 포인트입니다.',warn:'테트라포드 진입은 미끄럼과 추락 위험이 커 피하세요.'},{id:'jangho',n:'삼척 장호항',r:'강원·경북',a:'강원 삼척',l:'보통',t:'항구',lat:37.2860,lng:129.3130,img:3,fish:['우럭','놀래미','무늬오징어'],best:'해질 무렵과 밤 초입',note:'맑은 수심과 암반 지형이 있어 루어와 에깅을 함께 보기 좋습니다.',warn:'관광지 동선과 낮은 갯바위는 파도 상황을 보고 접근하세요.'},{id:'hupo',n:'울진 후포항',r:'강원·경북',a:'경북 울진',l:'초보',t:'항구',lat:36.6777,lng:129.4539,img:4,fish:['가자미','고등어','우럭'],best:'새벽 피딩과 해 질 무렵',note:'동해안 긴 방파제와 항구권을 함께 볼 수 있는 생활낚시 포인트입니다.',warn:'선박 입출항 구역과 작업 구간은 비워두세요.'},{id:'ganggu',n:'영덕 강구항',r:'강원·경북',a:'경북 영덕',l:'보통',t:'항구',lat:36.3595,lng:129.3895,img:5,fish:['도다리','우럭','전갱이'],best:'조류가 살아나는 시간대',note:'항구권과 방파제권을 함께 확인하기 좋아 동해 남부권 이동 동선에 맞습니다.',warn:'강한 북동풍과 너울이 있는 날은 바깥 방파제를 피하세요.'},{id:'homigot',n:'포항 호미곶 갯바위',r:'강원·경북',a:'경북 포항',l:'숙련',t:'갯바위',lat:36.0764,lng:129.5685,img:0,fish:['농어','우럭','무늬오징어'],best:'해 뜨기 전후와 해 질 무렵',note:'외해 영향을 받는 갯바위권이라 손맛 기대가 크지만 안전 판단이 먼저입니다.',warn:'너울, 비, 야간 단독 진입 시에는 출조를 미루세요.'},{id:'yeongdo',n:'부산 영도 하리항·태종대권',r:'부산·경남',a:'부산 영도',l:'숙련',t:'갯바위',lat:35.0579,lng:129.0826,img:1,fish:['감성돔','농어','벵에돔'],best:'해질 무렵과 들물 초반',note:'남해 외해성 어종을 기대할 수 있는 부산권 대표 갯바위 구간입니다.',warn:'절벽형 지형과 너울 위험이 있어 안전 장비 없이 진입하지 마세요.'},{id:'dadaepo',n:'다대포 몰운대·방파제',r:'부산·경남',a:'부산 사하',l:'보통',t:'방파제',lat:35.0460,lng:128.9700,img:2,fish:['농어','전어','감성돔'],best:'해질 무렵과 물돌이 전후',note:'하구와 바다가 만나는 지형이라 계절 어종 변화가 뚜렷합니다.',warn:'하구 물살과 해무가 강하면 시야와 철수 시간을 먼저 확인하세요.'},{id:'jinhae',n:'진해 명동항 방파제',r:'부산·경남',a:'경남 창원',l:'초보',t:'방파제',lat:35.0906,lng:128.7220,img:3,fish:['볼락','전갱이','감성돔'],best:'해질 무렵과 밤 초입',note:'내만형 방파제라 초보자도 짧은 루어와 찌낚시를 나눠 보기 좋습니다.',warn:'선박 접안 구역과 낚시 금지 표지는 현장에서 확인하세요.'},{id:'gujora',n:'거제 구조라항',r:'부산·경남',a:'경남 거제',l:'초보',t:'항구',lat:34.8056,lng:128.6933,img:4,fish:['볼락','무늬오징어','감성돔'],best:'해질 무렵과 밤 초입',note:'항구, 해변, 섬권 출항지가 가까워 가족 출조와 짧은 낚시에 맞습니다.',warn:'피서철에는 수영 구역과 캐스팅 구역을 분리하세요.'},{id:'tongyeong',n:'통영 미수항·미륵도권',r:'부산·경남',a:'경남 통영',l:'보통',t:'항구',lat:34.8270,lng:128.4100,img:5,fish:['볼락','감성돔','무늬오징어'],best:'밤 초입과 조류가 움직이는 시간',note:'내만과 섬권이 가까워 날씨에 따라 포인트를 바꾸기 좋습니다.',warn:'방파제 끝단과 선박 동선은 현장 상황을 보고 비켜주세요.'},{id:'mijo',n:'남해 미조항',r:'부산·경남',a:'경남 남해',l:'보통',t:'항구',lat:34.7110,lng:128.0470,img:0,fish:['감성돔','볼락','무늬오징어'],best:'해질 무렵과 조금 전후',note:'남해 동부 섬권으로 이어지는 항구라 다양한 어종을 기대할 수 있습니다.',warn:'외항 쪽은 바람과 너울 영향이 커 낮은 자리를 피하세요.'},{id:'yeosu',n:'여수 국동항·돌산권',r:'전남',a:'전남 여수',l:'초보',t:'항구',lat:34.7307,lng:127.7355,img:1,fish:['감성돔','갈치','볼락'],best:'해질 무렵과 야간 초입',note:'항구와 돌산 방파제권을 함께 살피기 좋은 남해 대표 생활낚시 구간입니다.',warn:'야간 출조는 조명, 구명조끼, 이동 동선을 먼저 확인하세요.'},{id:'goheung',n:'고흥 녹동항',r:'전남',a:'전남 고흥',l:'초보',t:'항구',lat:34.5316,lng:127.1415,img:2,fish:['감성돔','전갱이','문어'],best:'물 흐름이 살아나는 시간대',note:'내만형 항구라 바람을 피할 수 있는 자리를 찾기 쉽습니다.',warn:'여객선과 어선 입출항 구간은 비워두세요.'},{id:'wando',n:'완도항 방파제',r:'전남',a:'전남 완도',l:'보통',t:'방파제',lat:34.3160,lng:126.7594,img:3,fish:['감성돔','볼락','문어'],best:'해질 무렵과 물돌이 전후',note:'완도권 섬과 내만을 잇는 방파제형 포인트로 계절 어종이 다양합니다.',warn:'강한 조류와 선박 동선을 함께 확인하세요.'},{id:'mokpo',n:'목포 북항·고하도권',r:'전남',a:'전남 목포',l:'초보',t:'항구',lat:34.7917,lng:126.3747,img:4,fish:['우럭','감성돔','숭어'],best:'만조 전후와 해 질 무렵',note:'도심 접근성이 좋고 내만형 포인트가 많아 짧은 출조에 맞습니다.',warn:'항만 작업 구역과 통제 구간은 현장 표지를 따르세요.'},{id:'jeju_topdong',n:'제주 탑동 방파제',r:'제주',a:'제주 제주시',l:'초보',t:'방파제',lat:33.5163,lng:126.5268,img:5,fish:['전갱이','한치','벵에돔'],best:'해질 무렵과 야간 초입',note:'제주시 도심에서 접근하기 쉬운 방파제형 포인트입니다.',warn:'관광객과 산책객이 많아 캐스팅 방향을 반드시 분리하세요.'},{id:'aewol',n:'애월항',r:'제주',a:'제주 제주시',l:'초보',t:'항구',lat:33.4657,lng:126.3196,img:0,fish:['전갱이','한치','무늬오징어'],best:'해질 무렵과 밤 초입',note:'서부 해안 드라이브 동선과 짧은 에깅을 함께 묶기 좋습니다.',warn:'바람이 강한 날은 외항보다 안쪽 발판을 우선하세요.'},{id:'seongsan',n:'성산포항',r:'제주',a:'제주 서귀포',l:'보통',t:'항구',lat:33.4738,lng:126.9271,img:1,fish:['벵에돔','무늬오징어','전갱이'],best:'새벽과 해질 무렵',note:'동부권 항구와 섬권 출항지가 가까워 어종 선택지가 넓습니다.',warn:'바람 방향에 따라 방파제 체감 위험이 크게 달라집니다.'},{id:'seogwipo',n:'서귀포항·새섬권',r:'제주',a:'제주 서귀포',l:'보통',t:'항구',lat:33.2390,lng:126.5581,img:2,fish:['벵에돔','한치','무늬오징어'],best:'밤 초입과 조류가 움직이는 시간',note:'남쪽 바다와 항구권을 함께 볼 수 있어 에깅과 찌낚시를 나누기 좋습니다.',warn:'너울이 있으면 낮은 방파제와 갯바위 접근을 피하세요.'},{id:'mosulpo',n:'모슬포항',r:'제주',a:'제주 서귀포',l:'초보',t:'항구',lat:33.2175,lng:126.2514,img:3,fish:['전갱이','한치','방어'],best:'해질 무렵과 야간 초입',note:'서남부 항구형 포인트로 계절 회유어와 생활낚시를 함께 기대할 수 있습니다.',warn:'선박 접안 구역과 바람 맞는 외항은 피하세요.'},{id:'chagwido',n:'차귀도 포구·갯바위권',r:'제주',a:'제주 제주시',l:'숙련',t:'포구',lat:33.3087,lng:126.1642,img:4,fish:['벵에돔','무늬오징어','부시리'],best:'해질 무렵과 조류가 살아나는 시간',note:'외해 영향을 받는 서부권 갯바위라 숙련자에게 맞는 포인트입니다.',warn:'너울, 강풍, 야간 단독 진입은 피하고 철수 시간을 먼저 잡으세요.'}";
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
const ADS_TXT = `google.com, pub-8468106244002167, DIRECT, f08c47fec0942fa0
`;
const FEED_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>해안낚시맵</title>
    <link>${SITE_URL}/</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>전국 해안가 낚시 포인트, 지도, 바다 예보, 안전 정보를 정리한 가이드입니다.</description>
    <language>ko-KR</language>
    <lastBuildDate>Mon, 08 Jun 2026 00:00:00 +0900</lastBuildDate>
    <pubDate>Mon, 08 Jun 2026 00:00:00 +0900</pubDate>
    <ttl>60</ttl>
    <item>
      <title>전국 해안가 낚시 포인트 지도</title>
      <link>${SITE_URL}/</link>
      <guid isPermaLink="true">${SITE_URL}/</guid>
      <description>서해, 동해, 남해, 제주 주요 해안가 낚시 포인트의 위치, 추천 시간, 주의사항, 바다 예보를 한눈에 비교할 수 있습니다.</description>
      <category>해안가 낚시</category>
      <pubDate>Mon, 08 Jun 2026 00:00:00 +0900</pubDate>
    </item>
  </channel>
</rss>
`;

function upgradeHomepage(html) {
  html = html
    .replace(
      /<meta name='description' content='[^']*'>/,
      "<meta name='description' content='전국 해안가 낚시 포인트를 실제 지도, 현장 사진, 바다 예보와 함께 비교하는 가이드입니다.'>",
    )
    .replace(/<title>[^<]*<\/title>/, "<title>전국 해안가 낚시 포인트 지도</title>")
    .replace(/서해안 낚시 포인트 지도/g, "전국 해안가 낚시 포인트 지도")
    .replace(/서해안 낚시/g, "전국 해안가 낚시")
    .replace(/서해낚시맵/g, "해안낚시맵")
    .replace("<span class='mark'>W</span>", "<span class='mark'>K</span>")
    .replace("href='#api'>예보", "href='#forecast'>예보")
    .replace("<strong>12</strong><span>서해 포인트</span>", "<strong>35</strong><span>해안 포인트</span>")
    .replace("<strong>실제</strong><span>지도 위치</span>", "<strong>전국</strong><span>권역 필터</span>")
    .replace("<strong>9+</strong><span>바다 예보</span>", "<strong>실시간</strong><span>바다 예보</span>")
    .replace(
      /<p class='lead'>[\s\S]*?<\/p><div class='actions'>/,
      "<p class='lead'>서해, 동해, 남해, 제주까지 주요 해안 포인트를 실제 지도에서 확인하세요. 어종, 좋은 시간대, 주의사항, 현재 바다 예보만 간단히 정리했습니다.</p><div class='actions'>",
    )
    .replace("예: 궁평항, 우럭, 초보", "예: 궁평항, 제주, 농어")
    .replace(
      "<select id='region'><option value='all'>전체</option><option>인천·경기</option><option>충남</option><option>전북</option></select>",
      `<select id='region'>${REGION_OPTIONS}</select>`,
    )
    .replace(
      /<select id='type'>[\s\S]*?<\/select>/,
      `<select id='type'>${TYPE_OPTIONS}</select>`,
    )
    .replace(
      "마커를 누르면 사진, 좌표, 길찾기, 바다 예보가 함께 바뀝니다.",
      DETAIL_COPY,
    )
    .replace("aria-label='서해안 낚시 포인트 지도'", "aria-label='전국 해안가 낚시 포인트 지도'")
    .replace("<section><div class='list-head'>", "<section id='forecast'><div class='list-head'>")
    .replace(".setView([36.63,126.48],8)", ".setView([35.8,127.8],6)")
    .replace(
      "n:'소무의도 몽여해변·광명항',r:'인천·경기',a:'인천 중구',l:'보통',t:'갯바위'",
      "n:'소무의도 몽여해변·광명항',r:'인천·경기',a:'인천 중구',l:'보통',t:'해변'",
    );

  if (!html.includes("id:'jumunjin'")) {
    html = html.replace("];let selected=", `,${EXTRA_POINTS}];let selected=`);
  }

  if (!html.includes("function regionColor")) {
    html = html.replace(
      "function image(p){return imgs[p.img%imgs.length]}function cls",
      "function image(p){return imgs[p.img%imgs.length]}function regionColor(r){return {'인천·경기':'#0f6b68','충남':'#d89b2b','전북':'#315f99','강원·경북':'#2a8fb8','부산·경남':'#7b5db8','전남':'#d85d47','제주':'#23633b'}[r]||'#0f6b68'}function cls",
    );
  }

  html = html.replace(
    /fillColor:p\.r==='충남'\?\s*'#d89b2b':p\.r==='전북'\?'#315f99':'#0f6b68'/,
    "fillColor:regionColor(p.r)",
  );

  return html;
}

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

  html = html.replace(/ca-pub-\d+/g, "ca-pub-8468106244002167");

  html = upgradeHomepage(html);

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

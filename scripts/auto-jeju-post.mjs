import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const articlesPath = path.join(rootDir, "jeju-travel-news", "assets", "articles.js");
const roadmapPath = path.join(rootDir, "jeju-travel-news", "content-roadmap.md");
const sitemapPath = path.join(rootDir, "sitemap.xml");
const feedPath = path.join(rootDir, "feed.xml");
const siteUrl = "https://www.moneyarchive.kr";
const fallbackImage = "https://tong.visitkorea.or.kr/cms/resource/91/3481291_image2_1.jpg";

const sectionCategory = [
  ["가볼 만한 곳", "가볼 만한 곳"],
  ["해변", "해변"],
  ["오름", "오름"],
  ["맛집", "맛집"],
  ["시장", "맛집"],
  ["카페", "카페"],
  ["계절", "계절 코스"],
  ["가족", "계절 코스"],
  ["날씨", "계절 코스"]
];

const imageByCategory = {
  "가볼 만한 곳": [
    "https://tong.visitkorea.or.kr/cms/resource/82/2944282_image2_1.bmp",
    "https://tong.visitkorea.or.kr/cms/resource/55/3354255_image2_1.jpg",
    "https://tong.visitkorea.or.kr/cms/resource/74/3347274_image2_1.jpg"
  ],
  "해변": [
    "https://tong.visitkorea.or.kr/cms/resource/93/4075293_image2_1.jpg",
    "https://tong.visitkorea.or.kr/cms/resource/91/3480191_image2_1.jpg",
    "https://tong.visitkorea.or.kr/cms/resource/01/3034601_image2_1.jpg"
  ],
  "오름": [
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=82"
  ],
  "맛집": [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=82"
  ],
  "카페": [
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=1200&q=82"
  ],
  "계절 코스": [
    "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1477601263568-180e2c6d046e?auto=format&fit=crop&w=1200&q=82"
  ]
};

const placeHints = [
  ["성산일출봉", "제주 동부 · 성산", ["광치기해변", "성산항", "섭지코지", "우도"]],
  ["우도", "제주 동부 · 우도", ["성산항", "서빈백사", "검멀레해변", "우도봉"]],
  ["섭지코지", "제주 동부 · 성산", ["성산일출봉", "광치기해변", "신양섭지해변", "성산항"]],
  ["비자림", "제주 동부 · 구좌", ["월정리해변", "세화해변", "김녕해수욕장", "안돌오름"]],
  ["산굼부리", "제주 동부 · 조천", ["제주돌문화공원", "교래자연휴양림", "비자림", "절물자연휴양림"]],
  ["용머리해안", "제주 서남부 · 안덕", ["산방산", "사계해변", "송악산", "화순금모래해변"]],
  ["천지연폭포", "서귀포 도심", ["새연교", "서귀포매일올레시장", "정방폭포", "이중섭거리"]],
  ["정방폭포", "서귀포 도심", ["천지연폭포", "서귀포항", "이중섭거리", "새연교"]],
  ["쇠소깍", "서귀포 · 하효동", ["하효항", "검은여해변", "정방폭포", "위미항"]],
  ["새별오름", "제주 서부 · 애월", ["금오름", "한담해안산책로", "곽지해수욕장", "오설록"]],
  ["사려니숲길", "제주 중산간 · 조천", ["절물자연휴양림", "산굼부리", "교래자연휴양림", "비자림"]],
  ["한라수목원", "제주시", ["수목원길", "노형동 카페", "도두봉", "이호테우해변"]],
  ["제주민속촌", "제주 동남부 · 표선", ["표선해수욕장", "성읍민속마을", "섭지코지", "서귀포 동부"]],
  ["오설록", "제주 서부 · 안덕", ["이니스프리 제주하우스", "저지오름", "협재해수욕장", "산방산"]],
  ["카멜리아힐", "제주 서남부 · 안덕", ["오설록", "중문관광단지", "산방산", "화순금모래해변"]],
  ["아쿠아플라넷", "제주 동부 · 성산", ["섭지코지", "성산일출봉", "광치기해변", "성산항"]],
  ["제주현대미술관", "제주 서부 · 한경", ["저지문화예술인마을", "오설록", "환상숲곶자왈", "협재해수욕장"]],
  ["이중섭거리", "서귀포 도심", ["서귀포매일올레시장", "천지연폭포", "새연교", "정방폭포"]],
  ["월정리", "제주 동부 · 구좌", ["월정리해변", "세화해변", "비자림", "김녕해수욕장"]],
  ["김녕", "제주 동부 · 구좌", ["김녕해수욕장", "월정리해변", "김녕미로공원", "만장굴"]],
  ["협재", "제주 서부 · 한림", ["협재해수욕장", "금능해수욕장", "한림공원", "비양도 전망"]],
  ["금능", "제주 서부 · 한림", ["금능해수욕장", "협재해수욕장", "한림공원", "비양도 전망"]],
  ["함덕", "제주 북동부 · 조천", ["함덕해수욕장", "서우봉", "조천포구", "북촌"]],
  ["세화", "제주 동부 · 구좌", ["세화해변", "세화오일장", "월정리해변", "비자림"]],
  ["표선", "제주 동남부 · 표선", ["표선해수욕장", "제주민속촌", "성읍민속마을", "섭지코지"]],
  ["중문", "제주 서귀포 · 중문", ["중문색달해수욕장", "주상절리", "천제연폭포", "중문관광단지"]],
  ["곽지", "제주 서부 · 애월", ["곽지해수욕장", "한담해안산책로", "애월 카페거리", "협재해수욕장"]],
  ["이호테우", "제주시 · 이호", ["이호테우해변", "도두봉", "용담해안도로", "제주공항"]],
  ["삼양", "제주시 · 삼양", ["삼양해수욕장", "제주항", "동문시장", "함덕해수욕장"]],
  ["신창", "제주 서부 · 한경", ["신창풍차해안도로", "수월봉", "차귀도", "한경 카페"]],
  ["용담", "제주시 · 용담", ["용담해안도로", "제주공항", "도두봉", "이호테우해변"]],
  ["하도", "제주 동부 · 구좌", ["하도해변", "세화해변", "종달리", "우도 전망"]],
  ["다랑쉬", "제주 동부 · 구좌", ["다랑쉬오름", "아끈다랑쉬오름", "비자림", "세화해변"]],
  ["아부오름", "제주 동부 · 구좌", ["아부오름", "비자림", "송당리", "안돌오름"]],
  ["금오름", "제주 서부 · 한림", ["금오름", "협재해수욕장", "오설록", "새별오름"]],
  ["따라비", "제주 동남부 · 표선", ["따라비오름", "가시리", "성읍민속마을", "표선해수욕장"]],
  ["동문시장", "제주시", ["동문시장", "칠성로", "탑동", "제주항"]],
  ["흑돼지거리", "제주시", ["흑돼지거리", "동문시장", "탑동", "제주항"]],
  ["고기국수", "제주시", ["고기국수 거리", "동문시장", "제주공항", "용담해안도로"]],
  ["모슬포", "제주 서남부 · 대정", ["모슬포항", "송악산", "산방산", "사계해변"]],
  ["오일장", "제주 전역", ["제주시민속오일장", "세화오일장", "동문시장", "서귀포매일올레시장"]],
  ["공항", "제주시 · 공항권", ["제주공항", "용담해안도로", "도두봉", "이호테우해변"]]
];

const slugTokens = [
  ["성산일출봉", "seongsan-sunrise"], ["우도", "udo"], ["섭지코지", "seopjikoji"],
  ["비자림", "bijarim"], ["산굼부리", "sangumburi"], ["제주돌문화공원", "jeju-stone-park"],
  ["용머리해안", "yongmeori-coast"], ["천지연폭포", "cheonjiyeon-waterfall"], ["정방폭포", "jeongbang-waterfall"],
  ["쇠소깍", "soesokkak"], ["새별오름", "saebyeol-oreum"], ["사려니숲길", "saryeoni-forest"],
  ["한라수목원", "hallasan-arboretum"], ["제주민속촌", "jeju-folk-village"], ["오설록", "osulloc"],
  ["카멜리아힐", "camellia-hill"], ["아쿠아플라넷", "aqua-planet"], ["제주현대미술관", "jeju-modern-art-museum"],
  ["이중섭거리", "lee-jung-seop-street"], ["월정리", "woljeongri"], ["김녕", "gimnyeong"],
  ["협재", "hyeopjae"], ["금능", "geumneung"], ["함덕", "hamdeok"], ["세화", "sehwa"],
  ["표선", "pyoseon"], ["중문색달", "jungmun-saekdal"], ["중문", "jungmun"], ["곽지", "gwakji"],
  ["이호테우", "iho-taewoo"], ["삼양", "samyang"], ["신창", "shinchang"], ["용담", "yongdam"],
  ["하도", "hado"], ["다랑쉬", "darangshi"], ["아부오름", "abu-oreum"], ["금오름", "geum-oreum"],
  ["따라비", "ttarabi"], ["용눈이", "yongnuni"], ["안돌", "andol"], ["백약이", "baekyaki"],
  ["거문오름", "geomun-oreum"], ["물영아리", "mulyeongari"], ["노꼬메", "nokkome"], ["군산오름", "gunsan-oreum"],
  ["저지오름", "jeoji-oreum"], ["한라산", "hallasan"], ["동문시장", "dongmun-market"],
  ["흑돼지거리", "black-pork-street"], ["고기국수", "gogi-guksu"], ["모슬포", "moseulpo"],
  ["오일장", "five-day-market"], ["공항", "airport"], ["카페", "cafe"], ["해변", "beach"],
  ["오름", "oreum"], ["주차", "parking"], ["입장료", "fee"], ["코스", "course"],
  ["가족", "family"], ["실내", "indoor"], ["여행", "travel"], ["동선", "route"],
  ["산책", "walk"], ["체크", "check"], ["가이드", "guide"]
];

function todayKst() {
  if (process.env.AUTO_POST_DATE) return process.env.AUTO_POST_DATE;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function boundedPostCount(value) {
  const count = Number(value);
  if (!Number.isFinite(count)) return 1;
  return Math.min(10, Math.max(1, Math.trunc(count)));
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/[·ㆍ\-_/]/g, "")
    .toLowerCase();
}

function imageKey(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    return `${url.origin}${url.pathname}`.toLowerCase();
  } catch (error) {
    return raw.split(/[?#]/)[0].toLowerCase();
  }
}

function xmlEscape(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function inferCategory(sectionTitle) {
  const found = sectionCategory.find(([keyword]) => sectionTitle.includes(keyword));
  return found?.[1] || "가볼 만한 곳";
}

async function importArticles() {
  const moduleUrl = `${pathToFileURL(articlesPath).href}?t=${Date.now()}`;
  const module = await import(moduleUrl);
  return {
    categories: module.categories,
    articles: module.articles
  };
}

async function parseRoadmap() {
  const text = await fs.readFile(roadmapPath, "utf8");
  let category = "";
  const candidates = [];

  for (const line of text.split(/\r?\n/)) {
    const section = line.match(/^###\s+(.+)/);
    if (section) {
      category = inferCategory(section[1]);
      continue;
    }

    const item = line.match(/^\d+\.\s+(.+)/);
    if (!item || !category) continue;
    candidates.push({
      title: item[1].trim(),
      category,
      index: candidates.length + 1
    });
  }

  return candidates;
}

function primaryKeyword(title) {
  const placeMatch = placeHints.find(([keyword]) => title.includes(keyword));
  if (placeMatch) return placeMatch[0];

  return String(title || "")
    .replace(/\s*(주차|입장료|운영시간|소요시간|여행|방문|체크|코스|동선|정리|가이드|추천|카페|맛집|반나절|당일치기|가족|실내|산책|드라이브|시즌|시간|날짜|근처|전|후|전망|초보|등산|일몰|일출|야간|물때|예약|탐방|먹거리|아침식사|점심|저녁|마지막|첫날|하루)+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 2)
    .join(" ");
}

function candidateCoverageKeys(title) {
  const keys = placeHints
    .filter(([keyword]) => title.includes(keyword))
    .map(([keyword]) => normalizeText(keyword));
  const primary = normalizeText(primaryKeyword(title));
  if (primary) keys.push(primary);
  return [...new Set(keys)].filter((key) => key.length >= 2);
}

function alreadyCovered(candidate, articles) {
  const keys = candidateCoverageKeys(candidate.title);
  const full = normalizeText(candidate.title);
  return articles.some((article) => {
    const haystack = normalizeText([
      article.title,
      article.slug,
      article.region,
      ...(article.course || []),
      ...(article.nearbySpots || [])
    ].join(" "));
    return haystack.includes(full) || keys.some((key) => haystack.includes(key));
  });
}

function slugify(title, date, index) {
  const matched = [];
  for (const [keyword, token] of slugTokens) {
    if (title.includes(keyword) && !matched.includes(token)) matched.push(token);
  }

  const base = matched.join("-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base ? `${base}-${date.replaceAll("-", "")}` : `jeju-auto-${date.replaceAll("-", "")}-${index}`;
}

function inferPlace(title) {
  return placeHints.find(([keyword]) => title.includes(keyword)) || ["제주", "제주 전역", ["제주시", "서귀포", "해안도로", "시장"]];
}

function categoryIntent(category) {
  if (category === "해변") return "바다 산책과 물놀이, 카페 동선";
  if (category === "오름") return "주차와 소요 시간, 날씨에 따른 난이도";
  if (category === "맛집") return "식사 시간대와 주차, 주변 이동";
  if (category === "카페") return "카페 휴식과 주변 산책";
  if (category === "숙소") return "숙소 위치와 권역별 이동";
  if (category === "계절 코스") return "계절 변수와 대체 동선";
  return "주차, 운영시간, 주변 코스";
}

function hasFinalConsonant(value) {
  const text = String(value || "").trim();
  if (!text) return false;
  const last = [...text].pop();
  const code = last.charCodeAt(0) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0;
}

function objectPhrase(value) {
  return `${value}${hasFinalConsonant(value) ? "을" : "를"}`;
}

function buildCourse(candidate, place, nearby) {
  const title = candidate.title;
  if (candidate.category === "맛집") return [place, "주변 주차 확인", "식사", nearby[0] || "시장 산책"];
  if (candidate.category === "카페") return [place, "카페", nearby[0] || "해안 산책", nearby[1] || "주변 여행지"];
  if (candidate.category === "해변") return [place, "해변 산책", nearby[0] || "근처 카페", nearby[1] || "주변 포인트"];
  if (candidate.category === "오름") return [place, "오름 산책", nearby[0] || "중산간 카페", nearby[1] || "주변 숲길"];
  if (title.includes("비 오는 날") || title.includes("실내")) return [place, "실내 관광지", "시장 또는 카페", nearby[0] || "숙소 복귀"];
  return [place, nearby[0] || "주변 산책", nearby[1] || "카페 휴식", nearby[2] || "식사"];
}

function buildArticle(candidate, date, publishAt, official = null, usedImageKeys = new Set()) {
  const [place, region, nearby] = inferPlace(candidate.title);
  const course = buildCourse(candidate, place, nearby);
  const imagePool = imageByCategory[candidate.category] || [fallbackImage];
  const imageCandidates = [
    official?.image,
    ...imagePool,
    ...Object.values(imageByCategory).flat(),
    fallbackImage
  ].filter(Boolean);
  const image = imageCandidates.find((value) => !usedImageKeys.has(imageKey(value))) || imageCandidates[0] || fallbackImage;
  const address = official?.address || `${region} 일대`;
  const intent = categoryIntent(candidate.category);
  const slug = slugify(candidate.title, date, candidate.index);

  return {
    title: candidate.title,
    slug,
    category: candidate.category,
    status: "published",
    publishAt,
    region,
    image,
    summary: `${objectPhrase(place)} 중심으로 ${intent} 관련 정보를 확인하기 좋게 정리한 제주 여행 정보입니다.`,
    date,
    course,
    address,
    parking: `${place} 주변 주차장은 성수기와 주말에 혼잡할 수 있습니다. 도착 전 공영 주차장 위치와 도보 이동 시간을 함께 확인하세요.`,
    fee: `${candidate.category === "해변" || candidate.category === "오름" ? "대부분 무료로 둘러볼 수 있으나" : "입장료나 이용료가 있을 수 있으므로"} 방문 전 공식 안내와 현장 요금을 확인하세요.`,
    operatingHours: "운영시간은 계절, 날씨, 현장 사정에 따라 달라질 수 있습니다. 늦은 오후 방문이라면 마감 시간을 먼저 확인하세요.",
    content: [
      `${candidate.title}는 ${region} 권역에서 일정을 잡을 때 함께 보기 좋은 주제입니다. 단순히 한 곳만 찍고 이동하기보다 주차, 이동 시간, 주변 식사나 카페까지 같이 계산하면 여행 피로를 줄일 수 있습니다.`,
      `${place} 일정은 오전과 늦은 오후의 체감이 다릅니다. 사진을 원하면 빛이 부드러운 시간대를 고르고, 아이나 부모님과 함께라면 화장실과 휴식 지점이 가까운 동선을 우선하는 편이 좋습니다.`,
      `추천 동선은 ${course.join(" → ")} 순서입니다. 시간이 짧다면 첫 두 곳만 보고, 여유가 있으면 ${nearby.slice(0, 3).join(", ")}까지 같은 권역으로 묶어 움직이면 동선이 자연스럽습니다.`,
      `비나 강풍 예보가 있으면 야외 체류 시간을 줄이고 실내 카페나 시장을 대체 코스로 준비하세요. 제주 여행은 이동 거리가 생각보다 길어질 수 있으므로 하루에 동쪽과 서쪽을 동시에 넣는 구성은 피하는 것이 안전합니다.`
    ],
    nearbySpots: nearby.slice(0, 4)
  };
}

async function fetchOfficialInfo(candidate) {
  const serviceKey = (process.env.KTO_TOUR_API_KEY || process.env.KTO_SERVICE_KEY || process.env.TOUR_API_KEY || "").trim();
  if (!serviceKey) return null;

  const keyword = primaryKeyword(candidate.title) || candidate.title;
  const search = new URLSearchParams({
    MobileOS: "ETC",
    MobileApp: "JejuAutoPost",
    _type: "json",
    numOfRows: "5",
    pageNo: "1",
    arrange: "Q",
    keyword
  });
  const encodedKey = /%[0-9a-f]{2}/i.test(serviceKey) ? serviceKey : encodeURIComponent(serviceKey);
  const url = `https://apis.data.go.kr/B551011/KorService2/searchKeyword2?${search.toString()}&serviceKey=${encodedKey}`;

  try {
    const response = await fetch(url, { headers: { accept: "application/json" } });
    const payload = await response.json();
    const item = payload?.response?.body?.items?.item;
    const items = Array.isArray(item) ? item : item ? [item] : [];
    const keywordKey = normalizeText(keyword);
    const match = items.find((entry) => {
      const titleKey = normalizeText(entry.title);
      const addressKey = normalizeText([entry.addr1, entry.addr2].filter(Boolean).join(" "));
      const samePlace = titleKey && (titleKey.includes(keywordKey) || keywordKey.includes(titleKey));
      const isJeju = addressKey.includes("제주") || String(entry.areacode || "") === "39";
      return samePlace && isJeju && (entry.firstimage || entry.firstimage2);
    });
    if (!match) return null;
    return {
      image: match.firstimage || match.firstimage2 || "",
      address: [match.addr1, match.addr2].filter(Boolean).join(" ")
    };
  } catch (error) {
    return null;
  }
}

function isPublic(article, date) {
  const status = String(article.status || "published").toLowerCase();
  if (status === "draft" || status === "private") return false;
  const articleDate = article.date || "";
  return !articleDate || articleDate <= date;
}

function buildArticlesSource(categories, articles) {
  return `export const categories = ${JSON.stringify(categories, null, 2)};\n\nexport const articles = ${JSON.stringify(articles, null, 2)};\n`;
}

function buildSitemap(articles, date) {
  const urls = [
    {
      loc: `${siteUrl}/`,
      lastmod: date,
      changefreq: "daily",
      priority: "1.0"
    },
    ...articles.filter((article) => isPublic(article, date)).map((article) => ({
      loc: `${siteUrl}/article.html?slug=${encodeURIComponent(article.slug)}`,
      lastmod: article.publishAt || article.date || date,
      changefreq: "weekly",
      priority: "0.8"
    }))
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((item) => `  <url>\n    <loc>${xmlEscape(item.loc)}</loc>\n    <lastmod>${xmlEscape(item.lastmod)}</lastmod>\n    <changefreq>${item.changefreq}</changefreq>\n    <priority>${item.priority}</priority>\n  </url>`).join("\n")}\n</urlset>\n`;
}

function pubDate(value) {
  const raw = value || todayKst();
  const parsed = new Date(String(raw).includes("T") ? raw : `${raw}T00:00:00+09:00`);
  return parsed.toUTCString();
}

function buildFeed(articles, date) {
  const items = articles
    .filter((article) => isPublic(article, date))
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .slice(0, 30);

  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n  <title>제주여행뉴스</title>\n  <link>${siteUrl}/</link>\n  <description>제주 가볼 만한 곳, 맛집, 카페, 숙소, 계절 코스를 정리하는 제주 여행 정보 매거진</description>\n  <language>ko-KR</language>\n  <lastBuildDate>${pubDate(items[0]?.publishAt || date)}</lastBuildDate>\n${items.map((article) => {
    const link = `${siteUrl}/article.html?slug=${encodeURIComponent(article.slug)}`;
    return `  <item>\n    <title>${xmlEscape(article.title)}</title>\n    <link>${xmlEscape(link)}</link>\n    <guid isPermaLink="true">${xmlEscape(link)}</guid>\n    <description>${xmlEscape(article.summary)}</description>\n    <category>${xmlEscape(article.category)}</category>\n    <pubDate>${pubDate(article.publishAt || article.date || date)}</pubDate>\n  </item>`;
  }).join("\n")}\n</channel>\n</rss>\n`;
}

async function main() {
  const date = todayKst();
  const publishAt = new Date().toISOString();
  const count = boundedPostCount(process.env.AUTO_POST_COUNT || "1");
  const { categories, articles } = await importArticles();
  const candidates = await parseRoadmap();
  const nextArticles = [...articles];
  const usedImageKeys = new Set(nextArticles.map((article) => imageKey(article.image)).filter(Boolean));
  const added = [];

  for (const candidate of candidates) {
    if (added.length >= count) break;
    if (alreadyCovered(candidate, nextArticles)) continue;
    const official = await fetchOfficialInfo(candidate);
    const article = buildArticle(candidate, date, publishAt, official, usedImageKeys);
    if (nextArticles.some((item) => item.slug === article.slug)) continue;
    nextArticles.unshift(article);
    usedImageKeys.add(imageKey(article.image));
    added.push(article);
  }

  if (!added.length) {
    console.log("No new article candidate available.");
    return;
  }

  await fs.writeFile(articlesPath, buildArticlesSource(categories, nextArticles), "utf8");
  await fs.writeFile(sitemapPath, buildSitemap(nextArticles, date), "utf8");
  await fs.writeFile(feedPath, buildFeed(nextArticles, date), "utf8");

  console.log(`Added ${added.length} article(s):`);
  for (const article of added) {
    console.log(`- ${article.title} (${article.slug})`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

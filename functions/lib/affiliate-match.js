const GENERIC_TERMS = new Set([
  "제주", "여행", "코스", "가이드", "정보", "정리", "추천", "방문", "체크",
  "투어", "티켓", "액티비티", "상품", "주변", "근처", "일정", "당일치기",
  "반나절", "하루", "가기", "좋은", "편한", "부모님과", "아이와", "가족과",
  "전국", "전역", "동부", "서부", "남부", "북부", "동쪽", "서쪽", "도심",
  "권역", "일대", "초보", "기준", "방법", "전", "후"
]);

const CATEGORY_INTENTS = {
  "가볼 만한 곳": ["관광", "입장권", "체험", "투어", "티켓"],
  "해변": ["바다", "해양", "서핑", "스노클", "다이빙", "카약", "패들", "요트", "보트"],
  "오름": ["오름", "트레킹", "하이킹", "등산", "숲", "산책", "한라산"],
  "맛집": ["맛집", "미식", "푸드", "시장", "쿠킹", "요리", "먹거리", "식도락"],
  "카페": ["카페", "커피", "디저트", "티룸", "베이커리"],
  "숙소": ["숙소", "호텔", "리조트", "펜션", "게스트하우스"],
  "계절 코스": ["관광", "체험", "투어", "트레킹", "입장권", "티켓"]
};

const WATER_INTENTS = CATEGORY_INTENTS["해변"];
const LOCATION_SUFFIXES = [
  "해수욕장", "카페거리", "해안도로", "일출봉", "자연휴양림", "민속마을",
  "관광단지", "미술관", "박물관", "수목원", "돌문화공원", "해변", "오름",
  "시장", "숲길", "폭포", "포구", "전망대", "공원", "거리", "항"
];

export function normalizeAffiliateText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^0-9a-z가-힣]+/g, "");
}

function stripLocationSuffix(value) {
  for (const suffix of LOCATION_SUFFIXES) {
    if (value.length > suffix.length + 1 && value.endsWith(suffix)) {
      return value.slice(0, -suffix.length);
    }
  }
  return value;
}

function termsFrom(values) {
  const terms = new Set();
  for (const value of values.flat()) {
    const tokens = String(value || "").match(/[0-9a-zA-Z가-힣]+/g) || [];
    for (const rawToken of tokens) {
      const token = rawToken.toLowerCase();
      if (token.length < 2 || GENERIC_TERMS.has(token)) continue;
      terms.add(token);
      const shortened = stripLocationSuffix(token);
      if (shortened.length >= 2 && !GENERIC_TERMS.has(shortened)) terms.add(shortened);
    }
  }
  return [...terms];
}

function matchingTerms(haystack, terms) {
  return terms.filter((term) => haystack.includes(normalizeAffiliateText(term)));
}

function intentTerms(category) {
  return CATEGORY_INTENTS[category] || CATEGORY_INTENTS["가볼 만한 곳"];
}

export function affiliateMatchContext(value = {}) {
  const nearby = Array.isArray(value.nearby)
    ? value.nearby
    : String(value.nearby || "").split(/[|,]/).filter(Boolean);
  const category = String(value.category || "가볼 만한 곳").trim();
  const primary = termsFrom([value.spot, value.title]);
  const region = termsFrom([value.region]);
  const nearbyTerms = termsFrom(nearby);

  return {
    category,
    scope: String(value.scope || "home"),
    primary,
    region,
    nearby: nearbyTerms,
    intents: intentTerms(category)
  };
}

export function scoreAffiliateItem(item = {}, value = {}) {
  const context = value.primary ? value : affiliateMatchContext(value);
  const haystack = normalizeAffiliateText([
    item.title,
    item.category,
    item.region,
    item.description
  ].filter(Boolean).join(" "));

  if (!haystack || !item.url) return { score: -1, relevant: false };

  const primaryMatches = matchingTerms(haystack, context.primary);
  const regionMatches = matchingTerms(haystack, context.region);
  const nearbyMatches = matchingTerms(haystack, context.nearby);
  const matchedIntents = matchingTerms(haystack, context.intents);
  const waterMatches = matchingTerms(haystack, WATER_INTENTS);
  const locationMatched = primaryMatches.length > 0 || regionMatches.length > 0 || nearbyMatches.length > 0;
  const intentMatched = matchedIntents.length > 0;
  const strict = context.scope !== "home";

  let score = primaryMatches.length * 10
    + regionMatches.length * 6
    + nearbyMatches.length * 3
    + matchedIntents.length * 2;

  if (["맛집", "카페"].includes(context.category) && waterMatches.length && !intentMatched) score -= 20;

  let relevant;
  if (!strict) {
    relevant = score > 0;
  } else if (["맛집", "카페"].includes(context.category)) {
    relevant = locationMatched && intentMatched;
  } else if (context.category === "숙소") {
    relevant = locationMatched && intentMatched;
  } else if (context.primary.length) {
    relevant = primaryMatches.length > 0 || (regionMatches.length > 0 && intentMatched);
  } else if (context.region.length) {
    relevant = regionMatches.length > 0 && intentMatched;
  } else {
    relevant = false;
  }

  return {
    score,
    relevant,
    matches: {
      primary: primaryMatches,
      region: regionMatches,
      nearby: nearbyMatches,
      intent: matchedIntents
    }
  };
}

export function rankAffiliateItems(items = [], value = {}, options = {}) {
  const context = affiliateMatchContext(value);
  const limit = Math.max(1, Math.min(12, Number(options.limit) || 6));
  const allowUnmatched = options.allowUnmatched ?? context.scope === "home";
  const seen = new Set();
  const validItems = items.filter((item) => {
    if (!item?.title || !item?.url) return false;
    const key = normalizeAffiliateText(item.url || item.title);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const ranked = validItems
    .map((item, index) => ({ item, index, ...scoreAffiliateItem(item, context) }))
    .filter((entry) => entry.relevant)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.item);

  if (ranked.length) return ranked.slice(0, limit);
  return allowUnmatched ? validItems.slice(0, limit) : [];
}

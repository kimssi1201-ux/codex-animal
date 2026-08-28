// Broad region groups for /region/ landing pages.
// `articles[].region` is free text written across many content passes
// ("제주 동부 · 구좌", "서귀포 · 남부", "제주 서남부 · 안덕" ...), so this module
// buckets that text into a small set of navigable regions instead of
// requiring every article to carry a clean region id.
export const regionGroups = [
  {
    id: "jeju-si",
    label: "제주시",
    eyebrow: "Jeju-si",
    blurb: "공항권, 원도심, 노형·연동 등 제주시 권역의 여행 정보를 모았습니다."
  },
  {
    id: "seogwipo",
    label: "서귀포",
    eyebrow: "Seogwipo",
    blurb: "서귀포 시내, 중문, 안덕, 동홍동·천지동 등 서귀포 권역의 여행 정보를 모았습니다."
  },
  {
    id: "dong",
    label: "동부",
    eyebrow: "East",
    blurb: "구좌, 성산, 우도, 표선, 조천 등 제주 동부 권역의 여행 정보를 모았습니다."
  },
  {
    id: "seo",
    label: "서부",
    eyebrow: "West",
    blurb: "애월, 한림, 한경 등 제주 서부 권역의 여행 정보를 모았습니다."
  },
  {
    id: "nam",
    label: "남부",
    eyebrow: "South",
    blurb: "대정 등 제주 서남부 권역의 여행 정보를 모았습니다."
  },
  {
    id: "buk",
    label: "북부",
    eyebrow: "North",
    blurb: "삼양 등 제주 북부 해안 권역의 여행 정보를 모았습니다."
  },
  {
    id: "jeonyeok",
    label: "제주 전역",
    eyebrow: "All Jeju",
    blurb: "제주 전역, 계절 코스, 한라산 권역 등 지역을 하나로 특정하기 어려운 여행 정보를 모았습니다."
  }
];

export const regionGroupsById = new Map(regionGroups.map((group) => [group.id, group]));

// Individual place names get tagged inconsistently across content passes
// (e.g. "제주 서남부 · 안덕", "제주 서부 · 안덕" and "제주 서귀포 · 안덕" all
// refer to the same neighborhood). Checked before the broader directional
// rules below so every article about the same place lands in one bucket.
const neighborhoodOverrides = [
  ["안덕", "seogwipo"],
  ["조천", "dong"]
];

// Priority-ordered keyword matches. Checked top to bottom, first match wins.
const regionRules = [
  ["서귀포", "seogwipo"],
  ["제주시", "jeju-si"],
  ["북동부", "buk"],
  ["서남부", "nam"],
  ["동남부", "dong"],
  ["서부", "seo"],
  ["동부", "dong"],
  ["남부", "nam"],
  ["북부", "buk"]
];

export function classifyRegion(article = {}) {
  const region = String(article.region || "");
  for (const [keyword, id] of neighborhoodOverrides) {
    if (region.includes(keyword)) return id;
  }
  for (const [keyword, id] of regionRules) {
    if (region.includes(keyword)) return id;
  }
  return "jeonyeok";
}

export function groupArticlesByRegion(articles = []) {
  const buckets = new Map(regionGroups.map((group) => [group.id, []]));
  articles.forEach((article) => {
    const id = classifyRegion(article);
    (buckets.get(id) || buckets.get("jeonyeok")).push(article);
  });
  return buckets;
}

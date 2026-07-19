import { articles, categories } from "./articles.js?v=20260718-images-12";

const $ = (selector) => document.querySelector(selector);
const params = new URLSearchParams(window.location.search);
const fallbackImage = "https://tong.visitkorea.or.kr/cms/resource/91/3481291_image2_1.jpg";
const tourismDataVersion = "20260718-images-12";
const detailPath = window.location.pathname.includes("/jeju-travel-news/") ? "article.html" : "/article.html";
const officialCache = new Map();
const airportCache = new Map();
const regionCache = new Map();
const tnaCategoryCache = new Map();
const myrealtripRequestKeys = new Map();
const articleThumbnailCache = new Map();
const articleThumbnailRequests = new Map();
const publicNow = Date.now();
const officialImageSlugs = new Set([
  "jeju-stay-location-guide",
  "jeju-city-stay-route-guide",
  "seogwipo-stay-route-guide",
  "hamdeok-stay-location-guide",
  "aewol-stay-location-guide",
  "seongsan-stay-location-guide",
  "jungmun-stay-location-guide",
  "rainy-day-indoor-jeju",
  "east-jeju-2days",
  "seongsan-sunrise-course",
  "hyeopjae-half-day",
  "hamdeok-cafe-street",
  "udo-day-trip",
  "seogwipo-olle-market-food",
  "sangumburi-autumn-course",
  "hallasan-beginner-trail",
  "seopjikoji-coastal-walk-guide",
  "bijarim-forest-walk-guide",
  "saryeoni-forest-road-check",
  "spring-jeju-canola-blossom-route",
  "yongmeori-coast-visit-check",
  "jeongbang-waterfall-guide",
  "cheonjiyeon-night-walk-course",
  "woljeongri-beach-cafe-walk",
  "gimnyeong-beach-light-guide",
  "osulloc-west-jeju-course",
  "jeju-stone-park-rainy-day-course",
  "soesokkak-hahyo-walk-guide",
  "pyoseon-beach-family-guide",
  "dongmun-market-evening-food-route",
  "geum-oreum-sunset-walk-guide",
  "saebyeol-oreum-silvergrass-guide",
  "camellia-hill-season-guide",
  "aqua-planet-jeju-family-guide",
  "lee-jung-seop-street-walk-guide",
  "gimnyeong-maze-park-family-guide",
  "jeju-43-peace-park-guide",
  "hangmong-historic-site-guide",
  "jeju-herb-dongsan-night-guide",
  "nohyung-supermarket-indoor-guide",
  "arte-museum-jeju-indoor-guide",
  "suwolbong-geotrail-guide",
  "songaksan-dulle-gil-guide",
  "bangju-church-architecture-guide",
  "hallasan-arboretum-walk-guide"
]);
const articleImageKeywordOverrides = new Map([
  ["aewol-coastal-drive", "애월해안도로"],
  ["rainy-day-indoor-jeju", "제주현대미술관"],
  ["east-jeju-2days", "함덕해수욕장"],
  ["west-jeju-cafe-tour", "협재해수욕장"],
  ["seongsan-sunrise-course", "성산일출봉"],
  ["hyeopjae-half-day", "협재해수욕장"],
  ["hamdeok-cafe-street", "함덕해수욕장"],
  ["udo-day-trip", "우도"],
  ["seogwipo-olle-market-food", "올레시장"],
  ["sangumburi-autumn-course", "산굼부리"],
  ["hallasan-beginner-trail", "한라산"],
  ["family-friendly-jeju", "아쿠아플라넷 제주"],
  ["jeju-accommodation-location", "함덕해수욕장"],
  ["seopjikoji-coastal-walk-guide", "섭지코지"],
  ["bijarim-forest-walk-guide", "비자림"],
  ["saryeoni-forest-road-check", "사려니숲길"],
  ["yongmeori-coast-visit-check", "용머리해안"],
  ["jeongbang-waterfall-guide", "정방폭포"],
  ["cheonjiyeon-night-walk-course", "천지연폭포"],
  ["woljeongri-beach-cafe-walk", "월정리해변"],
  ["gimnyeong-beach-light-guide", "김녕해수욕장"],
  ["pyoseon-beach-family-guide", "표선해수욕장"],
  ["jeju-stone-park-rainy-day-course", "제주돌문화공원"],
  ["dongmun-market-evening-food-route", "동문재래시장"],
  ["jeju-black-pork-street-check", "흑돼지거리"],
  ["jeju-city-accommodation-route", "한라수목원"],
  ["seogwipo-accommodation-route", "천지연폭포"],
  ["lee-jung-seop-street-walk-guide", "이중섭거리"],
  ["jeju-43-peace-park-guide", "제주4.3평화공원"],
  ["hangmong-historic-site-guide", "항몽유적지"],
  ["arte-museum-jeju-indoor-guide", "아르떼뮤지엄 제주"],
  ["sehwa-five-day-market-food-route", "세화해변"],
  ["mosulpo-port-seafood-route", "모슬포항"],
  ["jocheon-breakfast-brunch-route", "함덕해수욕장"],
  ["aewol-sunset-cafe-route", "애월해안도로"],
  ["andok-tea-dessert-cafe-route", "오설록"],
  ["hamdeok-stay-location-guide", "함덕"],
  ["aewol-stay-location-guide", "애월"],
  ["seongsan-stay-location-guide", "성산"],
  ["jungmun-stay-location-guide", "중문"],
  ["spring-jeju-canola-blossom-route", "유채꽃"],
  ["summer-jeju-beach-swim-check", "협재해수욕장"],
  ["winter-jeju-camellia-snow-route", "카멜리아힐"],
  ["nohyung-supermarket-indoor-guide", "노형수퍼마켙"],
  ["hallasan-arboretum-walk-guide", "한라수목원"]
]);
const articleImageFallbacks = new Map([
  ["jeju-stay-location-guide", "https://tong.visitkorea.or.kr/cms/resource/83/2876783_image2_1.jpg"],
  ["jeju-city-stay-route-guide", "https://tong.visitkorea.or.kr/cms/resource/82/3089182_image2_1.jpg"],
  ["seogwipo-stay-route-guide", "https://tong.visitkorea.or.kr/cms/resource/45/3569245_image2_1.jpg"],
  ["hamdeok-stay-location-guide", "https://tong.visitkorea.or.kr/cms/resource/57/4086557_image2_1.jpg"],
  ["aewol-stay-location-guide", "https://tong.visitkorea.or.kr/cms/resource/06/4077606_image2_1.jpg"],
  ["seongsan-stay-location-guide", "https://tong.visitkorea.or.kr/cms/resource/92/3527092_image2_1.jpg"],
  ["jungmun-stay-location-guide", "https://tong.visitkorea.or.kr/cms/resource/85/4074085_image2_1.jpg"],
  ["sangumburi-autumn-course", "https://tong.visitkorea.or.kr/cms/resource/55/3354255_image2_1.jpg"],
  ["rainy-day-indoor-jeju", "https://tong.visitkorea.or.kr/cms/resource/63/3562163_image2_1.jpg"],
  ["east-jeju-2days", "https://tong.visitkorea.or.kr/cms/resource/64/3384664_image2_1.jpg"],
  ["saryeoni-forest-road-check", "https://tong.visitkorea.or.kr/cms/resource/30/3525130_image2_1.jpg"],
  ["dongmun-market-evening-food-route", "https://tong.visitkorea.or.kr/cms/resource/38/2678438_image2_1.jpg"],
  ["spring-jeju-canola-blossom-route", "https://tong.visitkorea.or.kr/cms/resource/69/3588469_image2_1.jpg"]
]);

function articlePublishTime(article) {
  const value = article.publishAt || article.date || "";
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
}

function isPublicArticle(article) {
  const status = String(article.status || "published").toLowerCase();
  if (status === "draft" || status === "private") return false;
  if (status === "scheduled" || articlePublishTime(article) > publicNow) {
    return articlePublishTime(article) <= publicNow;
  }
  return true;
}

const publicArticles = articles.filter(isPublicArticle);

let activeCategory = categories[0] || "전체";
const filterCategories = categories.filter((category) => category !== categories[0]);
let officialRequestId = 0;
let articleThumbnailObserver = null;
const observedArticleThumbs = new WeakSet();

const todayKeywords = [
  { label: "제주 가볼만한 곳", category: "가볼 만한 곳" },
  { label: "제주 해변", category: "해변" },
  { label: "제주 맛집", category: "맛집" },
  { label: "카페 투어", category: "카페" },
  { label: "오름 산책", category: "오름" },
  { label: "계절 코스", category: "계절 코스" },
  { label: "숙소 위치", category: "숙소" },
  { label: "비 오는 날", category: "계절 코스" }
];

const faqItems = [
  {
    question: "제주여행뉴스에서는 무엇을 먼저 보면 좋나요?",
    answer: "추천 기사를 먼저 보고, 관심 있는 카테고리를 고르면 됩니다. 처음 방문이라면 가볼 만한 곳, 해변, 계절 코스 순서로 보는 편이 쉽습니다."
  },
  {
    question: "관광지 정보는 어디에서 확인하나요?",
    answer: "뉴스 피드 안의 장소 카드를 열면 주소, 분류, 위치 확인 링크를 볼 수 있습니다. 운영시간과 요금은 방문 직전 공식 안내를 다시 확인하세요."
  },
  {
    question: "상품이나 광고 영역이 있나요?",
    answer: "제주 여행 정보를 해치지 않는 범위에서 애드센스 광고와 마이리얼트립 제휴 상품 영역을 함께 운영합니다. 광고성 링크는 여행 준비 흐름에 맞는 위치에만 배치합니다."
  }
];

const footerGroups = [
  { title: "제주 여행", links: ["가볼 만한 곳", "해변", "오름", "계절 코스"] },
  { title: "여행 준비", links: ["방문 전 체크", "숙소 위치", "비 오는 날", "가족 여행"] },
  { title: "지역", links: ["제주시", "서귀포", "성산", "애월"] },
  { title: "언어", links: ["한국어", "English", "日本語", "中文"] }
];

const visitCheckItems = [
  {
    title: "운영시간",
    text: "폭포, 박물관, 유료 관광지는 입장 마감 시간이 다를 수 있습니다."
  },
  {
    title: "날씨",
    text: "오름과 해변은 바람, 안개, 우천 예보에 따라 체감 난이도가 달라집니다."
  },
  {
    title: "주차",
    text: "성수기에는 목적지 바로 앞보다 주변 공영 주차장과 도보 이동을 함께 보세요."
  },
  {
    title: "동선",
    text: "동쪽, 서쪽, 서귀포권을 하루에 모두 묶기보다 한 권역 중심으로 잡는 편이 편합니다."
  }
];

const myrealtripFallbackItems = [
  {
    title: "제주 동쪽 투어",
    category: "투어",
    priceText: "마이리얼트립 연결 대기",
    image: "https://tong.visitkorea.or.kr/cms/resource/75/3400775_image2_1.jpg"
  },
  {
    title: "제주 해변 액티비티",
    category: "티켓",
    priceText: "마이리얼트립 연결 대기",
    image: "https://tong.visitkorea.or.kr/cms/resource/81/3037781_image2_1.jpg"
  },
  {
    title: "제주 숙소",
    category: "숙소",
    priceText: "마이리얼트립 연결 대기",
    image: "https://tong.visitkorea.or.kr/cms/resource/36/3421436_image2_1.jpg"
  }
];

const languageCatalog = {
  ko: {
    htmlLang: "ko",
    ui: {
      brandName: "제주여행뉴스",
      brandTagline: "제주 여행 정보 뉴스",
      menu: "메뉴 열기",
      list: "목록",
      news: "제주 여행 뉴스",
      products: "여행 상품",
      check: "방문 전 체크",
      recommended: "추천 기사",
      julyTitle: "제주 여행 가이드",
      latest: "최신 글",
      places: "가볼 만한 곳",
      photoGallery: "사진으로 보는 제주",
      photoCountSuffix: "장",
      more: "더보기 +",
      faqTitle: "이용 가이드",
      footerTagline: "제주 여행 선택을 돕는 뉴스 포털",
      footerDescription: "제주 관광지, 해변, 오름, 맛집, 카페, 숙소 위치와 방문 준비 정보를 뉴스 피드로 정리합니다.",
      flightTitle: "제주 항공권 최저가 조회",
      stayTitle: "제주 숙소 상품 조회",
      tnaTitle: "제주 투어·티켓 상품 조회",
      productTitle: "제주 여행 상품·제휴 추천",
      visitTitle: "방문 전 체크",
      travelDesk: "여행 준비"
    },
    categories: { "가볼 만한 곳": "가볼 만한 곳", "맛집": "맛집", "카페": "카페", "숙소": "숙소", "해변": "해변", "오름": "오름", "계절 코스": "계절 코스" },
    todayKeywords: ["제주 가볼만한 곳", "제주 해변", "제주 맛집", "카페 투어", "오름 산책", "계절 코스", "숙소 위치", "비 오는 날"],
    faq: [
      ["제주여행뉴스에서는 무엇을 먼저 보면 좋나요?", "추천 기사를 먼저 보고, 관심 있는 카테고리를 고르면 됩니다. 처음 방문이라면 가볼 만한 곳, 해변, 계절 코스 순서로 보는 편이 쉽습니다."],
      ["관광지 정보는 어디에서 확인하나요?", "뉴스 피드 안의 장소 카드를 열면 주소, 분류, 위치 확인 링크를 볼 수 있습니다. 운영시간과 요금은 방문 직전 공식 안내를 다시 확인하세요."],
      ["상품이나 광고 영역이 있나요?", "제주 여행 정보를 해치지 않는 범위에서 여행 준비에 필요한 상품 영역을 함께 운영합니다." ]
    ],
    visitCheck: [["운영시간", "폭포, 박물관, 유료 관광지는 입장 마감 시간이 다를 수 있습니다."], ["날씨", "오름과 해변은 바람, 안개, 우천 예보에 따라 체감 난이도가 달라집니다."], ["주차", "성수기에는 목적지 바로 앞보다 주변 공영 주차장과 도보 이동을 함께 보세요."], ["동선", "동쪽, 서쪽, 서귀포권을 하루에 모두 묶기보다 한 권역 중심으로 잡는 편이 편합니다."]],
    footerGroups: [["제주 여행", ["가볼 만한 곳", "해변", "오름", "계절 코스"]], ["여행 준비", ["방문 전 체크", "숙소 위치", "비 오는 날", "가족 여행"]], ["지역", ["제주시", "서귀포", "성산", "애월"]], ["언어", ["한국어", "English", "日本語", "中文"]]]
  },
  en: {
    htmlLang: "en",
    ui: {
      brandName: "Jeju Travel News",
      brandTagline: "Jeju travel information",
      menu: "Open menu",
      list: "List",
      news: "Jeju Travel News",
      products: "Travel Picks",
      check: "Before You Go",
      recommended: "Featured Stories",
      julyTitle: "Jeju Travel Guide",
      latest: "Latest Stories",
      places: "Places to Visit",
      photoGallery: "Jeju in Photos",
      photoCountSuffix: " photos",
      more: "View more +",
      faqTitle: "Visitor Guide",
      footerTagline: "A practical guide to planning Jeju trips",
      footerDescription: "Jeju attractions, beaches, oreum trails, food, cafes, stays and practical travel notes in one news feed.",
      flightTitle: "Find Jeju Flight Deals",
      stayTitle: "Find Jeju Stays",
      tnaTitle: "Find Jeju Tours & Tickets",
      productTitle: "Jeju Travel Picks",
      visitTitle: "Before You Go",
      travelDesk: "Trip Planning"
    },
    categories: { "가볼 만한 곳": "Places to Visit", "맛집": "Food", "카페": "Cafes", "숙소": "Stays", "해변": "Beaches", "오름": "Oreum Trails", "계절 코스": "Seasonal Routes" },
    todayKeywords: ["Jeju places", "Jeju beaches", "Jeju food", "Cafe tours", "Oreum walks", "Seasonal routes", "Stay areas", "Rainy-day ideas"],
    faq: [["What should I read first?", "Start with the featured stories, then choose a category that matches your trip. Places, beaches and seasonal routes are a simple starting point."], ["Where can I check place details?", "Open a place card to see its address, category and map link. Confirm opening hours and fees with the official source before visiting."], ["Does the site include products or ads?", "Travel preparation product areas may appear alongside the information feed."]],
    visitCheck: [["Opening hours", "Waterfalls, museums and paid attractions may stop entry earlier than closing time."], ["Weather", "Wind, fog and rain can change the difficulty of oreum and beach visits."], ["Parking", "During busy periods, compare public parking and walking distance before driving in."], ["Route", "A single region per day is usually easier than crossing the whole island."]],
    footerGroups: [["Jeju Travel", ["Places to Visit", "Beaches", "Oreum Trails", "Seasonal Routes"]], ["Trip Planning", ["Before You Go", "Stay Areas", "Rainy-day Ideas", "Family Trips"]], ["Regions", ["Jeju City", "Seogwipo", "Seongsan", "Aewol"]], ["Language", ["한국어", "English", "日本語", "中文"]]]
  },
  ja: {
    htmlLang: "ja",
    ui: {
      brandName: "済州旅行ニュース",
      brandTagline: "済州旅行情報ニュース",
      menu: "メニューを開く",
      list: "一覧",
      news: "済州旅行ニュース",
      products: "旅行商品",
      check: "訪問前チェック",
      recommended: "おすすめ記事",
      julyTitle: "済州旅行ガイド",
      latest: "最新記事",
      places: "おすすめスポット",
      photoGallery: "写真で見る済州",
      photoCountSuffix: "枚",
      more: "もっと見る +",
      faqTitle: "利用ガイド",
      footerTagline: "済州旅行の計画を助ける情報ポータル",
      footerDescription: "済州の観光地、ビーチ、オルム、グルメ、カフェ、宿泊情報をまとめています。",
      flightTitle: "済州航空券を検索",
      stayTitle: "済州の宿泊施設を検索",
      tnaTitle: "済州ツアー・チケットを検索",
      productTitle: "済州旅行おすすめ",
      visitTitle: "訪問前チェック",
      travelDesk: "旅行準備"
    },
    categories: { "가볼 만한 곳": "観光スポット", "맛집": "グルメ", "카페": "カフェ", "숙소": "宿泊", "해변": "ビーチ", "오름": "オルム", "계절 코스": "季節コース" },
    todayKeywords: ["済州おすすめ", "済州ビーチ", "済州グルメ", "カフェ巡り", "オルム散歩", "季節コース", "宿泊エリア", "雨の日旅行"],
    faq: [["まず何を見ればいいですか？", "おすすめ記事を見てから、興味のあるカテゴリーを選んでください。"], ["詳細情報はどこで確認できますか？", "場所カードを開くと住所、カテゴリー、地図リンクを確認できます。訪問前に公式案内も確認してください。"], ["商品や広告はありますか？", "旅行準備に役立つ商品情報が表示される場合があります。"]],
    visitCheck: [["営業時間", "滝や博物館、有料施設は入場締切が異なる場合があります。"], ["天気", "風、霧、雨によってオルムやビーチの歩きやすさが変わります。"], ["駐車", "繁忙期は公共駐車場と徒歩距離も確認してください。"], ["ルート", "一日に一つのエリアを中心にすると移動が楽です。"]],
    footerGroups: [["済州旅行", ["観光スポット", "ビーチ", "オルム", "季節コース"]], ["旅行準備", ["訪問前チェック", "宿泊エリア", "雨の日旅行", "家族旅行"]], ["地域", ["済州市", "西帰浦", "城山", "涯月"]], ["言語", ["한국어", "English", "日本語", "中文"]]]
  },
  zh: {
    htmlLang: "zh-CN",
    ui: {
      brandName: "济州旅行新闻",
      brandTagline: "济州旅行资讯",
      menu: "打开菜单",
      list: "列表",
      news: "济州旅行新闻",
      products: "旅行产品",
      check: "出行前检查",
      recommended: "推荐文章",
      julyTitle: "济州旅行指南",
      latest: "最新文章",
      places: "值得去的地方",
      photoGallery: "照片中的济州",
      photoCountSuffix: "张",
      more: "查看更多 +",
      faqTitle: "使用指南",
      footerTagline: "帮助规划济州旅行的信息门户",
      footerDescription: "整理济州景点、海滩、火山丘、美食、咖啡馆、住宿和出行提示。",
      flightTitle: "查询济州机票",
      stayTitle: "查询济州住宿",
      tnaTitle: "查询济州 tours 和门票",
      productTitle: "济州旅行推荐",
      visitTitle: "出行前检查",
      travelDesk: "旅行准备"
    },
    categories: { "가볼 만한 곳": "值得去的地方", "맛집": "美食", "카페": "咖啡馆", "숙소": "住宿", "해변": "海滩", "오름": "火山丘", "계절 코스": "季节路线" },
    todayKeywords: ["济州景点", "济州海滩", "济州美食", "咖啡馆之旅", "火山丘散步", "季节路线", "住宿区域", "雨天旅行"],
    faq: [["应该先看什么？", "先浏览推荐文章，再选择符合行程的分类。"], ["在哪里查看地点详情？", "打开地点卡片即可查看地址、分类和地图链接。出发前请再次确认官方信息。"], ["网站有商品或广告吗？", "页面可能会显示与旅行准备相关的商品信息。"]],
    visitCheck: [["开放时间", "瀑布、博物馆和收费景点可能提前停止入场。"], ["天气", "风、雾和雨会影响火山丘及海滩的行走难度。"], ["停车", "旺季请同时确认公共停车场和步行距离。"], ["路线", "每天集中游览一个区域通常更轻松。"]],
    footerGroups: [["济州旅行", ["值得去的地方", "海滩", "火山丘", "季节路线"]], ["旅行准备", ["出行前检查", "住宿区域", "雨天旅行", "家庭旅行"]], ["地区", ["济州市", "西归浦", "城山", "涯月"]], ["语言", ["한국어", "English", "日本語", "中文"]]]
  }
};

function getLanguagePack() {
  return languageCatalog[currentLanguage] || languageCatalog.ko;
}

function categoryLabel(category) {
  return getLanguagePack().categories[category] || category;
}

function savedLanguage() {
  try {
    const value = localStorage.getItem("jeju-language");
    return languageCatalog[value] ? value : "ko";
  } catch (error) {
    return "ko";
  }
}

let currentLanguage = savedLanguage();

const dataI18nKeys = {
  "brand.name": "brandName",
  "brand.tagline": "brandTagline",
  "nav.menu": "menu",
  "nav.list": "list",
  "nav.news": "news",
  "nav.myrealtrip": "products",
  "nav.check": "check",
  "july.title": "julyTitle",
  "july.loading": "loading",
  "faq.title": "faqTitle",
  "footer.tagline": "footerTagline",
  "footer.description": "footerDescription"
};

function languageUiText(key, fallback = "") {
  const uiKey = dataI18nKeys[key] || key;
  if (uiKey === "loading") {
    return currentLanguage === "ko" ? "불러오는 중" : currentLanguage === "ja" ? "読み込み中" : currentLanguage === "zh" ? "加载中" : "Loading";
  }
  return getLanguagePack().ui[uiKey] || fallback;
}

function applyLanguage(language = currentLanguage) {
  if (!languageCatalog[language]) language = "ko";
  currentLanguage = language;
  try {
    localStorage.setItem("jeju-language", currentLanguage);
  } catch (error) {
    // Storage can be unavailable in private browsing; the current page still updates.
  }

  const pack = getLanguagePack();
  document.documentElement.lang = pack.htmlLang;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const translated = languageUiText(node.dataset.i18n, node.textContent);
    if (translated) node.textContent = translated;
  });

  const textTargets = [
    ["#july .feed-heading .eyebrow", pack.ui.recommended],
    ["#feedListTitle", pack.ui.latest],
    ["#flightTitle", pack.ui.flightTitle],
    ["#stayTitle", pack.ui.stayTitle],
    ["#tnaTitle", pack.ui.tnaTitle],
    ["#myrealtripTitle", pack.ui.productTitle],
    ["#visitCheckTitle", pack.ui.visitTitle],
    ["#travelToolsTitle", pack.ui.travelDesk]
  ];
  textTargets.forEach(([selector, text]) => {
    const node = $(selector);
    if (node && text) node.textContent = text;
  });

  const languageSwitch = $("#languageSwitch");
  if (languageSwitch) {
    languageSwitch.setAttribute("aria-label", currentLanguage === "ko" ? "언어 선택" : currentLanguage === "ja" ? "言語選択" : currentLanguage === "zh" ? "语言选择" : "Choose language");
    languageSwitch.querySelectorAll("[data-lang]").forEach((button) => {
      const isActive = button.dataset.lang === currentLanguage;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  if ($("#newsFeedList")) {
    renderPrimaryNav();
    renderTabs();
    renderRecommended();
    renderFeed();
    renderTodayKeywords();
    renderFaq();
    renderVisitCheck();
    renderFooter();
    renderCategoryNews();
    renderVisualGallery();
  }
  document.title = `${pack.ui.brandName} | ${pack.ui.julyTitle}`;
}

function bindLanguageSwitch() {
  const languageSwitch = $("#languageSwitch");
  if (!languageSwitch || languageSwitch.dataset.bound === "true") return;
  languageSwitch.addEventListener("click", (event) => {
    const button = event.target.closest("[data-lang]");
    if (!button) return;
    event.preventDefault();
    applyLanguage(button.dataset.lang);
  });
  languageSwitch.dataset.bound = "true";
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function articleUrl(article) {
  return `${detailPath}?slug=${encodeURIComponent(article.slug)}`;
}

function officialUrl(place) {
  const query = new URLSearchParams({
    contentId: place.contentId,
    contentTypeId: place.contentTypeId || "",
    title: place.title || "",
    category: place.category || "",
    address: place.address || place.region || "",
    image: place.image || "",
    mapx: place.mapx || "",
    mapy: place.mapy || ""
  });
  return `${detailPath}?${query.toString()}`;
}

function spotUrl(spot, currentSlug = "") {
  const normalizedSpot = normalizeText(spot);
  const match = publicArticles.find((article) => {
    if (article.slug === currentSlug) return false;
    const title = normalizeText(article.title);
    const region = normalizeText(article.region);
    const course = normalizeText((article.course || []).join(" "));
    return title.includes(normalizedSpot) || normalizedSpot.includes(title) || region.includes(normalizedSpot) || course.includes(normalizedSpot);
  });

  if (match) return articleUrl(match);
  return `${detailPath}?spot=${encodeURIComponent(spot)}`;
}

function mapUrl(place) {
  if (!place.mapx || !place.mapy) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.mapy},${place.mapx}`)}`;
}

function mapSearchUrl(value) {
  const keyword = String(value || "").trim();
  if (!keyword) return "";
  return `https://map.naver.com/p/search/${encodeURIComponent(keyword)}`;
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/[·ㆍ\-_/]/g, "")
    .toLowerCase();
}

function normalizeImageUrl(value) {
  const url = String(value || "").trim();
  if (!url) return fallbackImage;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("http://")) return url.replace(/^http:\/\//i, "https://");
  return url;
}

function safeExternalUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  const normalized = url.startsWith("//") ? `https:${url}` : url;
  if (!/^https:\/\//i.test(normalized)) return "";
  try {
    return new URL(normalized).href;
  } catch (error) {
    return "";
  }
}

function firstMappedProductImage(value, allowGenericUrl = false, seen = new WeakSet()) {
  if (!value) return "";
  if (typeof value === "string") {
    const raw = value.trim();
    return allowGenericUrl && raw ? normalizeImageUrl(raw) : "";
  }
  if (typeof value !== "object") return "";
  if (seen.has(value)) return "";
  seen.add(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = firstMappedProductImage(item, allowGenericUrl, seen);
      if (found) return found;
    }
    return "";
  }

  if (value.type === "Image") {
    const raw = String(value.src || value.url || value.imageUrl || value.thumbnailUrl || "").trim();
    const image = raw ? normalizeImageUrl(raw) : "";
    if (image) return image;
  }

  const directKeys = [
    "image",
    "imageUrl",
    "thumbnail",
    "thumbnailUrl",
    "mainImage",
    "mainImageUrl",
    "coverImage",
    "coverImageUrl",
    "representativeImage",
    "representativeImageUrl",
    "productImage",
    "productImageUrl",
    "hotelImage",
    "hotelImageUrl",
    "photo",
    "photoUrl",
    "picture",
    "pictureUrl"
  ];

  for (const key of directKeys) {
    const found = firstMappedProductImage(value[key], true, seen);
    if (found) return found;
  }

  if (allowGenericUrl) {
    const raw = String(value.url || value.src || value.href || "").trim();
    const generic = raw ? normalizeImageUrl(raw) : "";
    if (generic) return generic;
  }

  for (const [key, child] of Object.entries(value)) {
    if (/(image|thumbnail|photo|picture|cover|media|gallery)/i.test(key)) {
      const found = firstMappedProductImage(child, true, seen);
      if (found) return found;
    }
  }

  return "";
}

function imageTag(src, alt, className = "", attrs = "") {
  const classAttribute = className ? ` class="${escapeHtml(className)}"` : "";
  const extraAttributes = attrs ? ` ${attrs}` : "";
  return `<img${classAttribute}${extraAttributes} src="${escapeHtml(normalizeImageUrl(src))}" alt="${escapeHtml(alt)}" loading="lazy">`;
}

function bindImageFallbacks() {
  document.addEventListener("error", (event) => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset.fallbackApplied) return;
    image.dataset.fallbackApplied = "true";
    const articleFallback = image.dataset.articleThumb
      ? articleImageFallbacks.get(image.dataset.articleThumb)
      : "";
    image.src = normalizeImageUrl(articleFallback || fallbackImage);
  }, true);
}

function normalizeProduct(product = {}) {
  return {
    title: product.title || product.name || product.productName || "제주 여행 상품",
    category: product.category || product.type || product.productType || "여행 상품",
    priceText: product.priceText || product.displayPrice || product.price || product.salePrice || "가격 확인",
    image: firstMappedProductImage(product, false),
    url: safeExternalUrl(product.url || product.link || product.deepLink || product.webUrl)
  };
}

function cleanTravelKeyword(value) {
  return String(value || "")
    .replace(/[·•]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s*(여행\s*)?(코스|가이드|정보|체크|방문 전 체크)$/g, "")
    .trim();
}

function hasAnyKeyword(value, keywords) {
  const text = String(value || "");
  return keywords.some((keyword) => text.includes(keyword));
}

function compactKeywordParts(parts) {
  const unique = [];
  parts
    .map(cleanTravelKeyword)
    .filter(Boolean)
    .forEach((part) => {
      if (!unique.some((item) => normalizeText(item) === normalizeText(part))) unique.push(part);
    });
  return unique.join(" ").replace(/\s+/g, " ").trim();
}

function myrealtripContextFromArticle(article = {}, categoryOverride = "") {
  const category = cleanTravelKeyword(categoryOverride || article.category);
  const spot = cleanTravelKeyword(articleOfficialKeyword(article) || article.title);
  const region = cleanTravelKeyword(article.region).replace(/^제주\s*/, "제주 ");
  const title = cleanTravelKeyword(article.title);
  const base = spot || title || region || "제주";
  let keyword = compactKeywordParts(["제주", base]);
  let label = base || "제주";
  let type = "tour";

  if (hasAnyKeyword(category, ["숙소", "호텔", "펜션"])) {
    keyword = compactKeywordParts([region || "제주", "숙소"]);
    label = cleanTravelKeyword(region || "제주 숙소");
    type = "hotel";
  } else if (hasAnyKeyword(category, ["맛집", "먹거리"])) {
    keyword = compactKeywordParts(["제주", base, "맛집"]);
  } else if (hasAnyKeyword(category, ["카페"])) {
    keyword = compactKeywordParts(["제주", base, "카페"]);
  } else if (hasAnyKeyword(category, ["해변", "바다"])) {
    keyword = compactKeywordParts(["제주", base, "해변"]);
  } else if (hasAnyKeyword(category, ["오름", "숲", "산책"])) {
    keyword = compactKeywordParts(["제주", base, "트레킹"]);
  } else if (hasAnyKeyword(category, ["계절", "코스"])) {
    keyword = compactKeywordParts(["제주", base, "투어"]);
  } else {
    keyword = compactKeywordParts(["제주", base, "투어"]);
  }

  return {
    keyword: keyword || "제주 투어",
    label: label || keyword || "제주",
    type,
    category
  };
}

function myrealtripContextFromHome() {
  const category = activeCategory === categories[0] ? "" : activeCategory;
  const seed = visibleArticles()[0] || publicArticles[0] || {};
  return myrealtripContextFromArticle(seed, category);
}

function contextualMyRealTripFallbackItems(context = {}) {
  const label = cleanTravelKeyword(context.label || context.keyword || "제주");
  const titles = context.type === "hotel"
    ? [`${label} 숙소`, `${label} 호텔`, `${label} 근처 여행 상품`]
    : [`${label} 투어·티켓`, `${label} 액티비티`, `${label} 숙소`];

  return myrealtripFallbackItems.map((item, index) => ({
    ...item,
    title: titles[index] || item.title,
    category: "마이리얼트립",
    priceText: "제휴 상품 확인"
  }));
}

function contextualProduct(product, context = {}, index = 0) {
  const item = normalizeProduct(product);
  const label = cleanTravelKeyword(context.label || context.keyword);
  const category = String(item.category || "");
  const isAffiliateFallback = category.includes("마이리얼트립") || category.includes("MyRealTrip");
  if (!label || !isAffiliateFallback || normalizeText(item.title).includes(normalizeText(label))) return item;

  const titles = context.type === "hotel"
    ? [`${label} 숙소`, `${label} 호텔`, `${label} 주변 여행 상품`]
    : [`${label} 투어·티켓`, `${label} 액티비티`, `${label} 숙소`];
  return { ...item, title: titles[index] || item.title };
}

function normalizeAirport(item = {}) {
  const code = String(item.code || item.iataCode || item.airportCode || item.id || "").toUpperCase();
  const city = item.city || item.cityName || item.regionName || "";
  const name = item.name || item.airportName || item.displayName || "";
  const label = [city, name].filter(Boolean).join(" ") || item.label || code;
  return { code, label };
}

function normalizeRegion(item = {}) {
  const regionId = String(item.regionId || item.id || item.value || item.code || "");
  const country = item.country || item.countryName || "";
  const name = item.name || item.regionName || item.displayName || item.title || "";
  const label = [country, name].filter(Boolean).join(" ") || item.label || name || regionId;
  return { regionId, label };
}

function normalizeTnaCategory(item = {}) {
  const value = String(item.value || item.category || item.id || item.code || "");
  const label = String(item.label || item.name || item.title || item.displayName || value || "카테고리");
  return { value, label };
}

function normalizeTnaProduct(product = {}) {
  return {
    title: product.title || product.name || product.productName || product.displayName || "투어·티켓 상품",
    category: product.categoryName || product.category || product.type || "투어·티켓",
    region: product.region || product.regionName || product.cityName || product.location || "",
    priceText: product.priceText || product.displayPrice || product.priceLabel || product.price || product.salePrice || "가격 확인",
    image: firstMappedProductImage(product, false),
    url: safeExternalUrl(product.url || product.link || product.deepLink || product.webUrl)
  };
}

function airportCodeFromInput(value, fallback = "") {
  const text = String(value || "");
  const match = text.match(/\(([A-Z]{3})\)/i) || text.match(/\b([A-Z]{3})\b/i);
  if (match) return match[1].toUpperCase();
  if (text.includes("제주")) return "CJU";
  if (text.includes("김포")) return "GMP";
  if (text.includes("인천")) return "ICN";
  if (text.includes("서울")) return "SEL";
  return fallback;
}

function regionIdFromInput(value) {
  const text = String(value || "");
  const match = text.match(/\[([^\]]+)\]$/);
  return match ? match[1] : "";
}

function flightMonthValue() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

function dateValue(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function priceText(value, currency = "KRW") {
  const numeric = Number(String(value || "").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return String(value || "가격 확인");
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(numeric);
}

function visibleArticles() {
  return activeCategory === categories[0] ? publicArticles : publicArticles.filter((article) => article.category === activeCategory);
}

function metaLine(parts) {
  return parts
    .filter(Boolean)
    .map((part) => `<span>${escapeHtml(part)}</span>`)
    .join("");
}

function thumbnailForArticle(article, useOfficialImage = false) {
  return useOfficialImage
    ? articleThumbnailCache.get(article.slug) || articleImageFallbacks.get(article.slug) || article.image
    : article.image;
}

function articleImageTag(article, className = "") {
  return imageTag(thumbnailForArticle(article, true), article.title, className, `data-article-thumb="${escapeHtml(article.slug)}"`);
}

function recommendedCard(article, isLead = false) {
  return `
    <article class="recommend-card${isLead ? " is-lead" : ""}">
      <a href="${articleUrl(article)}">
        ${articleImageTag(article)}
        <span class="recommend-content">
          <span class="recommend-label">${escapeHtml(categoryLabel(article.category))}</span>
          <strong>${escapeHtml(article.title)}</strong>
          ${isLead ? `<p>${escapeHtml(article.summary)}</p>` : ""}
          <em>${escapeHtml([article.date, article.region].filter(Boolean).join(" · "))}</em>
        </span>
      </a>
    </article>
  `;
}

function sectionArticleCard(article) {
  return `
    <article class="section-card">
      <a href="${articleUrl(article)}">
        <span class="section-thumb">${articleImageTag(article)}</span>
        <span class="section-card-label">${escapeHtml(categoryLabel(article.category))}</span>
        <h3>${escapeHtml(article.title)}</h3>
        <p>${escapeHtml(article.summary)}</p>
      </a>
    </article>
  `;
}

function leadArticleCard(article) {
  return `
    <a class="news-lead" href="${articleUrl(article)}">
      <span class="lead-thumb">${articleImageTag(article)}</span>
      <strong>${escapeHtml(article.title)}</strong>
      <span>${metaLine([categoryLabel(article.category), article.region, article.date])}</span>
    </a>
  `;
}

function pickArticleCard(article) {
  return `
    <a class="pick-card" href="${articleUrl(article)}">
      <span class="pick-thumb">${articleImageTag(article)}</span>
      <strong>${escapeHtml(article.title)}</strong>
    </a>
  `;
}

function rowArticleCard(article) {
  return `
    <a class="news-row" href="${articleUrl(article)}">
      <span class="row-thumb">${articleImageTag(article)}</span>
      <span>
        <strong>${escapeHtml(article.title)}</strong>
        <em>${escapeHtml([categoryLabel(article.category), article.region, article.date].filter(Boolean).join(" · "))}</em>
      </span>
    </a>
  `;
}

function newsCard(article) {
  return `
    <article class="news-feed-card">
      <a class="news-thumb" href="${articleUrl(article)}">
        ${articleImageTag(article)}
      </a>
      <div class="news-copy">
        <div class="meta">${metaLine([categoryLabel(article.category), article.region])}</div>
        <h2><a href="${articleUrl(article)}">${escapeHtml(article.title)}</a></h2>
        <p>${escapeHtml(article.summary)}</p>
      </div>
    </article>
  `;
}

function uniqueByImage(items) {
  const seen = new Set();
  return items.filter((item) => {
    const image = normalizeImageUrl(item.image);
    if (seen.has(image)) return false;
    seen.add(image);
    return true;
  });
}

function galleryCard(article) {
  return `
    <a class="gallery-card" href="${articleUrl(article)}">
      ${articleImageTag(article)}
      <span>${escapeHtml(categoryLabel(article.category))}</span>
      <strong>${escapeHtml(article.title)}</strong>
    </a>
  `;
}

function visualGalleryCard(article) {
  return `
    <a class="visual-gallery-card" href="${articleUrl(article)}" aria-label="${escapeHtml(article.title)}">
      ${articleImageTag(article)}
    </a>
  `;
}

function renderVisualGallery() {
  const gallery = $("#visualGallery");
  if (!gallery) return;
  const items = uniqueByImage(visibleArticles().slice(1)).slice(0, 8);
  const title = activeCategory === categories[0] ? getLanguagePack().ui.photoGallery : `${categoryLabel(activeCategory)} ${getLanguagePack().ui.photoGallery}`;
  gallery.innerHTML = `
    <div class="visual-gallery-head">
      <h2>${escapeHtml(title)}</h2>
      <span>${items.length}${escapeHtml(getLanguagePack().ui.photoCountSuffix)}</span>
    </div>
    <div class="visual-gallery-grid">${items.map(visualGalleryCard).join("")}</div>
  `;
}

function detailNearbyArticles(article, limit = 4) {
  const nearby = (article.nearbySpots || []).map(normalizeText).filter(Boolean);
  const regionHead = normalizeText(String(article.region || "").split("·")[0]);
  const scored = publicArticles
    .filter((item) => item.slug !== article.slug)
    .map((item) => {
      const target = normalizeText([item.title, item.region, ...(item.course || [])].join(" "));
      const sameCategory = item.category === article.category ? 3 : 0;
      const sameRegion = regionHead && normalizeText(item.region).includes(regionHead) ? 2 : 0;
      const nearbyMatch = nearby.some((spot) => target.includes(spot) || spot.includes(normalizeText(item.title))) ? 5 : 0;
      return { item, score: sameCategory + sameRegion + nearbyMatch };
    })
    .sort((a, b) => b.score - a.score);
  const preferred = scored.filter(({ score }) => score > 0).map(({ item }) => item);
  const fallback = publicArticles.filter((item) => item.slug !== article.slug);
  return uniqueByImage([...preferred, ...fallback]).slice(0, limit);
}

function nearbyTravelCard(article) {
  return `
    <a class="nearby-travel-card" href="${articleUrl(article)}">
      <span class="nearby-travel-thumb">${articleImageTag(article)}</span>
      <span class="nearby-travel-copy">
        <span class="nearby-travel-meta">${escapeHtml([categoryLabel(article.category), article.region].filter(Boolean).join(" · "))}</span>
        <strong>${escapeHtml(article.title)}</strong>
        <em>${escapeHtml(article.summary)}</em>
      </span>
    </a>
  `;
}

function renderNearbyTravelRecommendations(article) {
  const items = detailNearbyArticles(article);
  if (!items.length) return "";
  const nearbyText = (article.nearbySpots || []).slice(0, 3).join(", ");
  return `
    <section class="nearby-travel-section">
      <div class="nearby-travel-head">
        <p class="section-kicker">NEARBY</p>
        <h2>근처 여행지 추천</h2>
        ${nearbyText ? `<p>${escapeHtml(nearbyText)}와 함께 묶어 보기 좋은 주변 코스입니다.</p>` : ""}
      </div>
      <div class="nearby-travel-grid">${items.map(nearbyTravelCard).join("")}</div>
    </section>
  `;
}

function placeCard(place) {
  return `
    <article class="news-feed-card place-feed-card">
      <a class="news-thumb" href="${officialUrl(place)}">
        ${imageTag(place.image, place.title)}
      </a>
      <div class="news-copy">
        <div class="meta">${metaLine(["공식 장소정보", place.category])}</div>
        <h2><a href="${officialUrl(place)}">${escapeHtml(place.title)}</a></h2>
        <p>${escapeHtml(place.address || place.region || "제주")}</p>
        <dl class="mini-info">
          <div><dt>분류</dt><dd>${escapeHtml(place.category)}</dd></div>
          <div><dt>연락처</dt><dd>${escapeHtml(place.tel || "정보 없음")}</dd></div>
        </dl>
      </div>
    </article>
  `;
}

function renderTabs() {
  const tabs = $("#topCategoryTabs");
  if (!tabs) return;
  tabs.innerHTML = filterCategories
    .map((category) => {
      const count = publicArticles.filter((article) => article.category === category).length;
      return `
      <button type="button" class="${category === activeCategory ? "is-active" : ""}" data-category="${escapeHtml(category)}">
        <span>${escapeHtml(categoryLabel(category))}</span>
        <b>${count}</b>
      </button>
    `;
    })
    .join("");
}

function renderPrimaryNav() {
  const nav = $("#primaryNav");
  if (!nav) return;
  const links = filterCategories.map((category) => ({ category, active: category === activeCategory }));
  nav.innerHTML = links
    .map((item) => `
      <a class="${item.active ? "is-active" : ""}" href="#july" data-category="${escapeHtml(item.category)}">
        ${escapeHtml(categoryLabel(item.category))}
      </a>
    `)
    .join("");
}

function renderTodayKeywords() {
  const header = $(".site-header");
  if (!header) return;
  const bar = $(".today-keyword-bar") || document.createElement("nav");
  bar.className = "today-keyword-bar";
  bar.setAttribute("aria-label", currentLanguage === "ko" ? "오늘의 여행 키워드" : "Travel keywords");
  if (!bar.parentElement) header.after(bar);
  const keywords = getLanguagePack().todayKeywords;
  bar.innerHTML = `
    <div class="today-keyword-inner">
      <strong>${currentLanguage === "ko" ? "JEJU NOW" : "JEJU NOW"}</strong>
      <div>
        ${todayKeywords.map((item, index) => `
          <a href="#july" data-category="${escapeHtml(item.category)}">${escapeHtml(keywords[index] || item.label)}</a>
        `).join("")}
      </div>
    </div>
  `;
}

function compactTravelSearchSections() {
  if ($("#travelTools")) return;

  const configs = [
    {
      id: "flights",
      className: "flight-section",
      eyebrow: "Air",
      title: "항공권",
      description: "일정이 정해졌을 때 서울-제주 최저가 흐름을 확인하세요.",
      button: "열기"
    },
    {
      id: "stays",
      className: "stay-section",
      eyebrow: "Stay",
      title: "숙소",
      description: "지역과 날짜를 넣어 숙소 후보를 가볍게 비교하세요.",
      button: "열기"
    },
    {
      id: "tourTickets",
      className: "tna-section",
      eyebrow: "Tour",
      title: "투어·티켓",
      description: "액티비티와 입장권은 여행 코스가 잡힌 뒤 확인하세요.",
      button: "열기"
    }
  ];

  const items = configs
    .map((config) => ({ config, section: document.getElementById(config.id) }))
    .filter(({ section }) => section);
  if (!items.length) return;

  const wrapper = document.createElement("section");
  wrapper.className = "travel-tools-section";
  wrapper.id = "travelTools";
  wrapper.setAttribute("aria-labelledby", "travelToolsTitle");
  wrapper.innerHTML = `
    <div class="section-heading">
      <p class="eyebrow">Travel Desk</p>
      <h2 id="travelToolsTitle">여행 준비</h2>
      <p>뉴스와 장소 정보를 먼저 보고, 필요한 예약 정보만 아래에서 펼쳐 확인하세요.</p>
    </div>
    <div class="travel-tool-list"></div>
  `;
  const list = wrapper.querySelector(".travel-tool-list");

  items.forEach(({ config, section }) => {
    const heading = section.querySelector(".section-heading");
    const form = section.querySelector("form");
    const result = section.querySelector(".flight-result, .stay-result, .tna-result");
    const panel = document.createElement("div");
    const panelId = `${config.id}Panel`;
    panel.className = "travel-tool-panel";
    panel.id = panelId;
    panel.hidden = true;

    if (form) panel.append(form);
    if (result) panel.append(result);

    section.classList.remove(config.className);
    section.classList.add("travel-tool-card");
    section.removeAttribute("aria-labelledby");
    section.setAttribute("aria-label", config.title);
    section.innerHTML = "";
    const summaryNode = heading || document.createElement("div");
    section.append(summaryNode);
    section.append(panel);

    const summary = section.querySelector(".section-heading") || summaryNode;
    summary.className = "travel-tool-summary";
    summary.innerHTML = `
      <span>
        <em>${escapeHtml(config.eyebrow)}</em>
        <strong>${escapeHtml(config.title)}</strong>
        <small>${escapeHtml(config.description)}</small>
      </span>
      <button class="tool-toggle" type="button" aria-expanded="false" aria-controls="${panelId}">${escapeHtml(config.button)}</button>
    `;

    summary.querySelector(".tool-toggle").addEventListener("click", () => {
      const isOpen = section.classList.toggle("is-open");
      panel.hidden = !isOpen;
      const toggle = summary.querySelector(".tool-toggle");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.textContent = isOpen ? "닫기" : config.button;
    });

    list.append(section);
  });

  const main = document.querySelector("main");
  const faq = $("#info");
  const visitCheck = $("#visitCheck");
  const categoryNews = $("#categoryNews");
  const myrealtrip = $("#myrealtrip");

  if (main && faq) {
    if (categoryNews) main.insertBefore(categoryNews, faq);
    if (visitCheck) main.insertBefore(visitCheck, faq);
    main.insertBefore(wrapper, faq);
    if (myrealtrip) main.insertBefore(myrealtrip, faq);
  } else {
    ($("#july") || main)?.after(wrapper);
  }
}

function renderFeed(places = null) {
  const feed = $("#newsFeedList");
  const status = $("#julyStatus") || $("#feedStatus");
  if (!feed) return;

  const localItems = activeCategory === categories[0]
    ? publicArticles.filter((article) => article.category === "가볼 만한 곳").slice(0, 9)
    : visibleArticles();
  const feedHtml = localItems.map(sectionArticleCard).join("");

  feed.innerHTML = feedHtml || `<p class="empty-state">현재 선택한 카테고리의 제주 여행 정보가 없습니다.</p>`;
  const feedCount = $("#feedCount");
  const feedTitle = $("#feedListTitle");
  if (feedCount) feedCount.textContent = "더보기 +";
  if (feedTitle) feedTitle.textContent = activeCategory === categories[0] ? getLanguagePack().ui.places : categoryLabel(activeCategory);
  if (status) {
    status.hidden = true;
    status.textContent = "";
  }
  hydrateArticleThumbnails();
}

function renderRecommended() {
  const row = $("#recommendedArticles");
  if (!row) return;
  const picks = visibleArticles().slice(0, 5);
  row.innerHTML = picks
    .map((article, index) => recommendedCard(article, index === 0))
    .join("");
  hydrateArticleThumbnails();
}

function renderCategoryView(places = []) {
  const isFilteredView = activeCategory !== categories[0];
  const july = $("#july");
  const recommended = $("#recommendedArticles");
  const gallery = $("#visualGallery");
  july?.classList.toggle("is-category-filtered", isFilteredView);
  if (isFilteredView) {
    if (recommended) recommended.innerHTML = "";
    if (gallery) gallery.innerHTML = "";
  } else {
    renderRecommended();
    renderVisualGallery();
  }
  renderFeed(places);
  loadContextualMyRealTrip(myrealtripContextFromHome());
}

function shouldUseOfficialImage(article) {
  return officialImageSlugs.has(article.slug) || /images\.unsplash\.com/i.test(String(article.image || ""));
}

function articleImageKeywords(article) {
  const keyword = articleOfficialKeyword(article);
  return [
    keyword,
    article.title
  ]
    .map((keyword) => String(keyword || "").trim())
    .filter(Boolean)
    .filter((keyword, index, list) => list.findIndex((item) => normalizeText(item) === normalizeText(keyword)) === index);
}

function articlePlaceCategoryAllowed(article, place) {
  const category = normalizeText(article.category);
  const placeCategory = normalizeText(place?.category);
  if (!placeCategory) return false;
  if (category === "숙소") return placeCategory.includes("숙소");
  if (category === "맛집" || category === "카페") return placeCategory.includes("음식점");
  return !placeCategory.includes("음식점") && !placeCategory.includes("쇼핑");
}

function articlePlaceMatches(article, place) {
  const title = normalizeText(place?.title);
  if (!title || !place?.contentId) return false;
  if (!articlePlaceCategoryAllowed(article, place)) return false;
  return articleImageKeywords(article)
    .map(normalizeText)
    .filter(Boolean)
    .some((keyword) => title.includes(keyword));
}

function articleImageKey(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const normalized = normalizeImageUrl(raw);
  try {
    const url = new URL(normalized, window.location.origin);
    return `${url.origin}${url.pathname}`.toLowerCase();
  } catch (error) {
    return normalized.split(/[?#]/)[0].toLowerCase();
  }
}

function articleImageUsedByOtherArticle(image, currentSlug) {
  const key = articleImageKey(image);
  if (!key) return false;
  for (const [slug, cachedImage] of articleThumbnailCache.entries()) {
    if (slug !== currentSlug && articleImageKey(cachedImage) === key) return true;
  }
  return publicArticles.some((article) => article.slug !== currentSlug && articleImageKey(article.image) === key);
}

function setOfficialArticleImage(article, image) {
  if (!image || articleImageUsedByOtherArticle(image, article.slug)) return false;
  articleThumbnailCache.set(article.slug, normalizeImageUrl(image));
  return true;
}

function matchArticleImagePlace(article, places = []) {
  if (!shouldUseOfficialImage(article)) return null;
  const keywords = articleImageKeywords(article).map(normalizeText).filter(Boolean);
  const scored = places
    .filter((place) => place?.image)
    .map((place) => {
      const title = normalizeText(place.title);
      if (!title) return { place, score: 0 };
      if (articleImageUsedByOtherArticle(place.image, article.slug)) {
        return { place, score: 0 };
      }
      if (!articlePlaceCategoryAllowed(article, place)) return { place, score: 0 };
      const score = keywords.reduce((best, keyword) => {
        if (!keyword || !title.includes(keyword)) return best;
        if (title === keyword) return Math.max(best, 100);
        if (title.startsWith(keyword)) return Math.max(best, 84);
        return Math.max(best, 70);
      }, 0) + (normalizeText(place.category).includes("관광지") ? 8 : 0);
      return { place, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.place || null;
}

async function fetchArticleDetailImage(place) {
  if (!place?.contentId) return "";
  try {
    const query = new URLSearchParams({
      contentId: place.contentId,
      contentTypeId: place.contentTypeId || "",
      title: place.title || "",
      v: tourismDataVersion
    });
    const response = await fetch(`/api/jeju?${query.toString()}`, { headers: { accept: "application/json" } });
    const payload = await response.json();
    if (!response.ok || !payload?.ok) return "";
    return normalizeImageUrl(payload.item?.image || payload.item?.images?.[0] || "");
  } catch (error) {
    return "";
  }
}

function applyOfficialImagesToArticles(places = []) {
  let didUpdate = false;
  publicArticles.forEach((article) => {
    if (!shouldUseOfficialImage(article)) return;
    if (articleThumbnailCache.has(article.slug)) return;
    if (articleImageFallbacks.has(article.slug)) return;
    const match = matchArticleImagePlace(article, places);
    if (!match?.image) return;
    didUpdate = setOfficialArticleImage(article, match.image) || didUpdate;
  });
  return didUpdate;
}

function updateArticleThumbnailElements(article, image) {
  document
    .querySelectorAll(`img[data-article-thumb="${article.slug}"]`)
    .forEach((img) => {
      img.src = normalizeImageUrl(image);
    });
}

async function fetchArticleThumbnail(article) {
  if (!shouldUseOfficialImage(article)) return "";
  if (articleThumbnailCache.has(article.slug)) return articleThumbnailCache.get(article.slug);
  if (articleThumbnailRequests.has(article.slug)) return articleThumbnailRequests.get(article.slug);

  const fixedImage = articleImageFallbacks.get(article.slug);
  if (fixedImage) {
    setOfficialArticleImage(article, fixedImage);
    updateArticleThumbnailElements(article, fixedImage);
    return fixedImage;
  }

  const keyword = articleOfficialKeyword(article);
  const request = (async () => {
    try {
      const query = new URLSearchParams({ keyword, category: "전체", v: tourismDataVersion });
      const response = await fetch(`/api/jeju?${query.toString()}`, { headers: { accept: "application/json" } });
      const payload = await response.json();
      if (!response.ok || !payload.ok) return "";
      const places = payload.items || [];
      const match = matchArticleImagePlace(article, places);
      const place = places.find((item) => articlePlaceMatches(article, item));
      const image = match?.image || await fetchArticleDetailImage(place) || articleImageFallbacks.get(article.slug) || "";
      if (!image || !setOfficialArticleImage(article, image)) return "";
      updateArticleThumbnailElements(article, image);
      return articleThumbnailCache.get(article.slug) || "";
    } catch (error) {
      return "";
    }
  })();

  articleThumbnailRequests.set(article.slug, request);
  return request;
}

function hydrateArticleThumbnails() {
  const images = [...document.querySelectorAll("img[data-article-thumb]")];
  if (!images.length) return;

  const loadImage = (img) => {
    const article = publicArticles.find((item) => item.slug === img.dataset.articleThumb);
    if (!article) return;
    const cached = articleThumbnailCache.get(article.slug);
    if (cached) {
      img.src = normalizeImageUrl(cached);
      return;
    }
    fetchArticleThumbnail(article);
  };

  if (!("IntersectionObserver" in window)) {
    images.forEach(loadImage);
    return;
  }

  if (!articleThumbnailObserver) {
    articleThumbnailObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        articleThumbnailObserver.unobserve(entry.target);
        loadImage(entry.target);
      });
    }, { rootMargin: "360px 0px" });
  }

  images.forEach((img) => {
    if (observedArticleThumbs.has(img)) return;
    observedArticleThumbs.add(img);
    articleThumbnailObserver.observe(img);
  });
}

function renderCategoryNews() {
  const wrapper = $("#categoryNewsSections");
  if (!wrapper) return;
  const pack = getLanguagePack();
  const sections = [
    {
      id: "latest-news",
      eyebrow: "LATEST",
      title: currentLanguage === "ko" ? "최신 여행뉴스" : pack.ui.latest,
      items: publicArticles.slice(0, 6)
    },
    ...categories
      .filter((category) => category !== categories[0] && category !== "가볼 만한 곳")
      .map((category) => ({
        id: `category-${encodeURIComponent(category)}`,
        eyebrow: "TRAVEL",
        title: categoryLabel(category),
        items: publicArticles.filter((article) => article.category === category).slice(0, 6)
      }))
  ];

  wrapper.innerHTML = sections
    .map((section) => {
      const items = section.items || [];
      if (!items.length) return "";
      return `
        <section class="news-section category-news-section" id="${section.id}">
          <div class="portal-section-head">
            <span>${escapeHtml(section.eyebrow)}</span>
            <h2>${escapeHtml(section.title)}</h2>
            <a href="#july" data-category="${escapeHtml(section.items?.[0]?.category || section.title)}">${escapeHtml(pack.ui.more)}</a>
          </div>
          <div class="section-card-grid">${items.map(sectionArticleCard).join("")}</div>
        </section>
      `;
    })
    .join("");
  hydrateArticleThumbnails();
}

function renderFaq() {
  const list = $("#faqList");
  if (!list) return;
  list.innerHTML = getLanguagePack().faq
    .map(([question, answer]) => `
      <details class="faq-item">
        <summary>${escapeHtml(question)}</summary>
        <p>${escapeHtml(answer)}</p>
      </details>
    `)
    .join("");
}

function renderVisitCheck() {
  const grid = $("#visitCheckGrid");
  if (!grid) return;
  grid.innerHTML = getLanguagePack().visitCheck
    .map(([title, text]) => `
      <article class="visit-check-card">
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(text)}</p>
      </article>
    `)
    .join("");
}

function myrealtripCard(product, context = {}, index = 0) {
  const item = contextualProduct(product, context, index);
  const content = `
    ${imageTag(item.image, item.title)}
    <span>
      <em>${escapeHtml(item.category)}</em>
      <strong>${escapeHtml(item.title)}</strong>
      <small>${escapeHtml(String(item.priceText))}</small>
    </span>
  `;

  if (item.url) {
    return `
      <article class="mrt-card">
        <a href="${escapeHtml(item.url)}" target="_blank" rel="sponsored nofollow noopener noreferrer">${content}</a>
      </article>
    `;
  }

  return `<article class="mrt-card is-disabled">${content}</article>`;
}

function renderMyRealTrip(items = [], mode = "loading", context = {}, gridSelector = "#myrealtripGrid") {
  const grid = $(gridSelector);
  if (!grid) return;
  const label = cleanTravelKeyword(context.label || context.keyword || "제주");
  const heading = grid.closest(".mrt-section")?.querySelector(".section-heading h2");
  if (heading && gridSelector === "#myrealtripGrid") {
    heading.textContent = `${label} 여행 상품·제휴 추천`;
  }

  if (mode === "ready" && items.length) {
    grid.innerHTML = items.slice(0, 6).map((item, index) => myrealtripCard(item, context, index)).join("");
    return;
  }

  const message = mode === "not-configured"
    ? "마이리얼트립 광고 연결 정보가 아직 설정되지 않았습니다. API 키나 제휴 URL이 연결되면 이 영역에 실제 상품 광고가 표시됩니다."
    : `${label} 여행 상품 광고 정보를 확인하고 있습니다.`;

  grid.innerHTML = `
    <div class="mrt-status">
      <strong>${escapeHtml(message)}</strong>
      <p>${escapeHtml(label)} 일정과 가까운 투어, 숙소, 액티비티 중심으로 노출합니다.</p>
    </div>
    ${contextualMyRealTripFallbackItems(context).map((item, index) => myrealtripCard(item, context, index)).join("")}
  `;
}

async function loadMyRealTrip(context = myrealtripContextFromHome(), gridSelector = "#myrealtripGrid") {
  return loadContextualMyRealTrip(context, gridSelector);
}

async function loadContextualMyRealTrip(context = myrealtripContextFromHome(), gridSelector = "#myrealtripGrid") {
  const grid = $(gridSelector);
  if (!grid) return;

  const keyword = cleanTravelKeyword(context.keyword || "제주");
  const type = context.type || "tour";
  const requestKey = `${keyword}|${type}`;
  if (myrealtripRequestKeys.get(gridSelector) === requestKey) return;
  myrealtripRequestKeys.set(gridSelector, requestKey);
  renderMyRealTrip([], "loading", context, gridSelector);

  try {
    const query = new URLSearchParams({
      keyword,
      type,
      limit: "6",
      v: tourismDataVersion
    });
    const response = await fetch(`/api/myrealtrip?${query.toString()}`, {
      headers: { accept: "application/json" }
    });
    const payload = await response.json();
    if (!response.ok || payload?.ok === false) {
      renderMyRealTrip([], payload?.configured === false ? "not-configured" : "loading", context, gridSelector);
      return;
    }
    renderMyRealTrip(payload.items || [], "ready", context, gridSelector);
  } catch (error) {
    renderMyRealTrip([], "not-configured", context, gridSelector);
  }
}

function renderFlightResult(items = [], mode = "idle", message = "") {
  const result = $("#flightResult");
  if (!result) return;

  if (mode === "ready" && items.length) {
    result.innerHTML = `
      <div class="flight-calendar-list">
        ${items.slice(0, 8).map((item) => {
          const url = safeExternalUrl(item.url);
          const tag = url ? "a" : "article";
          const linkAttrs = url ? ` href="${escapeHtml(url)}" target="_blank" rel="sponsored nofollow noopener noreferrer"` : "";
          return `
            <${tag} class="flight-price-card"${linkAttrs}>
              <strong>${escapeHtml(item.date || "날짜 확인")}</strong>
              <span>${escapeHtml(priceText(item.price, item.currency || "KRW"))}</span>
              <small>${escapeHtml(item.airline || "최저가 캘린더")}</small>
            </${tag}>
          `;
        }).join("")}
      </div>
    `;
    return;
  }

  const fallbackMessage = mode === "not-configured"
    ? "MYREALTRIP_API_BASE 또는 항공권 엔드포인트 URL과 MYREALTRIP_API_KEY가 설정되면 공항 자동완성과 최저가 캘린더가 동작합니다."
    : message || "출발지와 목적지를 입력한 뒤 최저가를 조회하세요.";
  result.innerHTML = `<div class="flight-status">${escapeHtml(fallbackMessage)}</div>`;
}

async function postFlight(action, body) {
  const response = await fetch(`/api/myrealtrip-flight?action=${encodeURIComponent(action)}&v=${tourismDataVersion}`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json();
  if (!response.ok || payload?.ok === false) {
    const error = new Error(payload?.message || "항공권 정보를 불러오지 못했습니다.");
    error.payload = payload;
    throw error;
  }
  return payload;
}

async function loadAirportOptions(keyword, datalist) {
  const query = String(keyword || "").trim();
  if (!query || !datalist) return;
  if (airportCache.has(query)) {
    datalist.innerHTML = airportCache.get(query);
    return;
  }

  try {
    const payload = await postFlight("airport-autocomplete", { keyword: query, query });
    const html = (payload.items || [])
      .map(normalizeAirport)
      .filter((item) => item.code || item.label)
      .slice(0, 8)
      .map((item) => `<option value="${escapeHtml(`${item.label} (${item.code})`)}"></option>`)
      .join("");
    airportCache.set(query, html);
    datalist.innerHTML = html;
  } catch (error) {
    if (error.payload?.configured === false) renderFlightResult([], "not-configured");
  }
}

function bindFlightSearch() {
  const form = $("#flightSearchForm");
  if (!form) return;

  const originInput = $("#flightOrigin");
  const destinationInput = $("#flightDestination");
  const monthInput = $("#flightMonth");
  const originOptions = $("#flightOriginOptions");
  const destinationOptions = $("#flightDestinationOptions");
  if (monthInput && !monthInput.value) monthInput.value = flightMonthValue();

  const bindAutocomplete = (input, datalist) => {
    if (!input || !datalist) return;
    input.addEventListener("input", () => {
      if (input.value.trim().length >= 2) loadAirportOptions(input.value, datalist);
    });
    input.addEventListener("focus", () => {
      if (input.value.trim().length >= 2) loadAirportOptions(input.value, datalist);
    });
  };

  bindAutocomplete(originInput, originOptions);
  bindAutocomplete(destinationInput, destinationOptions);
  renderFlightResult();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const originCode = airportCodeFromInput(originInput?.value, "SEL");
    const destinationCode = airportCodeFromInput(destinationInput?.value, "CJU");
    const month = monthInput?.value || flightMonthValue();
    renderFlightResult([], "loading", "항공권 최저가 캘린더를 조회하고 있습니다.");

    try {
      const payload = await postFlight("lowest-price-calendar", {
        originAirportCode: originCode,
        destinationAirportCode: destinationCode,
        departureAirportCode: originCode,
        arrivalAirportCode: destinationCode,
        origin: originCode,
        destination: destinationCode,
        departure: originCode,
        arrival: destinationCode,
        yearMonth: month,
        month
      });
      renderFlightResult(payload.items || [], "ready", "표시할 최저가 데이터가 없습니다.");
    } catch (error) {
      renderFlightResult([], error.payload?.configured === false ? "not-configured" : "idle", error.message);
    }
  });
}

function renderStayResult(items = [], mode = "idle", message = "") {
  const result = $("#stayResult");
  if (!result) return;

  if (mode === "ready" && items.length) {
    result.innerHTML = `
      <div class="stay-card-list">
        ${items.slice(0, 6).map((item) => {
          const url = safeExternalUrl(item.url);
          const image = item.image || fallbackImage;
          const tag = url ? "a" : "article";
          const linkAttrs = url ? ` href="${escapeHtml(url)}" target="_blank" rel="sponsored nofollow noopener noreferrer"` : "";
          return `
            <${tag} class="stay-card"${linkAttrs}>
              ${imageTag(image, item.title)}
              <span>
                <em>${escapeHtml(item.region || item.rating || "마이리얼트립 숙소")}</em>
                <strong>${escapeHtml(item.title || "숙소 상품")}</strong>
                <small>${escapeHtml(String(item.priceText || "가격 확인"))}</small>
              </span>
            </${tag}>
          `;
        }).join("")}
      </div>
    `;
    return;
  }

  const fallbackMessage = mode === "not-configured"
    ? "MYREALTRIP_API_BASE 또는 숙소 엔드포인트 URL과 MYREALTRIP_API_KEY가 설정되면 지역 자동완성과 숙소 검색이 동작합니다."
    : message || "지역을 입력한 뒤 숙소를 조회하세요.";
  result.innerHTML = `<div class="stay-status">${escapeHtml(fallbackMessage)}</div>`;
}

async function postAccommodation(action, body) {
  const response = await fetch(`/api/myrealtrip-accommodation?action=${encodeURIComponent(action)}&v=${tourismDataVersion}`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json();
  if (!response.ok || payload?.ok === false) {
    const error = new Error(payload?.message || "숙소 정보를 불러오지 못했습니다.");
    error.payload = payload;
    throw error;
  }
  return payload;
}

async function findRegion(keyword, datalist = null) {
  const query = String(keyword || "").trim();
  if (!query) return null;
  if (regionCache.has(query)) {
    const cached = regionCache.get(query);
    if (datalist) datalist.innerHTML = cached.html;
    return cached.items[0] || null;
  }

  const payload = await postAccommodation("region-autocomplete", { keyword: query, query });
  const items = (payload.items || [])
    .map(normalizeRegion)
    .filter((item) => item.regionId || item.label)
    .slice(0, 8);
  const html = items
    .map((item) => `<option value="${escapeHtml(`${item.label} [${item.regionId}]`)}"></option>`)
    .join("");
  regionCache.set(query, { items, html });
  if (datalist) datalist.innerHTML = html;
  return items[0] || null;
}

async function loadRegionOptions(keyword, datalist) {
  try {
    await findRegion(keyword, datalist);
  } catch (error) {
    if (error.payload?.configured === false) renderStayResult([], "not-configured");
  }
}

function bindStaySearch() {
  const form = $("#staySearchForm");
  if (!form) return;

  const regionInput = $("#stayRegion");
  const regionOptions = $("#stayRegionOptions");
  const checkInInput = $("#stayCheckIn");
  const checkOutInput = $("#stayCheckOut");
  const guestsInput = $("#stayGuests");
  if (checkInInput && !checkInInput.value) checkInInput.value = dateValue(14);
  if (checkOutInput && !checkOutInput.value) checkOutInput.value = dateValue(15);

  if (regionInput && regionOptions) {
    regionInput.addEventListener("input", () => {
      if (regionInput.value.trim().length >= 2) loadRegionOptions(regionInput.value, regionOptions);
    });
    regionInput.addEventListener("focus", () => {
      if (regionInput.value.trim().length >= 2) loadRegionOptions(regionInput.value, regionOptions);
    });
  }

  renderStayResult();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const keyword = regionInput?.value || "제주";
    let regionId = regionIdFromInput(keyword);
    renderStayResult([], "loading", "숙소 지역 정보와 상품을 조회하고 있습니다.");

    try {
      if (!regionId) {
        const region = await findRegion(keyword, regionOptions);
        regionId = region?.regionId || "";
      }
      if (!regionId) {
        renderStayResult([], "idle", "지역 자동완성 결과에서 숙소 검색에 사용할 regionId를 찾지 못했습니다.");
        return;
      }

      const payload = await postAccommodation("search", {
        regionId,
        checkIn: checkInInput?.value || dateValue(14),
        checkOut: checkOutInput?.value || dateValue(15),
        adults: Number(guestsInput?.value || 2),
        guests: Number(guestsInput?.value || 2),
        rooms: 1
      });
      renderStayResult(payload.items || [], "ready", "표시할 숙소 상품이 없습니다.");
    } catch (error) {
      renderStayResult([], error.payload?.configured === false ? "not-configured" : "idle", error.message);
    }
  });
}

function renderTnaResult(items = [], mode = "idle", message = "") {
  const result = $("#tnaResult");
  if (!result) return;

  if (mode === "ready" && items.length) {
    result.innerHTML = `
      <div class="tna-card-list">
        ${items.slice(0, 6).map((product) => {
          const item = normalizeTnaProduct(product);
          const tag = item.url ? "a" : "article";
          const linkAttrs = item.url ? ` href="${escapeHtml(item.url)}" target="_blank" rel="sponsored nofollow noopener noreferrer"` : "";
          return `
            <${tag} class="tna-card"${linkAttrs}>
              ${imageTag(item.image || fallbackImage, item.title)}
              <span>
                <em>${escapeHtml(item.category || item.region || "투어·티켓")}</em>
                <strong>${escapeHtml(item.title)}</strong>
                <small>${escapeHtml(String(item.priceText))}</small>
              </span>
            </${tag}>
          `;
        }).join("")}
      </div>
    `;
    return;
  }

  const fallbackMessage = mode === "not-configured"
    ? "MYREALTRIP_API_BASE 또는 투어티켓 엔드포인트 URL과 MYREALTRIP_API_KEY가 설정되면 카테고리와 상품 검색이 동작합니다."
    : message || "도시와 검색어를 입력한 뒤 투어·티켓 상품을 조회하세요.";
  result.innerHTML = `<div class="tna-status">${escapeHtml(fallbackMessage)}</div>`;
}

async function postTna(action, body) {
  const response = await fetch(`/api/myrealtrip-tna?action=${encodeURIComponent(action)}&v=${tourismDataVersion}`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json();
  if (!response.ok || payload?.ok === false) {
    const error = new Error(payload?.message || "투어·티켓 정보를 불러오지 못했습니다.");
    error.payload = payload;
    throw error;
  }
  return payload;
}

async function loadTnaCategories(city, select) {
  const query = String(city || "").trim() || "제주";
  if (!select) return;
  if (tnaCategoryCache.has(query)) {
    select.innerHTML = tnaCategoryCache.get(query);
    return;
  }

  try {
    const payload = await postTna("categories", { city: query, cityName: query, keyword: query, query });
    const options = (payload.items || [])
      .map(normalizeTnaCategory)
      .filter((item) => item.value || item.label)
      .slice(0, 40)
      .map((item) => `<option value="${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>`)
      .join("");
    const html = `<option value="">전체</option>${options}`;
    tnaCategoryCache.set(query, html);
    select.innerHTML = html;
  } catch (error) {
    if (error.payload?.configured === false) renderTnaResult([], "not-configured");
  }
}

function bindTnaSearch() {
  const form = $("#tnaSearchForm");
  if (!form) return;

  const cityInput = $("#tnaCity");
  const categorySelect = $("#tnaCategory");
  const keywordInput = $("#tnaKeyword");
  renderTnaResult();
  loadTnaCategories(cityInput?.value || "제주", categorySelect);

  cityInput?.addEventListener("change", () => {
    loadTnaCategories(cityInput.value, categorySelect);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const city = cityInput?.value || "제주";
    const keyword = keywordInput?.value || "";
    const category = categorySelect?.value || "";
    renderTnaResult([], "loading", "투어·티켓 상품을 조회하고 있습니다.");

    try {
      const payload = await postTna("search", {
        city,
        cityName: city,
        keyword,
        query: keyword,
        category,
        page: 1,
        limit: 12
      });
      renderTnaResult(payload.items || [], "ready", "표시할 투어·티켓 상품이 없습니다.");
    } catch (error) {
      renderTnaResult([], error.payload?.configured === false ? "not-configured" : "idle", error.message);
    }
  });
}

function renderFooter() {
  const footer = $("#footerLinks");
  if (!footer) return;
  footer.innerHTML = getLanguagePack().footerGroups
    .map(([title, links]) => `
      <nav aria-label="${escapeHtml(title)}">
        <h2>${escapeHtml(title)}</h2>
        <ul>
          ${links.map((link) => `<li><a href="#top">${escapeHtml(link)}</a></li>`).join("")}
        </ul>
      </nav>
    `)
    .join("");
}

async function loadOfficialPlaces() {
  const requestCategory = activeCategory;
  const requestId = ++officialRequestId;

  if (officialCache.has(requestCategory)) {
    const places = officialCache.get(requestCategory);
    applyOfficialImagesToArticles(places);
    renderCategoryView(places);
    return;
  }

  renderCategoryView([]);

  try {
    const response = await fetch(`/api/jeju?category=${encodeURIComponent(requestCategory)}&v=${tourismDataVersion}`, {
      headers: { accept: "application/json" }
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || "관광정보를 불러오지 못했습니다.");
    const places = payload.items || [];
    applyOfficialImagesToArticles(places);
    officialCache.set(requestCategory, places);
  } catch (error) {
    officialCache.set(requestCategory, []);
  }

  if (requestId === officialRequestId && requestCategory === activeCategory) {
    renderCategoryView(officialCache.get(requestCategory));
  }
}

function setActiveCategory(category) {
  if (category && !categories.includes(category)) {
    activeCategory = categories[0];
  } else {
    activeCategory = category || categories[0];
  }
  renderPrimaryNav();
  renderTabs();
  renderCategoryView([]);
  loadOfficialPlaces();
}

function bindHeader() {
  const menuButton = $("#menuToggle") || $("#menuButton");
  const nav = $("#primaryNav");
  if (menuButton && nav) {
    const setOpen = (open) => {
      menuButton.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
    };

    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") === "true";
      setOpen(!open);
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("click", (event) => {
      if (!document.body.classList.contains("menu-open")) return;
      if (nav.contains(event.target) || menuButton.contains(event.target)) return;
      setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }
}

function bindHome() {
  const bindCategoryContainer = (container) => {
    if (!container) return;
    container.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      event.preventDefault();
      setActiveCategory(button.dataset.category);
      $("#july")?.scrollIntoView({ block: "start" });
    });
  };

  bindCategoryContainer($("#topCategoryTabs"));
  bindCategoryContainer($("#primaryNav"));
  bindCategoryContainer($(".today-keyword-bar"));
  bindCategoryContainer($("#categoryNewsSections"));
}

function renderHome() {
  if (!$("#newsFeedList")) return;
  renderTodayKeywords();
  renderPrimaryNav();
  renderTabs();
  renderCategoryView([]);
  compactTravelSearchSections();
  bindFlightSearch();
  bindStaySearch();
  bindTnaSearch();
  renderVisitCheck();
  renderCategoryNews();
  renderFaq();
  renderFooter();
  bindHome();
  loadOfficialPlaces();
}

function rowsFromPairs(pairs) {
  return pairs
    .map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value || "공식 안내 확인 필요")}</td></tr>`)
    .join("");
}

function usefulInfoValue(value) {
  const text = String(value || "").trim();
  if (!text || text === "정보 없음" || text.includes("공식 안내 확인 필요")) return "";
  return text;
}

function articleInfoRows(article, place = {}) {
  return rowsFromPairs([
    ["지역", article.region],
    ["주소", usefulInfoValue(place.address) || article.address],
    ["주차", usefulInfoValue(place.parking) || article.parking],
    ["운영시간", usefulInfoValue(place.operatingHours) || article.operatingHours],
    ["입장료", usefulInfoValue(place.fee) || article.fee]
  ]);
}

function staticInfoRows(article) {
  return articleInfoRows(article);
}

function updateArticleInfoTable(article, place) {
  const tableBody = $("#articleInfoRows");
  if (!tableBody) return;
  tableBody.innerHTML = articleInfoRows(article, place);
}

function articleOfficialKeyword(article) {
  const override = articleImageKeywordOverrides.get(article.slug);
  if (override) return override;
  const spot = ((article.course || []).find(Boolean) || article.title || "").trim();
  return spot
    .replace(/^\d일차\s*/g, "")
    .replace(/\s*(입구|매표소|전망대|전망|산책로|탐방로|안내소|주변)$/g, "")
    .split(/[·ㆍ]/)[0]
    .trim() || article.title;
}

function articleBodySections(article) {
  const course = (article.course || []).filter(Boolean);
  const nearby = (article.nearbySpots || []).filter(Boolean);
  const firstCourse = course[0] || article.title;
  const secondCourse = course[1] || article.region || "주변 코스";
  const lastCourse = course[course.length - 1] || nearby[0] || article.region || article.title;
  const routeText = course.length ? course.slice(0, 5).join(" → ") : article.title;
  const nearbyText = nearby.length ? nearby.slice(0, 4).join(", ") : "주변 관광지";
  const baseContent = (article.content || []).filter(Boolean);
  const intro = baseContent[0] || `${article.title}은 ${article.region || "제주"}에서 일정에 넣기 좋은 ${article.category || "여행지"}입니다.`;
  const localTip = baseContent[1] || `${article.region || "제주"} 권역은 날씨와 교통 상황에 따라 체감 이동 시간이 달라질 수 있으니 여유 시간을 두고 움직이는 편이 좋습니다.`;

  return [
    {
      title: "여행 포인트",
      paragraphs: [
        intro,
        `${article.title}은 한 장소만 빠르게 보고 이동하기보다 주변 흐름을 함께 잡을 때 만족도가 높습니다. ${article.category || "여행"} 일정이라면 사진을 찍는 시간, 식사 시간, 주차장에서 목적지까지 걷는 시간을 같이 계산해 두세요.`
      ]
    },
    {
      title: "추천 동선",
      paragraphs: [
        `기본 동선은 ${routeText} 순서로 잡으면 무리 없이 이어집니다. 시작 지점은 ${firstCourse}, 중간에 여유를 두고 볼 곳은 ${secondCourse}, 마무리 지점은 ${lastCourse}로 생각하면 전체 흐름이 단순해집니다.`,
        `일정이 짧다면 모든 장소를 다 넣기보다 핵심 2~3곳만 고르는 편이 낫습니다. 반대로 반나절 이상 시간이 있다면 ${nearbyText}까지 묶어 같은 권역 안에서 천천히 움직이는 구성이 좋습니다.`
      ]
    },
    {
      title: "머무는 시간과 이동 팁",
      paragraphs: [
        localTip,
        `렌터카 이동이라면 주차 위치를 먼저 확인하세요. ${article.parking} 도보 이동이 길어질 수 있는 날에는 목적지 바로 앞 주차만 고집하지 말고 가까운 공영 주차장이나 대체 코스를 함께 보는 편이 편합니다.`
      ]
    },
    {
      title: "방문 전 확인",
      paragraphs: [
        `운영시간과 입장료는 계절, 날씨, 현장 사정에 따라 달라질 수 있습니다. ${article.operatingHours} ${article.fee} 출발 전에는 지도 위치와 공식 안내를 한 번 더 확인하는 것이 안전합니다.`,
        `해변, 오름, 숲길처럼 야외 비중이 큰 일정은 바람과 비 예보에 영향을 많이 받습니다. 아이와 함께 가거나 부모님을 모시고 간다면 화장실, 그늘, 편의점, 식사 장소를 먼저 확인하고 이동하세요.`
      ]
    }
  ];
}

function articleReadableLead(article) {
  const course = (article.course || []).filter(Boolean);
  const firstCourse = course[0] || article.title;
  const lastCourse = course[course.length - 1] || article.region || article.title;
  const nearby = (article.nearbySpots || []).filter(Boolean);
  const nearbyText = nearby.length ? `${nearby.slice(0, 3).join(", ")}까지` : "주변 코스까지";
  return `${firstCourse}에서 시작해 ${lastCourse}로 이어지는 흐름을 기준으로 정리했습니다. ${article.region || "제주"} 권역에서 ${article.category || "여행"} 일정을 잡을 때 필요한 동선, 체류 시간, 방문 전 확인 사항을 함께 보세요. 여유가 있으면 ${nearbyText} 묶어 보면 좋습니다.`;
}

function renderArticleBodySection(article) {
  return `
    <section class="article-readable-section">
      <div class="section-kicker">TRAVEL NOTE</div>
      <h2>본문 정보</h2>
      <div class="readable-lead">
        <strong>읽기 전 핵심</strong>
        <p>${escapeHtml(articleReadableLead(article))}</p>
      </div>
      <div class="article-note-list">
        ${articleBodySections(article).map((section) => `
          <article class="article-note-block">
            <h3>${escapeHtml(section.title)}</h3>
            ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function articleAudienceItems(article) {
  const region = article.region || "제주";
  const category = article.category || "여행지";
  return [
    `${region} 권역에서 ${category} 중심 일정을 잡고 싶은 여행자`,
    "주차, 운영시간, 입장료를 먼저 확인하고 움직이고 싶은 초행 여행자",
    "한 곳만 보고 끝내기보다 주변 장소까지 자연스럽게 묶고 싶은 여행자"
  ];
}

function articlePlanningRows(article) {
  const course = (article.course || []).filter(Boolean);
  const first = course[0] || article.title;
  const last = course[course.length - 1] || article.region;
  const duration = course.length >= 4 ? "반나절 이상" : "1~2시간";
  const pace = course.length >= 4 ? "장소를 모두 넣기보다 핵심 2~3곳을 먼저 정하세요." : "주변 추천 한두 곳만 더해도 일정이 자연스럽습니다.";

  return [
    ["추천 체류", duration],
    ["시작 지점", first],
    ["마무리 지점", last],
    ["동선 팁", pace]
  ];
}

function renderAudienceSection(article) {
  return `
    <section class="template-card">
      <h2>이런 사람에게 추천</h2>
      <ul class="recommend-list">
        ${articleAudienceItems(article).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </section>
  `;
}

function renderPlanningSection(article) {
  return `
    <section class="template-card">
      <h2>권장 동선</h2>
      <dl class="planning-grid">
        ${articlePlanningRows(article).map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}
      </dl>
    </section>
  `;
}

function placeInfoRows(place) {
  return rowsFromPairs([
    ["분류", place.category],
    ["주소", place.address],
    ["연락처", place.tel],
    ["휴무일", place.restDate],
    ["운영시간", place.operatingHours],
    ["주차", place.parking],
    ["입장료", place.fee]
  ]);
}

function updateMeta(title, description) {
  document.title = `${title} | 제주여행뉴스`;
  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) descriptionMeta.setAttribute("content", description);
}

function articleSeoTitle(article) {
  const suffix = "주차 운영시간 입장료 코스 정리";
  return article.title.includes("주차") ? article.title : `${article.title} ${suffix}`;
}

function articleSeoDescription(article) {
  return `${article.summary} 주소, 주차, 운영시간, 입장료, 추천 동선과 주변 여행지를 함께 정리했습니다.`;
}

function renderRelated(article) {
  const relatedBox = $("#relatedArticles");
  if (!relatedBox) return;
  const related = publicArticles
    .filter((item) => item.slug !== article.slug && (item.category === article.category || item.region === article.region))
    .slice(0, 4);
  relatedBox.innerHTML = related.map(newsCard).join("");
  hydrateArticleThumbnails();
}

function renderInlineOfficialShell(article) {
  const spot = articleOfficialKeyword(article);
  return `
    <section class="map-card official-inline-card" id="articleOfficialInfo" aria-live="polite">
      <h2>공식 확인 정보</h2>
      <p>${escapeHtml(spot)}의 운영시간, 주차, 요금 정보를 본문에서 바로 확인합니다.</p>
      <div class="official-inline-status">공식 관광정보를 불러오는 중입니다.</div>
    </section>
  `;
}

function officialActionButtons(place, fallbackKeyword = "") {
  const homepage = safeExternalUrl(place.homepageUrl || place.homepage);
  const map = mapUrl(place) || mapSearchUrl(place.title || place.address || fallbackKeyword);
  const phone = phoneUrl(place.tel);
  return [
    homepage ? `<a class="primary-link" href="${escapeHtml(homepage)}" target="_blank" rel="noreferrer">공식 안내</a>` : "",
    map ? `<a class="primary-link" href="${escapeHtml(map)}" target="_blank" rel="noreferrer">지도에서 보기</a>` : "",
    phone ? `<a class="primary-link is-secondary" href="${escapeHtml(phone)}">전화하기</a>` : ""
  ].filter(Boolean).join("");
}

function officialInlineFacts(place, keyword) {
  const facts = [
    ["공식 명칭", normalizeText(place.title) !== normalizeText(keyword) ? place.title : ""],
    ["분류", place.category],
    ["문의", usefulInfoValue(place.tel)],
    ["휴무일", usefulInfoValue(place.restDate)]
  ].filter(([, value]) => usefulInfoValue(value));

  if (!facts.length) return "";

  return `
    <dl class="official-facts">
      ${facts.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}
    </dl>
  `;
}

function renderOfficialInlineContent(place, keyword) {
  const buttons = officialActionButtons(place, keyword);
  const facts = officialInlineFacts(place, keyword);
  return `
    <h2>방문 전 확인</h2>
    <p>상단 기본 정보에 공식 관광정보를 반영했습니다. 출발 전에는 최신 공지와 지도 위치만 한 번 더 확인하세요.</p>
    ${facts}
    ${buttons ? `<div class="detail-link-row">${buttons}</div>` : ""}
    <p class="source-note">자료 출처: 한국관광공사 관광정보. 운영시간과 요금은 현장 사정에 따라 달라질 수 있습니다.</p>
  `;
}

function renderOfficialInlineFallback(article, keyword) {
  const map = mapSearchUrl(`${keyword || article.title} ${article.address || "제주"}`);
  return `
    <h2>방문 전 확인</h2>
    <p>공식 상세값을 불러오지 못했습니다. 상단 기본 정보를 기준으로 보고, 출발 전 지도 위치와 현장 안내를 확인하세요.</p>
    <div class="detail-link-row">
      <a class="primary-link" href="${escapeHtml(map)}" target="_blank" rel="noreferrer">지도에서 보기</a>
    </div>
  `;
}

async function hydrateStaticOfficialInfo(article) {
  const container = $("#articleOfficialInfo");
  if (!container) return;
  const keyword = articleOfficialKeyword(article);

  try {
    const listQuery = new URLSearchParams({ keyword, category: "전체", v: tourismDataVersion });
    const listResponse = await fetch(`/api/jeju?${listQuery.toString()}`, { headers: { accept: "application/json" } });
    const listPayload = await listResponse.json();
    const placeFromList = listPayload?.items?.find((item) => normalizeText(item.title).includes(normalizeText(keyword))) || listPayload?.items?.[0];
    if (!listResponse.ok || !listPayload.ok || !placeFromList) throw new Error("공식 관광정보를 찾지 못했습니다.");

    const detailQuery = new URLSearchParams({
      contentId: placeFromList.contentId,
      v: tourismDataVersion,
      title: placeFromList.title || keyword
    });
    if (placeFromList.contentTypeId) detailQuery.set("contentTypeId", placeFromList.contentTypeId);
    const detailResponse = await fetch(`/api/jeju?${detailQuery.toString()}`, { headers: { accept: "application/json" } });
    const detailPayload = await detailResponse.json();
    const detailItem = detailResponse.ok && detailPayload.ok ? detailPayload.item || {} : {};
    const place = {
      ...fallbackPlace(placeFromList.contentId, placeFromList.contentTypeId || ""),
      ...placeFromList,
      ...detailItem
    };
    updateArticleInfoTable(article, place);
    container.innerHTML = renderOfficialInlineContent(place, keyword);
  } catch (error) {
    container.innerHTML = renderOfficialInlineFallback(article, keyword);
  }
}

function renderStaticDetail(detail) {
  const slug = params.get("slug") || publicArticles[0]?.slug || "";
  const article = publicArticles.find((item) => item.slug === slug) || publicArticles[0];
  if (!article) {
    updateMeta("제주 여행 정보", "현재 공개된 제주 여행 글이 없습니다.");
    detail.innerHTML = `<div class="detail-loading">현재 공개된 제주 여행 글이 없습니다.</div>`;
    return;
  }
  const myrealtripContext = myrealtripContextFromArticle(article);
  updateMeta(articleSeoTitle(article), articleSeoDescription(article));
  detail.innerHTML = `
    ${imageTag(thumbnailForArticle(article, true), article.title, "detail-hero", `data-article-thumb="${escapeHtml(article.slug)}"`)}
    <div class="detail-body">
      <div class="meta">${metaLine([article.category, article.region, article.date])}</div>
      <h1>${escapeHtml(article.title)}</h1>
      <p class="summary">${escapeHtml(article.summary)}</p>
      <table class="info-table article-info-table"><tbody id="articleInfoRows">${staticInfoRows(article)}</tbody></table>
      ${renderNearbyTravelRecommendations(article)}
      ${renderInlineOfficialShell(article)}
      ${renderAudienceSection(article)}
      ${renderPlanningSection(article)}
      ${renderArticleBodySection(article)}
      <section>
        <h2>여행 코스 요약</h2>
        <ol class="course-list">${(article.course || []).map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
      </section>
      <section>
        <h2>방문 전 체크포인트</h2>
        <ul class="check-list">
          <li>운영시간과 입장료는 현장 사정에 따라 달라질 수 있습니다.</li>
          <li>해변과 오름은 바람, 비, 안개 예보를 먼저 확인하세요.</li>
          <li>주차장이 혼잡하면 가까운 대체 코스를 준비하는 편이 좋습니다.</li>
        </ul>
      </section>
      <section>
        <h2>주변 장소 바로가기</h2>
        <div class="spot-tags">${(article.nearbySpots || []).map((spot) => `<a href="${escapeHtml(spotUrl(spot, article.slug))}">${escapeHtml(spot)}</a>`).join("")}</div>
      </section>
      <section class="mrt-section article-mrt-section" aria-labelledby="articleMyRealTripTitle">
        <div class="section-heading">
          <p class="eyebrow">MYREALTRIP</p>
          <h2 id="articleMyRealTripTitle">${escapeHtml(myrealtripContext.label)} 여행 상품</h2>
          <p>${escapeHtml(myrealtripContext.keyword)} 기준으로 관련 투어, 숙소, 액티비티를 보여줍니다.</p>
        </div>
        <div class="mrt-grid" id="articleMyRealTripGrid"></div>
      </section>
    </div>
  `;
  hydrateStaticOfficialInfo(article);
  loadContextualMyRealTrip(myrealtripContext, "#articleMyRealTripGrid");
  renderRelated(article);
  hydrateArticleThumbnails();
}

async function renderSpotDetail(detail, spot) {
  const title = `${spot} 여행 정보`;
  updateMeta(title, `${spot}의 제주 여행 정보를 정리했습니다.`);
  detail.innerHTML = `<div class="detail-loading">${escapeHtml(spot)} 정보를 불러오고 있습니다.</div>`;

  try {
    const query = new URLSearchParams({ keyword: spot, category: "전체", v: tourismDataVersion });
    const response = await fetch(`/api/jeju?${query.toString()}`, { headers: { accept: "application/json" } });
    const payload = await response.json();
    const first = payload?.items?.[0];
    if (!response.ok || !payload.ok || !first) throw new Error("장소 정보를 찾지 못했습니다.");
    await renderOfficialDetail(detail, first.contentId, first.contentTypeId || "", {
      ...fallbackPlace(first.contentId, first.contentTypeId || ""),
      ...first,
      restDate: "공식 안내 확인 필요",
      operatingHours: "공식 안내 확인 필요",
      parking: "공식 안내 확인 필요",
      fee: "공식 안내 확인 필요",
      checkPoint: "운영시간, 입장료, 주차 정보는 공식 안내와 현장 공지를 함께 확인하세요."
    });
  } catch (error) {
    const fallback = {
      contentId: "",
      contentTypeId: "",
      title,
      category: "주변 추천",
      address: `제주 ${spot}`,
      region: `제주 ${spot}`,
      tel: "정보 없음",
      image: fallbackImage,
      mapx: "",
      mapy: "",
      homepageUrl: "",
      restDate: "공식 안내 확인 필요",
      operatingHours: "공식 안내 확인 필요",
      parking: "공식 안내 확인 필요",
      fee: "공식 안내 확인 필요",
      checkPoint: "운영시간, 입장료, 주차 정보는 공식 안내와 현장 공지를 함께 확인하세요."
    };
    detail.innerHTML = renderPlaceDetailHtml(fallback, "주변 추천", `${spot}은 제주 여행 중 함께 묶어 보기 좋은 주변 장소입니다. 정확한 운영 정보가 필요한 경우 지도와 공식 안내를 함께 확인하세요.`);
  }
}

function fallbackPlace(contentId, contentTypeId) {
  return {
    contentId,
    contentTypeId,
    title: params.get("title") || "제주 관광정보",
    category: params.get("category") || "관광정보",
    address: params.get("address") || "",
    region: params.get("address") || "제주",
    tel: "정보 없음",
    image: params.get("image") || fallbackImage,
    mapx: params.get("mapx") || "",
    mapy: params.get("mapy") || "",
    homepageUrl: "",
    restDate: "공식 안내 확인 필요",
    operatingHours: "공식 안내 확인 필요",
    parking: "공식 안내 확인 필요",
    fee: "공식 안내 확인 필요",
    checkPoint: "방문 전 운영시간, 휴무일, 요금 안내를 다시 확인하세요."
  };
}

function phoneUrl(value) {
  const primaryNumber = String(value || "").split(/[~,/]/)[0];
  const digits = primaryNumber.replace(/[^\d+]/g, "");
  if (digits.replace(/\D/g, "").length < 7) return "";
  return `tel:${digits}`;
}

function renderOfficialLinks(place) {
  const links = officialActionButtons(place);

  if (!links) return "";
  return `
    <section class="map-card">
      <h2>공식 확인 링크</h2>
      <p>운영시간, 입장료, 휴무일은 변경될 수 있으니 출발 전 공식 안내를 한 번 더 확인하세요.</p>
      <div class="detail-link-row">${links}</div>
    </section>
  `;
}

function renderPlaceDetailHtml(place, sourceLabel, overview = "") {
  return `
    ${imageTag(place.image, place.title, "detail-hero")}
    <div class="detail-body">
      <div class="meta">${metaLine([sourceLabel, place.category])}</div>
      <h1>${escapeHtml(place.title)}</h1>
      <p class="summary">${escapeHtml(place.address || place.region || "제주")}</p>
      <table class="info-table"><tbody>${placeInfoRows(place)}</tbody></table>
      <section>
        <h2>장소 소개</h2>
        <p>${escapeHtml(overview || "목록에서 확인한 주소와 위치 정보를 먼저 표시합니다.")}</p>
      </section>
      <section>
        <h2>방문 전 체크포인트</h2>
        <ul class="check-list">
          <li>운영시간, 휴무일, 요금은 현장 사정에 따라 달라질 수 있습니다.</li>
          <li>${escapeHtml(place.checkPoint || "방문 전 최신 안내를 다시 확인하세요.")}</li>
          <li>주소와 주차 정보를 확인한 뒤 주변 대체 코스도 함께 준비하세요.</li>
        </ul>
      </section>
      ${renderOfficialLinks(place)}
      <p class="source-note">자료 출처: 한국관광공사 관광정보</p>
    </div>
  `;
}

async function renderOfficialDetail(detail, contentId, contentTypeId, fallbackOverride = null) {
  const fallback = fallbackOverride || fallbackPlace(contentId, contentTypeId);
  detail.innerHTML = `<div class="detail-loading">관광정보를 불러오고 있습니다.</div>`;

  try {
    const query = new URLSearchParams({ contentId, v: tourismDataVersion });
    if (contentTypeId) query.set("contentTypeId", contentTypeId);
    if (fallback.title) query.set("title", fallback.title);
    const response = await fetch(`/api/jeju?${query.toString()}`, { headers: { accept: "application/json" } });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || "관광정보를 불러오지 못했습니다.");
    const place = { ...fallback, ...payload.item };
    updateMeta(place.title, `${place.title}의 주소와 방문 정보를 정리했습니다.`);
    detail.innerHTML = renderPlaceDetailHtml(place, "관광정보", place.overview);
  } catch (error) {
    updateMeta(fallback.title, `${fallback.title}의 주소와 위치 정보를 정리했습니다.`);
    detail.innerHTML = renderPlaceDetailHtml(fallback, "관광정보 목록");
  }

  const relatedBox = $("#relatedArticles");
  if (relatedBox) {
    relatedBox.innerHTML = publicArticles.slice(0, 4).map(newsCard).join("");
  }
}

function renderDetail() {
  const detail = $("#articleDetail");
  if (!detail) return;

  const contentId = params.get("contentId") || params.get("id");
  const spot = params.get("spot");
  if (spot) {
    renderSpotDetail(detail, spot);
    return;
  }

  if (contentId) {
    renderOfficialDetail(detail, contentId, params.get("contentTypeId") || "");
    return;
  }

  renderStaticDetail(detail);
}

bindImageFallbacks();
bindHeader();
renderHome();
renderDetail();
bindLanguageSwitch();
applyLanguage(currentLanguage);

import { articles, categories } from "./articles.js?v=20260810-editorial-2";
import { curateArticles } from "./editorial.js?v=20260810-editorial-2";

const $ = (selector) => document.querySelector(selector);
const params = new URLSearchParams(window.location.search);
const fallbackImage = "https://tong.visitkorea.or.kr/cms/resource/91/3481291_image2_1.jpg";
const tourismDataVersion = "20260807-affiliate-match-2";
const detailPath = window.location.pathname.includes("/jeju-travel-news/") ? "article.html" : "/article.html";
const officialCache = new Map();
const beachInfoCache = new Map();
const beachWeatherCache = new Map();
const beachWeatherRequests = new Map();
const beachImageCache = new Map();
const beachImageRequests = new Map();
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
  ["saryeoni-forest-road-check", "https://api.cdn.visitjeju.net/photomng/imgpath/201804/30/ae89a383-ef1b-4295-8eac-75aa9c521571.webp"],
  ["camellia-hill-season-guide", "https://api.cdn.visitjeju.net/photomng/imgpath/202406/21/ed262984-f51e-4998-a475-b9645fae4569.webp"],
  ["dongmun-market-evening-food-route", "https://tong.visitkorea.or.kr/cms/resource/38/2678438_image2_1.jpg"],
  ["spring-jeju-canola-blossom-route", "https://tong.visitkorea.or.kr/cms/resource/69/3588469_image2_1.jpg"]
]);

const beachImageFallbacks = new Map([
  ["344", "https://tong.visitkorea.or.kr/cms/resource/02/3024202_image2_1.jpg"],
  ["347", "https://tong.visitkorea.or.kr/cms/resource/13/3552513_image2_1.jpg"],
  ["342", "https://tong.visitkorea.or.kr/cms/resource/01/3034601_image2_1.jpg"],
  ["343", "https://tong.visitkorea.or.kr/cms/resource/52/3023852_image2_1.jpg"],
  ["345", "https://tong.visitkorea.or.kr/cms/resource/30/3053130_image2_1.jpg"],
  ["355", "https://tong.visitkorea.or.kr/cms/resource_photo/09/3515409_image2_1.jpg"],
  ["354", "https://tong.visitkorea.or.kr/cms/resource/91/3480191_image2_1.jpg"],
  ["349", "https://tong.visitkorea.or.kr/cms/resource/20/3039520_image2_1.jpeg"],
  ["348", "https://tong.visitkorea.or.kr/cms/resource/66/3354566_image2_1.jpg"],
  ["352", "https://tong.visitkorea.or.kr/cms/resource/00/3354600_image2_1.jpg"],
  ["346", "https://tong.visitkorea.or.kr/cms/resource/66/3096066_image2_1.jpg"]
]);

const beachImageQueries = new Map([
  ["344", [{ keyword: "신양", category: "가볼 만한 곳" }, { keyword: "섭지코지", category: "가볼 만한 곳" }]],
  ["347", [{ keyword: "중문색달", category: "해변" }, { keyword: "중문", category: "해변" }]],
  ["342", [{ keyword: "표선", category: "해변" }]],
  ["343", [{ keyword: "화순", category: "해변" }]],
  ["345", [{ keyword: "곽지", category: "해변" }]],
  ["355", [{ keyword: "금능", category: "해변" }]],
  ["354", [{ keyword: "김녕", category: "해변" }]],
  ["349", [{ keyword: "삼양", category: "해변" }]],
  ["348", [{ keyword: "이호", category: "해변" }]],
  ["352", [{ keyword: "함덕", category: "해변" }]],
  ["346", [{ keyword: "협재", category: "해변" }]]
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

const publicArticles = curateArticles(articles).filter(isPublicArticle);

const requestedCategory = params.get("category");
let activeCategory = categories.includes(requestedCategory) ? requestedCategory : categories[0] || "전체";
const filterCategories = categories.filter((category) => category !== categories[0]);
let officialRequestId = 0;
let beachInfoRequestId = 0;
let beachImageObserver = null;
let beachWeatherObserver = null;
let articleThumbnailObserver = null;
const observedArticleThumbs = new WeakSet();

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

const languageCatalog = {
  ko: {
    htmlLang: "ko",
    ui: {
      brandName: "제주여행뉴스",
      brandTagline: "제주를 깊게 읽는 여행 매거진",
      editorialLine: "제주를 깊게 읽는 여행 매거진",
      homeIntro: "계절과 동선에 맞는 제주 여행 정보를 한눈에 정리했습니다.",
      plan: "여행 준비",
      menu: "메뉴 열기",
      list: "목록",
      news: "제주 여행 뉴스",
      products: "여행 상품",
      check: "방문 전 체크",
      recommended: "이번 주 제주",
      julyTitle: "제주 여행 가이드",
      latest: "새로 올라온 여행 이야기",
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
      coupangDisclosure: "광고·제휴 안내: 이 글에는 쿠팡 파트너스 링크가 포함되어 있으며, 링크를 통해 상품을 구매하면 운영자에게 일정액의 수수료가 지급됩니다.",
      myrealtripDisclosure: "광고·제휴 안내: 이 영역에는 마이리얼트립 제휴 링크가 포함될 수 있으며, 링크를 통해 상품을 예약·구매하면 운영자에게 수수료가 지급될 수 있습니다.",
      visitTitle: "방문 전 체크",
      travelDesk: "여행 준비"
    },
    categories: { "가볼 만한 곳": "가볼 만한 곳", "맛집": "맛집", "카페": "카페", "숙소": "숙소", "해변": "해변", "오름": "오름", "계절 코스": "계절 코스" },
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
      brandTagline: "An editorial guide to Jeju",
      editorialLine: "An editorial guide to Jeju",
      homeIntro: "Clear Jeju travel information organized by season and route.",
      plan: "Plan your trip",
      menu: "Open menu",
      list: "List",
      news: "Jeju Travel News",
      products: "Travel Picks",
      check: "Before You Go",
      recommended: "This Week in Jeju",
      julyTitle: "Jeju Travel Guide",
      latest: "New from Jeju",
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
      coupangDisclosure: "Advertising and affiliate disclosure: This article may include Coupang Partners links. We may receive a commission when you purchase through a link.",
      myrealtripDisclosure: "Advertising and affiliate disclosure: This area may include MyRealTrip affiliate links. We may receive a commission when you book or purchase through a link.",
      visitTitle: "Before You Go",
      travelDesk: "Trip Planning"
    },
    categories: { "가볼 만한 곳": "Places to Visit", "맛집": "Food", "카페": "Cafes", "숙소": "Stays", "해변": "Beaches", "오름": "Oreum Trails", "계절 코스": "Seasonal Routes" },
    faq: [["What should I read first?", "Start with the featured stories, then choose a category that matches your trip. Places, beaches and seasonal routes are a simple starting point."], ["Where can I check place details?", "Open a place card to see its address, category and map link. Confirm opening hours and fees with the official source before visiting."], ["Does the site include products or ads?", "Travel preparation product areas may appear alongside the information feed."]],
    visitCheck: [["Opening hours", "Waterfalls, museums and paid attractions may stop entry earlier than closing time."], ["Weather", "Wind, fog and rain can change the difficulty of oreum and beach visits."], ["Parking", "During busy periods, compare public parking and walking distance before driving in."], ["Route", "A single region per day is usually easier than crossing the whole island."]],
    footerGroups: [["Jeju Travel", ["Places to Visit", "Beaches", "Oreum Trails", "Seasonal Routes"]], ["Trip Planning", ["Before You Go", "Stay Areas", "Rainy-day Ideas", "Family Trips"]], ["Regions", ["Jeju City", "Seogwipo", "Seongsan", "Aewol"]], ["Language", ["한국어", "English", "日本語", "中文"]]]
  },
  ja: {
    htmlLang: "ja",
    ui: {
      brandName: "済州旅行ニュース",
      brandTagline: "済州を深く読む旅行マガジン",
      editorialLine: "済州を深く読む旅行マガジン",
      homeIntro: "季節と動線に合わせた済州旅行情報を分かりやすくまとめました。",
      plan: "旅行準備",
      menu: "メニューを開く",
      list: "一覧",
      news: "済州旅行ニュース",
      products: "旅行商品",
      check: "訪問前チェック",
      recommended: "今週の済州",
      julyTitle: "済州旅行ガイド",
      latest: "済州の新着記事",
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
      coupangDisclosure: "広告・アフィリエイトのお知らせ：この記事にはCoupang Partnersのリンクが含まれる場合があります。リンク経由の購入により運営者が手数料を受け取ることがあります。",
      myrealtripDisclosure: "広告・アフィリエイトのお知らせ：このエリアにはMyRealTripのアフィリエイトリンクが含まれる場合があります。リンク経由の予約・購入により運営者が手数料を受け取ることがあります。",
      visitTitle: "訪問前チェック",
      travelDesk: "旅行準備"
    },
    categories: { "가볼 만한 곳": "観光スポット", "맛집": "グルメ", "카페": "カフェ", "숙소": "宿泊", "해변": "ビーチ", "오름": "オルム", "계절 코스": "季節コース" },
    faq: [["まず何を見ればいいですか？", "おすすめ記事を見てから、興味のあるカテゴリーを選んでください。"], ["詳細情報はどこで確認できますか？", "場所カードを開くと住所、カテゴリー、地図リンクを確認できます。訪問前に公式案内も確認してください。"], ["商品や広告はありますか？", "旅行準備に役立つ商品情報が表示される場合があります。"]],
    visitCheck: [["営業時間", "滝や博物館、有料施設は入場締切が異なる場合があります。"], ["天気", "風、霧、雨によってオルムやビーチの歩きやすさが変わります。"], ["駐車", "繁忙期は公共駐車場と徒歩距離も確認してください。"], ["ルート", "一日に一つのエリアを中心にすると移動が楽です。"]],
    footerGroups: [["済州旅行", ["観光スポット", "ビーチ", "オルム", "季節コース"]], ["旅行準備", ["訪問前チェック", "宿泊エリア", "雨の日旅行", "家族旅行"]], ["地域", ["済州市", "西帰浦", "城山", "涯月"]], ["言語", ["한국어", "English", "日本語", "中文"]]]
  },
  zh: {
    htmlLang: "zh-CN",
    ui: {
      brandName: "济州旅行新闻",
      brandTagline: "深度阅读济州的旅行杂志",
      editorialLine: "深度阅读济州的旅行杂志",
      homeIntro: "按季节和路线整理实用的济州旅行信息。",
      plan: "旅行准备",
      menu: "打开菜单",
      list: "列表",
      news: "济州旅行新闻",
      products: "旅行产品",
      check: "出行前检查",
      recommended: "本周济州",
      julyTitle: "济州旅行指南",
      latest: "济州最新文章",
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
      coupangDisclosure: "广告与联盟说明：本文可能包含Coupang Partners链接。通过链接购买商品后，运营者可能获得一定佣金。",
      myrealtripDisclosure: "广告与联盟说明：此区域可能包含MyRealTrip联盟链接。通过链接预订或购买商品后，运营者可能获得佣金。",
      visitTitle: "出行前检查",
      travelDesk: "旅行准备"
    },
    categories: { "가볼 만한 곳": "值得去的地方", "맛집": "美食", "카페": "咖啡馆", "숙소": "住宿", "해변": "海滩", "오름": "火山丘", "계절 코스": "季节路线" },
    faq: [["应该先看什么？", "先浏览推荐文章，再选择符合行程的分类。"], ["在哪里查看地点详情？", "打开地点卡片即可查看地址、分类和地图链接。出发前请再次确认官方信息。"], ["网站有商品或广告吗？", "页面可能会显示与旅行准备相关的商品信息。"]],
    visitCheck: [["开放时间", "瀑布、博物馆和收费景点可能提前停止入场。"], ["天气", "风、雾和雨会影响火山丘及海滩的行走难度。"], ["停车", "旺季请同时确认公共停车场和步行距离。"], ["路线", "每天集中游览一个区域通常更轻松。"]],
    footerGroups: [["济州旅行", ["值得去的地方", "海滩", "火山丘", "季节路线"]], ["旅行准备", ["出行前检查", "住宿区域", "雨天旅行", "家庭旅行"]], ["地区", ["济州市", "西归浦", "城山", "涯月"]], ["语言", ["한국어", "English", "日本語", "中文"]]]
  }
};

const beachInfoCopyCatalog = {
  ko: {
    eyebrow: "해양수산부 공식 정보",
    title: "제주 해수욕장 정보",
    description: "해양수산부 공개정보를 기준으로 제주 해수욕장의 규모, 해변 특징과 비상 연락처를 정리했습니다.",
    loading: "해수욕장 정보를 불러오는 중입니다.",
    empty: "현재 불러올 해수욕장 정보가 없습니다.",
    district: "지역",
    width: "해변 폭",
    length: "해변 길이",
    feature: "해변 특징",
    emergency: "비상 연락처",
    map: "지도 보기",
    source: "공식 안내",
    unit: "m",
    sourceNote: "자료 출처: 해양수산부 해수욕장정보 서비스와 기상청 전국 해수욕장 날씨 조회서비스. 운영시간, 입수 가능 여부와 편의시설은 현장 공지를 함께 확인하세요.",
    weatherTitle: "기상청 현재 정보",
    weatherLoading: "날씨 정보를 확인하는 중입니다.",
    weatherUnavailable: "현재 확인할 수 있는 날씨 정보가 없습니다.",
    weatherStationMissing: "기상청 지점 정보가 없습니다.",
    temperature: "기온",
    rain: "강수",
    wind: "바람",
    wave: "파고",
    waterTemperature: "수온",
    sunrise: "일출",
    sunset: "일몰",
    weatherSource: "기상청 공식 데이터"
  },
  en: {
    eyebrow: "MINISTRY OF OCEANS DATA",
    title: "Jeju beach information",
    description: "Beach size, shoreline features and emergency contacts from the Ministry of Oceans and Fisheries dataset.",
    loading: "Loading beach information.",
    empty: "No beach information is available right now.",
    district: "Area",
    width: "Beach width",
    length: "Beach length",
    feature: "Beach type",
    emergency: "Emergency contact",
    map: "Open map",
    source: "Official source",
    unit: "m",
    sourceNote: "Sources: Ministry of Oceans and Fisheries beach information service and KMA nationwide beach weather service. Confirm swimming hours, access and facilities on site.",
    weatherTitle: "KMA current conditions",
    weatherLoading: "Checking beach weather.",
    weatherUnavailable: "Current weather is not available.",
    weatherStationMissing: "No KMA station is mapped.",
    temperature: "Temp",
    rain: "Rain",
    wind: "Wind",
    wave: "Wave",
    waterTemperature: "Water",
    sunrise: "Sunrise",
    sunset: "Sunset",
    weatherSource: "Official KMA data"
  },
  ja: {
    eyebrow: "海洋水産部公式情報",
    title: "済州ビーチ情報",
    description: "海洋水産部の公開情報をもとに、ビーチの規模、特徴、緊急連絡先をまとめました。",
    loading: "ビーチ情報を読み込んでいます。",
    empty: "現在利用できるビーチ情報がありません。",
    district: "地域",
    width: "ビーチ幅",
    length: "海岸の長さ",
    feature: "特徴",
    emergency: "緊急連絡先",
    map: "地図を見る",
    source: "公式案内",
    unit: "m",
    sourceNote: "出典：海洋水産部ビーチ情報サービス、気象庁全国ビーチ天気サービス。遊泳時間、立入区域、施設は現地案内も確認してください。",
    weatherTitle: "気象庁の現在情報",
    weatherLoading: "ビーチの天気を確認しています。",
    weatherUnavailable: "現在の天気情報を取得できません。",
    weatherStationMissing: "気象庁の観測地点がありません。",
    temperature: "気温",
    rain: "降水",
    wind: "風",
    wave: "波高",
    waterTemperature: "水温",
    sunrise: "日の出",
    sunset: "日の入り",
    weatherSource: "気象庁公式データ"
  },
  zh: {
    eyebrow: "海洋水产部官方信息",
    title: "济州海滩信息",
    description: "根据海洋水产部公开数据，整理济州海滩规模、海滩特点和紧急联系方式。",
    loading: "正在加载海滩信息。",
    empty: "目前没有可用的海滩信息。",
    district: "地区",
    width: "海滩宽度",
    length: "海岸长度",
    feature: "海滩特点",
    emergency: "紧急联系方式",
    map: "查看地图",
    source: "官方说明",
    unit: "m",
    sourceNote: "资料来源：海洋水产部海滩信息服务、韩国气象厅全国海滩天气服务。开放时间、下水区域和设施请同时确认现场公告。",
    weatherTitle: "韩国气象厅当前信息",
    weatherLoading: "正在确认海滩天气。",
    weatherUnavailable: "目前没有可用的天气信息。",
    weatherStationMissing: "没有对应的气象厅观测点。",
    temperature: "气温",
    rain: "降水",
    wind: "风",
    wave: "浪高",
    waterTemperature: "水温",
    sunrise: "日出",
    sunset: "日落",
    weatherSource: "韩国气象厅官方数据"
  }
};

const articleCopyCatalog = {
  ko: {
    labels: { region: "지역", address: "주소", parking: "주차", hours: "운영시간", fee: "입장료" },
    nearbyTitle: "근처 여행지 추천",
    nearbyDescription: (spots) => `${spots}와 함께 묶어 보기 좋은 주변 코스입니다.`,
    officialTitle: "공식 확인 정보",
    officialDescription: (spot) => `${spot}의 운영시간, 주차, 요금 정보를 본문에서 바로 확인합니다.`,
    bodyTitle: "본문 정보",
    bodyLead: "읽기 전 핵심",
    bodySections: ["여행 포인트", "추천 동선", "머무는 시간과 이동 팁", "방문 전 확인"],
    audienceTitle: "이런 사람에게 추천",
    planningTitle: "권장 동선",
    routeTitle: "여행 코스 요약",
    checklistTitle: "방문 전 체크포인트",
    nearbyTagsTitle: "주변 장소 바로가기",
    relatedTitle: "관련 글",
    checkItems: ["운영시간과 입장료는 현장 사정에 따라 달라질 수 있습니다.", "해변과 오름은 바람, 비, 안개 예보를 먼저 확인하세요.", "주차장이 혼잡하면 가까운 대체 코스를 준비하는 편이 좋습니다."],
    summary: (title, region, category) => `${title}을 중심으로 ${region}에서 ${category} 여행을 준비할 때 필요한 동선과 방문 정보를 정리했습니다.`,
    content: (title, region, route, nearby, category) => [
      `${title}은 ${region}에서 ${category} 일정을 잡을 때 주변 흐름까지 함께 살펴보기 좋은 여행지입니다. 주차, 이동 시간, 식사나 카페까지 같이 계산하면 여행 피로를 줄일 수 있습니다.`,
      `추천 동선은 ${route} 순서입니다. 시간이 짧다면 핵심 장소 두세 곳만 고르고, 여유가 있다면 ${nearby}까지 같은 권역으로 묶어 움직이는 편이 자연스럽습니다.`,
      `사진을 찍는 시간과 목적지까지 걷는 시간을 일정에 포함하세요. 아이나 부모님과 함께라면 화장실, 휴식 지점, 그늘 여부를 먼저 확인하면 이동이 편합니다.`,
      "출발 전에는 날씨, 공식 운영시간, 입장 마감과 주차 공지를 다시 확인하세요. 야외 일정은 강풍이나 비가 예보되면 실내 카페와 박물관을 대체 코스로 준비하는 것이 좋습니다."
    ],
    parking: "방문 전 공식 주차 안내와 공영 주차장 위치를 확인하세요. 성수기와 주말에는 도보 이동 시간을 함께 계산하는 편이 좋습니다.",
    fee: "무료 또는 유료 구간이 있을 수 있으므로 방문 전 공식 안내와 현장 요금을 확인하세요.",
    hours: "운영시간과 입장 마감은 계절, 날씨, 현장 사정에 따라 달라질 수 있습니다.",
    audienceItems: (region, category) => [`${region}에서 ${category} 중심 일정을 잡고 싶은 여행자`, "주차, 운영시간, 입장료를 먼저 확인하고 싶은 초행 여행자", "한 곳과 주변 장소를 자연스럽게 묶어 여행하고 싶은 사람"],
    planningRows: (first, last, pace) => [["추천 체류", "반나절 이상"], ["시작 지점", first], ["마무리 지점", last], ["동선 팁", pace]]
  },
  en: {
    labels: { region: "Region", address: "Address", parking: "Parking", hours: "Opening hours", fee: "Admission" },
    nearbyTitle: "Nearby places to visit",
    nearbyDescription: (spots) => `Easy nearby stops to pair with ${spots}.`,
    officialTitle: "Official information",
    officialDescription: (spot) => `Check opening hours, parking and fees for ${spot} here.`,
    bodyTitle: "Trip notes",
    bodyLead: "Key points at a glance",
    bodySections: ["Trip focus", "Suggested route", "Timing and transport tips", "Before you go"],
    audienceTitle: "Recommended for",
    planningTitle: "Suggested itinerary",
    routeTitle: "Route summary",
    checklistTitle: "Before-you-go checklist",
    nearbyTagsTitle: "Nearby place links",
    relatedTitle: "Related stories",
    checkItems: ["Opening hours and admission may change with local conditions.", "Check wind, rain and fog forecasts before beach or oreum visits.", "When parking is busy, prepare a nearby alternative and allow extra walking time."],
    summary: (title, region, category) => `A practical guide to planning a ${category.toLowerCase()} trip around ${title} in ${region}.`,
    content: (title, region, route, nearby, category) => [
      `${title} is a useful ${category.toLowerCase()} stop to pair with other places in ${region}. Planning parking, travel time and a meal or cafe break together can make the day much easier.`,
      `The suggested route is ${route}. On a short schedule, choose two or three key stops. With more time, add ${nearby} within the same area instead of crossing the island.`,
      `Leave room for photos and the walk from parking to the main site. Families and older travelers should check restrooms, shade and resting points before setting out.`,
      "Before leaving, confirm the weather, official opening hours, last admission and parking notices. For strong wind or rain, keep an indoor cafe or museum as a backup plan."
    ],
    parking: "Check the official parking notice and nearby public parking before visiting. On weekends and in peak season, include walking time in your plan.",
    fee: "Some areas may be free while others charge a fee. Confirm the official notice and current price before visiting.",
    hours: "Opening hours and last admission may change by season, weather and local conditions.",
    audienceItems: (region, category) => [`Travelers planning a ${category.toLowerCase()} day in ${region}`, "First-time visitors who want to check parking, hours and admission first", "Anyone who wants to connect one main stop with nearby places"],
    planningRows: (first, last, pace) => [["Suggested stay", "Half day or longer"], ["Start", first], ["Finish", last], ["Route tip", pace]]
  },
  ja: {
    labels: { region: "エリア", address: "住所", parking: "駐車", hours: "営業時間", fee: "入場料" },
    nearbyTitle: "周辺のおすすめスポット",
    nearbyDescription: (spots) => `${spots}と一緒に回りやすい周辺コースです。`,
    officialTitle: "公式情報",
    officialDescription: (spot) => `${spot}の営業時間、駐車場、料金を確認できます。`,
    bodyTitle: "本文情報",
    bodyLead: "先に見るポイント",
    bodySections: ["旅のポイント", "おすすめルート", "滞在時間と移動のコツ", "訪問前の確認"],
    audienceTitle: "こんな方におすすめ",
    planningTitle: "おすすめ行程",
    routeTitle: "旅行コース概要",
    checklistTitle: "訪問前チェック",
    nearbyTagsTitle: "周辺スポットへのリンク",
    relatedTitle: "関連記事",
    checkItems: ["営業時間と入場料は現地状況により変わる場合があります。", "ビーチやオルムへ行く前に風、雨、霧の予報を確認してください。", "駐車場が混雑する場合は近くの代替コースと徒歩時間を準備しましょう。"],
    summary: (title, region, category) => `${region}で${title}を中心に${category}旅行を楽しむための動線と訪問情報をまとめました。`,
    content: (title, region, route, nearby, category) => [
      `${title}は${region}で${category}の予定を組むとき、周辺の流れも一緒に考えやすい場所です。駐車、移動時間、食事やカフェをまとめて計画すると無理がありません。`,
      `おすすめの順番は${route}です。短い日程なら主要な二、三か所に絞り、時間があれば${nearby}まで同じエリアで回ると移動が楽です。`,
      `写真を撮る時間と駐車場から歩く時間も予定に入れてください。家族旅行ではトイレ、休憩場所、日陰の有無を先に確認すると安心です。`,
      "出発前に天気、公式の営業時間、最終入場、駐車場のお知らせを確認しましょう。風や雨が強い日はカフェや博物館を代替コースにすると便利です。"
    ],
    parking: "訪問前に公式の駐車案内と公共駐車場を確認してください。週末や繁忙期は徒歩時間も含めて計画しましょう。",
    fee: "無料の場所でも一部施設は有料の場合があります。訪問前に公式案内と最新料金を確認してください。",
    hours: "営業時間と最終入場は季節、天候、現地事情により変わる場合があります。",
    audienceItems: (region, category) => [`${region}で${category}中心の予定を組みたい方`, "駐車、営業時間、料金を先に確認したい初めての旅行者", "一つの場所と周辺スポットを一緒に回りたい方"],
    planningRows: (first, last, pace) => [["滞在時間", "半日以上"], ["スタート", first], ["ゴール", last], ["ルートのコツ", pace]]
  },
  zh: {
    labels: { region: "地区", address: "地址", parking: "停车", hours: "开放时间", fee: "门票" },
    nearbyTitle: "附近旅行地推荐",
    nearbyDescription: (spots) => `适合与${spots}一起安排的周边路线。`,
    officialTitle: "官方信息",
    officialDescription: (spot) => `在这里查看${spot}的开放时间、停车和费用信息。`,
    bodyTitle: "正文信息",
    bodyLead: "阅读前重点",
    bodySections: ["旅行重点", "推荐路线", "停留时间与交通提示", "出发前确认"],
    audienceTitle: "适合这些旅行者",
    planningTitle: "建议行程",
    routeTitle: "旅行路线摘要",
    checklistTitle: "出行前检查",
    nearbyTagsTitle: "附近地点链接",
    relatedTitle: "相关文章",
    checkItems: ["开放时间和门票可能因现场情况而变化。", "前往海滩或火山丘前请确认风、雨和雾的预报。", "停车场拥挤时，请准备附近替代路线并预留步行时间。"],
    summary: (title, region, category) => `整理了在${region}以${title}为中心体验${category}旅行时需要的路线和实用信息。`,
    content: (title, region, route, nearby, category) => [
      `${title}适合在${region}安排${category}行程时与周边景点一起游览。把停车、移动时间、用餐或咖啡馆休息一起计划，行程会更轻松。`,
      `推荐路线为${route}。时间较短时选择两到三个重点地点；时间充足时，可在同一区域加入${nearby}，避免一天横跨整座岛。`,
      `请把拍照时间和从停车处步行的时间也算进计划。带孩子或长辈出行时，建议提前确认卫生间、休息处和遮阳位置。`,
      "出发前再次确认天气、官方开放时间、停止入场时间和停车公告。遇到强风或下雨时，可将咖啡馆或博物馆作为备用路线。"
    ],
    parking: "出发前请确认官方停车信息和附近公共停车场。周末及旺季要把步行时间一起算入行程。",
    fee: "部分区域免费，部分设施可能收费。出发前请确认官方说明和最新价格。",
    hours: "开放时间和停止入场时间可能因季节、天气和现场情况而变化。",
    audienceItems: (region, category) => [`想在${region}安排${category}行程的旅行者`, "希望先确认停车、开放时间和门票的初次游客", "想把主要景点和附近地点一起安排的旅行者"],
    planningRows: (first, last, pace) => [["建议停留", "半天以上"], ["起点", first], ["终点", last], ["路线提示", pace]]
  }
};

const articleTermTranslations = {
  en: {
    "하도해변": "Hado Beach", "더마파크": "The Ma Park", "제주현대미술관": "Jeju Museum of Contemporary Art", "성산일출봉": "Seongsan Ilchulbong", "협재해수욕장": "Hyeopjae Beach", "함덕해수욕장": "Hamdeok Beach", "우도": "Udo", "애월": "Aewol", "서귀포": "Seogwipo", "제주시": "Jeju City", "오설록": "Osulloc", "비자림": "Bijarim Forest", "사려니숲길": "Saryeoni Forest Road", "섭지코지": "Seopjikoji", "용머리해안": "Yongmeori Coast", "정방폭포": "Jeongbang Waterfall", "천지연폭포": "Cheonjiyeon Waterfall", "월정리해변": "Woljeongri Beach", "김녕해수욕장": "Gimnyeong Beach", "표선해수욕장": "Pyoseon Beach", "동문시장": "Dongmun Market", "산굼부리": "Sangumburi", "한라산": "Hallasan", "제주": "Jeju", "동쪽": "East", "서쪽": "West", "북동부": "Northeast", "서남부": "Southwest", "전역": "Islandwide", "중산간": "Mid-mountain", "조용한": "Quiet", "바다": "Coast", "코스": "Route", "여행": "Travel", "일출": "Sunrise", "반나절": "Half-day", "카페 거리": "Cafe Street", "당일치기": "Day Trip", "드라이브": "Drive", "먹거리": "Food", "가을": "Autumn", "억새": "Silver Grass", "비 오는 날": "Rainy Day", "실내": "Indoor", "1박 2일": "2-Day", "투어": "Tour", "초보": "Beginner", "등산": "Hike", "가족과 가기 좋은": "Family-friendly", "숙소 위치 고르는 법": "Where to Stay", "산책": "Walk", "가이드": "Guide", "정보": "Guide", "체크": "Checklist", "방문 전": "Before You Go", "노을": "Sunset", "야간": "Night", "저녁": "Evening" },
  ja: {
    "하도해변": "ハドビーチ", "더마파크": "ザ・マパーク", "제주현대미술관": "済州現代美術館", "성산일출봉": "城山日出峰", "협재해수욕장": "挟才海水浴場", "함덕해수욕장": "咸徳海水浴場", "우도": "牛島", "애월": "涯月", "서귀포": "西帰浦", "제주시": "済州市", "오설록": "オソルロク", "비자림": "榧子林", "사려니숲길": "サリョニ森道", "섭지코지": "ソプチコジ", "용머리해안": "龍頭海岸", "정방폭포": "正房瀑布", "천지연폭포": "天地淵瀑布", "월정리해변": "月汀里ビーチ", "김녕해수욕장": "金寧ビーチ", "표선해수욕장": "表善ビーチ", "동문시장": "東門市場", "산굼부리": "サングムブリ", "한라산": "漢拏山", "제주": "済州", "동쪽": "東部", "서쪽": "西部", "북동부": "北東部", "서남부": "南西部", "전역": "島全域", "중산간": "中山間", "조용한": "静かな", "바다": "海", "코스": "コース", "여행": "旅行", "일출": "日の出", "반나절": "半日", "카페 거리": "カフェ通り", "당일치기": "日帰り", "드라이브": "ドライブ", "먹거리": "グルメ", "가을": "秋", "억새": "ススキ", "비 오는 날": "雨の日", "실내": "屋内", "1박 2일": "1泊2日", "투어": "ツアー", "초보": "初心者", "등산": "登山", "가족과 가기 좋은": "家族向け", "숙소 위치 고르는 법": "宿泊エリアの選び方", "산책": "散策", "가이드": "ガイド", "정보": "情報", "체크": "チェック", "방문 전": "訪問前", "노을": "夕日", "야간": "夜間", "저녁": "夕食" },
  zh: {
    "하도해변": "下道海滩", "더마파크": "德马公园", "제주현대미술관": "济州现代美术馆", "성산일출봉": "城山日出峰", "협재해수욕장": "协才海水浴场", "함덕해수욕장": "咸德海水浴场", "우도": "牛岛", "애월": "涯月", "서귀포": "西归浦", "제주시": "济州市", "오설록": "O'Sulloc", "비자림": "榧子林森林", "사려니숲길": "思连伊森林路", "섭지코지": "涉地可支", "용머리해안": "龙头海岸", "정방폭포": "正房瀑布", "천지연폭포": "天地渊瀑布", "월정리해변": "月汀里海滩", "김녕해수욕장": "金宁海水浴场", "표선해수욕장": "表善海水浴场", "동문시장": "东门市场", "산굼부리": "山君不离", "한라산": "汉拏山", "제주": "济州", "동쪽": "东部", "서쪽": "西部", "북동부": "东北部", "서남부": "西南部", "전역": "全岛", "중산간": "中山地区", "조용한": "安静的", "바다": "海边", "코스": "路线", "여행": "旅行", "일출": "日出", "반나절": "半日", "카페 거리": "咖啡馆街", "당일치기": "一日游", "드라이브": "自驾", "먹거리": "美食", "가을": "秋季", "억새": "芒草", "비 오는 날": "雨天", "실내": "室内", "1박 2일": "两天一夜", "투어": "游览", "초보": "初学者", "등산": "登山", "가족과 가기 좋은": "适合家庭", "숙소 위치 고르는 법": "住宿区域选择", "산책": "散步", "가이드": "指南", "정보": "信息", "체크": "检查", "방문 전": "出行前", "노을": "日落", "야간": "夜间", "저녁": "晚餐" }
};

const articleRegionTranslations = {
  en: { "동부": "East", "서부": "West", "성산": "Seongsan", "구좌": "Gujwa", "한림": "Hallim", "조천": "Jocheon", "안덕": "Andeok", "중문": "Jungmun", "탑동": "Tapdong", "원도심": "Old Downtown", "천지동": "Cheonji-dong", "하효동": "Hahyo-dong", "표선": "Pyoseon" },
  ja: { "동부": "東部", "서부": "西部", "성산": "城山", "구좌": "旧左", "한림": "翰林", "조천": "朝天", "안덕": "安徳", "중문": "中文", "탑동": "塔洞", "원도심": "旧市街", "천지동": "天地洞", "하효동": "下孝洞", "표선": "表善" },
  zh: { "동부": "东部", "서부": "西部", "성산": "城山", "구좌": "旧左", "한림": "翰林", "조천": "朝天", "안덕": "安德", "중문": "中文", "탑동": "塔洞", "원도심": "旧市区", "천지동": "天地洞", "하효동": "下孝洞", "표선": "表善" }
};

const articleExtraTranslations = {
  en: { "가족 여행": "Family Trip", "가족": "Family", "공연": "Performance", "식사": "Meal", "아침식사": "Breakfast", "브런치": "Brunch", "전시": "Exhibition", "역사": "History", "건축": "Architecture", "숙소": "Stay", "위치": "Location", "고르는 법": "How to Choose", "거리": "Street", "주변": "Nearby", "방문": "Visit", "시간": "Time", "물빛": "Water Color", "보기 좋은": "Best Time to See", "차와": "Tea and", "디저트": "Dessert", "유채꽃": "Canola Flowers", "동백": "Camellia", "눈꽃": "Snow Flowers", "수퍼마켙": "Supermarket", "박물관": "Museum", "시장": "Market", "해안": "Coast", "숲길": "Forest Road", "평화공원": "Peace Park", "마을": "Village", "포구": "Port", "폭포": "Waterfall", "공원": "Park", "해산물": "Seafood", "지질트레일": "Geotrail", "둘레길": "Loop Trail" },
  ja: { "가족 여행": "家族旅行", "가족": "家族", "공연": "公演", "식사": "食事", "아침식사": "朝食", "브런치": "ブランチ", "전시": "展示", "역사": "歴史", "건축": "建築", "숙소": "宿泊", "위치": "場所", "고르는 법": "選び方", "거리": "通り", "주변": "周辺", "방문": "訪問", "시간": "時間", "물빛": "海の色", "보기 좋은": "見頃", "차와": "お茶と", "디저트": "デザート", "유채꽃": "菜の花", "동백": "椿", "눈꽃": "雪景色", "수퍼마켙": "スーパーマーケット", "박물관": "博物館", "시장": "市場", "해안": "海岸", "숲길": "森の道", "평화공원": "平和公園", "마을": "村", "포구": "港", "폭포": "滝", "공원": "公園", "해산물": "海鮮", "지질트레일": "ジオトレイル", "둘레길": "周回路" },
  zh: { "가족 여행": "家庭旅行", "가족": "家庭", "공연": "演出", "식사": "用餐", "아침식사": "早餐", "브런치": "早午餐", "전시": "展览", "역사": "历史", "건축": "建筑", "숙소": "住宿", "위치": "位置", "고르는 법": "选择方法", "거리": "街道", "주변": "周边", "방문": "访问", "시간": "时间", "물빛": "海水颜色", "보기 좋은": "适合观赏的时间", "차와": "茶和", "디저트": "甜点", "유채꽃": "油菜花", "동백": "山茶花", "눈꽃": "雪景", "수퍼마켙": "超市", "박물관": "博物馆", "시장": "市场", "해안": "海岸", "숲길": "森林路", "평화공원": "和平公园", "마을": "村庄", "포구": "港口", "폭포": "瀑布", "공원": "公园", "해산물": "海鲜", "지질트레일": "地质步道", "둘레길": "环线步道" }
};

function getArticleCopy() {
  return articleCopyCatalog[currentLanguage] || articleCopyCatalog.ko;
}

function translateArticleText(value) {
  const text = String(value || "");
  if (currentLanguage === "ko") return text;
  const terms = { ...(articleTermTranslations[currentLanguage] || {}), ...(articleRegionTranslations[currentLanguage] || {}), ...(articleExtraTranslations[currentLanguage] || {}) };
  return Object.entries(terms)
    .sort(([left], [right]) => right.length - left.length)
    .reduce((result, [source, translated]) => result.replaceAll(source, translated), text);
}

function localizedArticleTitle(article) {
  return translateArticleText(article.title);
}

function localizedArticle(article) {
  if (currentLanguage === "ko") return article;
  const copy = getArticleCopy();
  const title = localizedArticleTitle(article);
  const region = translateArticleText(article.region);
  const category = categoryLabel(article.category);
  const course = (article.course || []).map(translateArticleText);
  const nearby = (article.nearbySpots || []).map(translateArticleText);
  const route = course.slice(0, 5).join(" → ") || title;
  const nearbyText = nearby.slice(0, 3).join(", ") || region;
  return {
    ...article,
    title,
    summary: copy.summary(title, region, category),
    region,
    address: translateArticleText(article.address),
    parking: copy.parking,
    fee: copy.fee,
    operatingHours: copy.hours,
    course,
    nearbySpots: nearby,
    content: copy.content(title, region, route, nearbyText, category)
  };
}

function getLanguagePack() {
  return languageCatalog[currentLanguage] || languageCatalog.ko;
}

function categoryLabel(category) {
  return getLanguagePack().categories[category] || category;
}

function savedLanguage() {
  const requestedLanguage = params.get("lang");
  if (languageCatalog[requestedLanguage]) return requestedLanguage;
  try {
    const value = localStorage.getItem("jeju-language");
    return languageCatalog[value] ? value : "ko";
  } catch (error) {
    return "ko";
  }
}

let currentLanguage = savedLanguage();

function getBeachInfoCopy() {
  return beachInfoCopyCatalog[currentLanguage] || beachInfoCopyCatalog.ko;
}

function renderBeachInfoHeading() {
  const copy = getBeachInfoCopy();
  const eyebrow = $("#beachInfoEyebrow");
  const title = $("#beachInfoTitle");
  const description = $("#beachInfoDescription");
  if (eyebrow) eyebrow.textContent = copy.eyebrow;
  if (title) title.textContent = copy.title;
  if (description) description.textContent = copy.description;
}

const dataI18nKeys = {
  "brand.name": "brandName",
  "brand.tagline": "brandTagline",
  "header.editorial": "editorialLine",
  "home.intro": "homeIntro",
  "nav.menu": "menu",
  "nav.list": "list",
  "nav.plan": "plan",
  "nav.news": "news",
  "nav.myrealtrip": "products",
  "nav.check": "check",
  "affiliate.coupang": "coupangDisclosure",
  "affiliate.myrealtrip": "myrealtripDisclosure",
  "july.title": "julyTitle",
  "july.loading": "loading",
  "faq.title": "faqTitle",
  "footer.tagline": "footerTagline",
  "footer.description": "footerDescription"
};

function languageUiText(key, fallback = "") {
  if (key === "article.related") return getArticleCopy().relatedTitle;
  const uiKey = dataI18nKeys[key] || key;
  if (uiKey === "loading") {
    return currentLanguage === "ko" ? "불러오는 중" : currentLanguage === "ja" ? "読み込み中" : currentLanguage === "zh" ? "加载中" : "Loading";
  }
  return getLanguagePack().ui[uiKey] || fallback;
}

function renderEditionDate() {
  const target = $("#editionDate");
  if (!target) return;
  const now = new Date();
  const locale = currentLanguage === "ja" ? "ja-JP" : currentLanguage === "zh" ? "zh-CN" : currentLanguage === "en" ? "en-US" : "ko-KR";
  target.dateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  target.textContent = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: currentLanguage === "en" ? "short" : "long",
    day: "numeric"
  }).format(now);
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
  renderEditionDate();

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
    renderRecommended();
    renderFeed();
    renderFaq();
    renderVisitCheck();
    renderFooter();
    renderCategoryNews();
    renderVisualGallery();
    renderBeachInfoHeading();
    renderBeachInfo(beachInfoCache.get("제주") || []);
  }
  const detail = $("#articleDetail");
  if (detail && !params.get("contentId") && !params.get("spot") && detail.dataset.language !== currentLanguage) {
    renderStaticDetail(detail);
  }
  if ($("#newsFeedList")) document.title = `${pack.ui.brandName} | ${pack.ui.julyTitle}`;
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
  return `/articles/${encodeURIComponent(article.slug)}/`;
}

function articleSlugFromPath() {
  const match = window.location.pathname.match(/\/articles\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : "";
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
    category: product.category || product.region || product.type || product.productType || "여행 상품",
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

const affiliateStayRegionPattern = /(성산|애월|함덕|조천|구좌|한림|한경|중문|표선|안덕|대정|남원|모슬포|우도|제주시|서귀포)/;
const genericAffiliateSpots = new Set(["제주", "제주시", "서귀포", "해안도로", "시장", "카페", "숙소", "오름", "해변"]);
const affiliateStayAreaAliases = [
  { pattern: /(동문|탑동|용두암|관덕정|칠성로|원도심|제주공항|노형|연동)/, keyword: "제주 시내" },
  { pattern: /(올레시장|이중섭|천지연|정방|서귀동|서귀포 시내)/, keyword: "서귀포" }
];

function articleAffiliateSpot(article = {}) {
  const candidates = [...(article.course || []), ...(article.nearbySpots || [])]
    .map(cleanTravelKeyword)
    .filter((value) => value && !genericAffiliateSpots.has(value));
  const override = cleanTravelKeyword(articleImageKeywordOverrides.get(article.slug));
  return candidates[0] || override || cleanTravelKeyword(article.title);
}

function accommodationKeyword(spot, region) {
  const source = `${spot || ""} ${region || ""}`;
  const alias = affiliateStayAreaAliases.find(({ pattern }) => pattern.test(source));
  if (alias) return alias.keyword;
  const spotMatch = String(spot || "").match(affiliateStayRegionPattern);
  if (spotMatch) return spotMatch[1];
  const regionMatch = String(region || "").match(affiliateStayRegionPattern);
  return regionMatch?.[1] || "";
}

function myrealtripContextFromArticle(article = {}, categoryOverride = "") {
  const category = cleanTravelKeyword(categoryOverride || article.category);
  const spot = articleAffiliateSpot(article);
  const region = cleanTravelKeyword(article.region);
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
    type = "hotel";
  } else if (hasAnyKeyword(category, ["카페"])) {
    keyword = compactKeywordParts(["제주", base, "카페"]);
    type = "hotel";
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
    category,
    title,
    spot,
    region,
    nearby: (article.nearbySpots || []).slice(0, 5),
    stayKeyword: accommodationKeyword(spot, region),
    scope: "article"
  };
}

function myrealtripContextFromHome() {
  const category = activeCategory === categories[0] ? "" : activeCategory;
  const seed = visibleArticles()[0] || publicArticles[0] || {};
  const context = myrealtripContextFromArticle(seed, category);
  return {
    ...context,
    label: category || "제주",
    scope: category ? "category" : "home"
  };
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
  return imageTag(thumbnailForArticle(article, true), localizedArticleTitle(article), className, `data-article-thumb="${escapeHtml(article.slug)}"`);
}

function recommendedCard(article, isLead = false) {
  const view = localizedArticle(article);
  return `
    <article class="recommend-card${isLead ? " is-lead" : ""}">
      <a href="${articleUrl(article)}">
        ${articleImageTag(article)}
        <span class="recommend-content">
          <span class="recommend-label">${escapeHtml(categoryLabel(article.category))}</span>
          <strong>${escapeHtml(view.title)}</strong>
          ${isLead ? `<p>${escapeHtml(view.summary)}</p>` : ""}
          <em>${escapeHtml([article.date, view.region].filter(Boolean).join(" · "))}</em>
        </span>
      </a>
    </article>
  `;
}

function sectionArticleCard(article) {
  const view = localizedArticle(article);
  return `
    <article class="section-card">
      <a href="${articleUrl(article)}">
        <span class="section-thumb">${articleImageTag(article)}</span>
        <span class="section-card-label">${escapeHtml(categoryLabel(article.category))}</span>
        <h3>${escapeHtml(view.title)}</h3>
        <p>${escapeHtml(view.summary)}</p>
      </a>
    </article>
  `;
}

function leadArticleCard(article) {
  const view = localizedArticle(article);
  return `
    <a class="news-lead" href="${articleUrl(article)}">
      <span class="lead-thumb">${articleImageTag(article)}</span>
      <strong>${escapeHtml(view.title)}</strong>
      <span>${metaLine([categoryLabel(article.category), view.region, article.date])}</span>
    </a>
  `;
}

function pickArticleCard(article) {
  const view = localizedArticle(article);
  return `
    <a class="pick-card" href="${articleUrl(article)}">
      <span class="pick-thumb">${articleImageTag(article)}</span>
      <strong>${escapeHtml(view.title)}</strong>
    </a>
  `;
}

function rowArticleCard(article) {
  const view = localizedArticle(article);
  return `
    <a class="news-row" href="${articleUrl(article)}">
      <span class="row-thumb">${articleImageTag(article)}</span>
      <span>
        <strong>${escapeHtml(view.title)}</strong>
        <em>${escapeHtml([categoryLabel(article.category), view.region, article.date].filter(Boolean).join(" · "))}</em>
      </span>
    </a>
  `;
}

function newsCard(article) {
  const view = localizedArticle(article);
  return `
    <article class="news-feed-card">
      <a class="news-thumb" href="${articleUrl(article)}">
        ${articleImageTag(article)}
      </a>
      <div class="news-copy">
        <div class="meta">${metaLine([categoryLabel(article.category), view.region])}</div>
        <h2><a href="${articleUrl(article)}">${escapeHtml(view.title)}</a></h2>
        <p>${escapeHtml(view.summary)}</p>
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

function homeHeroArticles() {
  const editorialSlugs = [
    "seongsan-sunrise-course",
    "hyeopjae-half-day",
    "hamdeok-cafe-street",
    "udo-day-trip"
  ];
  const editorialPicks = editorialSlugs
    .map((slug) => publicArticles.find((article) => article.slug === slug))
    .filter(Boolean);
  return uniqueByImage([...editorialPicks, ...publicArticles]).slice(0, 4);
}

function homeLatestArticles() {
  const heroSlugs = new Set(homeHeroArticles().map((article) => article.slug));
  return uniqueByImage(publicArticles.filter((article) => !heroSlugs.has(article.slug))).slice(0, 8);
}

function galleryCard(article) {
  const view = localizedArticle(article);
  return `
    <a class="gallery-card" href="${articleUrl(article)}">
      ${articleImageTag(article)}
      <span>${escapeHtml(categoryLabel(article.category))}</span>
      <strong>${escapeHtml(view.title)}</strong>
    </a>
  `;
}

function visualGalleryCard(article) {
  const view = localizedArticle(article);
  return `
    <a class="visual-gallery-card" href="${articleUrl(article)}" aria-label="${escapeHtml(view.title)}">
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
  const view = localizedArticle(article);
  return `
    <a class="nearby-travel-card" href="${articleUrl(article)}">
      <span class="nearby-travel-thumb">${articleImageTag(article)}</span>
      <span class="nearby-travel-copy">
        <span class="nearby-travel-meta">${escapeHtml([categoryLabel(article.category), article.region].filter(Boolean).join(" · "))}</span>
        <strong>${escapeHtml(view.title)}</strong>
        <em>${escapeHtml(view.summary)}</em>
      </span>
    </a>
  `;
}

function renderNearbyTravelRecommendations(article) {
  const copy = getArticleCopy();
  const items = detailNearbyArticles(article);
  if (!items.length) return "";
  const nearbyText = (article.nearbySpots || []).slice(0, 3).join(", ");
  return `
    <section class="nearby-travel-section">
      <div class="nearby-travel-head">
        <p class="section-kicker">NEARBY</p>
        <h2>${escapeHtml(copy.nearbyTitle)}</h2>
        ${nearbyText ? `<p>${escapeHtml(copy.nearbyDescription(translateArticleText(nearbyText)))}</p>` : ""}
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
  const coupang = $(".coupang-affiliate-section:not(.article-affiliate-section)");

  if (main && faq) {
    [categoryNews, visitCheck, wrapper, myrealtrip, coupang]
      .filter(Boolean)
      .forEach((section) => main.insertBefore(section, faq));
  } else {
    ($("#july") || main)?.after(wrapper);
  }
}

function renderFeed(places = null) {
  const feed = $("#newsFeedList");
  const status = $("#julyStatus") || $("#feedStatus");
  if (!feed) return;

  const localItems = activeCategory === categories[0]
    ? homeLatestArticles()
    : visibleArticles();
  const feedHtml = localItems.map(sectionArticleCard).join("");

  feed.innerHTML = feedHtml || `<p class="empty-state">현재 선택한 카테고리의 제주 여행 정보가 없습니다.</p>`;
  const feedCount = $("#feedCount");
  const feedTitle = $("#feedListTitle");
  if (feedCount) {
    const suffix = currentLanguage === "ko" ? "개 기사" : currentLanguage === "ja" ? "件" : currentLanguage === "zh" ? "篇" : " stories";
    feedCount.textContent = `${localItems.length}${suffix}`;
  }
  if (feedTitle) feedTitle.textContent = activeCategory === categories[0] ? getLanguagePack().ui.latest : categoryLabel(activeCategory);
  if (status) {
    status.hidden = true;
    status.textContent = "";
  }
  hydrateArticleThumbnails();
}

function beachImageForItem(item) {
  return item.image || beachImageFallbacks.get(String(item.weatherCode || "")) || fallbackImage;
}

function beachImageCandidateScore(code, candidate) {
  const title = normalizeText(candidate?.title);
  const queries = beachImageQueries.get(String(code)) || [];
  if (!title || !candidate?.image || !/(해수욕장|해변|비치)/.test(candidate.title || "")) return 0;
  return queries.reduce((best, query) => {
    const keyword = normalizeText(query.keyword);
    if (!keyword || !title.includes(keyword)) return best;
    if (title === keyword) return Math.max(best, 110);
    if (title.startsWith(keyword)) return Math.max(best, 100);
    return Math.max(best, 85);
  }, 0);
}

function bestBeachImage(code, items = []) {
  return items
    .map((item) => ({ item, score: beachImageCandidateScore(code, item) }))
    .filter(({ item, score }) => score > 0 && safeExternalUrl(item.image))
    .sort((a, b) => b.score - a.score)[0]?.item?.image || "";
}

async function fetchBeachImage(code) {
  const queries = beachImageQueries.get(String(code)) || [];
  for (const queryParams of queries) {
    try {
      const query = new URLSearchParams({
        keyword: queryParams.keyword,
        category: queryParams.category,
        v: tourismDataVersion
      });
      const response = await fetch(`/api/jeju?${query.toString()}`, { headers: { accept: "application/json" } });
      const payload = await response.json();
      if (!response.ok || !payload?.ok) continue;
      const image = safeExternalUrl(bestBeachImage(code, payload.items || []));
      if (image) return image;
    } catch (error) {
      // The verified per-beach fallback remains visible when the tourism API is unavailable.
    }
  }
  return beachImageFallbacks.get(String(code)) || "";
}

async function loadBeachImageNode(node) {
  if (!node) return;
  const code = String(node.dataset.beachImage || "");
  if (!code) return;
  if (beachImageCache.has(code)) {
    node.src = normalizeImageUrl(beachImageCache.get(code));
    return;
  }
  if (!beachImageRequests.has(code)) beachImageRequests.set(code, fetchBeachImage(code));
  const image = await beachImageRequests.get(code);
  beachImageRequests.delete(code);
  if (!image) return;
  beachImageCache.set(code, image);
  node.src = normalizeImageUrl(image);
}

function hydrateBeachImages() {
  const images = [...document.querySelectorAll("img[data-beach-image]")];
  if (beachImageObserver) beachImageObserver.disconnect();
  if (!images.length) return;
  if (!("IntersectionObserver" in window)) {
    images.forEach((image) => loadBeachImageNode(image));
    return;
  }
  beachImageObserver = new IntersectionObserver((entries) => {
    entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
      beachImageObserver.unobserve(entry.target);
      loadBeachImageNode(entry.target);
    });
  }, { rootMargin: "300px 0px" });
  images.forEach((image) => beachImageObserver.observe(image));
}

function beachNumber(value, copy) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "공식 정보 확인 필요";
  return `${Number.isInteger(number) ? number : number.toFixed(1)}${copy.unit}`;
}

function weatherTime(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length === 4 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : String(value || "");
}

function weatherNumber(value, suffix = "") {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return `${Number.isInteger(number) ? number : number.toFixed(1)}${suffix}`;
}

function renderBeachWeatherNode(node, data = null) {
  if (!node) return;
  const copy = getBeachInfoCopy();
  if (!node.dataset.weatherCode) {
    node.innerHTML = `<p class="beach-weather-status">${escapeHtml(copy.weatherStationMissing)}</p>`;
    return;
  }
  if (!data) {
    node.innerHTML = `<p class="beach-weather-status">${escapeHtml(copy.weatherLoading)}</p>`;
    return;
  }
  if (!data.ok) {
    node.innerHTML = `<p class="beach-weather-status">${escapeHtml(data.error || copy.weatherUnavailable)}</p>`;
    return;
  }

  const forecast = data.forecast;
  const main = forecast
    ? [weatherNumber(forecast.temperature, "°C"), forecast.label].filter(Boolean).join(" · ")
    : copy.weatherUnavailable;
  const details = [];
  if (forecast?.rain) details.push(`${copy.rain} ${forecast.rain === "강수없음" ? "없음" : forecast.rain}`);
  if (Number.isFinite(Number(forecast?.windSpeed))) details.push(`${copy.wind} ${weatherNumber(forecast.windSpeed, "m/s")}`);
  if (data.wave?.value) details.push(`${copy.wave} ${data.wave.value}m`);
  if (data.waterTemperature?.value) details.push(`${copy.waterTemperature} ${data.waterTemperature.value}°C`);
  if (data.sun?.sunrise || data.sun?.sunset) {
    details.push(`${copy.sunrise} ${weatherTime(data.sun?.sunrise)} · ${copy.sunset} ${weatherTime(data.sun?.sunset)}`);
  }
  const forecastTime = forecast ? `${forecast.date.slice(4, 6)}.${forecast.date.slice(6, 8)} ${weatherTime(forecast.time)}` : "";
  node.innerHTML = `
    <div class="beach-weather-heading">
      <strong>${escapeHtml(copy.weatherTitle)}</strong>
      <span>${escapeHtml(forecastTime || copy.weatherSource)}</span>
    </div>
    <p class="beach-weather-main">${escapeHtml(main)}</p>
    ${details.length ? `<p class="beach-weather-meta">${escapeHtml(details.join(" · "))}</p>` : ""}
    <p class="beach-weather-source">${escapeHtml(copy.weatherSource)}</p>
  `;
}

async function loadBeachWeatherNode(node) {
  if (!node) return;
  const code = node.dataset.weatherCode;
  if (!code) {
    renderBeachWeatherNode(node);
    return;
  }
  if (beachWeatherCache.has(code)) {
    renderBeachWeatherNode(node, beachWeatherCache.get(code));
    return;
  }

  renderBeachWeatherNode(node, null);
  if (!beachWeatherRequests.has(code)) {
    const request = fetch(`/api/beach-weather?beach_num=${encodeURIComponent(code)}&v=${encodeURIComponent(tourismDataVersion)}`, {
      headers: { accept: "application/json" }
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload.ok) throw new Error(payload.error || "날씨 정보를 불러오지 못했습니다.");
        return payload;
      })
      .catch((error) => ({ ok: false, error: error instanceof Error ? error.message : "날씨 정보를 불러오지 못했습니다." }));
    beachWeatherRequests.set(code, request);
  }
  const data = await beachWeatherRequests.get(code);
  if (data?.ok) beachWeatherCache.set(code, data);
  renderBeachWeatherNode(node, data);
  beachWeatherRequests.delete(code);
}

function hydrateBeachWeather() {
  const nodes = [...document.querySelectorAll("[data-beach-weather]")];
  if (beachWeatherObserver) beachWeatherObserver.disconnect();
  if (!nodes.length) return;
  if (!("IntersectionObserver" in window)) {
    nodes.forEach((node) => loadBeachWeatherNode(node));
    return;
  }
  beachWeatherObserver = new IntersectionObserver((entries) => {
    entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
      beachWeatherObserver.unobserve(entry.target);
      loadBeachWeatherNode(entry.target);
    });
  }, { rootMargin: "240px 0px" });
  nodes.forEach((node) => beachWeatherObserver.observe(node));
}

function beachInfoCard(item) {
  const copy = getBeachInfoCopy();
  const imageKey = String(item.weatherCode || item.title || "");
  const mapLink = item.latitude && item.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.latitude},${item.longitude}`)}`
    : "";
  const sourceLink = safeExternalUrl(item.sourceUrl);
  return `
    <article class="beach-info-card">
      <div class="beach-info-image">${imageTag(beachImageForItem(item), item.title, "", `data-beach-image="${escapeHtml(imageKey)}"`)}</div>
      <div class="beach-info-copy">
        <p class="meta">${escapeHtml([item.district, item.feature].filter(Boolean).join(" · ") || copy.title)}</p>
        <h3>${escapeHtml(item.title)}</h3>
        <dl class="beach-info-facts">
          <div><dt>${escapeHtml(copy.width)}</dt><dd>${escapeHtml(beachNumber(item.width, copy))}</dd></div>
          <div><dt>${escapeHtml(copy.length)}</dt><dd>${escapeHtml(beachNumber(item.length, copy))}</dd></div>
          <div><dt>${escapeHtml(copy.emergency)}</dt><dd>${escapeHtml(item.emergencyPhone || "공식 정보 확인 필요")}</dd></div>
        </dl>
        <div class="beach-weather" data-beach-weather="${escapeHtml(item.weatherCode || "")}"></div>
        <div class="beach-info-actions">
          ${mapLink ? `<a href="${escapeHtml(mapLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(copy.map)}</a>` : ""}
          ${sourceLink ? `<a href="${escapeHtml(sourceLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(copy.source)}</a>` : ""}
        </div>
      </div>
    </article>
  `;
}

function renderBeachInfo(items = [], loading = false) {
  const grid = $("#beachInfoGrid");
  const status = $("#beachInfoStatus");
  if (!grid || !status) return;
  const copy = getBeachInfoCopy();
  status.textContent = loading ? copy.loading : "";
  status.hidden = !loading;
  grid.innerHTML = items.length
    ? items.map(beachInfoCard).join("") + `<p class="source-note beach-info-note">${escapeHtml(copy.sourceNote)}</p>`
    : loading ? "" : `<p class="empty-state">${escapeHtml(copy.empty)}</p>`;
  hydrateBeachImages();
  hydrateBeachWeather();
}

async function loadBeachInfo() {
  if (activeCategory !== "해변" || !$("#beachInfoGrid")) return;
  const requestId = ++beachInfoRequestId;
  const cacheKey = "제주";
  if (beachInfoCache.has(cacheKey)) {
    renderBeachInfo(beachInfoCache.get(cacheKey));
    return;
  }

  renderBeachInfo([], true);
  try {
    const query = new URLSearchParams({ sido: cacheKey, rows: "30", v: tourismDataVersion });
    const response = await fetch(`/api/beaches?${query.toString()}`, { headers: { accept: "application/json" } });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || "해수욕장 정보를 불러오지 못했습니다.");
    beachInfoCache.set(cacheKey, payload.items || []);
  } catch (error) {
    beachInfoCache.set(cacheKey, []);
  }
  if (requestId === beachInfoRequestId && activeCategory === "해변") {
    renderBeachInfo(beachInfoCache.get(cacheKey) || []);
  }
}

function updateBeachInfoVisibility() {
  const section = $("#beachInfo");
  if (!section) return;
  const visible = activeCategory === "해변";
  section.hidden = !visible;
  if (visible) loadBeachInfo();
}

function renderRecommended() {
  const row = $("#recommendedArticles");
  if (!row) return;
  const picks = activeCategory === categories[0]
    ? homeHeroArticles()
    : uniqueByImage(visibleArticles()).slice(0, 4);
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
  updateBeachInfoVisibility();
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
  const reservedArticles = [...homeHeroArticles(), ...homeLatestArticles()];
  const usedSlugs = new Set(reservedArticles.map((article) => article.slug));
  const usedImages = new Set(reservedArticles.map((article) => normalizeImageUrl(article.image)).filter(Boolean));
  const sections = categories
    .filter((category) => category !== categories[0])
    .map((category) => {
      const items = publicArticles
        .filter((article) => {
          const image = normalizeImageUrl(article.image);
          return article.category === category && !usedSlugs.has(article.slug) && image && !usedImages.has(image);
        })
        .slice(0, 6);
      items.forEach((article) => {
        usedSlugs.add(article.slug);
        usedImages.add(normalizeImageUrl(article.image));
      });
      return {
        id: `category-${encodeURIComponent(category)}`,
        eyebrow: "ISLAND GUIDE",
        title: categoryLabel(category),
        items
      };
    });

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

function myrealtripCard(product) {
  const item = normalizeProduct(product);
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
  const section = grid.closest(".mrt-section");
  const label = cleanTravelKeyword(context.label || context.keyword || "제주");
  const heading = section?.querySelector(".section-heading h2");
  const description = section?.querySelector(".mrt-context-description");
  const isStay = context.type === "hotel" || Boolean(context.searchDates?.checkIn);
  if (heading) {
    heading.textContent = isStay
      ? currentLanguage === "ko"
        ? `${label} 주변 숙소`
        : currentLanguage === "ja"
          ? `${translateArticleText(label)} 周辺の宿泊施設`
          : currentLanguage === "zh"
            ? `${translateArticleText(label)} 周边住宿`
            : `Stays near ${translateArticleText(label)}`
      : currentLanguage === "ko"
        ? `${label} 예약·체험 정보`
        : `${translateArticleText(label)} ${getLanguagePack().ui.productTitle}`;
  }
  if (description) {
    description.textContent = isStay
      ? currentLanguage === "ko"
        ? "여행지와 같은 권역에서 예약 가능한 숙소만 모았습니다."
        : currentLanguage === "ja"
          ? "旅行先と同じエリアで予約できる宿泊施設をまとめました。"
          : currentLanguage === "zh"
            ? "仅显示与旅行地同一区域内可预订的住宿。"
            : "Available stays in the same area as this destination."
      : currentLanguage === "ko"
        ? "여행지와 직접 관련된 투어·체험 상품만 모았습니다."
        : currentLanguage === "ja"
          ? "旅行先に直接関連するツアーと体験のみを表示します。"
          : currentLanguage === "zh"
            ? "仅显示与旅行地直接相关的游览和体验。"
            : "Tours and activities directly related to this destination.";
  }

  const validItems = items
    .map(normalizeProduct)
    .filter((item) => item.title && item.url && item.image);
  if (mode === "ready" && validItems.length) {
    if (section) section.hidden = false;
    const limit = context.scope === "home" ? 6 : 4;
    const dates = context.searchDates;
    const dateNote = dates?.checkIn && dates?.checkOut
      ? `<p class="mrt-date-note">${escapeHtml(`${dates.checkIn} 체크인 · ${dates.checkOut} 체크아웃 · 성인 2명 기준 가격`)}</p>`
      : "";
    grid.innerHTML = `${dateNote}${validItems.slice(0, limit).map(myrealtripCard).join("")}`;
    return;
  }

  grid.innerHTML = "";
  if (section) section.hidden = true;
}

async function loadMyRealTrip(context = myrealtripContextFromHome(), gridSelector = "#myrealtripGrid") {
  return loadContextualMyRealTrip(context, gridSelector);
}

async function loadContextualMyRealTrip(context = myrealtripContextFromHome(), gridSelector = "#myrealtripGrid") {
  const grid = $(gridSelector);
  if (!grid) return;

  const keyword = cleanTravelKeyword(context.keyword || "제주");
  const type = context.type || "tour";
  const requestKey = `${keyword}|${type}|${context.scope || "home"}|${context.stayKeyword || ""}`;
  if (myrealtripRequestKeys.get(gridSelector) === requestKey) return;
  myrealtripRequestKeys.set(gridSelector, requestKey);
  renderMyRealTrip([], "loading", context, gridSelector);

  try {
    const fetchTours = async () => {
      const query = new URLSearchParams({
        keyword,
        type,
        title: context.title || "",
        spot: context.spot || "",
        category: context.category || "",
        region: context.region || "",
        nearby: (context.nearby || []).join("|"),
        scope: context.scope || "home",
        limit: "6",
        v: tourismDataVersion
      });
      const response = await fetch(`/api/myrealtrip?${query.toString()}`, {
        headers: { accept: "application/json" }
      });
      const payload = await response.json();
      return response.ok && payload?.ok !== false ? payload : { items: [] };
    };

    const fetchStays = async () => {
      if (!context.stayKeyword) return { items: [] };
      const response = await fetch(`/api/myrealtrip-accommodation?action=search&v=${encodeURIComponent(tourismDataVersion)}`, {
        method: "POST",
        headers: { accept: "application/json", "content-type": "application/json" },
        body: JSON.stringify({
          keyword: context.stayKeyword,
          query: context.stayKeyword,
          title: context.title || "",
          spot: context.spot || "",
          region: context.region || "",
          nearby: (context.nearby || []).join("|"),
          scope: context.scope || "home",
          adults: 2,
          page: 1,
          limit: 4
        })
      });
      const payload = await response.json();
      return response.ok && payload?.ok !== false ? payload : { items: [] };
    };

    let payload;
    if (type === "hotel") {
      payload = await fetchStays();
    } else {
      payload = await fetchTours();
      if (!(payload.items || []).length && context.scope === "article" && context.stayKeyword) {
        payload = await fetchStays();
      }
    }

    renderMyRealTrip(payload.items || [], "ready", { ...context, searchDates: payload.searchDates }, gridSelector);
  } catch (error) {
    renderMyRealTrip([], "empty", context, gridSelector);
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

function footerHref(groupIndex, linkIndex) {
  const categoryLinks = ["가볼 만한 곳", "해변", "오름", "계절 코스"];
  const planningLinks = [
    "/editorial-policy",
    `/?category=${encodeURIComponent("숙소")}#july`,
    `/?category=${encodeURIComponent("계절 코스")}#july`,
    "/articles/family-friendly-jeju/"
  ];
  const regionLinks = [
    "/articles/dongmun-market-evening-food-route/",
    "/articles/jeongbang-waterfall-guide/",
    "/articles/seongsan-sunrise-course/",
    "/articles/aewol-coastal-drive/"
  ];
  const languageLinks = ["ko", "en", "ja", "zh"];
  if (groupIndex === 0) return `/?category=${encodeURIComponent(categoryLinks[linkIndex] || "가볼 만한 곳")}#july`;
  if (groupIndex === 1) return planningLinks[linkIndex] || "/editorial-policy";
  if (groupIndex === 2) return regionLinks[linkIndex] || "/";
  if (groupIndex === 3) return `/?lang=${languageLinks[linkIndex] || "ko"}`;
  return "/";
}

function renderFooter() {
  const footer = $("#footerLinks");
  if (!footer) return;
  const groups = getLanguagePack().footerGroups
    .map(([title, links], groupIndex) => `
      <nav aria-label="${escapeHtml(title)}">
        <h2>${escapeHtml(title)}</h2>
        <ul>
          ${links.map((link, linkIndex) => `<li><a href="${escapeHtml(footerHref(groupIndex, linkIndex))}">${escapeHtml(link)}</a></li>`).join("")}
        </ul>
      </nav>
    `)
    .join("");
  const trustTitle = currentLanguage === "ko" ? "사이트 안내" : currentLanguage === "ja" ? "サイト情報" : currentLanguage === "zh" ? "网站信息" : "Site information";
  const trustLabels = currentLanguage === "ko"
    ? ["사이트 소개", "편집 원칙", "문의·수정 요청", "개인정보 처리방침"]
    : currentLanguage === "ja"
      ? ["サイト紹介", "編集方針", "お問い合わせ", "プライバシー"]
      : currentLanguage === "zh"
        ? ["网站介绍", "编辑原则", "联系与更正", "隐私政策"]
        : ["About", "Editorial policy", "Contact and corrections", "Privacy"];
  const trustHrefs = ["/about", "/editorial-policy", "/contact", "/privacy"];
  footer.innerHTML = `${groups}
    <nav aria-label="${escapeHtml(trustTitle)}">
      <h2>${escapeHtml(trustTitle)}</h2>
      <ul>${trustLabels.map((label, index) => `<li><a href="${trustHrefs[index]}">${escapeHtml(label)}</a></li>`).join("")}</ul>
    </nav>`;
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

  bindCategoryContainer($("#primaryNav"));
  bindCategoryContainer($("#categoryNewsSections"));
}

function renderHome() {
  if (!$("#newsFeedList")) return;
  renderEditionDate();
  renderPrimaryNav();
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
  const labels = getArticleCopy().labels;
  return rowsFromPairs([
    [labels.region, article.region],
    [labels.address, usefulInfoValue(place.address) || article.address],
    [labels.parking, usefulInfoValue(place.parking) || article.parking],
    [labels.hours, usefulInfoValue(place.operatingHours) || article.operatingHours],
    [labels.fee, usefulInfoValue(place.fee) || article.fee]
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
  const copy = getArticleCopy();
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

  if (currentLanguage === "ko" && Array.isArray(article.editorialSections) && article.editorialSections.length) {
    return article.editorialSections;
  }

  if (currentLanguage !== "ko") {
    return copy.bodySections.map((title, index) => ({
      title,
      paragraphs: [baseContent[index] || copy.content(article.title, article.region, routeText, nearbyText, categoryLabel(article.category))[index]]
    }));
  }

  return [
    {
      title: copy.bodySections[0],
      paragraphs: [
        intro,
        currentLanguage === "ko"
          ? `${article.title}은 한 장소만 빠르게 보고 이동하기보다 주변 흐름을 함께 잡을 때 만족도가 높습니다. ${article.category || "여행"} 일정이라면 사진을 찍는 시간, 식사 시간, 주차장에서 목적지까지 걷는 시간을 같이 계산해 두세요.`
          : `${article.title} is easier to enjoy when nearby stops are planned together instead of treating it as a quick stop. Include photo time, meals and the walk from parking to the destination in your ${categoryLabel(article.category) || "trip"} plan.`
      ]
    },
    {
      title: copy.bodySections[1],
      paragraphs: [
        `기본 동선은 ${routeText} 순서로 잡으면 무리 없이 이어집니다. 시작 지점은 ${firstCourse}, 중간에 여유를 두고 볼 곳은 ${secondCourse}, 마무리 지점은 ${lastCourse}로 생각하면 전체 흐름이 단순해집니다.`,
        `일정이 짧다면 모든 장소를 다 넣기보다 핵심 2~3곳만 고르는 편이 낫습니다. 반대로 반나절 이상 시간이 있다면 ${nearbyText}까지 묶어 같은 권역 안에서 천천히 움직이는 구성이 좋습니다.`
      ]
    },
    {
      title: copy.bodySections[2],
      paragraphs: [
        localTip,
        `렌터카 이동이라면 주차 위치를 먼저 확인하세요. ${article.parking} 도보 이동이 길어질 수 있는 날에는 목적지 바로 앞 주차만 고집하지 말고 가까운 공영 주차장이나 대체 코스를 함께 보는 편이 편합니다.`
      ]
    },
    {
      title: copy.bodySections[3],
      paragraphs: [
        `운영시간과 입장료는 계절, 날씨, 현장 사정에 따라 달라질 수 있습니다. ${article.operatingHours} ${article.fee} 출발 전에는 지도 위치와 공식 안내를 한 번 더 확인하는 것이 안전합니다.`,
        `해변, 오름, 숲길처럼 야외 비중이 큰 일정은 바람과 비 예보에 영향을 많이 받습니다. 아이와 함께 가거나 부모님을 모시고 간다면 화장실, 그늘, 편의점, 식사 장소를 먼저 확인하고 이동하세요.`
      ]
    }
  ];
}

function articleReadableLead(article) {
  const copy = getArticleCopy();
  const course = (article.course || []).filter(Boolean);
  const firstCourse = course[0] || article.title;
  const lastCourse = course[course.length - 1] || article.region || article.title;
  const nearby = (article.nearbySpots || []).filter(Boolean);
  const nearbyText = nearby.length ? `${nearby.slice(0, 3).join(", ")}까지` : "주변 코스까지";
  if (currentLanguage !== "ko") return copy.content(article.title, article.region, course.slice(0, 5).join(" → ") || article.title, nearby.slice(0, 3).join(", ") || article.region, categoryLabel(article.category))[0];
  return `${firstCourse}에서 시작해 ${lastCourse}로 이어지는 흐름을 기준으로 정리했습니다. ${article.region || "제주"} 권역에서 ${article.category || "여행"} 일정을 잡을 때 필요한 동선, 체류 시간, 방문 전 확인 사항을 함께 보세요. 여유가 있으면 ${nearbyText} 묶어 보면 좋습니다.`;
}

function renderArticleBodySection(article) {
  return `
    <section class="article-readable-section">
      <div class="section-kicker">TRAVEL NOTE</div>
      <h2>${escapeHtml(getArticleCopy().bodyTitle)}</h2>
      <div class="readable-lead">
        <strong>${escapeHtml(getArticleCopy().bodyLead)}</strong>
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
  const copy = getArticleCopy();
  const region = article.region || "제주";
  const category = categoryLabel(article.category || "여행지");
  return copy.audienceItems(region, category);
}

function articlePlanningRows(article) {
  const copy = getArticleCopy();
  const course = (article.course || []).filter(Boolean);
  const first = course[0] || article.title;
  const last = course[course.length - 1] || article.region;
  const duration = course.length >= 4 ? "반나절 이상" : "1~2시간";
  const pace = course.length >= 4 ? "장소를 모두 넣기보다 핵심 2~3곳을 먼저 정하세요." : "주변 추천 한두 곳만 더해도 일정이 자연스럽습니다.";

  if (currentLanguage === "ko") return [["추천 체류", duration], ["시작 지점", first], ["마무리 지점", last], ["동선 팁", pace]];
  const localizedPace = currentLanguage === "en"
    ? "Choose two or three key stops instead of fitting everything in."
    : currentLanguage === "ja"
      ? "すべて詰め込まず、主要な二、三か所を選びましょう。"
      : "不要安排所有地点，优先选择两到三个重点。";
  return copy.planningRows(first, last, localizedPace);
}

function renderAudienceSection(article) {
  return `
    <section class="template-card">
      <h2>${escapeHtml(getArticleCopy().audienceTitle)}</h2>
      <ul class="recommend-list">
        ${articleAudienceItems(article).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </section>
  `;
}

function renderPlanningSection(article) {
  return `
    <section class="template-card">
      <h2>${escapeHtml(getArticleCopy().planningTitle)}</h2>
      <dl class="planning-grid">
        ${articlePlanningRows(article).map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}
      </dl>
    </section>
  `;
}

function renderEditorialByline(article) {
  const labels = currentLanguage === "ko"
    ? { author: "작성", reviewed: "최종 검수", method: "검수 기준" }
    : currentLanguage === "ja"
      ? { author: "作成", reviewed: "最終確認", method: "確認基準" }
      : currentLanguage === "zh"
        ? { author: "撰写", reviewed: "最终审核", method: "审核标准" }
        : { author: "By", reviewed: "Reviewed", method: "Review standard" };
  return `
    <div class="article-byline" aria-label="${escapeHtml(labels.method)}">
      <span><strong>${escapeHtml(labels.author)}</strong> ${escapeHtml(article.author || "제주여행뉴스 편집팀")}</span>
      <span><strong>${escapeHtml(labels.reviewed)}</strong> ${escapeHtml(article.reviewedAt || article.date)}</span>
      ${article.reviewMethod ? `<p><strong>${escapeHtml(labels.method)}</strong> ${escapeHtml(article.reviewMethod)}</p>` : ""}
    </div>
  `;
}

function renderArticleSources(article) {
  const sources = (article.sources || [])
    .map((source) => ({ name: String(source?.name || "").trim(), url: safeExternalUrl(source?.url) }))
    .filter((source) => source.name && source.url);
  if (!sources.length) return "";
  const title = currentLanguage === "ko" ? "자료 출처와 수정 요청" : currentLanguage === "ja" ? "情報源と修正依頼" : currentLanguage === "zh" ? "资料来源与更正" : "Sources and corrections";
  const note = currentLanguage === "ko"
    ? "운영시간·요금·통제 정보는 바뀔 수 있습니다. 방문 전 아래 공식 채널을 다시 확인해 주세요. 잘못된 정보는 문의 페이지로 알려주시면 검토 후 수정합니다."
    : currentLanguage === "ja"
      ? "営業時間、料金、規制情報は変更される場合があります。訪問前に公式情報をご確認ください。"
      : currentLanguage === "zh"
        ? "开放时间、费用和管制信息可能会变化。出发前请再次确认官方信息。"
        : "Hours, fees and access restrictions can change. Check the official sources before visiting.";
  return `
    <section class="article-sources">
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(note)}</p>
      <ul>${sources.map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.name)}</a></li>`).join("")}</ul>
      <a class="correction-link" href="/contact">${currentLanguage === "ko" ? "정보 수정 요청" : currentLanguage === "ja" ? "修正を依頼" : currentLanguage === "zh" ? "提交更正" : "Request a correction"}</a>
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

function setMetaProperty(property, content) {
  let meta = document.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.append(meta);
  }
  meta.setAttribute("content", content);
}

function updateMeta(title, description, canonicalUrl = "") {
  document.title = `${title} | 제주여행뉴스`;
  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) descriptionMeta.setAttribute("content", description);
  setMetaProperty("og:title", `${title} | 제주여행뉴스`);
  setMetaProperty("og:description", description);
  if (canonicalUrl) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.append(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);
    setMetaProperty("og:url", canonicalUrl);
  }
}

function articleSeoTitle(article) {
  const suffix = currentLanguage === "ko" ? "주차 운영시간 입장료 코스 정리" : currentLanguage === "ja" ? "駐車場 営業時間 料金 コースガイド" : currentLanguage === "zh" ? "停车 开放时间 门票 路线指南" : "Parking Hours Fees Route Guide";
  return article.title.includes("주차") ? article.title : `${article.title} ${suffix}`;
}

function articleSeoDescription(article) {
  if (currentLanguage === "ko") return `${article.summary} 주소, 주차, 운영시간, 입장료, 추천 동선과 주변 여행지를 함께 정리했습니다.`;
  const copy = getArticleCopy();
  if (currentLanguage === "ja") return `${article.summary} ${copy.bodyTitle}、${copy.labels.address}、${copy.labels.parking}、${copy.labels.hours}、${copy.labels.fee}と周辺ルートをまとめています。`;
  if (currentLanguage === "zh") return `${article.summary} 整理了${copy.bodyTitle}、${copy.labels.address}、${copy.labels.parking}、${copy.labels.hours}、${copy.labels.fee}及附近路线。`;
  return `${article.summary} ${copy.bodyTitle}, ${copy.labels.address}, ${copy.labels.parking}, ${copy.labels.hours}, ${copy.labels.fee} and nearby routes are included.`;
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
  const copy = getArticleCopy();
  const spot = articleOfficialKeyword(article);
  return `
    <section class="map-card official-inline-card" id="articleOfficialInfo" aria-live="polite">
      <h2>${escapeHtml(copy.officialTitle)}</h2>
      <p>${escapeHtml(copy.officialDescription(translateArticleText(spot)))}</p>
      <div class="official-inline-status">${currentLanguage === "ko" ? "공식 관광정보를 불러오는 중입니다." : currentLanguage === "ja" ? "公式観光情報を読み込んでいます。" : currentLanguage === "zh" ? "正在加载官方旅游信息。" : "Loading official tourism information."}</div>
    </section>
  `;
}

function officialActionButtons(place, fallbackKeyword = "") {
  const labels = currentLanguage === "ko"
    ? ["공식 안내", "지도에서 보기", "전화하기"]
    : currentLanguage === "ja"
      ? ["公式案内", "地図で見る", "電話する"]
      : currentLanguage === "zh"
        ? ["官方说明", "在地图中查看", "拨打电话"]
        : ["Official site", "View on map", "Call"];
  const homepage = safeExternalUrl(place.homepageUrl || place.homepage);
  const map = mapUrl(place) || mapSearchUrl(place.title || place.address || fallbackKeyword);
  const phone = phoneUrl(place.tel);
  return [
    homepage ? `<a class="primary-link" href="${escapeHtml(homepage)}" target="_blank" rel="noreferrer">${labels[0]}</a>` : "",
    map ? `<a class="primary-link" href="${escapeHtml(map)}" target="_blank" rel="noreferrer">${labels[1]}</a>` : "",
    phone ? `<a class="primary-link is-secondary" href="${escapeHtml(phone)}">${labels[2]}</a>` : ""
  ].filter(Boolean).join("");
}

function officialInlineFacts(place, keyword) {
  const labels = currentLanguage === "ko"
    ? ["공식 명칭", "분류", "문의", "휴무일"]
    : currentLanguage === "ja"
      ? ["正式名称", "分類", "問い合わせ", "休業日"]
      : currentLanguage === "zh"
        ? ["官方名称", "分类", "咨询", "休息日"]
        : ["Official name", "Category", "Contact", "Closed days"];
  const facts = [
    [labels[0], normalizeText(place.title) !== normalizeText(keyword) ? translateArticleText(place.title) : ""],
    [labels[1], translateArticleText(place.category)],
    [labels[2], usefulInfoValue(place.tel)],
    [labels[3], translateArticleText(usefulInfoValue(place.restDate))]
  ].filter(([, value]) => usefulInfoValue(value));

  if (!facts.length) return "";

  return `
    <dl class="official-facts">
      ${facts.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}
    </dl>
  `;
}

function renderOfficialInlineContent(place, keyword) {
  const copy = getArticleCopy();
  const buttons = officialActionButtons(place, keyword);
  const facts = officialInlineFacts(place, keyword);
  return `
    <h2>${escapeHtml(copy.checklistTitle)}</h2>
    <p>${currentLanguage === "ko" ? "상단 기본 정보에 공식 관광정보를 반영했습니다. 출발 전에는 최신 공지와 지도 위치만 한 번 더 확인하세요." : currentLanguage === "ja" ? "基本情報に公式観光情報を反映しています。出発前に最新のお知らせと地図をもう一度確認してください。" : currentLanguage === "zh" ? "基本信息已加入官方旅游资料。出发前请再次确认最新公告和地图位置。" : "Official tourism information is reflected above. Check the latest notice and map location before leaving."}</p>
    ${facts}
    ${buttons ? `<div class="detail-link-row">${buttons}</div>` : ""}
    <p class="source-note">${currentLanguage === "ko" ? "자료 출처: 한국관광공사 관광정보. 운영시간과 요금은 현장 사정에 따라 달라질 수 있습니다." : currentLanguage === "ja" ? "出典：韓国観光公社の観光情報。営業時間と料金は現地状況により変わる場合があります。" : currentLanguage === "zh" ? "资料来源：韩国旅游发展局旅游信息。开放时间和费用可能因现场情况而变化。" : "Source: Korea Tourism Organization. Hours and fees may change with local conditions."}</p>
  `;
}

function renderOfficialInlineFallback(article, keyword) {
  const copy = getArticleCopy();
  const map = mapSearchUrl(`${keyword || article.title} ${article.address || "제주"}`);
  return `
    <h2>${escapeHtml(copy.checklistTitle)}</h2>
    <p>${currentLanguage === "ko" ? "공식 상세값을 불러오지 못했습니다. 상단 기본 정보를 기준으로 보고, 출발 전 지도 위치와 현장 안내를 확인하세요." : currentLanguage === "ja" ? "公式の詳細情報を読み込めませんでした。基本情報を確認し、出発前に地図と現地案内を確認してください。" : currentLanguage === "zh" ? "无法加载官方详细信息。请参考基本信息，并在出发前确认地图和现场信息。" : "Official details could not be loaded. Use the basic information above and check the map and local notice before leaving."}</p>
    <div class="detail-link-row">
      <a class="primary-link" href="${escapeHtml(map)}" target="_blank" rel="noreferrer">${currentLanguage === "ko" ? "지도에서 보기" : currentLanguage === "ja" ? "地図で見る" : currentLanguage === "zh" ? "在地图中查看" : "View on map"}</a>
    </div>
  `;
}

async function hydrateStaticOfficialInfo(article, displayArticle = localizedArticle(article)) {
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
    updateArticleInfoTable(displayArticle, place);
    container.innerHTML = renderOfficialInlineContent(place, keyword);
  } catch (error) {
    container.innerHTML = renderOfficialInlineFallback(article, keyword);
  }
}

function renderStaticDetail(detail) {
  const slug = params.get("slug") || articleSlugFromPath() || publicArticles[0]?.slug || "";
  const article = publicArticles.find((item) => item.slug === slug) || publicArticles[0];
  if (!article) {
    updateMeta("제주 여행 정보", "현재 공개된 제주 여행 글이 없습니다.");
    detail.innerHTML = `<div class="detail-loading">현재 공개된 제주 여행 글이 없습니다.</div>`;
    return;
  }
  const view = localizedArticle(article);
  const copy = getArticleCopy();
  const myrealtripContext = myrealtripContextFromArticle(article);
  const productDescription = currentLanguage === "ko"
    ? `${myrealtripContext.keyword} 기준으로 관련 투어, 숙소, 액티비티를 보여줍니다.`
    : currentLanguage === "ja"
      ? `${translateArticleText(myrealtripContext.keyword)}を基準に関連ツアー、宿泊、アクティビティを表示します。`
      : currentLanguage === "zh"
        ? `根据${translateArticleText(myrealtripContext.keyword)}显示相关游览、住宿和活动。`
        : `Related tours, stays and activities for ${translateArticleText(myrealtripContext.keyword)}.`;
  updateMeta(articleSeoTitle(view), articleSeoDescription(view), `https://www.moneyarchive.kr${articleUrl(article)}`);
  detail.innerHTML = `
    ${imageTag(thumbnailForArticle(article, true), view.title, "detail-hero", `data-article-thumb="${escapeHtml(article.slug)}"`)}
    <div class="detail-body">
      <div class="meta">${metaLine([categoryLabel(article.category), view.region, article.date])}</div>
      <h1>${escapeHtml(view.title)}</h1>
      <p class="summary">${escapeHtml(view.summary)}</p>
      ${renderEditorialByline(article)}
      <table class="info-table article-info-table"><tbody id="articleInfoRows">${staticInfoRows(view)}</tbody></table>
      ${renderNearbyTravelRecommendations(article)}
      ${renderInlineOfficialShell(article)}
      ${renderAudienceSection(view)}
      ${renderPlanningSection(view)}
      ${renderArticleBodySection(view)}
      <section>
        <h2>${escapeHtml(copy.routeTitle)}</h2>
        <ol class="course-list">${(view.course || []).map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
      </section>
      <section>
        <h2>${escapeHtml(copy.checklistTitle)}</h2>
        <ul class="check-list">
          ${copy.checkItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
      <section>
        <h2>${escapeHtml(copy.nearbyTagsTitle)}</h2>
        <div class="spot-tags">${(article.nearbySpots || []).map((spot, index) => `<a href="${escapeHtml(spotUrl(spot, article.slug))}">${escapeHtml(view.nearbySpots[index] || spot)}</a>`).join("")}</div>
      </section>
      ${renderArticleSources(article)}
      <section class="mrt-section article-mrt-section" aria-labelledby="articleMyRealTripTitle" hidden>
        <div class="section-heading">
          <p class="eyebrow">MYREALTRIP</p>
          <h2 id="articleMyRealTripTitle">${escapeHtml(translateArticleText(myrealtripContext.label))} ${escapeHtml(getLanguagePack().ui.productTitle)}</h2>
          <p class="mrt-context-description">${escapeHtml(productDescription)}</p>
          <p class="affiliate-disclosure">${escapeHtml(getLanguagePack().ui.myrealtripDisclosure)}</p>
        </div>
        <div class="mrt-grid" id="articleMyRealTripGrid"></div>
      </section>
    </div>
  `;
  detail.dataset.language = currentLanguage;
  myrealtripRequestKeys.delete("#articleMyRealTripGrid");
  hydrateStaticOfficialInfo(article, view);
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
  const title = currentLanguage === "ko" ? "공식 확인 링크" : currentLanguage === "ja" ? "公式リンク" : currentLanguage === "zh" ? "官方链接" : "Official links";
  const description = currentLanguage === "ko"
    ? "운영시간, 입장료, 휴무일은 변경될 수 있으니 출발 전 공식 안내를 한 번 더 확인하세요."
    : currentLanguage === "ja"
      ? "営業時間、料金、休業日は変わる場合があるため、出発前に公式案内を確認してください。"
      : currentLanguage === "zh"
        ? "开放时间、门票和休息日可能变化，出发前请再次确认官方说明。"
        : "Opening hours, fees and closed days can change. Check the official notice before leaving.";
  return `
    <section class="map-card">
      <h2>${title}</h2>
      <p>${description}</p>
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

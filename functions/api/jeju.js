const TOUR_API_BASE = "https://apis.data.go.kr/B551011/KorService2";
const TOUR_API_LEGACY_BASE = "https://apis.data.go.kr/B551011/KorService1";
const TOUR_API_CLASSIC_BASE = "https://apis.data.go.kr/B551011/KorService";
const LDONG_REGN_JEJU = "50";
const APP_NAME = "JejuTravelNews";

const CONTENT_TYPE_LABELS = {
  12: "관광지",
  14: "문화시설",
  15: "축제·행사",
  25: "여행코스",
  28: "레포츠",
  32: "숙소",
  38: "쇼핑",
  39: "음식점"
};

const CATEGORY_REQUESTS = {
  "전체": { endpoint: "searchKeyword2", keyword: "제주", allowedTypes: ["12", "14", "15", "25", "32", "39"] },
  "가볼 만한 곳": { endpoint: "searchKeyword2", contentTypeId: "12", keyword: "제주" },
  "맛집": { endpoint: "searchKeyword2", contentTypeId: "39", keyword: "제주" },
  "카페": { endpoint: "searchKeyword2", contentTypeId: "39", keyword: "카페" },
  "숙소": { endpoint: "searchKeyword2", contentTypeId: "32", keyword: "제주" },
  "해변": { endpoint: "searchKeyword2", contentTypeId: "12", keyword: "해변" },
  "오름": { endpoint: "searchKeyword2", contentTypeId: "12", keyword: "오름" },
  "계절 코스": { endpoint: "searchKeyword2", contentTypeId: "25", keyword: "제주" }
};

function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", init.cacheControl || "public, max-age=600, s-maxage=1800");
  return new Response(JSON.stringify(data), {
    status: init.status || 200,
    headers
  });
}

function getServiceKey(env) {
  return (
    env.KTO_TOUR_API_KEY ||
    env.KTO_SERVICE_KEY ||
    env.TOUR_API_KEY ||
    env.SERVICE_KEY ||
    ""
  ).trim();
}

function serviceKeyParam(serviceKey) {
  return /%[0-9a-f]{2}/i.test(serviceKey) ? serviceKey : encodeURIComponent(serviceKey);
}

function tourUrl(baseUrl, endpoint, params, serviceKey, keyName = "serviceKey") {
  const search = new URLSearchParams({
    MobileOS: "ETC",
    MobileApp: APP_NAME,
    _type: "json",
    ...params
  });
  return `${baseUrl}/${endpoint}?${search.toString()}&${keyName}=${serviceKeyParam(serviceKey)}`;
}

async function fetchTour(endpoint, params, serviceKey, baseUrl = TOUR_API_BASE, keyName = "serviceKey") {
  const response = await fetch(tourUrl(baseUrl, endpoint, params, serviceKey, keyName), {
    headers: { accept: "application/json" }
  });
  const text = await response.text();

  let payload;
  try {
    payload = JSON.parse(text);
  } catch (error) {
    throw new Error(`관광정보 응답을 해석하지 못했습니다. HTTP ${response.status}`);
  }

  const header = payload?.response?.header;
  if (!response.ok || (header?.resultCode && header.resultCode !== "0000")) {
    throw new Error(header?.resultMsg || `관광정보 호출 실패: HTTP ${response.status}`);
  }

  return payload?.response?.body || {};
}

async function fetchTourWithFallback(endpoint, params, serviceKey) {
  const primaryBody = await fetchTour(endpoint, params, serviceKey);
  if (asItems(primaryBody).length || Number(primaryBody.totalCount || 0) > 0) {
    return primaryBody;
  }

  const legacyEndpoint = endpoint.replace(/2$/, "1");
  if (legacyEndpoint === endpoint) return primaryBody;

  try {
    const legacyBody = await fetchTour(legacyEndpoint, params, serviceKey, TOUR_API_LEGACY_BASE);
    if (asItems(legacyBody).length || Number(legacyBody.totalCount || 0) > 0) {
      return legacyBody;
    }
  } catch (error) {
    // Continue to the classic TourAPI route below.
  }

  const classicEndpoint = endpoint.replace(/[12]$/, "");
  if (classicEndpoint !== endpoint) {
    try {
      const classicBody = await fetchTour(classicEndpoint, params, serviceKey, TOUR_API_CLASSIC_BASE, "ServiceKey");
      if (asItems(classicBody).length || Number(classicBody.totalCount || 0) > 0) {
        return classicBody;
      }
    } catch (error) {
      // Keep the empty primary response when all known routes fail.
    }
  }

  return primaryBody;
}

function asItems(value) {
  if (!value) return [];
  const item = value?.items?.item;
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

function stripTags(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeImageUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("http://")) return url.replace(/^http:\/\//i, "https://");
  return url;
}

function firstImage(...values) {
  return values.map(normalizeImageUrl).find(Boolean) || "";
}

function contentTypeLabel(contentTypeId) {
  return CONTENT_TYPE_LABELS[Number(contentTypeId)] || "관광정보";
}

function normalizeListItem(item) {
  const address = [item.addr1, item.addr2].filter(Boolean).join(" ");
  return {
    contentId: String(item.contentid || ""),
    contentTypeId: String(item.contenttypeid || ""),
    title: stripTags(item.title),
    category: contentTypeLabel(item.contenttypeid),
    region: address || "제주",
    address,
    tel: stripTags(item.tel),
    image: firstImage(item.firstimage, item.firstimage2),
    mapx: item.mapx || "",
    mapy: item.mapy || "",
    modified: item.modifiedtime || "",
    created: item.createdtime || ""
  };
}

function isJejuItem(item) {
  const address = [item.addr1, item.addr2].filter(Boolean).join(" ");
  return (
    /제주/.test(address) ||
    String(item.lDongRegnCd || "") === LDONG_REGN_JEJU ||
    String(item.areacode || "") === "39"
  );
}

function firstAvailable(...values) {
  return values.map(stripTags).find(Boolean) || "정보 없음";
}

function normalizeDetail(common, intro, images) {
  const address = [common.addr1, common.addr2].filter(Boolean).join(" ");
  const contentId = common.contentid || common.contentId || "";
  const contentTypeId = common.contenttypeid || common.contentTypeId || "";
  const operatingHours = firstAvailable(
    intro.usetime,
    intro.usetimeculture,
    intro.opentimefood,
    intro.playtime,
    intro.checkintime && intro.checkouttime ? `체크인 ${intro.checkintime} · 체크아웃 ${intro.checkouttime}` : "",
    intro.usetimeleports,
    intro.fairday,
    intro.opentime
  );
  const parking = firstAvailable(
    intro.parking,
    intro.parkingculture,
    intro.parkingfood,
    intro.parkinglodging,
    intro.parkingleports,
    intro.parkingshopping
  );
  const fee = firstAvailable(
    intro.usefee,
    intro.usetimefestival,
    intro.infocenterfood && intro.firstmenu ? `대표 메뉴: ${intro.firstmenu}` : "",
    intro.roomcount ? `객실 수: ${intro.roomcount}` : "",
    intro.taketime ? `소요 시간: ${intro.taketime}` : ""
  );
  const restDate = firstAvailable(
    intro.restdate,
    intro.restdateculture,
    intro.restdatefood,
    intro.restdateleports,
    intro.restdateshopping
  );
  const tel = firstAvailable(
    common.tel,
    intro.infocenter,
    intro.infocenterculture,
    intro.infocenterfood,
    intro.infocenterlodging,
    intro.infocenterleports,
    intro.infocentershopping,
    intro.sponsor1tel,
    intro.sponsor2tel
  );

  return {
    contentId: String(contentId),
    contentTypeId: String(contentTypeId),
    title: stripTags(common.title),
    category: contentTypeLabel(common.contenttypeid),
    address,
    region: address || "제주",
    tel,
    image: firstImage(common.firstimage, common.firstimage2, images[0]?.originimgurl, images[0]?.smallimageurl),
    images: images
      .map((image) => firstImage(image.originimgurl, image.smallimageurl))
      .filter(Boolean)
      .slice(0, 6),
    overview: stripTags(common.overview),
    homepage: common.homepage || "",
    mapx: common.mapx || "",
    mapy: common.mapy || "",
    zipcode: common.zipcode || "",
    operatingHours,
    parking,
    fee,
    restDate,
    checkPoint: firstAvailable(
      intro.chkbabycarriage,
      intro.chkpet,
      intro.chkcreditcard,
      intro.expguide,
      intro.treatmenu,
      intro.subfacility,
      intro.infocenter
    )
  };
}

async function handleList(requestUrl, serviceKey) {
  const category = requestUrl.searchParams.get("category") || "전체";
  const keyword = stripTags(requestUrl.searchParams.get("keyword") || "");
  const pageNo = requestUrl.searchParams.get("page") || "1";
  const config = CATEGORY_REQUESTS[category] || CATEGORY_REQUESTS["전체"];
  const params = {
    numOfRows: "100",
    pageNo
  };

  if (config.contentTypeId) params.contentTypeId = config.contentTypeId;
  if (keyword) {
    params.keyword = keyword;
  } else if (config.keyword) {
    params.keyword = config.keyword;
  }

  const body = await fetchTourWithFallback(config.endpoint, params, serviceKey);
  const items = asItems(body)
    .filter(isJejuItem)
    .filter((item) => !config.allowedTypes || config.allowedTypes.includes(String(item.contenttypeid || "")))
    .map(normalizeListItem)
    .filter((item) => item.contentId && item.title)
    .slice(0, 24);

  return json({
    ok: true,
    source: "한국관광공사",
    category,
    keyword,
    totalCount: items.length,
    pageNo: Number(body.pageNo || pageNo),
    items,
    updatedAt: new Date().toISOString()
  });
}

async function handleDetail(requestUrl, serviceKey) {
  const contentId = requestUrl.searchParams.get("id") || requestUrl.searchParams.get("contentId");
  const contentTypeId = requestUrl.searchParams.get("contentTypeId") || "";

  if (!contentId) {
    return json({ ok: false, error: "contentId가 필요합니다." }, { status: 400, cacheControl: "no-store" });
  }

  const commonBody = await fetchTourWithFallback("detailCommon2", {
    contentId,
    contentTypeId,
    defaultYN: "Y",
    firstImageYN: "Y",
    areacodeYN: "Y",
    catcodeYN: "Y",
    addrinfoYN: "Y",
    mapinfoYN: "Y",
    overviewYN: "Y"
  }, serviceKey);

  const introPromise = contentTypeId
    ? fetchTourWithFallback("detailIntro2", { contentId, contentTypeId }, serviceKey)
    : Promise.resolve({});
  const imagePromise = fetchTourWithFallback("detailImage2", {
    contentId,
    imageYN: "Y",
    subImageYN: "Y",
    numOfRows: "10",
    pageNo: "1"
  }, serviceKey);

  const [introBody, imageBody] = await Promise.all([
    introPromise.catch(() => ({})),
    imagePromise.catch(() => ({}))
  ]);
  const common = asItems(commonBody)[0] || {};
  const intro = asItems(introBody)[0] || {};
  const images = asItems(imageBody);

  if (!common.contentid && !common.contentId && !common.title) {
    return json({ ok: false, error: "관광정보를 찾지 못했습니다." }, { status: 404, cacheControl: "no-store" });
  }

  return json({
    ok: true,
    source: "한국관광공사",
    item: normalizeDetail(common, intro, images),
    updatedAt: new Date().toISOString()
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "content-type"
    }
  });
}

export async function onRequestGet(context) {
  const serviceKey = getServiceKey(context.env || {});

  if (!serviceKey) {
    return json({
      ok: false,
      error: "Cloudflare 환경변수에 KTO_TOUR_API_KEY가 없습니다."
    }, { status: 503, cacheControl: "no-store" });
  }

  try {
    const requestUrl = new URL(context.request.url);
    if (requestUrl.searchParams.has("id") || requestUrl.searchParams.has("contentId")) {
      return await handleDetail(requestUrl, serviceKey);
    }
    return await handleList(requestUrl, serviceKey);
  } catch (error) {
    return json({
      ok: false,
      error: error instanceof Error ? error.message : "관광정보를 불러오지 못했습니다."
    }, { status: 502, cacheControl: "no-store" });
  }
}

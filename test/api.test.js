import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { onRequestPost as adminPost } from "../functions/api/admin-posts.js";
import { onRequestGet as beachesGet } from "../functions/api/beaches.js";
import { onRequestGet as beachWeatherGet } from "../functions/api/beach-weather.js";
import { onRequestGet as jejuGet } from "../functions/api/jeju.js";
import { onRequestGet as myrealtripGet } from "../functions/api/myrealtrip.js";
import { onRequestGet as myrealtripLinkGet } from "../functions/api/myrealtrip-link.js";
import { onRequestPost as accommodationPost } from "../functions/api/myrealtrip-accommodation.js";
import { onRequestPost as flightPost } from "../functions/api/myrealtrip-flight.js";
import { onRequestPost as tnaPost } from "../functions/api/myrealtrip-tna.js";
import { articles } from "../jeju-travel-news/assets/articles.js";
import { curateArticles } from "../jeju-travel-news/assets/editorial.js";

function context(url, env = {}, init = {}) {
  const requestInit = {
    method: init.method || "GET",
    headers: init.headers || {}
  };
  if (init.body !== undefined) requestInit.body = init.body;
  return { request: new Request(url, requestInit), env };
}

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" }
  });
}

async function responseJson(response) {
  return response.json();
}

async function withMockFetch(mock, callback) {
  const previous = globalThis.fetch;
  globalThis.fetch = mock;
  try {
    return await callback();
  } finally {
    globalThis.fetch = previous;
  }
}

function mofPayload(item = {}) {
  return {
    getOceansBeachInfo: {
      header: { code: "00", message: "NORMAL_SERVICE" },
      totalCount: "1",
      item
    }
  };
}

function kmaPayload(items) {
  return {
    response: {
      header: { resultCode: "00", resultMsg: "NORMAL_SERVICE" },
      body: { items: { item: items } }
    }
  };
}

function kmaForecastItems() {
  return [
    { beachNum: "346", fcstDate: "20991231", fcstTime: "1200", category: "T1H", fcstValue: "27" },
    { beachNum: "346", fcstDate: "20991231", fcstTime: "1200", category: "PTY", fcstValue: "0" },
    { beachNum: "346", fcstDate: "20991231", fcstTime: "1200", category: "SKY", fcstValue: "3" },
    { beachNum: "346", fcstDate: "20991231", fcstTime: "1200", category: "RN1", fcstValue: "강수없음" },
    { beachNum: "346", fcstDate: "20991231", fcstTime: "1200", category: "REH", fcstValue: "70" },
    { beachNum: "346", fcstDate: "20991231", fcstTime: "1200", category: "WSD", fcstValue: "2.4" }
  ];
}

test("해수욕장 정보 API는 인증키 없이 외부 호출을 하지 않는다", async () => {
  let calls = 0;
  const response = await withMockFetch(async () => {
    calls += 1;
    return jsonResponse({});
  }, () => beachesGet(context("https://site.test/api/beaches", {})));

  assert.equal(response.status, 503);
  assert.equal((await responseJson(response)).configured, false);
  assert.equal(calls, 0);
});

test("해수욕장 정보 API는 지역·페이지 경계를 제한하고 날씨 지점을 매핑한다", async () => {
  let requestedUrl;
  const response = await withMockFetch(async (url) => {
    requestedUrl = new URL(url);
    return jsonResponse(mofPayload({
      num: "11",
      sido_nm: "제주",
      gugun_nm: "제주시",
      sta_nm: "협재",
      beach_wid: "40",
      beach_len: "500",
      beach_knd: "모래",
      link_tel: "064-000-0000",
      link_addr: "http://example.com/beach",
      beach_img: "http://images.example.com/hyeopjae.jpg",
      lat: "33.394",
      lon: "126.239"
    }));
  }, () => beachesGet(context("https://site.test/api/beaches?sido=%EC%A0%9C%EC%A3%BC&page=999&rows=999", { OCEANS_BEACH_API_KEY: "test-key" })));

  const payload = await responseJson(response);
  assert.equal(response.status, 200);
  assert.equal(payload.items[0].weatherCode, "346");
  assert.equal(payload.items[0].image, "https://images.example.com/hyeopjae.jpg");
  assert.equal(requestedUrl.searchParams.get("pageNo"), "10");
  assert.equal(requestedUrl.searchParams.get("numOfRows"), "30");
  assert.equal(requestedUrl.searchParams.get("SIDO_NM"), "제주");
});

test("해수욕장 정보 API는 잘못된 지역과 비정상 응답을 처리한다", async (t) => {
  await t.test("잘못된 지역", async () => {
    let calls = 0;
    const response = await withMockFetch(async () => {
      calls += 1;
      return jsonResponse({});
    }, () => beachesGet(context("https://site.test/api/beaches?sido=%EB%B6%80%EC%82%B0", { OCEANS_BEACH_API_KEY: "test-key" })));
    assert.equal(response.status, 400);
    assert.equal(calls, 0);
  });

  await t.test("JSON이 아닌 upstream 응답", async () => {
    const response = await withMockFetch(async () => new Response("upstream failed", { status: 200 }), () => beachesGet(context("https://site.test/api/beaches", { OCEANS_BEACH_API_KEY: "test-key" })));
    assert.equal(response.status, 502);
    assert.match((await responseJson(response)).error, /해석하지 못했습니다/);
  });

  await t.test("upstream 오류 코드", async () => {
    const response = await withMockFetch(async () => jsonResponse({ getOceansBeachInfo: { header: { code: "99", message: "NO_DATA" } } }), () => beachesGet(context("https://site.test/api/beaches", { OCEANS_BEACH_API_KEY: "test-key" })));
    assert.equal(response.status, 502);
    assert.match((await responseJson(response)).error, /NO_DATA/);
  });
});

test("해수욕장 날씨 API는 지점 허용 목록과 인증키를 검증한다", async (t) => {
  await t.test("인증키 없음", async () => {
    const response = await beachWeatherGet(context("https://site.test/api/beach-weather?beach_num=346"));
    assert.equal(response.status, 503);
  });

  await t.test("허용되지 않은 지점", async () => {
    let calls = 0;
    const response = await withMockFetch(async () => {
      calls += 1;
      return jsonResponse({});
    }, () => beachWeatherGet(context("https://site.test/api/beach-weather?beach_num=999", { KMA_BEACH_API_KEY: "test-key" })));
    assert.equal(response.status, 400);
    assert.equal(calls, 0);
  });
});

test("해수욕장 날씨 API는 예보·파고·수온·일출·조석을 mock 응답으로 통합한다", async () => {
  const calls = [];
  const response = await withMockFetch(async (url) => {
    const operation = new URL(url).pathname.split("/").at(-1);
    calls.push(operation);
    if (operation === "getUltraSrtFcstBeach") return jsonResponse(kmaPayload(kmaForecastItems()));
    if (operation === "getWhBuoyBeach") return jsonResponse(kmaPayload([{ wh: "0.7", tm: "209912311200" }]));
    if (operation === "getTwBuoyBeach") return jsonResponse(kmaPayload([{ tw: "22.4", tm: "209912311200" }]));
    if (operation === "getSunInfoBeach") return jsonResponse(kmaPayload([{ sunrise: "05:30", sunset: "19:45" }]));
    if (operation === "getTideInfoBeach") return jsonResponse(kmaPayload([{ tiType: "고조", tiTime: "12:00", tilevel: "320" }]));
    return jsonResponse({}, 404);
  }, () => beachWeatherGet(context("https://site.test/api/beach-weather?beach_num=346", { KMA_BEACH_API_KEY: "test-key" })));

  const payload = await responseJson(response);
  assert.equal(response.status, 200);
  assert.equal(payload.ok, true);
  assert.equal(payload.beachName, "협재");
  assert.equal(payload.forecast.temperature, 27);
  assert.equal(payload.forecast.label, "구름 많음");
  assert.equal(payload.wave.value, "0.7");
  assert.equal(payload.waterTemperature.value, "22.4");
  assert.deepEqual(payload.sun, { sunrise: "05:30", sunset: "19:45" });
  assert.equal(payload.tides[0].type, "고조");
  assert.ok(calls.includes("getUltraSrtFcstBeach"));
});

test("해수욕장 날씨 API는 선택 관측값이 실패해도 예보를 반환한다", async () => {
  const response = await withMockFetch(async (url) => {
    const operation = new URL(url).pathname.split("/").at(-1);
    if (operation === "getUltraSrtFcstBeach") return jsonResponse(kmaPayload(kmaForecastItems()));
    return jsonResponse({ response: { header: { resultCode: "03", resultMsg: "NO_DATA" } } });
  }, () => beachWeatherGet(context("https://site.test/api/beach-weather?beach_num=342", { KMA_BEACH_API_KEY: "test-key" })));

  const payload = await responseJson(response);
  assert.equal(response.status, 200);
  assert.equal(payload.ok, true);
  assert.equal(payload.forecast.temperature, 27);
  assert.equal(payload.wave, null);
  assert.equal(payload.waterTemperature, null);
});

test("해수욕장 날씨 API는 모든 예보 응답이 깨지면 502를 반환한다", async () => {
  const response = await withMockFetch(async () => new Response("not-json", { status: 200 }), () => beachWeatherGet(context("https://site.test/api/beach-weather?beach_num=346", { KMA_BEACH_API_KEY: "test-key" })));
  assert.equal(response.status, 502);
  assert.match((await responseJson(response)).error, /날씨 정보/);
});

test("한국관광공사 API는 제주 목록만 남기고 이미지를 HTTPS로 정규화한다", async () => {
  const response = await withMockFetch(async () => jsonResponse({
    response: {
      header: { resultCode: "0000", resultMsg: "OK" },
      body: {
        pageNo: "1",
        items: {
          item: [
            { contentid: "1", contenttypeid: "12", title: "협재해수욕장", addr1: "제주 제주시", firstimage: "http://images.example.com/beach.jpg" },
            { contentid: "2", contenttypeid: "12", title: "서울 해변", addr1: "서울 중구", firstimage: "http://images.example.com/seoul.jpg" }
          ]
        }
      }
    }
  }), () => jejuGet(context("https://site.test/api/jeju?keyword=%ED%98%91%EC%9E%AC&category=%ED%95%B4%EB%B3%80", { KTO_TOUR_API_KEY: "test-key" })));

  const payload = await responseJson(response);
  assert.equal(response.status, 200);
  assert.equal(payload.items.length, 1);
  assert.equal(payload.items[0].title, "협재해수욕장");
  assert.equal(payload.items[0].image, "https://images.example.com/beach.jpg");
});

test("한국관광공사 API는 키 누락·contentId 누락·upstream 오류를 처리한다", async (t) => {
  await t.test("키 누락", async () => {
    const response = await jejuGet(context("https://site.test/api/jeju?keyword=%ED%98%91%EC%9E%AC"));
    assert.equal(response.status, 503);
  });

  await t.test("상세 contentId 누락", async () => {
    const response = await jejuGet(context("https://site.test/api/jeju?id=", { KTO_TOUR_API_KEY: "test-key" }));
    assert.equal(response.status, 400);
  });

  await t.test("upstream JSON 오류", async () => {
    const response = await withMockFetch(async () => new Response("bad-json", { status: 200 }), () => jejuGet(context("https://site.test/api/jeju?keyword=%ED%98%91%EC%9E%AC", { KTO_TOUR_API_KEY: "test-key" })));
    assert.equal(response.status, 502);
  });
});

test("항공권 프록시는 정상 응답을 정규화하고 입력 경계를 적용한다", async (t) => {
  await t.test("공항 자동완성", async () => {
    let request;
    const response = await withMockFetch(async (url, options) => {
      request = { url: new URL(url), options };
      return jsonResponse({ airports: [{ airportCode: "cju", airportName: "제주국제공항", cityName: "제주" }] });
    }, () => flightPost(context("https://site.test/api/myrealtrip-flight?action=airport-autocomplete", {
      MYREALTRIP_FLIGHT_API_BASE: "https://flight.test",
      MYREALTRIP_API_KEY: "test-key"
    }, { method: "POST", body: JSON.stringify({ keyword: "제주" }) })));
    const payload = await responseJson(response);
    assert.equal(response.status, 200);
    assert.equal(payload.items[0].code, "CJU");
    assert.equal(request.url.pathname, "/v1/products/flight/airport-autocomplete");
    assert.equal(request.options.headers.get("authorization"), "Bearer test-key");
  });

  await t.test("지원하지 않는 action", async () => {
    let calls = 0;
    const response = await withMockFetch(async () => {
      calls += 1;
      return jsonResponse({});
    }, () => flightPost(context("https://site.test/api/myrealtrip-flight?action=unknown", {} , { method: "POST", body: "{}" })));
    assert.equal(response.status, 400);
    assert.equal(calls, 0);
  });

  await t.test("본문 크기 초과", async () => {
    const response = await flightPost(context("https://site.test/api/myrealtrip-flight?action=airport-autocomplete", {}, { method: "POST", body: "x".repeat(32769) }));
    assert.equal(response.status, 413);
  });
});

test("숙소 프록시는 지역 자동완성 응답을 정규화한다", async () => {
  const response = await withMockFetch(async () => jsonResponse({ regions: [{ id: "jeju", name: "제주", country: "대한민국" }] }), () => accommodationPost(context("https://site.test/api/myrealtrip-accommodation?action=region-autocomplete", {
    MYREALTRIP_ACCOMMODATION_API_BASE: "https://stay.test",
    MYREALTRIP_API_KEY: "test-key"
  }, { method: "POST", body: JSON.stringify({ keyword: "제주" }) })));
  const payload = await responseJson(response);
  assert.equal(response.status, 200);
  assert.deepEqual(payload.items[0], { regionId: "jeju", name: "제주", country: "대한민국", label: "대한민국 제주" });
});

test("마이리얼트립 상품은 기사 장소·카테고리와 일치할 때만 노출한다", async (t) => {
  const mcpItems = [
    {
      title: "[서귀포] 프라이빗 스노클링 체험",
      category: "해양 액티비티",
      image: "https://images.test/snorkeling.jpg",
      url: "https://experiences.myrealtrip.com/products/sea"
    },
    {
      title: "[제주시] 동문시장 야시장 미식 투어",
      category: "푸드 투어",
      image: "https://images.test/food.jpg",
      url: "https://experiences.myrealtrip.com/products/food"
    }
  ];

  await t.test("관련 상품만 점수순으로 반환", async () => {
    const response = await withMockFetch(async () => jsonResponse({
      result: { content: [{ type: "text", text: JSON.stringify({ items: mcpItems }) }] }
    }), () => myrealtripGet(context("https://site.test/api/myrealtrip?keyword=%EC%A0%9C%EC%A3%BC+%EB%8F%99%EB%AC%B8%EC%8B%9C%EC%9E%A5+%EB%A7%9B%EC%A7%91&scope=article&title=%EB%8F%99%EB%AC%B8%EC%8B%9C%EC%9E%A5+%EC%A0%80%EB%85%81+%EB%A8%B9%EA%B1%B0%EB%A6%AC&spot=%EB%8F%99%EB%AC%B8%EC%8B%9C%EC%9E%A5&category=%EB%A7%9B%EC%A7%91&region=%EC%A0%9C%EC%A3%BC%EC%8B%9C", {
      MYREALTRIP_MCP_URL: "https://mcp.test/mcp"
    })));
    const payload = await responseJson(response);
    assert.equal(response.status, 200);
    assert.equal(payload.matched, true);
    assert.deepEqual(payload.items.map((item) => item.title), ["[제주시] 동문시장 야시장 미식 투어"]);
  });

  await t.test("관련 상품이 없으면 제휴 링크를 억지로 대체하지 않음", async () => {
    const response = await withMockFetch(async () => jsonResponse({
      result: { content: [{ type: "text", text: JSON.stringify({ items: [mcpItems[0]] }) }] }
    }), () => myrealtripGet(context("https://site.test/api/myrealtrip?keyword=%EC%A0%9C%EC%A3%BC+%EB%8F%99%EB%AC%B8%EC%8B%9C%EC%9E%A5+%EB%A7%9B%EC%A7%91&scope=article&title=%EB%8F%99%EB%AC%B8%EC%8B%9C%EC%9E%A5&spot=%EB%8F%99%EB%AC%B8%EC%8B%9C%EC%9E%A5&category=%EB%A7%9B%EC%A7%91&region=%EC%A0%9C%EC%A3%BC%EC%8B%9C", {
      MYREALTRIP_MCP_URL: "https://mcp.test/mcp",
      MYREALTRIP_AFFILIATE_URL: "https://affiliate.test/jeju"
    })));
    const payload = await responseJson(response);
    assert.equal(response.status, 200);
    assert.equal(payload.matched, false);
    assert.deepEqual(payload.items, []);
  });

  await t.test("구조화 상품에 링크가 없으면 MCP 위젯 링크와 이미지를 결합", async () => {
    const structuredItem = {
      title: "성산일출봉 바다 카약",
      category: "해양 체험"
    };
    const widget = {
      children: [{
        type: "ListViewItem",
        onClickAction: { url: "https://experiences.myrealtrip.com/products/seongsan-kayak" },
        children: [
          { type: "Image", src: "https://images.test/seongsan-kayak.jpg" },
          { type: "Text", value: structuredItem.title },
          { type: "Text", value: "25,000원~" }
        ]
      }]
    };
    const response = await withMockFetch(async () => jsonResponse({
      result: {
        structuredContent: { items: [structuredItem] },
        content: [{ type: "text", text: JSON.stringify({ widget }) }]
      }
    }), () => myrealtripGet(context("https://site.test/api/myrealtrip?keyword=%EC%A0%9C%EC%A3%BC+%EC%84%B1%EC%82%B0%EC%9D%BC%EC%B6%9C%EB%B4%89&scope=article&title=%EC%84%B1%EC%82%B0%EC%9D%BC%EC%B6%9C%EB%B4%89+%EC%9D%BC%EC%B6%9C+%EC%97%AC%ED%96%89&spot=%EC%84%B1%EC%82%B0%EC%9D%BC%EC%B6%9C%EB%B4%89&category=%ED%95%B4%EB%B3%80&region=%EC%A0%9C%EC%A3%BC+%EB%8F%99%EB%B6%80+%EC%84%B1%EC%82%B0", {
      MYREALTRIP_MCP_URL: "https://mcp.test/mcp"
    })));
    const payload = await responseJson(response);
    assert.equal(payload.items.length, 1);
    assert.equal(payload.items[0].url, "https://experiences.myrealtrip.com/products/seongsan-kayak");
    assert.equal(payload.items[0].image, "https://images.test/seongsan-kayak.jpg");
  });

  await t.test("API 키가 있으면 상품 링크를 서버 마이링크 경유 주소로 변환", async () => {
    const response = await withMockFetch(async () => jsonResponse({
      result: { content: [{ type: "text", text: JSON.stringify({ items: [mcpItems[1]] }) }] }
    }), () => myrealtripGet(context("https://site.test/api/myrealtrip?keyword=%EC%A0%9C%EC%A3%BC+%EB%8F%99%EB%AC%B8%EC%8B%9C%EC%9E%A5+%EB%A7%9B%EC%A7%91&scope=article&title=%EB%8F%99%EB%AC%B8%EC%8B%9C%EC%9E%A5+%EC%A0%80%EB%85%81+%EB%A8%B9%EA%B1%B0%EB%A6%AC&spot=%EB%8F%99%EB%AC%B8%EC%8B%9C%EC%9E%A5&category=%EB%A7%9B%EC%A7%91&region=%EC%A0%9C%EC%A3%BC%EC%8B%9C", {
      MYREALTRIP_MCP_URL: "https://mcp.test/mcp",
      MYREALTRIP_API_KEY: "test-key"
    })));
    const payload = await responseJson(response);
    const linkedUrl = new URL(payload.items[0].url);
    assert.equal(linkedUrl.origin, "https://site.test");
    assert.equal(linkedUrl.pathname, "/api/myrealtrip-link");
    assert.equal(linkedUrl.searchParams.get("target"), mcpItems[1].url);
  });
});

test("마이리얼트립 마이링크 리디렉터는 입력과 장애를 안전하게 처리한다", async (t) => {
  await t.test("빈 값과 외부 도메인을 거부", async () => {
    let calls = 0;
    await withMockFetch(async () => {
      calls += 1;
      return jsonResponse({});
    }, async () => {
      const empty = await myrealtripLinkGet(context("https://site.test/api/myrealtrip-link"));
      const external = await myrealtripLinkGet(context("https://site.test/api/myrealtrip-link?target=https%3A%2F%2Fevil.test%2Foffer"));
      assert.equal(empty.status, 400);
      assert.equal(external.status, 400);
    });
    assert.equal(calls, 0);
  });

  await t.test("API 키가 없으면 검증된 원본 상품으로 이동", async () => {
    const target = "https://experiences.myrealtrip.com/products/jeju-tour";
    const response = await myrealtripLinkGet(context(`https://site.test/api/myrealtrip-link?target=${encodeURIComponent(target)}`));
    assert.equal(response.status, 302);
    assert.equal(response.headers.get("location"), target);
    assert.equal(response.headers.get("x-affiliate-tracking"), "fallback");
    assert.equal(response.headers.get("cache-control"), "no-store");
  });

  await t.test("공식 API 응답의 마이링크로 이동", async () => {
    const target = "https://experiences.myrealtrip.com/products/jeju-tour?date=2026-08-10";
    let request;
    const response = await withMockFetch(async (url, options) => {
      request = { url, options };
      return jsonResponse({ mylink: "https://affiliate.example/mylink/123", mylinkId: 123 });
    }, () => myrealtripLinkGet(context(`https://site.test/api/myrealtrip-link?target=${encodeURIComponent(target)}`, {
      MYREALTRIP_API_KEY: "test-key",
      MYREALTRIP_MYLINK_API_URL: "https://partner.test/v1/mylink"
    })));

    assert.equal(request.url, "https://partner.test/v1/mylink");
    assert.equal(request.options.headers.authorization, "Bearer test-key");
    assert.deepEqual(JSON.parse(request.options.body), { targetUrl: target });
    assert.equal(response.status, 302);
    assert.equal(response.headers.get("location"), "https://affiliate.example/mylink/123");
    assert.equal(response.headers.get("x-affiliate-tracking"), "mylink");
    assert.match(response.headers.get("cache-control"), /s-maxage=86400/);
  });

  await t.test("제휴 API 오류면 원본 상품 링크로 복구", async () => {
    const target = "https://www.myrealtrip.com/offers/123";
    const response = await withMockFetch(async () => jsonResponse({ message: "temporary error" }, 503), () => (
      myrealtripLinkGet(context(`https://site.test/api/myrealtrip-link?target=${encodeURIComponent(target)}`, {
        MYREALTRIP_API_KEY: "test-key",
        MYREALTRIP_MYLINK_API_URL: "https://partner.test/v1/mylink"
      }))
    ));
    assert.equal(response.status, 302);
    assert.equal(response.headers.get("location"), target);
    assert.equal(response.headers.get("x-affiliate-tracking"), "fallback");
  });
});

test("숙소 상품은 기본 날짜를 적용하고 기사 지역과 맞는 결과만 반환한다", async () => {
  let requestBody;
  const stayItems = [
    {
      gid: 1,
      name: "더 베스트 제주 성산",
      description: "4성급 · 호텔 · 성산 · 서귀포",
      price: "81,000원/박",
      rating: 4.2,
      thumbnailUrl: "https://images.test/seongsan.jpg"
    },
    {
      gid: 2,
      name: "중문 리조트",
      description: "5성급 · 리조트 · 중문 · 서귀포",
      price: "300,000원/박",
      rating: 4.7,
      thumbnailUrl: "https://images.test/jungmun.jpg"
    }
  ];
  const widget = {
    children: stayItems.map((item) => ({
      type: "ListViewItem",
      onClickAction: { url: `https://accommodation.myrealtrip.com/union/products/${item.gid}` },
      children: [
        { type: "Image", src: item.thumbnailUrl },
        { type: "Text", value: item.name },
        { type: "Text", value: item.price }
      ]
    }))
  };

  const response = await withMockFetch(async (url, options) => {
    requestBody = JSON.parse(options.body);
    return jsonResponse({
      result: {
        structuredContent: { stays: stayItems },
        content: [{ type: "text", text: JSON.stringify({ widget }) }]
      }
    });
  }, () => accommodationPost(context("https://site.test/api/myrealtrip-accommodation?action=search", {
    MYREALTRIP_MCP_URL: "https://mcp.test/mcp"
  }, {
    method: "POST",
    body: JSON.stringify({
      keyword: "성산",
      title: "성산일출봉 일출 여행 코스",
      spot: "성산일출봉",
      region: "제주 동부 · 성산",
      category: "숙소",
      scope: "article",
      limit: 4
    })
  })));

  const payload = await responseJson(response);
  const args = requestBody.params.arguments;
  assert.match(args.checkIn, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(args.checkOut, /^\d{4}-\d{2}-\d{2}$/);
  assert.notEqual(args.checkIn, args.checkOut);
  assert.equal(payload.matched, true);
  assert.equal(payload.items.length, 1);
  assert.equal(payload.items[0].title, "더 베스트 제주 성산");
  assert.equal(payload.items[0].url, "https://accommodation.myrealtrip.com/union/products/1");
  assert.deepEqual(payload.searchDates, { checkIn: args.checkIn, checkOut: args.checkOut });
});

test("숙소 상품은 기사 세부 권역과 검색 키워드가 함께 맞는 결과를 우선한다", async () => {
  let requestBody;
  const stayItems = [
    {
      gid: 1,
      name: "조천 해변 호텔",
      description: "4성급 · 호텔 · 조천 · 제주시",
      price: "95,000원/박",
      thumbnailUrl: "https://images.test/jocheon.jpg"
    },
    {
      gid: 2,
      name: "호텔 휘슬락 제주",
      description: "4성급 · 호텔 · 제주 시내 · 제주시",
      price: "105,000원/박",
      thumbnailUrl: "https://images.test/jeju-city.jpg"
    }
  ];
  const widget = {
    children: stayItems.map((item) => ({
      type: "ListViewItem",
      onClickAction: { url: `https://accommodation.myrealtrip.com/union/products/${item.gid}` },
      children: [
        { type: "Image", src: item.thumbnailUrl },
        { type: "Text", value: item.name },
        { type: "Text", value: item.price }
      ]
    }))
  };

  const response = await withMockFetch(async (url, options) => {
    requestBody = JSON.parse(options.body);
    return jsonResponse({
      result: {
        structuredContent: { stays: stayItems },
        content: [{ type: "text", text: JSON.stringify({ widget }) }]
      }
    });
  }, () => accommodationPost(context("https://site.test/api/myrealtrip-accommodation?action=search", {
    MYREALTRIP_MCP_URL: "https://mcp.test/mcp"
  }, {
    method: "POST",
    body: JSON.stringify({
      keyword: "제주 시내",
      title: "동문시장 저녁 먹거리 동선",
      spot: "동문시장",
      region: "제주시 · 원도심",
      scope: "article",
      limit: 1
    })
  })));

  const payload = await responseJson(response);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(requestBody.params.arguments.keyword, "제주 시내");
  assert.equal(requestBody.params.arguments.size, 12);
  assert.equal(payload.items.length, 1);
  assert.equal(payload.items[0].title, "호텔 휘슬락 제주");
});

test("투어티켓 MCP 프록시는 정상 카테고리와 잘못된 action을 처리한다", async (t) => {
  await t.test("카테고리 mock", async () => {
    let requestBody;
    const response = await withMockFetch(async (url, options) => {
      requestBody = JSON.parse(options.body);
      return jsonResponse({ result: { content: [{ type: "text", text: JSON.stringify({ categories: [{ value: "activity", label: "액티비티" }] }) }] } });
    }, () => tnaPost(context("https://site.test/api/myrealtrip-tna?action=categories", { MYREALTRIP_MCP_URL: "https://mcp.test/mcp" }, { method: "POST", body: JSON.stringify({ city: "제주" }) })));
    const payload = await responseJson(response);
    assert.equal(response.status, 200);
    assert.equal(payload.mcp, true);
    assert.equal(payload.items[0].value, "activity");
    assert.equal(requestBody.params.name, "getCategoryList");
  });

  await t.test("잘못된 action", async () => {
    const response = await tnaPost(context("https://site.test/api/myrealtrip-tna?action=invalid", { MYREALTRIP_MCP_URL: "https://mcp.test/mcp" }, { method: "POST", body: "{}" }));
    assert.equal(response.status, 400);
  });
});

test("관리자 저장 API는 인증과 payload 검증을 먼저 수행한다", async (t) => {
  await t.test("관리자 설정 누락", async () => {
    const response = await adminPost(context("https://site.test/api/admin-posts", {}, { method: "POST", body: "{}" }));
    assert.equal(response.status, 501);
  });

  await t.test("토큰 불일치", async () => {
    const response = await adminPost(context("https://site.test/api/admin-posts", { ADMIN_TOKEN: "correct", GITHUB_TOKEN: "github" }, {
      method: "POST",
      headers: { authorization: "Bearer wrong" },
      body: "{}"
    }));
    assert.equal(response.status, 401);
  });

  await t.test("유효 payload는 GitHub 요청을 mock으로 저장", async () => {
    const calls = [];
    const response = await withMockFetch(async (url, options) => {
      calls.push({ url, options });
      if (options.method === "PUT") return jsonResponse({ commit: { sha: "new-sha" } });
      return jsonResponse({ sha: "old-sha" });
    }, () => adminPost(context("https://site.test/api/admin-posts", {
      ADMIN_TOKEN: "correct",
      GITHUB_TOKEN: "github"
    }, {
      method: "POST",
      headers: { authorization: "Bearer correct" },
      body: JSON.stringify({
        categories: ["해변"],
        articles: [
          { title: "협재 안내", slug: "hyeopjae", status: "published", content: ["본문"] },
          { title: "중복 글", slug: "hyeopjae", status: "published" },
          { title: "제목만", slug: "" }
        ]
      })
    })));
    const payload = await responseJson(response);
    assert.equal(response.status, 200);
    assert.equal(payload.commit, "new-sha");
    assert.equal(calls.length, 2);
    const putBody = JSON.parse(calls[1].options.body);
    const source = Buffer.from(putBody.content, "base64").toString("utf8");
    assert.equal((source.match(/"slug": "hyeopjae"/g) || []).length, 1);
  });
});

test("메인 진입점은 해변 정보와 정적 기사 링크를 제공하고 미완성 예약 폼을 노출하지 않는다", async () => {
  const rootHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(rootHtml, /id="beachInfo"/);
  assert.match(rootHtml, /assets\/app\.js\?v=/);
  assert.match(rootHtml, /\/articles\/seongsan-sunrise-course\//);
  assert.doesNotMatch(rootHtml, /API 연결 전/);
  assert.doesNotMatch(rootHtml, /PartnersCoupang/);
});

test("글 생성 워크플로는 자동 예약 없이 수동 실행만 허용한다", async () => {
  const [workflow, generator] = await Promise.all([
    readFile(new URL("../.github/workflows/auto-jeju-post.yml", import.meta.url), "utf8"),
    readFile(new URL("../scripts/auto-jeju-post.mjs", import.meta.url), "utf8")
  ]);
  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /\bschedule:/);
  assert.doesNotMatch(workflow, /\bcron:/);
  assert.match(workflow, /group:\s*auto-jeju-post/);
  assert.match(workflow, /AUTO_POST_COUNT:\s*\$\{\{ github\.event\.inputs\.count \|\| '1' \}\}/);
  assert.match(workflow, /npm run build:content/);
  assert.match(generator, /const publishAt = new Date\(\)\.toISOString\(\)/);
  assert.match(generator, /status:\s*"draft"/);
  assert.match(generator, /Math\.min\(10, Math\.max\(1, Math\.trunc\(count\)\)\)/);
  assert.match(generator, /pubDate\(article\.publishAt \|\| article\.date \|\| date\)/);
});

test("공개 큐레이션은 검수된 고유 본문과 출처가 있는 글만 포함한다", () => {
  const curated = curateArticles(articles);
  assert.equal(curated.length, 32);
  assert.equal(new Set(curated.map((article) => article.slug)).size, curated.length);
  assert.equal(new Set(curated.map((article) => article.image)).size, curated.length);
  for (const article of curated) {
    assert.equal(article.status, "published");
    assert.ok(article.author);
    assert.match(article.reviewedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(article.sources.length >= 2);
    assert.ok(article.editorialSections.length >= 4);
    assert.ok(article.content.join("").replace(/\s/g, "").length >= 500, article.slug);
  }
});

test("정적 기사 페이지에는 검색 메타, 구조화 데이터, 작성자와 출처가 있다", async () => {
  const html = await readFile(new URL("../articles/seongsan-sunrise-course/index.html", import.meta.url), "utf8");
  assert.match(html, /rel="canonical" href="https:\/\/www\.moneyarchive\.kr\/articles\/seongsan-sunrise-course\/"/);
  assert.match(html, /type="application\/ld\+json"/);
  assert.match(html, /제주여행뉴스 편집팀/);
  assert.match(html, /자료 출처와 수정 요청/);
  assert.match(html, /한국관광공사/);
});

test("사이트맵은 검수된 정적 기사만 포함한다", async () => {
  const sitemap = await readFile(new URL("../sitemap.xml", import.meta.url), "utf8");
  const articleUrls = sitemap.match(/<loc>https:\/\/www\.moneyarchive\.kr\/articles\//g) || [];
  assert.equal(articleUrls.length, 32);
  assert.doesNotMatch(sitemap, /article\.html\?slug=/);
  assert.match(sitemap, /<loc>https:\/\/www\.moneyarchive\.kr\/about<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/www\.moneyarchive\.kr\/editorial-policy<\/loc>/);
});

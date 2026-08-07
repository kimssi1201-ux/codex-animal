import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { onRequestPost as adminPost } from "../functions/api/admin-posts.js";
import { onRequestGet as beachesGet } from "../functions/api/beaches.js";
import { onRequestGet as beachWeatherGet } from "../functions/api/beach-weather.js";
import { onRequestGet as jejuGet } from "../functions/api/jeju.js";
import { onRequestPost as accommodationPost } from "../functions/api/myrealtrip-accommodation.js";
import { onRequestPost as flightPost } from "../functions/api/myrealtrip-flight.js";
import { onRequestPost as tnaPost } from "../functions/api/myrealtrip-tna.js";

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

test("정적 진입점은 제주 페이지의 모듈·해변 섹션을 유지한다", async () => {
  const [rootHtml, nestedHtml] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../jeju-travel-news/index.html", import.meta.url), "utf8")
  ]);
  for (const html of [rootHtml, nestedHtml]) {
    assert.match(html, /id="beachInfo"/);
    assert.match(html, /assets\/app\.js\?v=/);
    assert.match(html, /assets\/styles\.css\?v=/);
  }
});

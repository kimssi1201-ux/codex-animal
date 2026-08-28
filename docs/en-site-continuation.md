# /en/ 영문 사이트 이어서 작업하기 (Codex용 인계 지시문)

이 문서는 `feature/en-site` 브랜치에서 Claude가 시작한 영문(`/en/`) 사이트
작업을 이어받아 완료하기 위한 지시문입니다. 아래 내용을 그대로 Codex에게
전달하면 됩니다.

## 배경과 현재 상태

- 브랜치: `feature/en-site` (origin/main에서 분기)
- 마지막 커밋: `9031175` ("Add 6 more English article translations (14/32 total)")
- 큐레이션된 한국어 글 32개 중 **14개**가 영문으로 번역·배포되어 있고,
  **18개**가 남아 있습니다.
- `npm run check` (build + test) 는 현재 커밋 기준으로 전부 통과합니다
  (54/54 테스트).
- 이 작업은 **기존 한국어 사이트를 절대 건드리지 않고** `/en/` 경로에
  영문 버전을 병용 추가하는 방식입니다. moneyarchive.kr은 실제 방문자와
  SEO가 있는 운영 중인 사이트이므로, 아래 "반드시 지킬 것"을 벗어나지
  마세요.

## 지금 할 일: 남은 18개 글 번역

`jeju-travel-news-en/assets/editorial-en.js`의 `translatedSlugs` 배열
끝에 있는 주석에 남은 18개 슬러그가 나열되어 있습니다:

```
yongmeori-coast-visit-check, jeongbang-waterfall-guide,
woljeongri-beach-cafe-walk, osulloc-west-jeju-course,
dongmun-market-evening-food-route,
samyang-beach-black-sand-walk-20260725, saryeoni-forest-road-check,
cheonjiyeon-night-walk-course, gimnyeong-beach-light-guide,
jeju-stone-park-rainy-day-course, soesokkak-hahyo-walk-guide,
geum-oreum-sunset-walk-guide, saebyeol-oreum-silvergrass-guide,
camellia-hill-season-guide, aqua-planet-jeju-family-guide,
lee-jung-seop-street-walk-guide, suwolbong-geotrail-guide,
songaksan-dulle-gil-guide
```

각 슬러그의 한국어 원문(`summary`, `editorialSections`)은
`jeju-travel-news/assets/editorial.js`와
`jeju-travel-news/assets/editorial-expansion.js`의 `editorialOverrides` /
`additionalEditorialOverrides` 객체에 있고, 구조적 필드(`title`, `region`,
`address`, `course`, `nearbySpots`, `parking`, `fee`, `operatingHours`,
`image`, `date`)는 `jeju-travel-news/assets/articles.js`의 `articles`
배열에서 슬러그로 찾으면 됩니다.

### 정확한 패턴 (이미 완료된 14개를 참고하세요)

`jeju-travel-news-en/assets/editorial-en.js`를 열어 이미 작성된 14개
항목(`seongsan-sunrise-course` ~ `bijarim-forest-walk-guide`)을 예시로
보고 **같은 모양**으로 나머지 18개를 추가하세요:

1. `translatedSlugs` 배열에 슬러그를 추가한다 (지금은 주석 처리되어
   있으니 주석을 지우고 실제 배열 항목으로 옮긴다).
2. `editorialOverridesEn` 객체에 슬러그를 키로 하는 항목을 추가한다.
   각 항목은 다음 필드를 가진다:
   - `title`, `category` (영문 라벨: 가볼 만한 곳→Places to Visit,
     맛집→Food, 카페→Cafes, 숙소→Stays, 해변→Beaches, 오름→Oreum
     Trails, 계절 코스→Seasonal Routes)
   - `region`, `address` (실제 로마자 표기 주소 — 외국인 관광객이
     택시·내비게이션에 쓸 수 있도록)
   - `parking`, `fee`, `operatingHours` (영문으로 자연스럽게 재작성)
   - `course[]`, `nearbySpots[]` (영문 지명)
   - `summary`
   - `editorialSections[]` — **기계적 직역이 아니라 실제 여행 정보 글로
     자연스럽게 재작성**. 원문의 실용적 조언(주차, 시간대, 날씨 대비,
     혼잡 회피, 대체 코스)을 그대로 살릴 것. 섹션 개수와 문단 수는
     원문과 비슷하게 맞추면 된다 (보통 섹션 4개, 섹션당 문단 1~2개).
   - `sources`: 원문이 `outdoorSources`를 쓰면 `outdoorSourcesEn`,
     `commonSources`를 쓰면 `commonSourcesEn`을 그대로 사용.
3. `curateArticlesEn()` 함수는 이미 있는 그대로 두면 됩니다 (수정 불필요).

### 검증

```
npm run check
```

이 명령이 통과해야 합니다. 특히:

- `test/en-site.test.js`가 모든 `translatedSlugs`에 대해 정적 페이지,
  hreflang, sitemap 항목을 검증합니다.
- `test/api.test.js`의 `공개 큐레이션은 검수된 고유 본문과 출처가 있는
  글만 포함한다` 테스트는 **한국어 큐레이션 32개** 를 검증하는 기존
  테스트이므로 절대 건드리지 마세요 (영문 작업과 무관합니다).

작업 후 `git diff --stat`로 변경 범위를 확인하세요. 예상되는 변경:
- `jeju-travel-news-en/assets/editorial-en.js` (번역 추가)
- `en/articles/<새 슬러그>/index.html` (새로 생성)
- `en/index.html`, `en/sitemap.xml`, `en/feed.xml` (재생성으로 갱신)
- `articles/<새로 번역된 슬러그>/index.html` (hreflang 태그 4줄 추가만
  — 그 외 내용은 절대 바뀌면 안 됨)

한국어 `editorial.js`, `editorial-expansion.js`, `articles.js`,
`index.html`의 본문 콘텐츠, `sitemap.xml`(루트), `feed.xml`(루트)은
**전혀 바뀌지 않아야** 합니다. 바뀐다면 무언가 잘못된 것입니다.

## 반드시 지킬 것 (원래 작업 지시에서 그대로 이어짐)

- 기존 한국어 콘텐츠·URL 구조를 절대 깨지 않는다.
- `admin/`은 번역하지 않는다 (운영자용, 한국어 유지).
- 쿠팡 관련 코드는 이 저장소에 없으므로 해당 없음.
- 마이리얼트립 연동은 백엔드(`functions/api/myrealtrip*.js`) 수정 없이
  프론트엔드 라벨만 영어로 유지한다 (`jeju-travel-news-en/assets/app.js`
  가 이미 이렇게 되어 있으니 그대로 재사용하면 됨).
- 커밋 전 반드시 `npm run check` 통과를 확인한다.
- 18개를 한 번에 다 하기보다, 6~8개씩 배치로 나눠 커밋하면 실수를
  줄이고 리뷰하기 쉽습니다 (지금까지의 방식과 동일).

## 완료 후

18개를 모두 마치면 `translatedSlugs`에 32개 전체가 들어가고 `en/`
아래에 32개 정적 페이지가 모두 생성됩니다. 그 시점에 이 문서
(`docs/en-site-continuation.md`)는 삭제해도 됩니다.

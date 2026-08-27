# 제주여행뉴스

제주 가볼 만한 곳, 해변, 오름, 맛집, 카페, 숙소 위치와 방문 전 체크 정보를 정리하는 Cloudflare Pages용 여행 매거진입니다.

## 구성

- `index.html` - 메인 SEO 구조와 시맨틱 섹션, 항공권·숙소·투어티켓 가격 비교 섹션
- `jeju-travel-news/assets/articles.js` - 원본 글 데이터
- `jeju-travel-news/assets/editorial.js` - 공개 글 큐레이션, 편집 본문과 출처
- `jeju-travel-news/assets/regions.js` - 기사 지역 텍스트를 제주시/서귀포/동/서/남/북 6개 권역으로 묶는 분류 규칙
- `jeju-travel-news/assets/app.js` - 콘텐츠 렌더링과 모바일 메뉴 동작
- `jeju-travel-news/assets/styles.css` - 반응형 매거진 레이아웃 스타일
- `articles/` - 빌드 시 생성되는 검색엔진용 정적 상세 페이지
- `region/` - 빌드 시 생성되는 지역별(제주시/서귀포/동/서/남/북) 랜딩 페이지
- `feed.xml`, `sitemap.xml`, `robots.txt`, `ads.txt`
- `jeju-travel-news/` - 제주여행뉴스 정적 페이지
- `functions/api/jeju.js` - 제주 관광정보 서버 함수
- `functions/api/beaches.js` - 해양수산부 제주 해수욕장 정보 서버 함수
- `functions/api/myrealtrip-flight.js`, `myrealtrip-accommodation.js`, `myrealtrip-tna.js` - 항공권·숙소·투어티켓 조회 서버 함수 (홈 화면의 가격 비교 섹션이 사용)
- `admin/` - 포스트 관리 화면
- `functions/api/admin-posts.js` - 관리자 GitHub 저장 함수

## Cloudflare Pages

- Framework preset: None
- Build command: 비워두기
- Build output directory: `/`

## 제주 관광정보 연결

Cloudflare Pages 환경변수에 한국관광공사 서비스 키를 저장합니다.

- 권장 변수명: `KTO_TOUR_API_KEY`
- 함께 지원하는 이름: `KTO_SERVICE_KEY`, `TOUR_API_KEY`, `SERVICE_KEY`

브라우저 JS에는 키를 넣지 않고, 제주 페이지는 `/api/jeju` 서버 함수만 호출합니다.

해수욕장 기본정보를 사용하려면 Cloudflare Pages 환경변수에 `OCEANS_BEACH_API_KEY`를 저장합니다. 인증키는 브라우저나 GitHub 저장소에 넣지 않고 `/api/beaches` 서버 함수에서만 사용합니다.

## 마이리얼트립 제휴 링크

Cloudflare Pages 비밀 변수 `MYREALTRIP_API_KEY`에 마케팅 파트너 API 키를 저장합니다. 상품 카드는 `/api/myrealtrip-link`를 거쳐 공식 `POST /v1/mylink` 응답으로 이동하며, 제휴 API가 실패하면 사용자가 상품을 계속 볼 수 있도록 검증된 원본 마이리얼트립 URL로 이동합니다.

API 키는 브라우저 코드, 저장소, `.env` 예제에 기록하지 않습니다. 별도의 링크 생성 주소를 발급받았다면 `MYREALTRIP_MYLINK_API_URL`로 지정할 수 있습니다.

## 관리자

`/admin/`에서 제주 여행 글을 검색, 편집, 예약 상태로 관리할 수 있습니다.
실제 GitHub 저장을 쓰려면 Cloudflare Pages 환경변수에 `ADMIN_TOKEN`과 `GITHUB_TOKEN`을 추가합니다.
자세한 내용은 `ADMIN.md`를 확인하세요.

## 글 발행

검수하지 않은 예약 발행은 사용하지 않습니다. `Auto Jeju Post` 워크플로는 GitHub Actions에서 운영자가 수동 실행할 때만 동작합니다.

- 새 글은 먼저 원본 데이터에 추가합니다.
- 공개 전 `editorial.js`에서 고유 본문, 출처, 검수일을 작성합니다.
- `npm run build:content`로 정적 상세 페이지, 지역별 랜딩 페이지(`region/`), 사이트맵과 RSS를 생성합니다.
- `npm run check` 통과 후 배포합니다.

선택 사항:

- GitHub Secrets에 `KTO_TOUR_API_KEY`를 넣으면 한국관광공사 이미지와 주소를 우선 반영합니다.
- 키가 없어도 초안 생성은 가능하지만 검수 전에는 공개하지 않습니다.

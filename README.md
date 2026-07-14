# 서울 축제 아카이브

서울 축제, 서울 가볼 만한 곳, 방문 전 체크 정보를 모아 보여주는 Cloudflare Pages용 정적 웹사이트입니다.

## 구성

- `index.html` - 메인 SEO 구조와 시맨틱 섹션
- `assets/travel-content.js` - TODAY 키워드, 카드, FAQ, 푸터 링크 데이터
- `assets/travel-home.js` - 콘텐츠 렌더링과 모바일 메뉴 동작
- `assets/travel-style.css` - 반응형 매거진 레이아웃 스타일
- `feed.xml`, `sitemap.xml`, `robots.txt`, `ads.txt`
- `jeju-travel-news/` - 제주여행뉴스 정적 페이지
- `functions/api/jeju.js` - 제주 관광정보 서버 함수
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

## 관리자

`/admin/`에서 제주 여행 글을 검색, 편집, 예약 상태로 관리할 수 있습니다.
실제 GitHub 저장을 쓰려면 Cloudflare Pages 환경변수에 `ADMIN_TOKEN`과 `GITHUB_TOKEN`을 추가합니다.
자세한 내용은 `ADMIN.md`를 확인하세요.

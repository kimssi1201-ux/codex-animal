# 제주여행뉴스 관리자

관리자 주소:

- `https://www.moneyarchive.kr/admin/`

## 기능

- 포스트 목록, 검색, 카테고리 필터, 상태 필터
- 발행됨, 예약됨, 임시저장 상태 관리
- 제목, slug, 카테고리, 지역, 이미지, 요약, 코스, 본문, 주변 추천, 주소, 주차, 운영시간, 입장료 편집
- 로컬 임시저장
- `articles.js` 내보내기
- Cloudflare 환경변수 설정 후 GitHub 저장

## Cloudflare 환경변수

Cloudflare Pages 프로젝트의 환경변수에 아래 값을 추가합니다.

- `ADMIN_TOKEN`: 관리자 화면에서 입력할 비밀번호성 토큰
- `GITHUB_TOKEN`: GitHub fine-grained token
- `GITHUB_OWNER`: `kimssi1201-ux`
- `GITHUB_REPO`: `codex-animal`
- `GITHUB_BRANCH`: `main`

`GITHUB_TOKEN` 권한은 이 저장소의 contents read/write 권한만 주는 것이 좋습니다.

## 저장 흐름

1. `/admin/`에서 글을 수정합니다.
2. `로컬 저장`으로 브라우저에 임시 저장합니다.
3. 관리 토큰을 입력하고 `GitHub 저장`을 누릅니다.
4. `/api/admin-posts`가 `jeju-travel-news/assets/articles.js`를 GitHub에 커밋합니다.
5. Cloudflare Pages가 GitHub 변경을 감지해 재배포합니다.

## 공개 노출 기준

- `status: "draft"`는 공개 사이트에서 숨김
- `status: "scheduled"` 또는 미래 날짜 글은 해당 날짜 전까지 숨김
- `status: "published"`이고 날짜가 현재보다 과거면 공개

현재 공개 사이트는 애드센스 품질 검수를 위해 `jeju-travel-news/assets/editorial.js`의 `curatedSlugs`에 포함되고, 고유 본문·출처·작성자·검수일이 등록된 글만 노출합니다. 관리자 화면에서 `published`로 저장한 것만으로는 즉시 공개되지 않습니다.

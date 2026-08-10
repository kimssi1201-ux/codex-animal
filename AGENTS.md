# Project Verification Guide

## Project

- Runtime: Node.js 20+ for scripts and Cloudflare Pages Functions.
- Frontend: static HTML, CSS and browser ES modules under `jeju-travel-news/`.
- Backend: Cloudflare Pages Functions under `functions/api/`.
- Package manager: npm. The repository uses Node's built-in test runner and has no runtime dependencies.
- Deployment: Cloudflare Pages project `codex-animal`, output directory `/`.

## Run

- Preview the static site with Cloudflare Pages: `npx.cmd wrangler pages dev .` in Windows PowerShell (`npx wrangler pages dev .` elsewhere)
- Production deployment: `npx.cmd wrangler pages deploy . --project-name codex-animal` in Windows PowerShell (`npx wrangler pages deploy . --project-name codex-animal` elsewhere)
- Open the production site: `https://www.moneyarchive.kr/`

## Test And Validation

- Run all tests: `npm test`
- Run tests in watch mode: `npm run test:watch`
- Run JavaScript syntax validation: `npm run check:js`
- Run the complete local verification: `npm run check`
- Build static article pages, sitemap and RSS: `npm run build`
- Lint validation: `npm run lint`

There is no bundler or separate lint configuration in this static project. `build` validates JavaScript and regenerates reviewed article pages, the sitemap and RSS feed. `lint` runs the JavaScript syntax check.

## Required After Code Changes

1. Run `npm run check`.
2. For API changes, confirm the changed handler has mock coverage in `test/api.test.js`.
3. Never put API keys in browser files, test fixtures, or committed configuration.
4. Do not call production APIs from automated tests. Use the fetch mocks in `test/api.test.js`.
5. For deployment changes, run a separate smoke check against the intended preview or production URL only after local tests pass.
6. Never restore scheduled bulk publishing without an explicit editorial review step. Public articles must be listed in `jeju-travel-news/assets/editorial.js` with unique sections, sources, author and review date.

# Video Downloader - Agent Guide

## Project Overview

Watermark-free video download site. Supports Douyin, Kuaishou, Bilibili, YouTube, Xiaohongshu, Weibo.
Stack: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Vitest

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run test` | Vitest watch mode |
| `npm run test:run` | Single test run |
| `npm run test:coverage` | Coverage report |

## Architecture

```
src/
├── app/
│   ├── api/parse/route.ts   # POST-only API endpoint
│   ├── page.tsx             # Client component (main UI)
│   ├── layout.tsx           # Root layout
│   └── globals.css
├── lib/
│   ├── parsers/
│   │   ├── index.ts         # Parser registry + detectPlatform()
│   │   ├── douyin.ts        # Douyin parser
│   │   ├── kuaishou.ts      # Kuaishou parser
│   │   ├── bilibili.ts      # Bilibili parser
│   │   ├── youtube.ts       # YouTube parser
│   │   ├── xiaohongshu.ts   # Xiaohongshu parser
│   │   └── weibo.ts         # Weibo parser
│   ├── cache.ts             # In-memory cache (dev only)
│   └── utils.ts             # URL validation, formatting
├── types/index.ts           # VideoInfo, Parser, ErrorCode
└── test/setup.ts            # Vitest setup (currently empty)
```

## Key Patterns

### Adding a New Platform Parser

1. Create `src/lib/parsers/<platform>.ts` exporting a `Parser` object
2. Register in `src/lib/parsers/index.ts` (add to `parsers` array + `platformPatterns`)
3. Add platform to `Platform` type in `src/types/index.ts`
4. Add to `RequestSchema` enum in `src/app/api/parse/route.ts`

### Parser Interface

```typescript
export interface Parser {
  name: Platform
  patterns: RegExp[]
  parse: (url: string) => Promise<VideoInfo>
}
```

### API Response Format

```typescript
// Success
{ success: true, data: VideoInfo, meta: { timestamp, parseTime, fromCache } }

// Error
{ success: false, error: { code: ErrorCode, message: string } }
```

## Important Details

- **Path alias**: `@/*` maps to `./src/*`
- **API is POST-only**: GET returns 405 with usage hint
- **Cache is in-memory**: No persistence, resets on server restart
- **CORS enabled**: API routes have `Access-Control-Allow-Origin: *`
- **Registry**: Uses npmmirror.com (Chinese mirror) via `.npmrc`
- **Parser pattern**: Each parser handles URL resolution (short links) → ID extraction → HTML fetch → data extraction
- **Test location**: Tests in `__tests__/` directories next to source files
- **Vitest config**: jsdom environment, globals enabled, setup at `src/test/setup.ts`
- **Dependencies**: axios for HTTP, cheerio for HTML parsing, zod for validation
- **Env vars**: `.env.local` exists with Supabase and Sentry config (see `.env.example` for required keys)

## Platform Status

| Platform | Status | Notes |
|----------|--------|-------|
| B站 | ✅ Works | Direct HTML parsing |
| YouTube | ✅ Works | Direct HTML parsing |
| 抖音 | ⚠️ Limited | Requires JS execution (`byted_acrawler`) |
| 快手 | ⚠️ Limited | Requires JS rendering, HTTP returns 405 |
| 小红书 | ⚠️ Limited | Dynamic content loading |
| 微博 | ⚠️ Limited | Requires login/visitor system |

**Known limitation**: Douyin, Kuaishou, Xiaohongshu, Weibo require headless browser (Puppeteer/Playwright) for real video extraction.

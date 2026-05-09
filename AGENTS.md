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

## 平台解析状态

| 平台 | 状态 | 说明 |
|------|------|------|
| B站 | ✅ 正常 | 直接解析 HTML 获取视频地址 |
| YouTube | ✅ 正常 | 直接解析 HTML 获取视频地址 |
| 抖音 | ⚠️ 受限 | 需要 JavaScript 执行反爬虫机制（`byted_acrawler`），简单 HTTP 请求无法获取内容 |
| 快手 | ⚠️ 受限 | 页面需要 JavaScript 渲染，HTTP 请求返回 405 |
| 小红书 | ⚠️ 受限 | 使用 JavaScript 动态加载内容，`__INITIAL_STATE__` 中无实际数据 |
| 微博 | ⚠️ 受限 | 需要登录和访客系统验证 |

**已知限制**：抖音、快手、小红书、微博的反爬虫机制较强，简单的 HTTP 请求无法获取真实视频地址。如需支持这些平台，需要使用无头浏览器（如 Puppeteer 或 Playwright）来渲染页面。

## OpenCode 配置注意事项

**配置文件位置**：
- 项目配置：`D:\Xcode\20260503_去水印\opencode.json`
- 全局配置：`C:\Users\Redme_H1K3\.config\opencode\opencode.json`

**重要教训**：
- JSON 格式必须严格合法（逗号、括号、引号必须匹配）
- 修改配置前必须备份，错误的 JSON 会导致 OpenCode 无法启动
- chrome-devtools-mcp 需要 `--slim --no-optional-methods` 参数才能正常工作

## Skills

Available in `.opencode/skills/`:

| Skill | 用途 |
|-------|------|
| `api-designer` | API 设计专家，设计 RESTful 接口、统一响应格式、错误处理 |
| `code-reviewer` | 代码审查专家，检查代码质量、安全漏洞、性能问题 |
| `debugger-assistant` | 调试助手，分析错误信息、堆栈跟踪，定位问题根因 |
| `doc-generator` | 自动生成和维护项目文档 |
| `git-workflow` | Git 工作流管理，分支策略、提交规范、PR 管理 |
| `performance-optimizer` | 性能分析和优化建议 |
| `refactor-planner` | 重构规划师，识别代码异味，制定安全重构计划 |
| `security-auditor` | 安全审计和漏洞检测 |
| `skill-creator` | 创建新的 OpenCode Skills 的元技能 |
| `test-generator` | 测试代码生成器，自动生成单元测试、集成测试 |
| `ui-ux-pro-max` | 专业 UI/UX 设计智能，提供设计建议和实现方案 |

## MCP 配置

| MCP | 配置位置 | 说明 |
|-----|----------|------|
| `chrome-devtools` | 项目 + 全局 | 浏览器操控，需 `--slim --no-optional-methods` 参数 |
| `brave-search` | 仅全局 | Brave 搜索引擎，远程 MCP |

# Video Downloader - Agent Guide

## 项目概述

无水印视频下载站点。支持抖音、快手、B站、YouTube、小红书、微博。
技术栈：Next.js 14 (App Router) + TypeScript + Tailwind CSS + Vitest

## 快速命令

| 命令 | 用途 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run lint` | ESLint 检查 |
| `npm run test` | Vitest 监听模式 |
| `npm run test:run` | 单次测试运行 |
| `npm run test:coverage` | 覆盖率报告 |

## 架构

```
src/
├── app/
│   ├── api/
│   │   ├── parse/route.ts   # POST-only API 端点
│   │   └── download/route.ts # 视频下载 API
│   ├── page.tsx             # 客户端组件（主 UI）
│   ├── layout.tsx           # 根布局
│   └── globals.css
├── components/
│   ├── UrlInput.tsx         # URL 输入组件
│   ├── ParseButton.tsx      # 解析按钮组件
│   ├── ErrorMessage.tsx     # 错误信息组件
│   └── VideoResult.tsx      # 视频结果组件
├── lib/
│   ├── parsers/
│   │   ├── index.ts         # 解析器注册 + detectPlatform()
│   │   ├── douyin.ts        # 抖音解析器
│   │   ├── douyin-sign.ts   # 抖音签名生成（isolated-vm）
│   │   ├── kuaishou.ts      # 快手解析器
│   │   ├── bilibili.ts      # B站解析器
│   │   ├── youtube.ts       # YouTube 解析器
│   │   ├── xiaohongshu.ts   # 小红书解析器
│   │   ├── weibo.ts         # 微博解析器
│   │   ├── snapwc.ts        # snapwc.com 备用解析器
│   │   ├── a_bogus.js       # 抖音签名算法
│   │   └── x_bogus.js       # 抖音签名算法
│   ├── cache.ts             # 内存缓存（仅开发）
│   ├── constants.ts         # 平台常量和工具函数
│   └── utils.ts             # URL 验证、格式化
├── types/index.ts           # VideoInfo, Parser, ErrorCode
└── test/setup.ts            # Vitest 配置
```

## 关键模式

### 添加新平台解析器

1. 创建 `src/lib/parsers/<platform>.ts` 导出 `Parser` 对象
2. 在 `src/lib/parsers/index.ts` 注册（添加到 `parsers` 数组 + `platformPatterns`）
3. 在 `src/types/index.ts` 添加平台类型
4. 在 `src/app/api/parse/route.ts` 添加到 `RequestSchema` 枚举

### 解析器接口

```typescript
export interface Parser {
  name: Platform
  patterns: RegExp[]
  parse: (url: string) => Promise<VideoInfo>
}
```

### API 响应格式

```typescript
// 成功
{ success: true, data: VideoInfo, meta: { timestamp, parseTime, fromCache } }

// 失败
{ success: false, error: { code: ErrorCode, message: string } }
```

## 重要细节

- **路径别名**：`@/*` 映射到 `./src/*`
- **API 仅 POST**：GET 返回 405
- **缓存仅内存**：无持久化，服务器重启重置
- **CORS 已启用**：API 路由 `Access-Control-Allow-Origin: *`
- **API 速率限制**：每 IP 每分钟 10 次请求
- **npm 镜像**：使用 npmmirror.com（中国镜像）通过 `.npmrc`
- **测试位置**：`__tests__/` 目录与源文件同级
- **Vitest 配置**：jsdom 环境，globals 启用，setup 在 `src/test/setup.ts`
- **依赖**：axios（HTTP）、cheerio（HTML 解析）、zod（验证）、isolated-vm（JS 执行）
- **环境变量**：`.env.local` 包含 Supabase 和 Sentry 配置（参见 `.env.example`）

## 平台状态

| 平台 | 状态 | 说明 |
|------|------|------|
| B站 | ✅ 可用 | 直接 API 调用（api.bilibili.com） |
| YouTube | ✅ 可用 | 通过 snapwc.com 解析 |
| 抖音 | ✅ 可用 | 通过 snapwc.com 解析 |
| 快手 | ✅ 可用 | 通过 snapwc.com 解析 |
| 小红书 | ✅ 可用 | 通过 snapwc.com 解析 |
| 微博 | ✅ 可用 | 移动端 API（m.weibo.cn） |

## 开发进度

### 已完成
- [x] Next.js 14 框架搭建
- [x] 6 个平台解析器基础实现
- [x] API 路由 + 缓存机制
- [x] 单页 UI 界面
- [x] 单元测试（detectPlatform、cache、API route）
- [x] 抖音签名生成（a_bogus/x_bogus）

### 进行中
- [ ] 解析器稳定性修复（小红书）
- [x] UI 组件化重构

### 待办
- [x] 真实视频下载功能
- [x] API 速率限制
- [ ] 集成测试（真实 URL）
- [ ] 生产部署配置

## 已知问题

### 抖音
- 依赖 `isolated-vm` 原生模块，部分环境编译失败
- 签名算法（a_bogus/x_bogus）可能随抖音更新失效

### 快手
- 使用 GraphQL API（visionVideoDetail）获取视频数据
- 需要 Mac Chrome 或 Firefox User-Agent（Windows Chrome 被反爬）
- 服务器端请求可能被反爬阻止，需要浏览器环境或有效 cookie

### 小红书
- SSR 数据格式 `__INITIAL_STATE__` 结构频繁变化
- 需要 `xsec_token` 参数才能获取视频数据
- 视频地址提取逻辑脆弱

### 微博
- 两套 API：m.weibo.cn（移动端）和 h5.video.weibo.com（H5）
- videoId 格式不统一（纯数字 vs 数字:字母）

### YouTube
- 仅从 `ytInitialPlayerResponse` 提取流媒体信息
- 可能被反爬机制阻止

### 通用
- 无 API 速率限制保护
- 下载功能仅打开链接，非真实下载
- UI 未组件化，全部在 page.tsx

## 关键依赖

### isolated-vm
- 用于抖音签名生成（a_bogus/x_bogus）
- 需要 C++ 编译环境（node-gyp）
- webpack 配置中已 externalize
- 内存限制：128MB

### npm 镜像
- 使用 `registry=https://registry.npmmirror.com`
- 安装依赖时使用中国镜像加速

## 测试说明

### 运行测试
```bash
npm run test        # 监听模式
npm run test:run    # 单次运行
npm run test:coverage  # 覆盖率
```

### 测试类型
- **单元测试**：`src/lib/parsers/__tests__/`、`src/lib/__tests__/`
- **API 测试**：`src/app/api/parse/__tests__/`
- **手动测试**：`test-api.js`（Node.js 脚本）、`test-browser.js`（Puppeteer）

### Mock 说明
- API 测试 mock 了 parsers 和 cache
- 解析器测试仅测试 detectPlatform，未测试实际解析

## 下阶段任务

### 优先级 P0（稳定性）
1. ~~修复快手解析器（处理 405 错误）~~ ✅ 已修复
2. 修复小红书解析器（更新 __INITIAL_STATE__ 解析）
3. 修复微博解析器（统一 videoId 处理）

### 优先级 P1（功能完善）
4. ~~实现真实视频下载功能~~ ✅ 已完成
5. ~~添加 API 速率限制~~ ✅ 已完成
6. ~~UI 组件化重构~~ ✅ 已完成

### 优先级 P2（质量提升）
7. 添加集成测试（真实 URL 测试）
8. 完善错误处理和日志
9. 生产部署配置

### 优先级 P3（扩展）
10. 添加更多平台支持
11. 添加视频质量选择
12. 添加批量下载功能

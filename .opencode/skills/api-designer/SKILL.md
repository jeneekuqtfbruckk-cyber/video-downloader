---
name: api-designer
description: API设计专家，设计RESTful接口、统一响应格式、错误处理、版本控制
license: MIT
compatibility: opencode
metadata:
  category: api-design
  framework: nextjs
---

## What I do
- 设计RESTful API接口
- 定义统一响应格式
- 设计错误处理体系
- 制定版本控制策略

## When to use me
- 新建API端点时
- 重构现有API时
- 设计API文档时

## 设计原则

### RESTful命名规范
```
GET    /api/videos          # 获取视频列表
GET    /api/videos/:id      # 获取单个视频
POST   /api/videos          # 创建视频
PUT    /api/videos/:id      # 更新视频
DELETE /api/videos/:id      # 删除视频

POST   /api/parse           # 解析视频（动作）
POST   /api/download        # 下载视频（动作）
```

### 命名风格
- 使用kebab-case：`/api/video-list`
- 资源使用复数：`/api/videos`
- 嵌套资源：`/api/users/:id/videos`

## 统一响应格式

### 成功响应
```typescript
interface SuccessResponse<T> {
  success: true
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
    timestamp: string
  }
}

// 示例
{
  "success": true,
  "data": {
    "id": "123",
    "title": "Video Title",
    "url": "https://..."
  },
  "meta": {
    "timestamp": "2026-05-03T12:00:00Z"
  }
}
```

### 错误响应
```typescript
interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}

// 示例
{
  "success": false,
  "error": {
    "code": "PARSE_FAILED",
    "message": "无法解析该视频链接",
    "details": {
      "platform": "douyin",
      "reason": "视频已删除"
    }
  }
}
```

## 错误码体系

### HTTP状态码使用
| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | OK | 成功 |
| 201 | Created | 创建成功 |
| 400 | Bad Request | 参数错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 429 | Too Many Requests | 频率限制 |
| 500 | Internal Error | 服务器错误 |

### 业务错误码
```typescript
enum ErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_PARAMS = 'INVALID_PARAMS',
  
  // 解析错误
  PARSE_FAILED = 'PARSE_FAILED',
  UNSUPPORTED_PLATFORM = 'UNSUPPORTED_PLATFORM',
  VIDEO_NOT_FOUND = 'VIDEO_NOT_FOUND',
  
  // 下载错误
  DOWNLOAD_FAILED = 'DOWNLOAD_FAILED',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  
  // 频率限制
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}
```

## API Route模板

### Next.js App Router
```typescript
// app/api/parse/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const RequestSchema = z.object({
  url: z.string().url('Invalid URL format'),
  platform: z.enum(['douyin', 'kuaishou', 'bilibili', 'youtube']).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, platform } = RequestSchema.parse(body)
    
    const result = await parseVideo(url, platform)
    
    return NextResponse.json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_PARAMS',
          message: '参数验证失败',
          details: error.errors
        }
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'PARSE_FAILED',
        message: error.message
      }
    }, { status: 500 })
  }
}
```

## 分页设计

### 请求参数
```
GET /api/videos?page=1&limit=20&sort=created_at&order=desc
```

### 响应格式
```typescript
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## 使用示例

```
设计视频解析API的接口规范
```

```
为下载功能设计RESTful API
```

```
帮我定义错误码体系
```

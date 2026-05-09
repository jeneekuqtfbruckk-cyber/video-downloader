---
name: test-generator
description: 测试代码生成器，根据源码自动生成单元测试、集成测试，支持Vitest/Jest
license: MIT
compatibility: opencode
metadata:
  category: testing
  framework: vitest
---

## What I do
- 分析源码生成测试骨架
- 覆盖正常路径、边界条件、错误处理
- 生成Mock和测试数据
- 计算测试覆盖率建议

## When to use me
- 新增函数/模块时
- 修改现有代码后补充测试
- 提升测试覆盖率

## 测试框架配置

### Vitest（推荐，Next.js首选）
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  }
})
```

## 测试模板

### 函数测试
```typescript
import { describe, it, expect, vi } from 'vitest'
import { functionName } from './module'

describe('functionName', () => {
  it('should handle success case', () => {
    // Arrange
    const input = 'test'
    
    // Act
    const result = functionName(input)
    
    // Assert
    expect(result).toBe('expected')
  })

  it('should throw error for invalid input', () => {
    // Arrange
    const invalidInput = null
    
    // Act & Assert
    expect(() => functionName(invalidInput)).toThrow('Invalid input')
  })

  it('should handle edge case', () => {
    // Arrange
    const edgeInput = ''
    
    // Act
    const result = functionName(edgeInput)
    
    // Assert
    expect(result).toBeDefined()
  })
})
```

### API Route测试
```typescript
import { describe, it, expect, vi } from 'vitest'
import { createMocks } from 'node-mocks-http'
import handler from './route'

describe('API Route', () => {
  it('should return 200 for valid request', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { url: 'https://example.com/video' }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toHaveProperty('success', true)
  })
})
```

### Mock模式
```typescript
// Mock外部依赖
vi.mock('@/lib/database', () => ({
  db: {
    query: vi.fn(),
    insert: vi.fn()
  }
}))

// Mock fetch
global.fetch = vi.fn()
```

## 测试覆盖策略

| 类型 | 覆盖目标 | 优先级 |
|------|----------|--------|
| 单元测试 | 核心业务逻辑 | P0 |
| 集成测试 | API端点 | P0 |
| 组件测试 | 关键UI组件 | P1 |
| E2E测试 | 核心用户流程 | P2 |

## 使用示例

```
为 @src/lib/parsers/douyin.ts 生成完整的单元测试
```

```
补充 parseVideo 函数的边界测试用例
```

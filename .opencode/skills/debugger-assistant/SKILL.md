---
name: debugger-assistant
description: 调试助手，分析错误信息、堆栈跟踪，快速定位问题根因并提供修复方案
license: MIT
compatibility: opencode
metadata:
  category: debugging
  language: all
---

## What I do
- 解析错误信息和堆栈跟踪
- 定位问题文件和代码行
- 分析错误上下文
- 提供修复方案和预防措施

## When to use me
- 遇到运行时错误时
- 测试失败需要排查时
- 生产环境bug修复

## 调试流程

### 1. 错误信息解析
```
TypeError: Cannot read properties of undefined (reading 'url')
    at parseVideo (src/lib/parsers/index.ts:45:23)
    at async POST (src/app/api/parse/route.ts:12:10)
```

分析结果：
- 错误类型：TypeError
- 原因：访问undefined的url属性
- 位置：src/lib/parsers/index.ts 第45行
- 调用链：API Route → parseVideo

### 2. 上下文分析
- 检查函数参数
- 验证数据来源
- 确认类型定义
- 追踪调用链

### 3. 修复方案
```typescript
// 修复前
const videoUrl = result.url

// 修复后
const videoUrl = result?.url ?? ''
if (!videoUrl) {
  throw new Error('Failed to extract video URL')
}
```

## 常见错误模式

### TypeError: Cannot read property
**原因**：访问null/undefined的属性
**修复**：添加空值检查或可选链
```typescript
// Before
obj.prop.nested

// After
obj?.prop?.nested ?? defaultValue
```

### Module not found
**原因**：导入路径错误或依赖未安装
**修复**：
1. 检查路径大小写
2. 确认文件存在
3. 运行 `npm install`

### Hydration mismatch
**原因**：SSR与CSR渲染结果不一致
**修复**：
```typescript
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return null
```

### Rate limit exceeded
**原因**：API调用频率过高
**修复**：
1. 添加请求缓存
2. 实现重试机制
3. 使用队列控制并发

### CORS error
**原因**：跨域请求被阻止
**修复**：
```typescript
// next.config.js
async headers() {
  return [{
    source: '/api/:path*',
    headers: [
      { key: 'Access-Control-Allow-Origin', value: '*' }
    ]
  }]
}
```

## 调试工具

### Console调试
```typescript
console.log('Debug:', { variable })
console.table(arrayData)
console.time('operation')
// ... 操作
console.timeEnd('operation')
```

### 错误边界（React）
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, info) {
    console.error('Error:', error)
    console.error('Stack:', info.componentStack)
  }
}
```

## 使用示例

```
帮我分析这个错误：TypeError: fetch failed at ...
```

```
这个测试为什么失败？错误信息是...
```

```
生产环境出现500错误，日志显示...
```

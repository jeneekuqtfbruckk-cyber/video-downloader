---
name: refactor-planner
description: 重构规划师，识别代码异味，制定安全的重构计划，确保重构不破坏现有功能
license: MIT
compatibility: opencode
metadata:
  category: refactoring
  language: all
---

## What I do
- 识别代码异味和坏味道
- 制定分步重构计划
- 确保重构前后行为一致
- 生成重构检查清单

## When to use me
- 代码难以维护时
- 函数过长需要拆分时
- 架构调整前的规划
- 技术债务清理

## 代码异味识别

### 1. 长函数（>50行）
**症状**：函数职责过多，难以理解
**重构策略**：Extract Method
```typescript
// Before
function processVideo(url: string) {
  // 50+ 行代码...
}

// After
function processVideo(url: string) {
  const videoInfo = extractVideoInfo(url)
  const downloadUrl = parseDownloadUrl(videoInfo)
  return formatResponse(downloadUrl)
}
```

### 2. 深层嵌套（>3层）
**症状**：回调地狱，难以追踪逻辑
**重构策略**：Early Return, Guard Clauses
```typescript
// Before
if (user) {
  if (user.role === 'admin') {
    if (user.isActive) {
      // 执行操作
    }
  }
}

// After
if (!user) return error('No user')
if (user.role !== 'admin') return error('Not admin')
if (!user.isActive) return error('Inactive')
// 执行操作
```

### 3. 重复代码
**症状**：相同逻辑在多处出现
**重构策略**：Extract Function
```typescript
// Before
// 在多处出现的相似代码

// After
function sharedLogic() {
  // 提取公共逻辑
}
```

### 4. 过多参数（>4个）
**症状**：函数调用难以记忆
**重构策略**：Introduce Parameter Object
```typescript
// Before
function createVideo(title, url, platform, quality, format) {}

// After
interface VideoOptions {
  title: string
  url: string
  platform: string
  quality: '720p' | '1080p'
  format: 'mp4' | 'webm'
}
function createVideo(options: VideoOptions) {}
```

### 5. 全局状态滥用
**症状**：状态难以追踪，副作用多
**重构策略**：Use Context/Provider or State Management
```typescript
// Before
let globalState = {}

// After
const StateContext = createContext<State>(initialState)
```

## 重构检查清单

### 重构前
- [ ] 确认现有测试通过
- [ ] 备份当前代码
- [ ] 制定回滚计划
- [ ] 通知团队成员

### 重构中
- [ ] 小步前进，频繁提交
- [ ] 每次改动后运行测试
- [ ] 保持接口兼容
- [ ] 更新相关文档

### 重构后
- [ ] 所有测试通过
- [ ] 代码审查通过
- [ ] 性能无回退
- [ ] 更新CHANGELOG

## 重构策略库

### Extract Method
适用：长函数
步骤：
1. 识别独立逻辑块
2. 提取为新函数
3. 替换原代码
4. 运行测试

### Replace Conditional with Polymorphism
适用：大量if-else/switch
步骤：
1. 定义基类/接口
2. 创建子类实现
3. 替换条件判断
4. 运行测试

### Move Method
适用：职责错位
步骤：
1. 识别目标类
2. 复制方法到目标
3. 更新调用方
4. 删除原方法
5. 运行测试

## 使用示例

```
分析 @src/lib/parsers/index.ts 的代码异味
```

```
制定将parseVideo函数拆分为多个小函数的计划
```

```
这个文件有200行了，帮我规划重构方案
```

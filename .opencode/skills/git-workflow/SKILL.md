---
name: git-workflow
description: Git 工作流管理，包括分支策略、提交规范、PR 管理
---

## 功能描述

Git 工作流管理，包括：
- 分支策略建议
- 提交信息规范（Conventional Commits）
- PR/CR 流程指导
- 冲突解决
- Git hooks 配置

## 使用方法

```
帮我创建一个分支
```

```
规范我的提交信息
```

```
解决这个合并冲突
```

## 分支策略

```
main          ← 生产环境
  └── develop ← 开发主线
       ├── feature/xxx  ← 新功能
       ├── fix/xxx      ← Bug 修复
       └── release/xxx  ← 发布准备
```

## 提交规范（Conventional Commits）

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Type 类型**：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

## 示例

```
帮我创建一个 feature/video-parser 分支
```

```
把我的提交信息规范为 conventional commits 格式
```

```
帮我解决 main 和 develop 之间的冲突
```

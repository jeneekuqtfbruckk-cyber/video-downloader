---
name: code-reviewer
description: 代码审查专家，自动检查代码质量、安全漏洞、性能问题，提供改进建议
license: MIT
compatibility: opencode
metadata:
  category: code-quality
  language: all
---

## What I do
- 审查代码质量、安全性、性能
- 识别潜在bug和代码异味
- 提供具体的修复建议
- 生成审查报告

## When to use me
- 提交代码前自动审查
- PR审查时辅助检查
- 重构前后对比分析

## 审查维度

### 安全性
- XSS漏洞检测
- SQL注入风险
- 敏感信息泄露（API Key、密码）
- 依赖包安全漏洞

### 性能
- N+1查询问题
- 内存泄漏风险
- 不必要的重渲染
- 大数据处理优化

### 可维护性
- 函数复杂度（圈复杂度<10）
- 命名规范检查
- 注释完整性
- 代码重复度

### 类型安全
- any类型使用
- 类型断言滥用
- 空值处理
- 泛型正确性

## 输出格式

```json
{
  "summary": "审查摘要",
  "issues": [
    {
      "file": "src/example.ts",
      "line": 42,
      "severity": "error|warning|info",
      "rule": "security/no-sql-injection",
      "message": "问题描述",
      "suggestion": "修复建议"
    }
  ],
  "metrics": {
    "complexity": 8,
    "coverage": "85%",
    "duplications": "2%"
  }
}
```

## 使用示例

```
请审查 @src/api/parse.ts 文件的代码质量
```

```
检查最近提交的代码是否有安全问题
```

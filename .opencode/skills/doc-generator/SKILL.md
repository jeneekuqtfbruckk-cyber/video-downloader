---
name: doc-generator
description: 自动生成和维护项目文档
---

## 功能描述

自动生成和维护项目文档，包括：
- README.md 生成
- API 文档生成
- 代码注释提取
- CHANGELOG 生成
- 贡献指南生成

## 使用方法

```
为这个项目生成 README
```

```
为 [文件/模块] 生成 API 文档
```

```
生成 CHANGELOG
```

## 示例

```
为这个项目生成一个完整的 README.md
```

```
为 src/lib/parsers/ 目录生成 API 文档
```

```
根据 git 提交历史生成 CHANGELOG
```

## 文档模板

### README.md 结构

```markdown
# 项目名称

> 简短描述

## 功能特性

## 快速开始

### 安装

### 配置

### 使用

## API 文档

## 贡献指南

## 许可证
```

### API 文档结构

```markdown
## 函数名

**描述**

**参数**
| 参数 | 类型 | 必填 | 说明 |

**返回值**

**示例**
```

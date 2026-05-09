---
name: skill-creator
description: 创建新的 OpenCode Skills 的元技能
---

## 功能描述

这是一个"元技能"，用于帮助用户创建新的 Skills。当你需要一个新的专业能力时，使用这个 Skill 来创建。

## 使用方法

```
创建一个新 skill，用于 [描述功能]
```

## 创建流程

1. 询问用户需求：这个 Skill 应该做什么？
2. 确定 Skill 名称（小写，连字符分隔）
3. 创建目录：`.opencode/skills/<name>/`
4. 创建 `SKILL.md` 文件，包含：
   - name: Skill 名称
   - description: 一句话描述
   - 功能描述
   - 使用方法
   - 示例

## SKILL.md 模板

```markdown
---
name: <skill-name>
description: <一句话描述>
---

## 功能描述
<详细描述这个 Skill 能做什么>

## 使用方法
<如何调用这个 Skill>

## 示例
<提供使用示例>
```

## 示例

```
创建一个新 skill，用于生成数据库迁移文件
```

输出：创建 `.opencode/skills/db-migration/SKILL.md`

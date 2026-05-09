---
name: security-auditor
description: 安全审计和漏洞检测
---

## 功能描述

安全审计和漏洞检测，包括：
- 代码安全审查
- 依赖漏洞扫描
- XSS/CSRF 防护检查
- 敏感信息泄露检测
- 认证/授权审查

## 使用方法

```
审查这个文件的安全问题
```

```
检查项目依赖的漏洞
```

```
检查是否有敏感信息泄露
```

## 安全检查清单

### 输入验证

- [ ] 所有用户输入都已验证
- [ ] SQL 参数化查询
- [ ] XSS 防护
- [ ] 路径遍历防护

### 认证授权

- [ ] 密码安全存储（bcrypt）
- [ ] JWT 安全配置
- [ ] 会话管理安全
- [ ] 权限检查完整

### 数据保护

- [ ] 敏感数据加密
- [ ] HTTPS 强制
- [ ] CORS 配置正确
- [ ] 无敏感信息泄露

### 依赖安全

- [ ] 无已知漏洞依赖
- [ ] 定期更新依赖
- [ ] 使用 npm audit

## 示例

```
审查 src/app/api/ 目录的安全问题
```

```
运行 npm audit 并修复漏洞
```

```
检查 .env.local 是否被 git 忽略
```

## 常见漏洞修复

### XSS 防护

```typescript
// ❌ 危险
element.innerHTML = userInput

// ✅ 安全
element.textContent = userInput
```

### SQL 注入防护

```typescript
// ❌ 危险
db.query(`SELECT * FROM users WHERE id = ${userId}`)

// ✅ 安全
db.query('SELECT * FROM users WHERE id = ?', [userId])
```

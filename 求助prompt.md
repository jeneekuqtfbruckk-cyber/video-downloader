# OpenCode + Chrome DevTools MCP 问题诊断报告

## 问题描述

在 OpenCode 中配置 chrome-devtools-mcp 后，MCP 服务器成功启动（日志显示 29 个工具），但工具未注册到 OpenCode 的工具注册表中，无法使用。

## 环境信息

- **操作系统**: Windows 10/11
- **OpenCode 版本**: 1.14.41
- **Node.js**: v20.x
- **chrome-devtools-mcp**: 0.25.0

## 配置文件

### 项目配置 (D:\Xcode\20260503_去水印\opencode.json)
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "chrome-devtools": {
      "type": "local",
      "command": ["cmd", "/c", "npx", "-y", "chrome-devtools-mcp@latest"],
      "environment": {
        "SystemRoot": "C:\\Windows",
        "PROGRAMFILES": "C:\\Program Files"
      },
      "timeout": 20000,
      "enabled": true
    }
  },
  "tools": {
    "chrome-devtools*": true
  }
}
```

### 全局配置 (C:\Users\{user}\.config\opencode\opencode.json)
```json
{
  "mcp": {
    "chrome-devtools": {
      "type": "local",
      "command": ["cmd", "/c", "npx", "-y", "chrome-devtools-mcp@latest"],
      "environment": {
        "SystemRoot": "C:\\Windows",
        "PROGRAMFILES": "C:\\Program Files"
      },
      "timeout": 20000
    }
  }
}
```

## 日志分析

### 成功启动的日志
```
INFO  service=mcp key=chrome-devtools type=local found
INFO  service=mcp key=chrome-devtools toolCount=29 create() successfully created client
```

### 错误日志
```
ERROR service=mcp clientName=chrome-devtools error=MCP error -32601: Method not found failed to get resources
ERROR service=mcp clientName=chrome-devtools error=MCP error -32601: Method not found failed to get prompts
```

### 工具注册表（只有内置工具）
```
service=tool.registry status=started read
service=tool.registry status=started glob
service=tool.registry status=started grep
service=tool.registry status=started edit
service=tool.registry status=started write
service=tool.registry status=started task
service=tool.registry status=started webfetch
service=tool.registry status=started todowrite
service=tool.registry status=started skill
```

## 已知问题

### OpenCode Issue #24985
**标题**: MCP client fails to initialize servers that don't implement optional `prompts/list` and `resources/list` methods

**描述**: 
当 MCP 服务器只实现 `tools/list` 和 `tools/call`（如 chrome-devtools-mcp），OpenCode 会将 `-32601`（Method not found）响应视为致命错误，导致服务器被丢弃。

**状态**: 开放，已分配给开发者 rekram1-node

**链接**: https://github.com/anomalyco/opencode/issues/24985

## 对比测试

### 在其他工具中的表现
- **Codex**: chrome-devtools-mcp 正常工作
- **Claude for Windows**: chrome-devtools-mcp 正常工作
- **Antigravity**: chrome-devtools-mcp 正常工作

### Codex 配置（参考）
```toml
[mcp_servers.chrome-devtools]
command = "cmd"
args = [
  "/c",
  "npx",
  "-y",
  "chrome-devtools-mcp@latest",
]
env = { SystemRoot="C:\\Windows", PROGRAMFILES="C:\\Program Files" }
startup_timeout_ms = 20_000
```

## 问题总结

1. **MCP 服务器本身正常**: 日志显示成功启动并识别 29 个工具
2. **OpenCode 初始化失败**: 由于 `-32601` 错误，工具未被注册
3. **已知 Bug**: OpenCode Issue #24985 确认了这个问题
4. **其他工具正常**: 相同的 MCP 在 Codex、Claude 中工作正常

## 寻求帮助

请提供以下信息：
1. 是否有解决 Issue #24985 的方案或补丁？
2. 是否有其他方式在 OpenCode 中实现浏览器自动化？
3. OpenCode 官方推荐的浏览器自动化方案是什么？
4. 是否有替代的 MCP 服务器可以实现类似功能？
5. 是否可以通过自定义工具（Custom Tools）实现浏览器控制？

## 相关链接

- OpenCode 文档: https://opencode.ai/docs/mcp-servers/
- chrome-devtools-mcp: https://github.com/ChromeDevTools/chrome-devtools-mcp
- OpenCode Issue #24985: https://github.com/anomalyco/opencode/issues/24985

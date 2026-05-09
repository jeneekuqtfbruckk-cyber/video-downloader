# Warp 终端配置教程（基于实际截图 + 官方文档核实）

> 版本：v0.2026.04.29.08.57.stable_02
> 参考：https://docs.warp.dev/terminal/settings/all-settings/

---

## 第一步：Account（账户）

**评级：建议**

截图：`Setting01.png`

- 点击右上角 **Sign up** 注册/登录账户
- **官方说明**：登录是可选的（Optional），未登录也可使用基本终端功能
- 登录后可使用 AI 功能、云同步、Settings Sync 等高级功能

---

## 第二步：Warp Agent

截图：`Setting02.png` ~ `Setting03.png`

### 2.1 Active AI

| 设置项 | 当前状态 | 建议操作 | 评级 |
|--------|----------|----------|------|
| Next Command | OFF | 保持OFF | 建议 |
| Prompt Suggestions | OFF | 保持OFF | 建议 |
| Suggested Code Bans | OFF | 保持OFF | 建议 |
| Shared Block Title Generation | OFF | 保持OFF | 建议 |

### 2.2 Input

| 设置项 | 当前状态 | 建议操作 | 评级 |
|--------|----------|----------|------|
| Autodetect agent prompts in terminal input | OFF | 保持OFF | 建议 |
| Autodetect terminal commands in agent input | OFF | 保持OFF | 建议 |
| Show input hint text | OFF | 保持OFF | 建议 |
| Show agent tips | OFF | 保持OFF | 建议 |
| Include agent-executed commands in history | OFF | 保持OFF | 建议 |

### 2.3 Voice

| 设置项 | 当前状态 | 建议操作 | 评级 |
|--------|----------|----------|------|
| Voice Input | OFF | 保持OFF | 建议 |

### 2.4 API Keys

| 设置项 | 当前状态 | 建议操作 | 评级 |
|--------|----------|----------|------|
| OpenAI API Key | 已填 | 保持 | 强烈建议 |
| Anthropic API Key | 已填 | 保持 | 强烈建议 |
| Google API Key | 已填 | 保持 | 强烈建议 |

> 注意：需要升级到 Build plan 才能使用自定义 API Key

### 2.5 Agent Attribution

| 设置项 | 当前状态 | 建议操作 | 评级 |
|--------|----------|----------|------|
| Enable agent attribution | ON | 保持ON | 建议 |

### 2.6 Other

| 设置项 | 当前状态 | 建议操作 | 评级 |
|--------|----------|----------|------|
| Show Oz changelog in new conversation view | OFF | 保持OFF | 建议 |
| Show "Use Agent" footer | OFF | 保持OFF | 建议 |
| Show conversation history in tools panel | OFF | 保持OFF | 建议 |
| Agent thinking display | Show & collapse | 保持 | 建议 |
| Preferred layout when opening existing agent conversations | New Tab | 保持 | 建议 |

### 2.7 Experimental

| 设置项 | 当前状态 | 建议操作 | 评级 |
|--------|----------|----------|------|
| Computer use in Cloud Agents | OFF | 保持OFF | 建议 |

---

## 第三步：Profiles

截图：`Setting04.png`

| 设置项 | 当前值 | 建议操作 | 评级 |
|--------|--------|----------|------|
| Base model | auto (cost-efficient) | 保持 | 强烈建议 |
| Full terminal use | Auto | 保持 | 强烈建议 |
| Apply code diffs | Agent decides | 保持 | 强烈建议 |
| Read files | Agent decides | 保持 | 强烈建议 |
| Execute commands | Always ask | 保持 | 强烈建议 |
| Interact with running commands | Always ask | 保持 | 强烈建议 |
| Ask questions | Ask unless auto-approve | 保持 | 强烈建议 |
| Call MCP servers | Agent decides | 保持 | 强烈建议 |
| Call web tools | On | 保持 | 强烈建议 |
| Auto-sync plans to Warp Drive | On | 保持 | 建议 |

> 点击 **Edit** 可修改以上设置

---

## 第四步：MCP Servers

截图：`Setting05.png`

| 设置项 | 当前状态 | 建议操作 | 评级 |
|--------|----------|----------|------|
| Auto-spawn servers from third-party agents | OFF | 保持OFF | 建议 |
| chrome-devtools | Detected from config file | 点击 **+** 添加 | 强烈建议 |

> **官方说明**：Warp 管理的全局 MCP 服务器会自动启动，不受此设置影响；项目级服务器需手动启动

### chrome-devtools-mcp 配置详解

**配置文件位置**：
- 项目配置：`D:\Xcode\20260503_去水印\opencode.json`
- 全局配置：`C:\Users\Redme_H1K3\.config\opencode\opencode.json`

**正确配置示例**：
```json
{
  "mcp": {
    "chrome-devtools": {
      "type": "local",
      "command": ["npx", "-y", "chrome-devtools-mcp@latest", "--slim", "--no-optional-methods"],
      "timeout": 30000,
      "enabled": true
    }
  }
}
```

**关键参数说明**：
- `--slim`：精简模式，减少可选功能
- `--no-optional-methods`：禁用 `prompts/list`、`resources/list` 等可选方法，规避 OpenCode 的严格校验
- `timeout: 30000`：超时设置（毫秒）
- `enabled: true`：显式启用

**常见错误**：
1. ❌ 缺少 `--slim --no-optional-methods` 参数 → 工具注册失败
2. ❌ JSON 格式错误（多余逗号、括号不匹配）→ OpenCode 无法启动
3. ❌ 未设置 `timeout` → 网络请求超时

**验证方法**：
```powershell
# 测试 chrome-devtools-mcp 是否能正常启动
npx -y chrome-devtools-mcp@latest --slim --no-optional-methods
```

### brave-search MCP 配置

**配置位置**：全局配置 `C:\Users\Redme_H1K3\.config\opencode\opencode.json`

**配置示例**：
```json
{
  "mcp": {
    "brave-search": {
      "type": "remote",
      "url": "https://mcp.brave.com/mcp",
      "enabled": true
    }
  }
}
```

**说明**：brave-search 是远程 MCP，无需本地安装，只需配置 URL 即可使用。

### MCP 配置汇总

| MCP | 类型 | 配置位置 | 用途 |
|-----|------|----------|------|
| chrome-devtools | local | 项目 + 全局 | 浏览器操控、截图、页面分析 |
| brave-search | remote | 仅全局 | 网络搜索 |

---

## 第五步：Knowledge

截图：`Setting06.png`

| 设置项 | 当前状态 | 建议操作 | 评级 |
|--------|----------|----------|------|
| Rules | OFF | 保持OFF | 建议 |
| Suggested Rules | OFF | 保持OFF | 建议 |
| Warp Drive as agent context | OFF | 保持OFF | 建议 |

---

## 第六步：Third party CLI agents

截图：`Setting07.png`

| 设置项 | 当前状态 | 建议操作 | 评级 |
|--------|----------|----------|------|
| Show coding agent toolbar | ON | 保持ON | 强烈建议 |
| Auto show/hide Rich Input based on agent status | ON | 保持ON | 强烈建议 |
| Auto open Rich Input when a coding agent session starts | OFF | 保持OFF | 建议 |
| Auto dismiss Rich Input after prompt submission | OFF | 保持OFF | 建议 |

---

## 第七步：Code → Indexing and projects

截图：`Setting08.png`

| 设置项 | 当前状态 | 建议操作 | 评级 |
|--------|----------|----------|------|
| Codebase indexing | OFF | **打开ON** | 强烈建议 |

> 打开后点击 **Index new folder**，选择你的项目目录（如 `D:\Xcode\20260503_去水印`）

---

## 第八步：Code → Editor and Code Review

截图：`Setting09.png`

| 设置项 | 当前值 | 建议操作 | 评级 |
|--------|--------|----------|------|
| Choose an editor to open file links | Default App | 保持 | 建议 |
| Choose an editor to open files from code review panel | Warp | 保持 | 建议 |
| Choose a layout to open files in Warp | Split Pane | 保持 | 建议 |
| Group files into single editor pane | ON | 保持ON | 建议 |
| Open Markdown files in Warp's Markdown Viewer by default | ON | 保持ON | 建议 |
| Auto open code review panel | OFF | 保持OFF | 建议 |
| Show code review button | ON | 保持ON | 强烈建议 |
| Show diff stats on code review button | ON | 保持ON | 强烈建议 |
| Project explorer | ON | 保持ON | 强烈建议 |
| Global file search | ON | 保持ON | 强烈建议 |

---

## 第九步：Cloud platform → Environments

截图：`Setting10.png`

| 设置项 | 当前状态 | 建议操作 | 评级 |
|--------|----------|----------|------|
| Environments | 未设置 | 根据需要选择 | 建议 |

> 可通过 Quick setup (GitHub) 或 Use the agent 设置

---

## 第十步：Teams

截图：`Setting11.png`

| 设置项 | 当前状态 | 建议操作 | 评级 |
|--------|----------|----------|------|
| Teams | 未创建 | 根据需要创建 | 建议 |

---

## 第十一步：Appearance（外观）

截图：`Setting12.png` ~ `Setting14.png`

### Themes

| 设置项 | 当前值 | 建议操作 | 评级 |
|--------|--------|----------|------|
| Sync with OS | OFF | 保持OFF | 建议 |
| Current theme | Dark | 保持 | 建议 |

### Window

| 设置项 | 当前值 | 建议操作 | 评级 |
|--------|--------|----------|------|
| Open new windows with custom size | OFF | 保持OFF | 建议 |
| Window Opacity | 100 | 保持 | 建议 |
| Use Window Blur (Acrylic texture) | OFF | 保持OFF | 建议 |
| Zoom | 100% | 保持 | 建议 |
| Tools panel visibility is consistent across tabs | ON | 保持ON | 建议 |

### Input

| 设置项 | 当前值 | 建议操作 | 评级 |
|--------|--------|----------|------|
| Input type | Warp | 保持 | 强烈建议 |
| Input position | Pin to the bottom (Warp mode) | 保持 | 强烈建议 |

### Panes

| 设置项 | 当前值 | 建议操作 | 评级 |
|--------|--------|----------|------|
| Dim inactive panes | OFF | 保持OFF | 建议 |
| Focus follows mouse | OFF | 保持OFF | 建议 |

### Blocks

| 设置项 | 当前值 | 建议操作 | 评级 |
|--------|--------|----------|------|
| Compact mode | OFF | 保持OFF | 建议 |
| Show Jump to Bottom of Block button | ON | 保持ON | 建议 |
| Show block dividers | ON | 保持ON | 建议 |

### Text

| 设置项 | 当前值 | 建议操作 | 评级 |
|--------|--------|----------|------|
| Terminal font | Hack (default) | 保持 | 建议 |
| Font weight | Normal | 保持 | 建议 |
| Font size (px) | 13 | 保持 | 建议 |
| Line height | 1.2 | 保持 | 建议 |
| Agent font | Hack (default) | 保持 | 建议 |
| Notebook font size | 14 | 保持 | 建议 |
| Enforce minimum contrast | Only for named colors | 保持 | 建议 |
| Show ligatures in terminal | OFF | 保持OFF | 建议 |

### Cursor

| 设置项 | 当前值 | 建议操作 | 评级 |
|--------|--------|----------|------|
| Cursor type | Bar | 保持 | 建议 |
| Blinking cursor | ON | 保持ON | 建议 |

### Tabs

| 设置项 | 当前值 | 建议操作 | 评级 |
|--------|--------|----------|------|
| Show tab indicators | ON | 保持ON | 建议 |
| Show the tab bar | When windowed | 保持 | 建议 |
| Tab close button position | Right | 保持 | 建议 |
| Use vertical tab layout | ON | 保持ON | 建议 |

### Full-screen Apps

| 设置项 | 当前值 | 建议操作 | 评级 |
|--------|--------|----------|------|
| Use custom padding in alt-screen | ON | 保持ON | 建议 |
| Uniform padding (px) | 0 | 保持 | 建议 |

---

## 第十二步：Features（功能）

截图：`Setting15.png` ~ `Setting17.png`

### General

| 设置项 | 当前值 | 建议操作 | 评级 |
|--------|--------|----------|------|
| Default mode for new sessions | Terminal | 保持 | 强烈建议 |
| Restore windows, tabs, and panes on startup | ON | 保持ON | 强烈建议 |
| Show sticky command header | ON | 保持ON | 建议 |
| Show tooltip on click on links | ON | 保持ON | 建议 |
| Show warning before quitting/logging out | ON | 保持ON | 建议 |
| Start Warp at login | ON | 保持ON | 建议 |
| Show changelog toast after updates | ON | 保持ON | 建议 |
| Lines scrolled by mouse wheel interval | 3 | 保持 | 建议 |

### Session

| 设置项 | 当前值 | 建议操作 | 评级 |
|--------|--------|----------|------|
| Maximum rows in a block | 50000 | 保持 | 建议 |
| Warp SSH Wrapper | ON | 保持ON | 强烈建议 |
| Default shell for new sessions | Default | 保持 | 强烈建议 |
| Working directory for new sessions | Previous session's directory | 保持 | 强烈建议 |
| Enable reopening of closed sessions | ON | 保持ON | 强烈建议 |
| Grace period (seconds) | 60 | 保持 | 建议 |

### Keys

| 设置项 | 当前值 | 建议操作 | 评级 |
|--------|--------|----------|------|
| Left Alt key is Meta | OFF | 保持OFF | 建议 |
| Right Alt key is Meta | OFF | 保持OFF | 建议 |
| Ctrl+Tab behavior | Activate previous/next tab | 保持 | 建议 |
| Global hotkey | Disabled | 保持 | 建议 |

### Text Editing

| 设置项 | 当前值 | 建议操作 | 评级 |
|--------|--------|----------|------|
| Autocomplete quotes, parentheses, and brackets | ON | 保持ON | 强烈建议 |
| Edit code and commands with Vim keybindings | OFF | 保持OFF | 建议 |

### Terminal Input

| 设置项 | 当前值 | 建议操作 | 评级 |
|--------|--------|----------|------|
| Error underlining for commands | ON | 保持ON | 强烈建议 |
| Syntax highlighting for commands | ON | 保持ON | 强烈建议 |
| Open completions menu as you type | OFF | 保持OFF | 建议 |
| Suggest corrected commands | ON | 保持ON | 强烈建议 |
| Expand aliases as you type | OFF | 保持OFF | 建议 |
| Middle-click to paste | ON | 保持ON | 建议 |
| Show autosuggestion keybinding hint | ON | 保持ON | 建议 |
| Show autosuggestion ignore button | OFF | 保持OFF | 建议 |
| Enable '@' context menu in terminal mode | ON | 保持ON | 强烈建议 |
| Outline codebase symbols for '@' context menu | ON | 保持ON | 强烈建议 |
| Show terminal input message line | ON | 保持ON | 建议 |
| Tab key behavior | User defined | 保持 | 建议 |

### Terminal

| 设置项 | 当前值 | 建议操作 | 评级 |
|--------|--------|----------|------|
| Enable Mouse Reporting | ON | 保持ON | 建议 |
| Enable Scroll Reporting | ON | 保持ON | 建议 |
| Enable Focus Reporting | ON | 保持ON | 建议 |
| Use Audible Bell | OFF | 保持OFF | 建议 |
| Double-click smart selection | ON | 保持ON | 建议 |
| Copy on select | ON | 保持ON | 强烈建议 |
| New tab placement | After current tab | 保持 | 建议 |

### Notifications

| 设置项 | 当前值 | 建议操作 | 评级 |
|--------|--------|----------|------|
| Receive desktop notifications from Warp | OFF | 保持OFF | 建议 |
| Show in-app agent notifications | ON | 保持ON | 强烈建议 |
| Toast notifications stay visible for | 8 seconds | 保持 | 建议 |

### Workflows

| 设置项 | 当前值 | 建议操作 | 评级 |
|--------|--------|----------|------|
| Show Global Workflows in Command Search (ctrl-r) | OFF | 保持OFF | 建议 |

### System

| 设置项 | 当前值 | 建议操作 | 评级 |
|--------|--------|----------|------|
| Preferred graphics backend | Default | 保持 | 建议 |

---

## 第十三步：Warpify

截图：`Setting18.png`

| 设置项 | 当前值 | 建议操作 | 评级 |
|--------|--------|----------|------|
| Subshells | bash, zsh, fish supported | 保持 | 建议 |
| Added commands | 空 | 根据需要添加 | 建议 |
| Denylisted commands | 空 | 根据需要添加 | 建议 |

---

## 第十四步：GitHub Personal Access Token

截图：`屏幕截图 2026-05-04 003617.png`

**评级：建议**（如需使用 GitHub MCP）

1. 访问 https://github.com/settings/tokens
2. 点击 **Generate new token** → 选择 **Tokens (classic)**
3. 设置 token 名称和权限
4. 复制 token 填入相关配置

---

## 重要配置汇总

### 建议修改

| 优先级 | 设置项 | 位置 | 操作 |
|--------|--------|------|------|
| 建议 | Sign up / 登录 | Account | 可选，登录后可用 AI 功能 |
| 建议 | Codebase indexing | Indexing and projects | 打开 ON |
| 建议 | chrome-devtools MCP | MCP Servers | 点击 + 添加 |
| 建议 | GitHub PAT | GitHub | 如需 GitHub MCP 则创建 |

### OpenCode Skills 列表

Skills 位于 `.opencode/skills/` 目录，每个 Skill 包含 `SKILL.md` 文件：

| Skill | 用途 | 使用场景 |
|-------|------|----------|
| `api-designer` | API 设计专家 | 设计 RESTful 接口、统一响应格式、错误处理 |
| `code-reviewer` | 代码审查专家 | 检查代码质量、安全漏洞、性能问题 |
| `debugger-assistant` | 调试助手 | 分析错误信息、堆栈跟踪，定位问题根因 |
| `doc-generator` | 文档生成器 | 自动生成和维护项目文档 |
| `git-workflow` | Git 工作流管理 | 分支策略、提交规范、PR 管理 |
| `performance-optimizer` | 性能优化器 | 性能分析和优化建议 |
| `refactor-planner` | 重构规划师 | 识别代码异味，制定安全重构计划 |
| `security-auditor` | 安全审计员 | 安全审计和漏洞检测 |
| `skill-creator` | Skill 创建器 | 创建新的 OpenCode Skills |
| `test-generator` | 测试生成器 | 自动生成单元测试、集成测试 |
| `ui-ux-pro-max` | UI/UX 设计师 | 专业设计建议和实现方案 |

**使用方式**：
```
/api-designer 设计视频解析API的接口规范
/code-reviewer 审查 @src/api/parse.ts 的代码质量
/debugger-assistant 分析这个错误：TypeError: fetch failed
/test-generator 为 @src/lib/parsers/douyin.ts 生成单元测试
```

### 保持默认即可（官方推荐）

大多数设置保持官方默认值即可，以下为关键默认值参考：

| 设置项 | 官方默认值 | 说明 |
|--------|------------|------|
| Input type | Warp (pinned_to_bottom) | Warp 特色输入模式 |
| Copy on select | true | 选中即复制 |
| Syntax highlighting | true | 命令语法高亮 |
| Error underlining | true | 命令错误下划线 |
| Suggest corrected commands | true | 命令纠错建议 |
| Autocomplete symbols | true | 括号引号自动补全 |
| Maximum grid size | 50000 | 最大行数 |
| restore_session | true | 启动时恢复会话 |
| login_item | true | 开机自启 |

---

## 信息来源

- 官方文档：https://docs.warp.dev/terminal/settings/all-settings/
- 安装指南：https://docs.warp.dev/getting-started/quickstart/installation-and-setup/
- Agent 平台：https://docs.warp.dev/agent-platform/
- GitHub Issues：https://github.com/warpdotdev/Warp/issues

---

## 踩坑记录：chrome-devtools-mcp 配置失败的教训

### 问题现象

配置 chrome-devtools-mcp 后，OpenCode 无法正常启动或工具注册失败。

### 根本原因

1. **OpenCode 对 MCP 可选方法的处理过于严格**
   - OpenCode 会尝试调用 `prompts/list`、`resources/list` 等可选方法
   - chrome-devtools-mcp 不支持这些方法，导致注册失败
   - 这是 OpenCode 的已知问题（Issue #24985）

2. **JSON 配置格式错误**
   - 多次手动修改配置时产生累积错误（多余逗号、括号不匹配）
   - 错误的 JSON 会导致 OpenCode 无法启动

### 解决方案

使用 `--slim --no-optional-methods` 参数禁用可选方法：

```json
{
  "mcp": {
    "chrome-devtools": {
      "type": "local",
      "command": ["npx", "-y", "chrome-devtools-mcp@latest", "--slim", "--no-optional-methods"],
      "timeout": 30000,
      "enabled": true
    }
  }
}
```

### 教训总结

| 错误类型 | 正确做法 |
|----------|----------|
| 缺少关键参数 | 必须添加 `--slim --no-optional-methods` |
| JSON 格式错误 | 修改前备份，使用 JSON 验证工具 |
| 只改项目配置 | 同时检查全局配置 `C:\Users\{user}\.config\opencode\opencode.json` |
| 不验证参数 | 先用 `npx -y chrome-devtools-mcp@latest --help` 验证参数是否支持 |

### 为什么我们花了这么久？

1. **缺乏系统性排查**：只关注项目配置，忽略了全局配置文件
2. **没有验证参数**：直接假设参数存在，没有先验证
3. **没有备份配置**：多次修改导致配置损坏
4. **没有查阅官方文档**：依赖猜测而非官方文档

### 为什么 Grok 能找到解决方案？

1. **系统性分析**：同时检查项目配置和全局配置
2. **参数验证**：确认 `--slim --no-optional-methods` 参数存在
3. **问题定位准确**：准确识别 OpenIssue #24985 的问题
4. **提供完整方案**：给出完整的配置文件，而不是片段

### 学习建议

1. **修改配置前必须备份**
2. **使用 JSON 验证工具检查格式**
3. **先验证参数是否存在**
4. **同时检查项目配置和全局配置**
5. **查阅官方文档和 GitHub Issues**

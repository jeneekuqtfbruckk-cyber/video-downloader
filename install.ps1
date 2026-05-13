# 安装脚本 - Warp + OpenCode + MiMo 配置工具
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Warp + OpenCode + MiMo 安装脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "请以管理员身份运行此脚本！" -ForegroundColor Red
    exit 1
}

# 1. 安装 Node.js
Write-Host "`n[1/4] 检查 Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js 已安装: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  → 安装 Node.js LTS..." -ForegroundColor Yellow
    winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
    Write-Host "  ✓ Node.js 安装完成" -ForegroundColor Green
}

# 2. 安装 Warp
Write-Host "`n[2/4] 检查 Warp..." -ForegroundColor Yellow
if (Get-Command warp -ErrorAction SilentlyContinue) {
    Write-Host "  ✓ Warp 已安装" -ForegroundColor Green
} else {
    Write-Host "  → 安装 Warp..." -ForegroundColor Yellow
    winget install Warp.Warp --accept-package-agreements --accept-source-agreements
    Write-Host "  ✓ Warp 安装完成（需要重启终端）" -ForegroundColor Green
}

# 3. 安装 OpenCode
Write-Host "`n[3/4] 检查 OpenCode..." -ForegroundColor Yellow
if (Get-Command opencode -ErrorAction SilentlyContinue) {
    $ocVersion = opencode --version
    Write-Host "  ✓ OpenCode 已安装: $ocVersion" -ForegroundColor Green
} else {
    Write-Host "  → 安装 OpenCode..." -ForegroundColor Yellow
    npm i -g opencode-ai@latest
    Write-Host "  ✓ OpenCode 安装完成" -ForegroundColor Green
}

# 4. 验证
Write-Host "`n[4/4] 验证安装..." -ForegroundColor Yellow
Write-Host "`n已安装版本:" -ForegroundColor Cyan
Write-Host "  Node.js: $(node --version)" -ForegroundColor White
Write-Host "  npm:     $(npm --version)" -ForegroundColor White
Write-Host "  OpenCode: $(opencode --version)" -ForegroundColor White

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  安装完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`n下一步:" -ForegroundColor Yellow
Write-Host "  1. 重启终端" -ForegroundColor White
Write-Host "  2. 访问 https://platform.xiaomimimo.com 获取 API Key" -ForegroundColor White
Write-Host "  3. 运行 opencode 并执行 /connect 配置 API" -ForegroundColor White
Write-Host "`n"

# 测试脚本 - 在新 Warp Tab 中运行
$urls = @(
    @{name="YouTube"; url="https://youtube.com/shorts/0f2iviKH5qo?si=kUaCrR_UMwd192Dl"},
    @{name="小红书"; url="https://www.xiaohongshu.com/discovery/item/646b5c61000000001300f5d0"},
    @{name="抖音"; url="https://v.douyin.com/6502g45160g/"},
    @{name="微博"; url="https://weibo.com/1551631093/QEoPP2HFm"},
    @{name="B站"; url="https://www.bilibili.com/video/BV1BaR1B8ETM/"}
)

Write-Host "========== 视频解析测试 ==========" -ForegroundColor Cyan

foreach ($item in $urls) {
    Write-Host "`n[$($item.name)]" -ForegroundColor Yellow
    try {
        $body = @{url=$item.url} | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "http://localhost:3001/api/parse" -Method POST -ContentType "application/json" -Body $body -ErrorAction Stop
        Write-Host "  状态: 成功" -ForegroundColor Green
        Write-Host "  标题: $($result.data.title.Substring(0, [Math]::Min(50, $result.data.title.Length)))"
        Write-Host "  平台: $($result.data.platform)"
    } catch {
        $errorBody = $_.ErrorDetails.Message
        if ($errorBody) {
            $errorData = $errorBody | ConvertFrom-Json
            Write-Host "  状态: 失败" -ForegroundColor Red
            Write-Host "  原因: $($errorData.error.message)"
        } else {
            Write-Host "  错误: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n========== 测试完成 ==========" -ForegroundColor Cyan

import { NextRequest, NextResponse } from 'next/server'

// 简单的内存速率限制器
const rateLimit = new Map<string, { count: number; resetTime: number }>()

const WINDOW_MS = 60 * 1000 // 1 分钟
const MAX_REQUESTS = 10 // 每个窗口最大请求数

export function checkRateLimit(ip: string): { success: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimit.get(ip)

  if (!record || now > record.resetTime) {
    // 新窗口或窗口已过期
    rateLimit.set(ip, { count: 1, resetTime: now + WINDOW_MS })
    return { success: true, remaining: MAX_REQUESTS - 1 }
  }

  if (record.count >= MAX_REQUESTS) {
    // 超过限制
    return { success: false, remaining: 0 }
  }

  // 增加计数
  record.count++
  return { success: true, remaining: MAX_REQUESTS - record.count }
}

// 定期清理过期记录
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimit.entries()) {
    if (now > value.resetTime) {
      rateLimit.delete(key)
    }
  }
}, 60 * 1000) // 每分钟清理一次

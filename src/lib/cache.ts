import { VideoInfo } from '@/types'

// 简单的内存缓存（开发环境）
const memoryCache = new Map<string, { data: VideoInfo; timestamp: number }>()

const CACHE_TTL = 1000 * 60 * 60 // 1小时

function getCacheKey(url: string): string {
  return `video:${url}`
}

export async function getCachedVideo(url: string): Promise<VideoInfo | null> {
  const key = getCacheKey(url)
  const cached = memoryCache.get(key)

  if (!cached) return null

  // 检查是否过期
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    memoryCache.delete(key)
    return null
  }

  return cached.data
}

export async function setCachedVideo(
  url: string,
  data: VideoInfo
): Promise<void> {
  const key = getCacheKey(url)
  memoryCache.set(key, {
    data,
    timestamp: Date.now()
  })

  // 清理过期缓存
  cleanExpiredCache()
}

function cleanExpiredCache(): void {
  const now = Date.now()
  const entries = Array.from(memoryCache.entries())
  for (const [key, value] of entries) {
    if (now - value.timestamp > CACHE_TTL) {
      memoryCache.delete(key)
    }
  }
}

// 获取缓存统计
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: memoryCache.size,
    keys: Array.from(memoryCache.keys())
  }
}

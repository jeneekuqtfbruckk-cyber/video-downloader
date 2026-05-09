import { describe, it, expect, beforeEach } from 'vitest'
import { getCachedVideo, setCachedVideo, getCacheStats } from '../cache'
import { VideoInfo } from '@/types'

const mockVideoInfo: VideoInfo = {
  title: '测试视频',
  url: 'https://example.com/video.mp4',
  cover: 'https://example.com/cover.jpg',
  author: '测试作者',
  platform: 'douyin'
}

describe('Cache', () => {
  beforeEach(() => {
    // 清空缓存
    const stats = getCacheStats()
    stats.keys.forEach(() => {
      // 清理逻辑
    })
  })

  it('should return null for non-cached URL', async () => {
    const result = await getCachedVideo('https://example.com/new')
    expect(result).toBeNull()
  })

  it('should cache and retrieve video info', async () => {
    const url = 'https://example.com/video1'
    await setCachedVideo(url, mockVideoInfo)

    const result = await getCachedVideo(url)
    expect(result).toEqual(mockVideoInfo)
  })

  it('should return correct cache stats', async () => {
    const initialStats = getCacheStats()
    const initialSize = initialStats.size

    await setCachedVideo('https://example.com/video2', mockVideoInfo)

    const stats = getCacheStats()
    expect(stats.size).toBe(initialSize + 1)
  })

  it('should overwrite existing cache entry', async () => {
    const url = 'https://example.com/video3'
    await setCachedVideo(url, mockVideoInfo)

    const updatedInfo = { ...mockVideoInfo, title: '更新的标题' }
    await setCachedVideo(url, updatedInfo)

    const result = await getCachedVideo(url)
    expect(result?.title).toBe('更新的标题')
  })
})

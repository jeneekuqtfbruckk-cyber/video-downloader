import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, GET } from '../route'
import { NextRequest } from 'next/server'

// Mock the parsers
vi.mock('@/lib/parsers', () => ({
  parseVideo: vi.fn(),
  detectPlatform: vi.fn()
}))

// Mock the cache
vi.mock('@/lib/cache', () => ({
  getCachedVideo: vi.fn(),
  setCachedVideo: vi.fn()
}))

import { parseVideo, detectPlatform } from '@/lib/parsers'
import { getCachedVideo, setCachedVideo } from '@/lib/cache'

describe('POST /api/parse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 for empty URL', async () => {
    const request = new NextRequest('http://localhost:3000/api/parse', {
      method: 'POST',
      body: JSON.stringify({ url: '' })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('INVALID_PARAMS')
  })

  it('should return 400 for empty body', async () => {
    const request = new NextRequest('http://localhost:3000/api/parse', {
      method: 'POST',
      body: JSON.stringify({})
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('should return 400 for unsupported platform', async () => {
    vi.mocked(detectPlatform).mockReturnValue('unknown')

    const request = new NextRequest('http://localhost:3000/api/parse', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com/video' })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('UNSUPPORTED_PLATFORM')
  })

  it('should return cached video if available', async () => {
    vi.mocked(detectPlatform).mockReturnValue('douyin')
    vi.mocked(getCachedVideo).mockResolvedValue({
      title: 'Cached Video',
      url: 'https://example.com/cached.mp4',
      platform: 'douyin'
    })

    const request = new NextRequest('http://localhost:3000/api/parse', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://www.douyin.com/video/123' })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.title).toBe('Cached Video')
    expect(data.meta.fromCache).toBe(true)
  })

  it('should parse video and return result', async () => {
    vi.mocked(detectPlatform).mockReturnValue('douyin')
    vi.mocked(getCachedVideo).mockResolvedValue(null)
    vi.mocked(parseVideo).mockResolvedValue({
      title: 'Test Video',
      url: 'https://example.com/video.mp4',
      platform: 'douyin'
    })
    vi.mocked(setCachedVideo).mockResolvedValue(undefined)

    const request = new NextRequest('http://localhost:3000/api/parse', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://www.douyin.com/video/123' })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.title).toBe('Test Video')
    expect(data.meta.fromCache).toBe(false)
    expect(setCachedVideo).toHaveBeenCalled()
  })

  it('should handle parse errors', async () => {
    vi.mocked(detectPlatform).mockReturnValue('douyin')
    vi.mocked(getCachedVideo).mockResolvedValue(null)
    vi.mocked(parseVideo).mockRejectedValue(new Error('解析失败'))

    const request = new NextRequest('http://localhost:3000/api/parse', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://www.douyin.com/video/123' })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error.message).toContain('解析失败')
  })
})

describe('GET /api/parse', () => {
  it('should return 405 with usage hint', async () => {
    const request = new NextRequest('http://localhost:3000/api/parse', {
      method: 'GET'
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(405)
    expect(data.success).toBe(false)
    expect(data.error.message).toContain('POST')
  })
})

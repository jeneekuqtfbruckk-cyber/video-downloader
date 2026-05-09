import { describe, it, expect } from 'vitest'
import { detectPlatform } from '../index'

describe('detectPlatform', () => {
  it('should detect douyin URLs', () => {
    expect(detectPlatform('https://www.douyin.com/video/123')).toBe('douyin')
    expect(detectPlatform('https://v.douyin.com/abc123')).toBe('douyin')
    expect(detectPlatform('https://www.iesdouyin.com/share/video/123')).toBe(
      'douyin'
    )
  })

  it('should detect kuaishou URLs', () => {
    expect(detectPlatform('https://www.kuaishou.com/short-video/abc')).toBe(
      'kuaishou'
    )
    expect(detectPlatform('https://v.kuaishou.com/abc123')).toBe('kuaishou')
    expect(detectPlatform('https://www.gifshow.com/abc')).toBe('kuaishou')
  })

  it('should detect bilibili URLs', () => {
    expect(
      detectPlatform('https://www.bilibili.com/video/BV1xx411c7mD')
    ).toBe('bilibili')
    expect(detectPlatform('https://www.bilibili.com/video/av12345')).toBe(
      'bilibili'
    )
    expect(detectPlatform('https://b23.tv/abc123')).toBe('bilibili')
  })

  it('should detect youtube URLs', () => {
    expect(
      detectPlatform('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    ).toBe('youtube')
    expect(detectPlatform('https://youtu.be/dQw4w9WgXcQ')).toBe('youtube')
    expect(
      detectPlatform('https://www.youtube.com/embed/dQw4w9WgXcQ')
    ).toBe('youtube')
    expect(
      detectPlatform('https://www.youtube.com/shorts/dQw4w9WgXcQ')
    ).toBe('youtube')
  })

  it('should detect xiaohongshu URLs', () => {
    expect(
      detectPlatform('https://www.xiaohongshu.com/explore/abc123')
    ).toBe('xiaohongshu')
    expect(
      detectPlatform('https://www.xiaohongshu.com/discovery/item/abc123')
    ).toBe('xiaohongshu')
    expect(detectPlatform('https://xhslink.com/abc123')).toBe('xiaohongshu')
  })

  it('should detect weibo URLs', () => {
    expect(
      detectPlatform('https://weibo.com/tv/show/1034:abc123')
    ).toBe('weibo')
    expect(
      detectPlatform('https://weibo.com/1234567890/abc123')
    ).toBe('weibo')
    expect(
      detectPlatform('https://m.weibo.cn/status/abc123')
    ).toBe('weibo')
  })

  it('should return unknown for unsupported URLs', () => {
    expect(detectPlatform('https://www.example.com/video')).toBe('unknown')
    expect(detectPlatform('https://google.com')).toBe('unknown')
  })
})

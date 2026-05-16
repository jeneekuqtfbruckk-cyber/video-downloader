import { VideoInfo, Platform } from '@/types'

// snapwc.com 支持的平台映射
const PLATFORM_MAP: Record<string, Platform> = {
  'douyin': 'douyin',
  'kuaishou': 'kuaishou',
  'bilibili': 'bilibili',
  'youtube': 'youtube',
  'xiaohongshu': 'xiaohongshu',
  'weibo': 'weibo'
}

// 检测平台
function detectPlatform(url: string): string {
  if (url.includes('douyin.com') || url.includes('iesdouyin.com')) return 'douyin'
  if (url.includes('kuaishou.com') || url.includes('gifshow.com')) return 'kuaishou'
  if (url.includes('bilibili.com') || url.includes('b23.tv')) return 'bilibili'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('xiaohongshu.com') || url.includes('xhslink.com')) return 'xiaohongshu'
  if (url.includes('weibo.com') || url.includes('weibo.cn')) return 'weibo'
  if (url.includes('tiktok.com')) return 'douyin'
  return 'unknown'
}

// 使用 snapwc.com 解析视频
export async function parseViaSnapwc(url: string): Promise<VideoInfo> {
  const platform = detectPlatform(url)
  
  // 调用 snapwc.com 的 API
  const response = await fetch('https://api.snapwc.com/api.parser/parse', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Locale': 'zh-CN'
    },
    body: JSON.stringify({ url })
  })
  
  if (!response.ok) {
    throw new Error(`snapwc.com API 返回 ${response.status}`)
  }
  
  const data = await response.json()
  
  // 检查是否需要验证码
  if (data.captcha_required) {
    throw new Error('需要验证码')
  }
  
  // 检查是否有结果
  if (!data.results || data.results.length === 0) {
    throw new Error('没有找到视频')
  }
  
  // 查找最佳视频结果
  const videoResult = data.results.find((r: any) => 
    r.type === 'video' || r.type === 'video+audio' || r.type === 'muxed'
  ) || data.results[0]
  
  if (!videoResult || !videoResult.url) {
    throw new Error('没有找到视频下载链接')
  }
  
  return {
    title: data.title || '未知视频',
    url: videoResult.url,
    cover: data.cover || '',
    author: '',
    platform: PLATFORM_MAP[platform] || 'unknown'
  }
}

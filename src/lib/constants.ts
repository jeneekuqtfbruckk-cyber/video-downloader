export type Platform = 'douyin' | 'kuaishou' | 'bilibili' | 'youtube' | 'xiaohongshu' | 'weibo'

export const PLATFORM_INFO: Record<Platform, { name: string; icon: string; color: string }> = {
  douyin: { name: '抖音', icon: '🎵', color: 'bg-pink-500' },
  kuaishou: { name: '快手', icon: '🎬', color: 'bg-orange-500' },
  bilibili: { name: 'B站', icon: '📺', color: 'bg-blue-500' },
  youtube: { name: 'YouTube', icon: '▶️', color: 'bg-red-500' },
  xiaohongshu: { name: '小红书', icon: '📕', color: 'bg-red-400' },
  weibo: { name: '微博', icon: '💬', color: 'bg-yellow-500' }
}

export function detectPlatform(url: string): Platform | null {
  if (url.includes('douyin.com') || url.includes('iesdouyin.com')) return 'douyin'
  if (url.includes('kuaishou.com') || url.includes('gifshow.com')) return 'kuaishou'
  if (url.includes('bilibili.com') || url.includes('b23.tv')) return 'bilibili'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('xiaohongshu.com') || url.includes('xhslink.com')) return 'xiaohongshu'
  if (url.includes('weibo.com') || url.includes('weibo.cn')) return 'weibo'
  return null
}

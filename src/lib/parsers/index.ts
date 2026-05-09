import { VideoInfo, Platform, Parser } from '@/types'
import { parseDouyin } from './douyin'
import { parseKuaishou } from './kuaishou'
import { parseBilibili } from './bilibili'
import { parseYoutube } from './youtube'
import { parseXiaohongshu } from './xiaohongshu'
import { parseWeibo } from './weibo'

const parsers: Parser[] = [
  parseDouyin,
  parseKuaishou,
  parseBilibili,
  parseYoutube,
  parseXiaohongshu,
  parseWeibo
]

export function detectPlatform(url: string): Platform {
  const platformPatterns: Record<Platform, RegExp[]> = {
    douyin: [
      /douyin\.com/,
      /iesdouyin\.com/,
      /v\.douyin\.com/
    ],
    kuaishou: [
      /kuaishou\.com/,
      /gifshow\.com/,
      /v\.kuaishou\.com/
    ],
    bilibili: [
      /bilibili\.com/,
      /b23\.tv/
    ],
    youtube: [
      /youtube\.com/,
      /youtu\.be/
    ],
    xiaohongshu: [
      /xiaohongshu\.com/,
      /xhslink\.com/
    ],
    weibo: [
      /weibo\.com/,
      /weibo\.cn/
    ],
    unknown: []
  }

  for (const [platform, patterns] of Object.entries(platformPatterns)) {
    if (patterns.some((pattern) => pattern.test(url))) {
      return platform as Platform
    }
  }

  return 'unknown'
}

export async function parseVideo(
  url: string,
  platform?: Platform
): Promise<VideoInfo> {
  const detectedPlatform = platform || detectPlatform(url)

  if (detectedPlatform === 'unknown') {
    throw new Error('不支持的视频平台')
  }

  const parser = parsers.find((p) => p.name === detectedPlatform)

  if (!parser) {
    throw new Error(`暂不支持 ${detectedPlatform} 平台`)
  }

  try {
    return await parser.parse(url)
  } catch (error) {
    const message = error instanceof Error ? error.message : '解析失败'
    throw new Error(`解析失败: ${message}`)
  }
}

export { parseDouyin, parseKuaishou, parseBilibili, parseYoutube, parseXiaohongshu, parseWeibo }

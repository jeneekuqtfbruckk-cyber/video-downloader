import axios from 'axios'
import { VideoInfo, Parser } from '@/types'

const PATTERNS = [
  /kuaishou\.com\/short-video\/(\w+)/,
  /v\.kuaishou\.com\/(\w+)/,
  /gifshow\.com\/(\w+)/
]

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  'Referer': 'https://v.kuaishou.com/'
}

async function resolveUrl(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: HEADERS,
      maxRedirects: 0,
      validateStatus: (status) => status === 302 || status === 301
    })
    return response.headers.location || url
  } catch {
    return url
  }
}

async function extractVideoId(url: string): Promise<string> {
  // 先尝试直接从URL提取
  for (const pattern of PATTERNS) {
    const match = url.match(pattern)
    if (match && match[1]) return match[1]
  }

  // 从路径中提取
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(Boolean)
    if (pathParts.length > 0) return pathParts[pathParts.length - 1]
  } catch {
    // 继续
  }

  // 如果直接匹配失败，尝试解析重定向
  const resolvedUrl = await resolveUrl(url)

  for (const pattern of PATTERNS) {
    const match = resolvedUrl.match(pattern)
    if (match && match[1]) return match[1]
  }

  // 从路径中提取
  try {
    const urlObj = new URL(resolvedUrl)
    const pathParts = urlObj.pathname.split('/').filter(Boolean)
    if (pathParts.length > 0) return pathParts[pathParts.length - 1]
  } catch {
    // 继续
  }

  throw new Error('无法提取视频ID')
}

async function fetchVideoInfo(videoId: string, url: string): Promise<VideoInfo> {
  const response = await axios.get(url, {
    headers: HEADERS,
    timeout: 10000
  })

  const html = response.data

  // 提取 window.__APOLLO_STATE__
  const apolloMatch = html.match(
    /window\.__APOLLO_STATE__\s*=\s*(\{[\s\S]*?\});/
  )

  if (!apolloMatch) {
    throw new Error('无法解析页面数据')
  }

  let apolloData: any
  try {
    apolloData = JSON.parse(apolloMatch[1])
  } catch {
    throw new Error('JSON解析失败')
  }

  const client = apolloData?.defaultClient
  if (!client) {
    throw new Error('无法获取客户端数据')
  }

  // 查找视频详情
  let photoData: any = null
  for (const [key, value] of Object.entries(client)) {
    if (
      typeof value === 'object' &&
      value !== null &&
      (value as any).__typename === 'VisionVideoDetailPhoto'
    ) {
      photoData = value
      break
    }
  }

  if (!photoData) {
    throw new Error('无法提取视频信息')
  }

  // 选择最佳视频源
  const candidates: Array<{ codec: string; url: string; priority: number }> = []

  if (photoData.photoH265Url) {
    candidates.push({ codec: 'hevc', url: photoData.photoH265Url, priority: 2 })
  }
  if (photoData.photoUrl) {
    candidates.push({ codec: 'h264', url: photoData.photoUrl, priority: 1 })
  }

  // 从videoResource中提取
  const videoResource = photoData.videoResource
  if (videoResource?.json) {
    const codecs = ['hevc', 'h264']
    for (const codec of codecs) {
      const codecData = videoResource.json[codec]
      if (codecData?.adaptationSet) {
        for (const adaptation of codecData.adaptationSet) {
          if (adaptation?.representation) {
            for (const rep of adaptation.representation) {
              if (rep.url) {
                candidates.push({
                  codec,
                  url: rep.url,
                  priority: codec === 'hevc' ? 2 : 1
                })
              }
            }
          }
        }
      }
    }
  }

  // 按优先级排序（hevc > h264）
  candidates.sort((a, b) => b.priority - a.priority)

  if (candidates.length === 0 || !candidates[0].url) {
    throw new Error('无法获取视频下载地址')
  }

  // 提取封面
  let coverUrl = ''
  const searchForCover = (obj: any): string => {
    if (typeof obj !== 'object' || obj === null) return ''
    if (obj.coverUrl && typeof obj.coverUrl === 'string') return obj.coverUrl
    for (const value of Object.values(obj)) {
      const result = searchForCover(value)
      if (result) return result
    }
    return ''
  }
  coverUrl = searchForCover(apolloData)

  return {
    title: photoData.caption || '快手视频',
    url: candidates[0].url,
    cover: coverUrl,
    author: photoData.userName || '',
    platform: 'kuaishou'
  }
}

export const parseKuaishou: Parser = {
  name: 'kuaishou',
  patterns: PATTERNS,
  parse: async (url: string) => {
    const videoId = await extractVideoId(url)
    return fetchVideoInfo(videoId, url)
  }
}

import axios from 'axios'
import { VideoInfo, Parser } from '@/types'

const PATTERNS = [
  /kuaishou\.com\/short-video\/(\w+)/,
  /v\.kuaishou\.com\/(\w+)/,
  /gifshow\.com\/(\w+)/,
  /kuaishou\.com\/fw\/photo\/(\w+)/
]

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  'Referer': 'https://www.kuaishou.com/',
  'Cookie': 'did=web_d0a1b2c3d4e5f6'
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
  // 使用 GraphQL API 获取视频数据
  const apiUrl = 'https://www.kuaishou.com/graphql'
  
  const query = {
    operationName: 'visionVideoDetailPhoto',
    variables: {
      photoId: videoId,
      page: 'detail'
    },
    query: `query visionVideoDetailPhoto($photoId: String, $type: String, $page: String) {
      visionVideoDetailPhoto(photoId: $photoId, type: $type, page: $page) {
        photo {
          id
          duration
          caption
          coverUrl
          photoUrl
          coverUrls
          photoH265Url
          manifest
          manifestH265
          videoResource
          timestamp
        }
        author {
          id
          name
          headerUrl
          following
        }
      }
    }`
  }
  
  const response = await axios.post(apiUrl, query, {
    headers: {
      ...HEADERS,
      'Content-Type': 'application/json',
      'Referer': `https://www.kuaishou.com/short-video/${videoId}`
    },
    timeout: 15000
  })
  
  const data = response.data
  
  if (!data?.data?.visionVideoDetailPhoto?.photo) {
    throw new Error('无法获取视频信息')
  }
  
  const photo = data.data.visionVideoDetailPhoto.photo
  const author = data.data.visionVideoDetailPhoto.author
  
  // 选择最佳视频源
  const candidates: Array<{ codec: string; url: string; priority: number }> = []
  
  if (photo.photoH265Url) {
    candidates.push({ codec: 'hevc', url: photo.photoH265Url, priority: 2 })
  }
  if (photo.photoUrl) {
    candidates.push({ codec: 'h264', url: photo.photoUrl, priority: 1 })
  }
  
  // 从 videoResource 中提取
  if (photo.videoResource?.json) {
    const codecs = ['hevc', 'h264']
    for (const codec of codecs) {
      const codecData = photo.videoResource.json[codec]
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
  
  return {
    title: photo.caption || '快手视频',
    url: candidates[0].url,
    cover: photo.coverUrl || '',
    author: author?.name || '',
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

import axios from 'axios'
import { VideoInfo, Parser } from '@/types'
import { fetchWithBrowser } from '@/lib/browser'

const PATTERNS = [
  /kuaishou\.com\/short-video\/(\w+)/,
  /v\.kuaishou\.com\/(\w+)/,
  /gifshow\.com\/(\w+)/,
  /kuaishou\.com\/fw\/photo\/(\w+)/
]

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  'Referer': 'https://www.kuaishou.com/'
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
  for (const pattern of PATTERNS) {
    const match = url.match(pattern)
    if (match && match[1]) return match[1]
  }

  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(Boolean)
    if (pathParts.length > 0) return pathParts[pathParts.length - 1]
  } catch {
    // 继续
  }

  const resolvedUrl = await resolveUrl(url)

  for (const pattern of PATTERNS) {
    const match = resolvedUrl.match(pattern)
    if (match && match[1]) return match[1]
  }

  try {
    const urlObj = new URL(resolvedUrl)
    const pathParts = urlObj.pathname.split('/').filter(Boolean)
    if (pathParts.length > 0) return pathParts[pathParts.length - 1]
  } catch {
    // 继续
  }

  throw new Error('无法提取视频ID')
}

function extractVideoFromData(data: any): VideoInfo {
  const photo = data?.data?.visionVideoDetail?.photo
  const author = data?.data?.visionVideoDetail?.author

  if (!photo) {
    throw new Error('无法获取视频信息')
  }

  const candidates: Array<{ codec: string; url: string; priority: number }> = []

  if (photo.photoH265Url) {
    candidates.push({ codec: 'hevc', url: photo.photoH265Url, priority: 2 })
  }
  if (photo.photoUrl) {
    candidates.push({ codec: 'h264', url: photo.photoUrl, priority: 1 })
  }

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

async function fetchViaHttp(videoId: string): Promise<any> {
  const apiUrl = 'https://www.kuaishou.com/graphql'

  const query = {
    operationName: 'visionVideoDetail',
    variables: { photoId: videoId, page: 'detail' },
    query: `query visionVideoDetail($photoId: String, $type: String, $page: String) {
      visionVideoDetail(photoId: $photoId, type: $type, page: $page) {
        photo {
          id duration caption coverUrl photoUrl coverUrls
          photoH265Url manifest manifestH265 videoResource timestamp
        }
        author { id name headerUrl following }
      }
    }`
  }

  const response = await axios.post(apiUrl, query, {
    headers: {
      ...HEADERS,
      'Content-Type': 'application/json',
      'Referer': `https://www.kuaishou.com/short-video/${videoId}`
    },
    timeout: 10000
  })

  return response.data
}

async function fetchViaBrowser(videoId: string): Promise<any> {
  const pageUrl = `https://www.kuaishou.com/short-video/${videoId}`
  const html = await fetchWithBrowser(pageUrl)

  // 从页面中提取 __APOLLO_STATE__
  const stateMatch = html.match(/window\.__APOLLO_STATE__\s*=\s*(\{[\s\S]*?\});/)
  if (!stateMatch) {
    throw new Error('浏览器方式也无法获取数据')
  }

  const apolloData = JSON.parse(stateMatch[1])
  const client = apolloData?.defaultClient
  if (!client) {
    throw new Error('无法获取客户端数据')
  }

  // 构造与 GraphQL 响应相同的格式
  let photo = null
  let author = null

  for (const [key, value] of Object.entries(client)) {
    if (typeof value === 'object' && value !== null) {
      if ((value as any).__typename === 'VisionVideoDetailPhoto') {
        photo = value
      }
      if ((value as any).__typename === 'VisionVideoDetailAuthor') {
        author = value
      }
    }
  }

  return {
    data: {
      visionVideoDetail: {
        photo,
        author
      }
    }
  }
}

async function fetchVideoInfo(videoId: string): Promise<VideoInfo> {
  let data: any

  try {
    // 先尝试 HTTP 方式
    data = await fetchViaHttp(videoId)
  } catch (httpError) {
    // 失败后尝试浏览器方式
    try {
      data = await fetchViaBrowser(videoId)
    } catch (browserError) {
      // 浏览器方式也失败，抛出原始 HTTP 错误
      throw new Error(`快手解析失败: HTTP 方式和浏览器方式均不可用`)
    }
  }

  return extractVideoFromData(data)
}

export const parseKuaishou: Parser = {
  name: 'kuaishou',
  patterns: PATTERNS,
  parse: async (url: string) => {
    const videoId = await extractVideoId(url)
    return fetchVideoInfo(videoId)
  }
}

import axios from 'axios'
import { VideoInfo, Parser } from '@/types'

const PATTERNS = [
  /douyin\.com\/video\/(\d+)/,
  /v\.douyin\.com\/(\w+)/,
  /iesdouyin\.com\/share\/video\/(\d+)/
]

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
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

  // 如果直接匹配失败，尝试解析重定向
  const resolvedUrl = await resolveUrl(url)

  for (const pattern of PATTERNS) {
    const match = resolvedUrl.match(pattern)
    if (match && match[1]) return match[1]
  }

  // 尝试从数字中提取
  const numMatch = resolvedUrl.match(/(\d{15,})/)
  if (numMatch) return numMatch[1]

  throw new Error('无法提取视频ID')
}

async function fetchVideoInfo(videoId: string): Promise<VideoInfo> {
  const pageUrl = `https://www.iesdouyin.com/share/video/${videoId}`

  const response = await axios.get(pageUrl, {
    headers: HEADERS,
    timeout: 10000
  })

  const html = response.data

  // 提取 window._ROUTER_DATA
  const routerDataMatch = html.match(
    /window\._ROUTER_DATA\s*=\s*(.*?)<\/script>/s
  )

  if (!routerDataMatch) {
    throw new Error('无法解析页面数据')
  }

  let rawData = routerDataMatch[1].trim().replace(/[;\s\n\r]+$/, '')

  // 确保是有效的JSON
  if (!rawData.startsWith('{')) {
    const jsonStart = rawData.indexOf('{')
    if (jsonStart !== -1) {
      rawData = rawData.slice(jsonStart).replace(/[;\s\n\r]+$/, '')
    }
  }

  let routerData: any
  try {
    routerData = JSON.parse(rawData)
  } catch {
    throw new Error('JSON解析失败')
  }

  // 提取视频详情
  const videoDetail =
    routerData?.loaderData?.['video_(id)/page']?.videoInfoRes?.item_list?.[0]

  if (!videoDetail) {
    throw new Error('无法提取视频信息')
  }

  const videoUri = videoDetail.video?.play_addr?.uri
  if (!videoUri) {
    throw new Error('无法获取视频地址')
  }

  // 构建无水印下载链接
  const downloadUrl = `http://www.iesdouyin.com/aweme/v1/play/?video_id=${videoUri}&ratio=1080p&line=0`

  return {
    title: videoDetail.desc || '抖音视频',
    url: downloadUrl,
    cover: videoDetail.video?.cover?.url_list?.[0] || '',
    author: videoDetail.author?.nickname || '',
    platform: 'douyin'
  }
}

export const parseDouyin: Parser = {
  name: 'douyin',
  patterns: PATTERNS,
  parse: async (url: string) => {
    const videoId = await extractVideoId(url)
    return fetchVideoInfo(videoId)
  }
}

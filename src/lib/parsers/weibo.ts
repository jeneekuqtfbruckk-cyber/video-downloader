import axios from 'axios'
import { VideoInfo, Parser } from '@/types'

const PATTERNS = [
  /weibo\.com\/tv\/show\/(\d+:\w+)/,
  /weibo\.com\/tv\/show\/(\w+)/,
  /weibo\.com\/(\d+)\/(\w+)/,
  /m\.weibo\.cn\/status\/(\w+)/,
  /m\.weibo\.cn\/detail\/(\w+)/,
  /weibo\.cn\/(\d+)\/(\w+)/,
  /weibo\.cn\/status\/(\w+)/
]

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Content-Type': 'application/x-www-form-urlencoded'
}

function extractVideoIdFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    // 优先从 fid 参数提取
    const fid = urlObj.searchParams.get('fid')
    if (fid) return fid
    // 从路径提取最后一段
    const pathParts = urlObj.pathname.split('/').filter(Boolean)
    if (pathParts.length > 0) return pathParts[pathParts.length - 1]
  } catch {
    // URL 解析失败，继续用正则
  }
  return ''
}

async function extractVideoId(url: string): Promise<string> {
  // 先尝试直接从URL提取
  const directId = extractVideoIdFromUrl(url)
  if (directId) return directId

  // 用正则匹配
  for (const pattern of PATTERNS) {
    const match = url.match(pattern)
    if (match) {
      return match[match.length - 1]
    }
  }

  // 尝试解析重定向
  try {
    const response = await axios.get(url, {
      headers: HEADERS,
      maxRedirects: 5,
      timeout: 10000,
      validateStatus: (status) => status < 400
    })
    const resolvedUrl = response.request?.res?.responseUrl || response.config?.url || url
    const resolvedId = extractVideoIdFromUrl(resolvedUrl)
    if (resolvedId) return resolvedId

    for (const pattern of PATTERNS) {
      const match = resolvedUrl.match(pattern)
      if (match) {
        return match[match.length - 1]
      }
    }
  } catch {
    // 重定向解析失败
  }

  throw new Error('无法提取视频ID')
}

function getResolutionScore(url: string): number {
  const match = url.match(/template=(\d+)x(\d+)/)
  if (match) {
    return parseInt(match[1]) * parseInt(match[2])
  }
  // 尝试从 key 中提取分辨率（如 1080P）
  const pMatch = url.match(/(\d+)P/i)
  if (pMatch) {
    return parseInt(pMatch[1])
  }
  return 0
}

function selectBestUrl(urls: Record<string, string>): string | null {
  if (!urls || Object.keys(urls).length === 0) return null

  const entries = Object.entries(urls)
  entries.sort((a, b) => getResolutionScore(b[1]) - getResolutionScore(a[1]))

  return entries[0][1]
}

async function fetchFromMWeibo(videoId: string): Promise<VideoInfo> {
  const apiUrl = `https://m.weibo.cn/statuses/show?id=${videoId}`

  const response = await axios.get(apiUrl, {
    headers: {
      ...HEADERS,
      'Referer': `https://m.weibo.cn/detail/${videoId}`,
      'X-Requested-With': 'XMLHttpRequest'
    },
    timeout: 10000
  })

  const data = response.data

  if (!data?.data?.page_info) {
    throw new Error('无法获取视频信息')
  }

  const status = data.data
  const pageInfo = status.page_info

  if (pageInfo.type !== 'video') {
    throw new Error('该微博不是视频类型')
  }

  // 优先从 urls 中选择最佳质量
  const videoUrl = selectBestUrl(pageInfo.urls) ||
    pageInfo.media_info?.stream_url

  if (!videoUrl) {
    throw new Error('无法获取视频地址')
  }

  // 提取标题：优先 title/page_title，否则从 text 中提取
  const title = pageInfo.title ||
    pageInfo.page_title ||
    status.text?.replace(/<[^>]+>/g, '').substring(0, 100) ||
    '微博视频'

  return {
    title,
    url: videoUrl,
    cover: pageInfo.page_pic?.url || '',
    author: status.user?.screen_name || '',
    platform: 'weibo'
  }
}

async function fetchFromH5Video(videoId: string, originalUrl: string): Promise<VideoInfo> {
  const apiUrl = 'https://h5.video.weibo.com/api/component'

  const response = await axios.post(
    apiUrl,
    `data=${encodeURIComponent(JSON.stringify({
      'Component_Play_Playinfo': { 'oid': videoId }
    }))}`,
    {
      params: { page: `/show/${videoId}` },
      headers: {
        ...HEADERS,
        'Referer': originalUrl
      },
      timeout: 10000
    }
  )

  const data = response.data

  if (!data?.data?.Component_Play_Playinfo) {
    throw new Error('无法获取视频信息')
  }

  const playInfo = data.data.Component_Play_Playinfo

  if (!playInfo.urls && !playInfo.stream_url) {
    throw new Error('无法获取视频地址')
  }

  // 选择最佳质量的 URL
  let videoUrl = selectBestUrl(playInfo.urls) || playInfo.stream_url

  if (!videoUrl) {
    throw new Error('无法获取视频地址')
  }

  // 补全协议头
  if (!videoUrl.startsWith('http')) {
    videoUrl = 'https:' + videoUrl
  }

  // 封面 URL 补全协议头
  let coverUrl = playInfo.cover_image || ''
  if (coverUrl && !coverUrl.startsWith('http')) {
    coverUrl = 'https:' + coverUrl
  }

  return {
    title: playInfo.title || '微博视频',
    url: videoUrl,
    cover: coverUrl,
    author: '',
    platform: 'weibo'
  }
}

async function fetchVideoInfo(videoId: string, originalUrl: string): Promise<VideoInfo> {
  // 如果 videoId 包含 ':'，使用 H5 视频 API
  if (videoId.includes(':')) {
    return fetchFromH5Video(videoId, originalUrl)
  }
  // 否则使用移动端 API
  return fetchFromMWeibo(videoId)
}

export const parseWeibo: Parser = {
  name: 'weibo',
  patterns: PATTERNS,
  parse: async (url: string) => {
    const videoId = await extractVideoId(url)
    return fetchVideoInfo(videoId, url)
  }
}

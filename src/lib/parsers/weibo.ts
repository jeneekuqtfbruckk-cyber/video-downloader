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

async function resolveUrl(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: HEADERS,
      maxRedirects: 5,
      timeout: 10000
    })
    return response.request?.res?.responseUrl || response.config?.url || url
  } catch {
    return url
  }
}

async function extractVideoId(url: string): Promise<string> {
  // 先尝试直接从URL提取
  for (const pattern of PATTERNS) {
    const match = url.match(pattern)
    if (match) {
      return match[match.length - 1]
    }
  }

  // 如果直接匹配失败，尝试解析重定向
  const resolvedUrl = await resolveUrl(url)

  for (const pattern of PATTERNS) {
    const match = resolvedUrl.match(pattern)
    if (match) {
      return match[match.length - 1]
    }
  }

  throw new Error('无法提取视频ID')
}

// 方式1: 使用移动端API
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

  if (!data || !data.data) {
    throw new Error('无法获取视频信息')
  }

  const status = data.data
  const pageInfo = status.page_info

  if (!pageInfo || pageInfo.type !== 'video') {
    throw new Error('该微博不是视频类型')
  }

  // 获取视频地址 - 优先选择高清
  const urls = pageInfo.urls || {}
  const sortedUrls = Object.entries(urls)
    .map(([key, value]) => {
      const match = key.match(/(\d+)P/)
      const resolution = match ? parseInt(match[1]) : 0
      return { key, url: value as string, resolution }
    })
    .sort((a, b) => b.resolution - a.resolution)

  const videoUrl = sortedUrls.length > 0
    ? sortedUrls[0].url
    : pageInfo.media_info?.stream_url

  if (!videoUrl) {
    throw new Error('无法获取视频地址')
  }

  return {
    title: status.text?.replace(/<[^>]+>/g, '').substring(0, 100) || '微博视频',
    url: videoUrl,
    cover: pageInfo.page_pic?.url || '',
    author: status.user?.screen_name || '',
    platform: 'weibo'
  }
}

// 方式2: 使用H5视频API
async function fetchFromH5Video(videoId: string, url: string): Promise<VideoInfo> {
  const apiUrl = 'https://h5.video.weibo.com/api/component'

  const response = await axios.post(apiUrl,
    `data=${encodeURIComponent(JSON.stringify({
      'Component_Play_Playinfo': { 'oid': videoId }
    }))}`,
    {
      params: { page: `/show/${videoId}` },
      headers: {
        ...HEADERS,
        'Referer': url
      },
      timeout: 10000
    }
  )

  const data = response.data

  if (!data || !data.data) {
    throw new Error('无法获取视频信息')
  }

  const playInfo = data.data.Component_Play_Playinfo

  if (!playInfo || !playInfo.urls) {
    throw new Error('无法获取视频信息')
  }

  // 获取视频地址 - 优先选择高清
  const urls = playInfo.urls
  const sortedUrls = Object.entries(urls)
    .map(([key, value]) => {
      const match = key.match(/(\d+)P/)
      const resolution = match ? parseInt(match[1]) : 0
      return { key, url: value as string, resolution }
    })
    .sort((a, b) => b.resolution - a.resolution)

  let videoUrl = sortedUrls.length > 0
    ? sortedUrls[0].url
    : playInfo.stream_url

  if (videoUrl && !videoUrl.startsWith('http')) {
    videoUrl = 'https:' + videoUrl
  }

  if (!videoUrl) {
    throw new Error('无法获取视频地址')
  }

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

async function fetchVideoInfo(videoId: string, url: string): Promise<VideoInfo> {
  // 判断使用哪种API
  // 如果videoId包含':'，使用H5视频API，否则使用移动端API
  if (videoId.includes(':')) {
    return fetchFromH5Video(videoId, url)
  }
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

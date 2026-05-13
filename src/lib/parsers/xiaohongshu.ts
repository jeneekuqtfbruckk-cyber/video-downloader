import axios from 'axios'
import { VideoInfo, Parser } from '@/types'

const PATTERNS = [
  /xiaohongshu\.com\/explore\/(\w+)/,
  /xiaohongshu\.com\/discovery\/item\/(\w+)/,
  /xhslink\.com\/(\w+)/
]

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'
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

async function extractNoteId(url: string): Promise<{ noteId: string; xsecToken: string }> {
  // 提取 xsec_token 参数
  let xsecToken = ''
  try {
    const urlObj = new URL(url)
    xsecToken = urlObj.searchParams.get('xsec_token') || ''
  } catch {
    // 继续
  }

  // 先尝试直接从URL提取
  for (const pattern of PATTERNS) {
    const match = url.match(pattern)
    if (match && match[1]) return { noteId: match[1], xsecToken }
  }

  // 如果直接匹配失败，尝试解析重定向
  const resolvedUrl = await resolveUrl(url)

  for (const pattern of PATTERNS) {
    const match = resolvedUrl.match(pattern)
    if (match && match[1]) {
      // 从重定向 URL 中提取 xsec_token
      try {
        const urlObj = new URL(resolvedUrl)
        xsecToken = urlObj.searchParams.get('xsec_token') || xsecToken
      } catch {
        // 继续
      }
      return { noteId: match[1], xsecToken }
    }
  }

  throw new Error('无法提取笔记ID')
}

async function fetchVideoInfo(noteId: string, xsecToken: string): Promise<VideoInfo> {
  // 构建页面 URL，包含 xsec_token 参数
  let pageUrl = `https://www.xiaohongshu.com/explore/${noteId}`
  if (xsecToken) {
    pageUrl += `?xsec_token=${encodeURIComponent(xsecToken)}&xsec_source=`
  }

  const response = await axios.get(pageUrl, {
    headers: HEADERS,
    timeout: 15000
  })

  const html = response.data

  // 提取 __INITIAL_STATE__ 数据
  const stateMatch = html.match(
    /window\.__INITIAL_STATE__\s*=\s*([\s\S]*?)<\/script>/
  )

  if (!stateMatch) {
    throw new Error('无法解析页面数据')
  }

  let rawData = stateMatch[1].trim().replace(/undefined/g, 'null')

  let state: any
  try {
    state = JSON.parse(rawData)
  } catch {
    throw new Error('JSON解析失败')
  }

  // 提取笔记详情
  const noteDetailMap = state?.note?.noteDetailMap

  if (!noteDetailMap) {
    throw new Error('无法提取笔记信息')
  }

  // 尝试从 noteDetailMap 中获取笔记详情
  let noteDetail = noteDetailMap[noteId]?.note

  // 如果没有找到，尝试从第一个有效的 key 获取
  if (!noteDetail) {
    const keys = Object.keys(noteDetailMap)
    for (const key of keys) {
      const detail = noteDetailMap[key]?.note
      if (detail && Object.keys(detail).length > 0) {
        noteDetail = detail
        break
      }
    }
  }

  if (!noteDetail || Object.keys(noteDetail).length === 0) {
    throw new Error('无法提取笔记信息')
  }

  // 检查是否为视频笔记
  const video = noteDetail.video
  if (!video) {
    throw new Error('该笔记不是视频类型')
  }

  // 从 video.media.stream 中提取视频 URL
  let videoUrl = ''
  
  // 优先使用 h264
  if (video.media?.stream?.h264?.[0]?.masterUrl) {
    videoUrl = video.media.stream.h264[0].masterUrl
  }
  // 然后使用 h265
  else if (video.media?.stream?.h265?.[0]?.masterUrl) {
    videoUrl = video.media.stream.h265[0].masterUrl
  }
  // 尝试从 backupUrls 获取
  else if (video.media?.stream?.h264?.[0]?.backupUrls?.[0]) {
    videoUrl = video.media.stream.h264[0].backupUrls[0]
  }

  if (!videoUrl) {
    throw new Error('无法获取视频地址')
  }

  // 获取标题
  const title = noteDetail.title || noteDetail.desc?.substring(0, 50) || '小红书视频'

  // 获取封面
  let coverUrl = ''
  if (noteDetail.imageList?.[0]?.urlDefault) {
    coverUrl = noteDetail.imageList[0].urlDefault
  } else if (noteDetail.imageList?.[0]?.url) {
    coverUrl = noteDetail.imageList[0].url.replace(/\\u002F/g, '/')
  }

  return {
    title,
    url: videoUrl,
    cover: coverUrl,
    author: noteDetail.user?.nickname || '',
    platform: 'xiaohongshu'
  }
}

export const parseXiaohongshu: Parser = {
  name: 'xiaohongshu',
  patterns: PATTERNS,
  parse: async (url: string) => {
    const { noteId, xsecToken } = await extractNoteId(url)
    return fetchVideoInfo(noteId, xsecToken)
  }
}

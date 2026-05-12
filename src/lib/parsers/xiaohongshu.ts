import axios from 'axios'
import { VideoInfo, Parser } from '@/types'

const PATTERNS = [
  /xiaohongshu\.com\/explore\/(\w+)/,
  /xiaohongshu\.com\/discovery\/item\/(\w+)/,
  /xhslink\.com\/(\w+)/
]

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'
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

async function extractNoteId(url: string): Promise<string> {
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

  throw new Error('无法提取笔记ID')
}

// 递归搜索字典中的key
function searchDictByKey(obj: any, key: string): any[] {
  const results: any[] = []

  if (typeof obj !== 'object' || obj === null) {
    return results
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      results.push(...searchDictByKey(item, key))
    }
    return results
  }

  if (obj[key] !== undefined) {
    results.push(obj[key])
  }

  for (const value of Object.values(obj)) {
    results.push(...searchDictByKey(value, key))
  }

  return results
}

async function fetchVideoInfo(noteId: string): Promise<VideoInfo> {
  const pageUrl = `https://www.xiaohongshu.com/explore/${noteId}`

  const response = await axios.get(pageUrl, {
    headers: HEADERS,
    timeout: 10000
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
  // key 可能是 noteId，也可能是 "null"（SSR 渲染时）
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

  // 递归搜索masterUrl
  let videoUrl = ''
  const masterUrls = searchDictByKey(state, 'masterUrl')
  if (masterUrls.length > 0) {
    videoUrl = masterUrls[0]
  }

  // 如果没找到，尝试backupUrls
  if (!videoUrl) {
    const backupUrls = searchDictByKey(state, 'backupUrls')
    if (backupUrls.length > 0) {
      const urls = backupUrls[0]
      videoUrl = Array.isArray(urls) ? urls[0] : urls
    }
  }

  // 如果还没找到，尝试直接从video对象获取
  if (!videoUrl) {
    videoUrl = video.media?.stream?.h264?.[0]?.masterUrl ||
      video.media?.stream?.h265?.[0]?.masterUrl ||
      video.url?.replace(/\\u002F/g, '/')
  }

  if (!videoUrl) {
    throw new Error('无法获取视频地址')
  }

  // 获取标题
  const titleResults = searchDictByKey(state, 'title')
  const descResults = searchDictByKey(state, 'desc')
  const videoTitle = (titleResults.length > 0 ? titleResults[0] : null) ||
    (descResults.length > 0 ? descResults[0]?.substring(0, 50) : null) ||
    '小红书视频'

  // 获取封面
  let coverUrl = ''
  try {
    coverUrl = noteDetail.imageList?.[0]?.urlDefault ||
      noteDetail.imageList?.[0]?.url?.replace(/\\u002F/g, '/') || ''
  } catch {
    // 忽略封面获取失败
  }

  return {
    title: videoTitle,
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
    const noteId = await extractNoteId(url)
    return fetchVideoInfo(noteId)
  }
}

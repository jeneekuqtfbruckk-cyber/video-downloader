import axios from 'axios'
import { VideoInfo, Parser } from '@/types'
import { fetchWithBrowser } from '@/lib/browser'

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
  let xsecToken = ''
  try {
    const urlObj = new URL(url)
    xsecToken = urlObj.searchParams.get('xsec_token') || ''
  } catch {
    // 继续
  }

  for (const pattern of PATTERNS) {
    const match = url.match(pattern)
    if (match && match[1]) return { noteId: match[1], xsecToken }
  }

  const resolvedUrl = await resolveUrl(url)

  for (const pattern of PATTERNS) {
    const match = resolvedUrl.match(pattern)
    if (match && match[1]) {
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

function extractVideoFromState(state: any, noteId: string): VideoInfo {
  const noteDetailMap = state?.note?.noteDetailMap

  if (!noteDetailMap) {
    throw new Error('无法提取笔记信息')
  }

  let noteDetail = noteDetailMap[noteId]?.note

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

  const video = noteDetail.video
  if (!video) {
    throw new Error('该笔记不是视频类型')
  }

  let videoUrl = ''

  if (video.media?.stream?.h264?.[0]?.masterUrl) {
    videoUrl = video.media.stream.h264[0].masterUrl
  } else if (video.media?.stream?.h265?.[0]?.masterUrl) {
    videoUrl = video.media.stream.h265[0].masterUrl
  } else if (video.media?.stream?.h264?.[0]?.backupUrls?.[0]) {
    videoUrl = video.media.stream.h264[0].backupUrls[0]
  }

  if (!videoUrl) {
    throw new Error('无法获取视频地址')
  }

  const title = noteDetail.title || noteDetail.desc?.substring(0, 50) || '小红书视频'

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

async function fetchViaHttp(noteId: string, xsecToken: string): Promise<any> {
  let pageUrl = `https://www.xiaohongshu.com/explore/${noteId}`
  if (xsecToken) {
    pageUrl += `?xsec_token=${encodeURIComponent(xsecToken)}&xsec_source=`
  }

  const response = await axios.get(pageUrl, {
    headers: HEADERS,
    timeout: 15000
  })

  return response.data
}

async function fetchViaBrowser(noteId: string): Promise<any> {
  const pageUrl = `https://www.xiaohongshu.com/explore/${noteId}`
  return await fetchWithBrowser(pageUrl)
}

function parseHtml(html: string): any {
  const stateMatch = html.match(
    /window\.__INITIAL_STATE__\s*=\s*([\s\S]*?)<\/script>/
  )

  if (!stateMatch) {
    throw new Error('无法解析页面数据')
  }

  let rawData = stateMatch[1].trim().replace(/undefined/g, 'null')

  try {
    return JSON.parse(rawData)
  } catch {
    throw new Error('JSON解析失败')
  }
}

async function fetchVideoInfo(noteId: string, xsecToken: string): Promise<VideoInfo> {
  let html: string

  try {
    html = await fetchViaHttp(noteId, xsecToken)
  } catch (httpError) {
    try {
      html = await fetchViaBrowser(noteId)
    } catch (browserError) {
      throw new Error(`小红书解析失败: HTTP 方式和浏览器方式均不可用`)
    }
  }

  const state = parseHtml(html)
  return extractVideoFromState(state, noteId)
}

export const parseXiaohongshu: Parser = {
  name: 'xiaohongshu',
  patterns: PATTERNS,
  parse: async (url: string) => {
    const { noteId, xsecToken } = await extractNoteId(url)
    return fetchVideoInfo(noteId, xsecToken)
  }
}

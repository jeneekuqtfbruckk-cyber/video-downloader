import axios from 'axios'
import { VideoInfo, Parser } from '@/types'

const PATTERNS = [
  /bilibili\.com\/video\/(BV\w+)/,
  /bilibili\.com\/video\/(av\d+)/,
  /b23\.tv\/(\w+)/
]

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  'Referer': 'https://www.bilibili.com/'
}

async function resolveUrl(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: HEADERS,
      maxRedirects: 5,
      validateStatus: (status) => status === 200
    })
    return response.request?.responseURL || url
  } catch {
    return url
  }
}

async function extractVideoId(
  url: string
): Promise<{ id: string; type: 'bv' | 'av' }> {
  // 先尝试直接从URL提取
  const bvMatch = url.match(/video\/(BV\w+)/)
  if (bvMatch) return { id: bvMatch[1], type: 'bv' }

  const avMatch = url.match(/video\/(av\d+)/)
  if (avMatch) return { id: avMatch[1].replace('av', ''), type: 'av' }

  // 如果直接匹配失败，尝试解析重定向
  const resolvedUrl = await resolveUrl(url)

  const bvMatch2 = resolvedUrl.match(/video\/(BV\w+)/)
  if (bvMatch2) return { id: bvMatch2[1], type: 'bv' }

  const avMatch2 = resolvedUrl.match(/video\/(av\d+)/)
  if (avMatch2) return { id: avMatch2[1].replace('av', ''), type: 'av' }

  throw new Error('无法提取视频ID')
}

async function fetchVideoInfo(videoId: {
  id: string
  type: 'bv' | 'av'
}): Promise<VideoInfo> {
  // 获取视频基本信息
  const params =
    videoId.type === 'bv'
      ? { bvid: videoId.id }
      : { aid: videoId.id }

  const viewResponse = await axios.get(
    'https://api.bilibili.com/x/web-interface/view',
    {
      params,
      headers: HEADERS,
      timeout: 10000
    }
  )

  const viewData = viewResponse.data
  if (viewData.code !== 0) {
    throw new Error(viewData.message || '获取视频信息失败')
  }

  const videoData = viewData.data
  const cid = videoData.cid
  const bvid = videoData.bvid

  // 获取视频播放地址（HTML5格式）
  const playResponse = await axios.get(
    'https://api.bilibili.com/x/player/playurl',
    {
      params: {
        bvid,
        cid,
        qn: 80,
        fnval: 0,
        fnver: 0,
        platform: 'html5'
      },
      headers: HEADERS,
      timeout: 10000
    }
  )

  const playData = playResponse.data
  if (playData.code !== 0) {
    throw new Error(playData.message || '获取播放地址失败')
  }

  // 选择最高质量的视频
  const durl = playData.data?.durl
  if (!durl || durl.length === 0) {
    throw new Error('无法获取视频下载地址')
  }

  // 按大小排序，选择最大的
  const bestVideo = durl.sort(
    (a: any, b: any) => (b.size || 0) - (a.size || 0)
  )[0]

  return {
    title: videoData.title || 'B站视频',
    url: bestVideo.url,
    cover: videoData.pic || '',
    author: videoData.owner?.name || '',
    platform: 'bilibili'
  }
}

export const parseBilibili: Parser = {
  name: 'bilibili',
  patterns: PATTERNS,
  parse: async (url: string) => {
    const videoId = await extractVideoId(url)
    return fetchVideoInfo(videoId)
  }
}

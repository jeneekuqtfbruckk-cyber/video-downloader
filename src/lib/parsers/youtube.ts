import axios from 'axios'
import { VideoInfo, Parser } from '@/types'

const PATTERNS = [
  /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
]

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'
}

function extractVideoId(url: string): string {
  for (const pattern of PATTERNS) {
    const match = url.match(pattern)
    if (match && match[1]) return match[1]
  }
  throw new Error('无法提取视频ID')
}

async function fetchVideoInfo(videoId: string): Promise<VideoInfo> {
  // 使用oEmbed API获取基本信息
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`

  try {
    const response = await axios.get(oembedUrl, {
      headers: HEADERS,
      timeout: 10000
    })

    const data = response.data

    // 尝试从页面提取更多信息
    let videoUrl = `https://www.youtube.com/watch?v=${videoId}`
    let coverUrl =
      data.thumbnail_url ||
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

    // 尝试获取页面中的流媒体信息
    try {
      const pageResponse = await axios.get(videoUrl, {
        headers: HEADERS,
        timeout: 10000
      })

      const html = pageResponse.data

      // 提取ytInitialPlayerResponse
      const playerMatch = html.match(
        /ytInitialPlayerResponse\s*=\s*({[\s\S]*?});/
      )

      if (playerMatch) {
        try {
          const playerData = JSON.parse(playerMatch[1])
          const formats =
            playerData?.streamingData?.formats ||
            playerData?.streamingData?.adaptiveFormats ||
            []

          // 选择最佳格式（有视频和音频的）
          const bestFormat = formats
            .filter(
              (f: any) =>
                f.url &&
                f.mimeType?.includes('video/mp4') &&
                f.mimeType?.includes('avc')
            )
            .sort(
              (a: any, b: any) =>
                (b.height || 0) - (a.height || 0)
            )[0]

          if (bestFormat?.url) {
            videoUrl = bestFormat.url
          }
        } catch {
          // 解析失败，使用默认URL
        }
      }
    } catch {
      // 页面请求失败，使用默认URL
    }

    return {
      title: data.title || 'YouTube视频',
      url: videoUrl,
      cover: coverUrl,
      author: data.author_name || '',
      platform: 'youtube'
    }
  } catch (error) {
    throw new Error('无法获取视频信息，视频可能不存在或为私有')
  }
}

export const parseYoutube: Parser = {
  name: 'youtube',
  patterns: PATTERNS,
  parse: async (url: string) => {
    const videoId = extractVideoId(url)
    return fetchVideoInfo(videoId)
  }
}

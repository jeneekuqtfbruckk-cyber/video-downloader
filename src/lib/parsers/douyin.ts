import axios from 'axios'
import { VideoInfo, Parser } from '@/types'
import { generateABogus, generateMsToken, generateTtwid } from './douyin-sign'

const PATTERNS = [
  /douyin\.com\/video\/(\d+)/,
  /v\.douyin\.com\/(\w+)/,
  /iesdouyin\.com\/share\/video\/(\d+)/,
  /douyin\.com\/discover\?modal_id=(\d+)/
]

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'

const HEADERS = {
  'User-Agent': USER_AGENT,
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'sec-ch-ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Dest': 'empty'
}

async function resolveUrl(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: { 'User-Agent': USER_AGENT },
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
  // 构建API请求URL
  const apiUrl = `https://www.douyin.com/aweme/v1/web/aweme/detail/?device_platform=webapp&aid=6383&channel=channel_pc_web&aweme_id=${videoId}&pc_client_type=1&version_code=170400&version_name=17.4.0&cookie_enabled=true&screen_width=1920&screen_height=1080&browser_language=zh-CN&browser_platform=Win32&browser_name=Chrome&browser_version=123.0.0.0&browser_online=true&engine_name=Blink&engine_version=123.0.0.0&os_name=Windows&os_version=10&cpu_core_num=16&device_memory=8&platform=PC&downlink=10&effective_type=4g&round_trip_time=50`

  // 生成签名参数
  const msToken = generateMsToken()
  const aBogus = generateABogus(apiUrl, USER_AGENT)

  // 构建完整URL
  const fullUrl = `${apiUrl}&msToken=${msToken}&a_bogus=${aBogus}`

  // 获取 ttwid
  let ttwid = ''
  try {
    const ttwidData = await generateTtwid(`https://www.douyin.com/video/${videoId}`)
    ttwid = ttwidData.ttwid
  } catch (e) {
    console.warn('获取 ttwid 失败:', e)
  }

  // 发送请求
  const headers: Record<string, string> = {
    ...HEADERS,
    'Referer': `https://www.douyin.com/video/${videoId}`,
    'Cookie': `ttwid=${ttwid}; msToken=${msToken};`
  }

  const response = await axios.get(fullUrl, {
    headers,
    timeout: 10000
  })

  if (!response.data || !response.data.aweme_detail) {
    throw new Error('无法获取视频信息')
  }

  const detail = response.data.aweme_detail

  // 获取无水印视频地址
  const videoUri = detail.video?.play_addr?.uri
  if (!videoUri) {
    throw new Error('无法获取视频地址')
  }

  // 构建无水印下载链接
  const downloadUrl = `https://www.douyin.com/aweme/v1/play/?video_id=${videoUri}&ratio=1080p&line=0`

  return {
    title: detail.desc || '抖音视频',
    url: downloadUrl,
    cover: detail.video?.cover?.url_list?.[0] || '',
    author: detail.author?.nickname || '',
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

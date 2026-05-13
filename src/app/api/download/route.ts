import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  const filename = request.nextUrl.searchParams.get('filename') || 'video.mp4'

  if (!url) {
    return NextResponse.json(
      { success: false, error: '缺少 url 参数' },
      { status: 400 }
    )
  }

  try {
    // 获取视频流
    const response = await axios.get(url, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'Referer': new URL(url).origin
      },
      timeout: 30000
    })

    // 设置响应头
    const headers = new Headers()
    headers.set('Content-Type', String(response.headers['content-type'] || 'video/mp4'))
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`)
    
    if (response.headers['content-length']) {
      headers.set('Content-Length', String(response.headers['content-length']))
    }

    // 返回视频流
    return new NextResponse(response.data, {
      status: 200,
      headers
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { success: false, error: '下载失败' },
      { status: 500 }
    )
  }
}

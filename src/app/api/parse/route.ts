import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { parseVideo, detectPlatform } from '@/lib/parsers'
import { getCachedVideo, setCachedVideo } from '@/lib/cache'
import { ErrorCode } from '@/types'

const RequestSchema = z.object({
  url: z.string().min(1, 'URL不能为空'),
  platform: z
    .enum([
      'douyin',
      'kuaishou',
      'bilibili',
      'youtube',
      'xiaohongshu',
      'weibo'
    ])
    .optional()
})

function normalizeUrl(url: string): string {
  let normalized = url.trim()
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized
  }
  return normalized
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { url: rawUrl, platform } = RequestSchema.parse(body)
    const url = normalizeUrl(rawUrl)

    // 检测平台
    const detectedPlatform = detectPlatform(url)
    if (detectedPlatform === 'unknown' && !platform) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.UNSUPPORTED_PLATFORM,
            message: '不支持该视频平台，请检查链接是否正确'
          }
        },
        { status: 400 }
      )
    }

    // 检查缓存
    const cached = await getCachedVideo(url)
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        meta: {
          timestamp: new Date().toISOString(),
          parseTime: Date.now() - startTime,
          fromCache: true
        }
      })
    }

    // 解析视频
    const videoInfo = await parseVideo(url, platform)

    // 存入缓存
    await setCachedVideo(url, videoInfo)

    return NextResponse.json({
      success: true,
      data: videoInfo,
      meta: {
        timestamp: new Date().toISOString(),
        parseTime: Date.now() - startTime,
        fromCache: false
      }
    })
  } catch (error) {
    // 处理Zod验证错误
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.INVALID_PARAMS,
            message: '参数验证失败',
            details: error.errors
          }
        },
        { status: 400 }
      )
    }

    // 处理业务错误
    const message = error instanceof Error ? error.message : '服务器内部错误'
    const code = message.includes('不支持')
      ? ErrorCode.UNSUPPORTED_PLATFORM
      : ErrorCode.PARSE_FAILED

    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message
        }
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: ErrorCode.INVALID_PARAMS,
        message: '请使用POST方法，body格式: { url: "视频链接" }'
      }
    },
    { status: 405 }
  )
}

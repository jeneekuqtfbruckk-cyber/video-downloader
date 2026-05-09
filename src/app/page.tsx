'use client'

import { useState } from 'react'

interface VideoResult {
  title: string
  url: string
  cover?: string
  author?: string
  platform: string
}

type Platform = 'douyin' | 'kuaishou' | 'bilibili' | 'youtube' | 'xiaohongshu' | 'weibo'

const PLATFORM_INFO: Record<Platform, { name: string; icon: string; color: string }> = {
  douyin: { name: '抖音', icon: '🎵', color: 'bg-pink-500' },
  kuaishou: { name: '快手', icon: '🎬', color: 'bg-orange-500' },
  bilibili: { name: 'B站', icon: '📺', color: 'bg-blue-500' },
  youtube: { name: 'YouTube', icon: '▶️', color: 'bg-red-500' },
  xiaohongshu: { name: '小红书', icon: '📕', color: 'bg-red-400' },
  weibo: { name: '微博', icon: '💬', color: 'bg-yellow-500' }
}

const EXAMPLE_URLS: Array<{ platform: Platform; url: string }> = [
  { platform: 'douyin', url: 'https://v.douyin.com/xxxxx' },
  { platform: 'kuaishou', url: 'https://v.kuaishou.com/xxxxx' },
  { platform: 'bilibili', url: 'https://www.bilibili.com/video/BVxxxxx' },
  { platform: 'youtube', url: 'https://www.youtube.com/watch?v=xxxxx' }
]

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VideoResult | null>(null)
  const [error, setError] = useState('')
  const [parseTime, setParseTime] = useState<number | null>(null)

  const detectPlatform = (url: string): Platform | null => {
    if (url.includes('douyin.com') || url.includes('iesdouyin.com')) return 'douyin'
    if (url.includes('kuaishou.com') || url.includes('gifshow.com')) return 'kuaishou'
    if (url.includes('bilibili.com') || url.includes('b23.tv')) return 'bilibili'
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
    if (url.includes('xiaohongshu.com') || url.includes('xhslink.com')) return 'xiaohongshu'
    if (url.includes('weibo.com')) return 'weibo'
    return null
  }

  const handleParse = async () => {
    if (!url.trim()) {
      setError('请输入视频链接')
      return
    }

    const platform = detectPlatform(url)
    if (!platform) {
      setError('不支持的平台，请检查链接是否正确')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    setParseTime(null)

    const startTime = Date.now()

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        setParseTime(Date.now() - startTime)
      } else {
        setError(data.error?.message || '解析失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (result?.url) {
      window.open(result.url, '_blank')
    }
  }

  const handleCopyUrl = () => {
    if (result?.url) {
      navigator.clipboard.writeText(result.url)
      alert('链接已复制')
    }
  }

  const platform = url ? detectPlatform(url) : null

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            无水印视频下载
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            粘贴视频链接，一键获取无水印高清视频
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                视频链接
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="粘贴抖音、快手、B站、YouTube等视频链接..."
                  className="w-full px-4 py-3 pr-24 rounded-lg border border-gray-300 
                    dark:border-gray-600 dark:bg-gray-700 dark:text-white
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200"
                  onKeyDown={(e) => e.key === 'Enter' && !loading && handleParse()}
                />
                {platform && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-sm font-medium text-white bg-blue-500">
                    {PLATFORM_INFO[platform].icon} {PLATFORM_INFO[platform].name}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleParse}
              disabled={loading || !url.trim()}
              className="w-full py-3 px-6 rounded-lg font-medium text-white
                bg-gradient-to-r from-blue-500 to-blue-600
                hover:from-blue-600 hover:to-blue-700
                disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  正在解析...
                </span>
              ) : (
                '🔍 解析视频'
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">❌</span>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Result Section */}
          {result && (
            <div className="mt-8 space-y-6">
              {/* Success Message */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      解析成功
                    </p>
                  </div>
                  {parseTime && (
                    <span className="text-xs text-gray-500">
                      耗时 {parseTime}ms
                    </span>
                  )}
                </div>
              </div>

              {/* Video Info */}
              <div className="flex flex-col sm:flex-row gap-4">
                {result.cover && (
                  <div className="flex-shrink-0">
                    <img
                      src={result.cover}
                      alt={result.title}
                      className="w-full sm:w-48 h-36 object-cover rounded-lg shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {result.title}
                  </h3>
                  {result.author && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">作者：</span>
                      {result.author}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">平台：</span>
                    {PLATFORM_INFO[result.platform as Platform]?.name || result.platform}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 px-6 rounded-lg font-medium text-white
                    bg-gradient-to-r from-green-500 to-green-600
                    hover:from-green-600 hover:to-green-700
                    transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                    shadow-lg hover:shadow-xl"
                >
                  ⬇️ 下载无水印视频
                </button>
                <button
                  onClick={handleCopyUrl}
                  className="py-3 px-6 rounded-lg font-medium text-gray-700 dark:text-gray-300
                    bg-gray-100 dark:bg-gray-700
                    hover:bg-gray-200 dark:hover:bg-gray-600
                    transform transition-all duration-200"
                >
                  📋 复制链接
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Supported Platforms */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            支持平台
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {Object.entries(PLATFORM_INFO).map(([key, info]) => (
              <span
                key={key}
                className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm 
                  shadow-sm border border-gray-200 dark:border-gray-700"
              >
                {info.icon} {info.name}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-400 dark:text-gray-500">
          <p>仅供个人学习使用，请尊重版权</p>
        </footer>
      </div>
    </main>
  )
}

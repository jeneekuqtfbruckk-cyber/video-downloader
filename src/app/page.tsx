'use client'

import { useState } from 'react'
import { UrlInput } from '@/components/UrlInput'
import { ParseButton } from '@/components/ParseButton'
import { ErrorMessage } from '@/components/ErrorMessage'
import { VideoResult } from '@/components/VideoResult'
import { PLATFORM_INFO, detectPlatform } from '@/lib/constants'

interface VideoResultType {
  title: string
  url: string
  cover?: string
  author?: string
  platform: string
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VideoResultType | null>(null)
  const [error, setError] = useState('')
  const [parseTime, setParseTime] = useState<number | null>(null)

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
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
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
            <UrlInput url={url} onChange={setUrl} platform={platform} />
            <ParseButton
              loading={loading}
              disabled={loading || !url.trim()}
              onClick={handleParse}
            />
          </div>

          {/* Error Message */}
          {error && <ErrorMessage message={error} />}

          {/* Result Section */}
          {result && (
            <VideoResult
              result={result}
              parseTime={parseTime}
              onCopyUrl={handleCopyUrl}
            />
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

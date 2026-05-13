'use client'

import { useState } from 'react'
import { Platform, PLATFORM_INFO } from '@/lib/constants'

interface VideoResultProps {
  result: {
    title: string
    url: string
    cover?: string
    author?: string
    platform: string
  }
  parseTime: number | null
  onCopyUrl: () => void
}

export function VideoResult({ result, parseTime, onCopyUrl }: VideoResultProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      // 生成文件名
      const platform = PLATFORM_INFO[result.platform as Platform]?.name || result.platform
      const filename = `${result.title || platform + '视频'}.mp4`
      
      // 使用下载 API
      const downloadUrl = `/api/download?url=${encodeURIComponent(result.url)}&filename=${encodeURIComponent(filename)}`
      
      // 创建隐藏的 a 标签触发下载
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('下载失败，请尝试复制链接手动下载')
    } finally {
      setDownloading(false)
    }
  }

  return (
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
          disabled={downloading}
          className="flex-1 py-3 px-6 rounded-lg font-medium text-white
            bg-gradient-to-r from-green-500 to-green-600
            hover:from-green-600 hover:to-green-700
            disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
            transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
            shadow-lg hover:shadow-xl"
        >
          {downloading ? (
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
              正在下载...
            </span>
          ) : (
            '⬇️ 下载无水印视频'
          )}
        </button>
        <button
          onClick={onCopyUrl}
          className="py-3 px-6 rounded-lg font-medium text-gray-700 dark:text-gray-300
            bg-gray-100 dark:bg-gray-700
            hover:bg-gray-200 dark:hover:bg-gray-600
            transform transition-all duration-200"
        >
          📋 复制链接
        </button>
      </div>
    </div>
  )
}

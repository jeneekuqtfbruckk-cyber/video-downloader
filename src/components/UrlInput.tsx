'use client'

import { Platform, PLATFORM_INFO } from '@/lib/constants'

interface UrlInputProps {
  url: string
  onChange: (url: string) => void
  platform: Platform | null
}

export function UrlInput({ url, onChange, platform }: UrlInputProps) {
  return (
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
          onChange={(e) => onChange(e.target.value)}
          placeholder="粘贴抖音、快手、B站、YouTube等视频链接..."
          className="w-full px-4 py-3 pr-24 rounded-lg border border-gray-300 
            dark:border-gray-600 dark:bg-gray-700 dark:text-white
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200"
        />
        {platform && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-sm font-medium text-white bg-blue-500">
            {PLATFORM_INFO[platform].icon} {PLATFORM_INFO[platform].name}
          </span>
        )}
      </div>
    </div>
  )
}

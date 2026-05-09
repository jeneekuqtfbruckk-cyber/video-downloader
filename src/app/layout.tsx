import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Video Downloader - 无水印视频下载',
  description: '支持抖音、快手、B站、YouTube等主流平台的无水印视频下载'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}

export interface VideoInfo {
  title: string
  url: string
  cover?: string
  author?: string
  platform: Platform
  quality?: VideoQuality
  format?: VideoFormat
  duration?: number
  size?: number
}

export type Platform =
  | 'douyin'
  | 'kuaishou'
  | 'bilibili'
  | 'youtube'
  | 'xiaohongshu'
  | 'weibo'
  | 'unknown'

export type VideoQuality = '360p' | '480p' | '720p' | '1080p' | '4k'

export type VideoFormat = 'mp4' | 'webm' | 'm3u8'

export interface ParseRequest {
  url: string
  platform?: Platform
}

export interface ParseResponse {
  success: boolean
  data?: VideoInfo
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    timestamp: string
    parseTime: number
  }
}

export interface Parser {
  name: Platform
  patterns: RegExp[]
  parse: (url: string) => Promise<VideoInfo>
}

export interface ApiError {
  code: ErrorCode
  message: string
  details?: any
}

export enum ErrorCode {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_PARAMS = 'INVALID_PARAMS',
  PARSE_FAILED = 'PARSE_FAILED',
  UNSUPPORTED_PLATFORM = 'UNSUPPORTED_PLATFORM',
  VIDEO_NOT_FOUND = 'VIDEO_NOT_FOUND',
  DOWNLOAD_FAILED = 'DOWNLOAD_FAILED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

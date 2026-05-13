'use client'

interface ParseButtonProps {
  loading: boolean
  disabled: boolean
  onClick: () => void
}

export function ParseButton({ loading, disabled, onClick }: ParseButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
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
  )
}

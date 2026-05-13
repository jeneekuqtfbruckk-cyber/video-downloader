'use client'

interface ErrorMessageProps {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="flex items-center">
        <span className="text-red-500 mr-2">❌</span>
        <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
      </div>
    </div>
  )
}

import { useRef, useCallback } from 'react'

interface LongPressOptions {
  delay?: number
}

export function useLongPress(callback: () => void, options: LongPressOptions = {}) {
  const { delay = 500 } = options
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const start = useCallback(() => {
    timerRef.current = setTimeout(() => {
      callback()
      // Haptic feedback on supported devices
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10)
      }
    }, delay)
  }, [callback, delay])

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: cancel,
  }
}

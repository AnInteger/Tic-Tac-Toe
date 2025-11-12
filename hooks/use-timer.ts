"use client"

import { useState, useEffect, useCallback } from "react"

export function useTimer(duration: number, onTimeout: () => void, enabled: boolean) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isRunning, setIsRunning] = useState(false)

  const start = useCallback(() => {
    setTimeLeft(duration)
    setIsRunning(true)
  }, [duration])

  const stop = useCallback(() => {
    setIsRunning(false)
    setTimeLeft(duration)
  }, [duration])

  const reset = useCallback(() => {
    setTimeLeft(duration)
  }, [duration])

  useEffect(() => {
    if (!enabled || !isRunning) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          onTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [enabled, isRunning, onTimeout])

  return {
    timeLeft,
    isRunning,
    start,
    stop,
    reset,
  }
}

"use client"

import { useState, useEffect } from "react"

interface PunishmentScreenProps {
  onComplete: () => void
  duration?: number // seconds
}

export function PunishmentScreen({ onComplete, duration = 10 }: PunishmentScreenProps) {
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete()
      return
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, onComplete])

  return (
    <div className="fixed inset-0 bg-[#0f380f] flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md">
        <div className="bg-[#8bac0f] border-8 border-[#306230] rounded-lg p-8 shadow-2xl">
          <div className="text-center space-y-6">
            {/* Ad Placeholder */}
            <div className="bg-[#0f380f] border-4 border-[#306230] rounded-lg p-8 min-h-[300px] flex flex-col items-center justify-center">
              <div className="animate-pulse space-y-4">
                <div className="text-[#8bac0f] text-xl pixel-text mb-4">ADVERTISEMENT</div>
                <div className="space-y-2">
                  <div className="h-4 bg-[#306230] rounded w-48" />
                  <div className="h-4 bg-[#306230] rounded w-40" />
                  <div className="h-4 bg-[#306230] rounded w-44" />
                </div>
                <div className="mt-6">
                  <div className="w-32 h-32 bg-[#306230] rounded-lg mx-auto flex items-center justify-center">
                    <p className="text-[#8bac0f] text-6xl">?</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="bg-[#0f380f] border-4 border-[#306230] rounded p-4">
              <p className="text-[#8bac0f] text-sm mb-2 pixel-text">AD ENDS IN</p>
              <p className="text-[#9bbc0f] text-5xl font-bold pixel-text">{timeLeft}s</p>
              <div className="mt-3 h-3 bg-[#306230] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#8bac0f] transition-all duration-1000"
                  style={{ width: `${((duration - timeLeft) / duration) * 100}%` }}
                />
              </div>
            </div>

            <p className="text-[#0f380f] text-xs pixel-text opacity-70">You cannot skip this advertisement</p>
          </div>
        </div>
      </div>
    </div>
  )
}

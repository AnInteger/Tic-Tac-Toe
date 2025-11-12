"use client"

import { useState, useCallback, useEffect, useRef } from "react"

interface MatchResult {
  matched: boolean
  gameId?: string
  yourSymbol?: "X" | "O"
  opponentSymbol?: "X" | "O"
  message?: string
}

export function useMatchmaking(playerId: string | null) {
  const [isSearching, setIsSearching] = useState(false)
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  const startMatchmaking = useCallback(async () => {
    if (!playerId) {
      setError("No player ID")
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const response = await fetch("/api/matchmaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      })

      if (!response.ok) {
        throw new Error("Matchmaking failed")
      }

      const result: MatchResult = await response.json()

      if (result.matched) {
        setMatchResult(result)
        setIsSearching(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setIsSearching(false)
    }
  }, [playerId])

  useEffect(() => {
    if (isSearching && !matchResult) {
      pollingRef.current = setTimeout(() => {
        startMatchmaking()
      }, 2000)
    }

    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current)
      }
    }
  }, [isSearching, matchResult, startMatchmaking])

  const cancelMatchmaking = useCallback(() => {
    setIsSearching(false)
    setMatchResult(null)
    if (pollingRef.current) {
      clearTimeout(pollingRef.current)
    }
  }, [])

  return {
    isSearching,
    matchResult,
    error,
    startMatchmaking,
    cancelMatchmaking,
  }
}

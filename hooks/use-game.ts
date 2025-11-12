"use client"

import { useState, useEffect, useCallback } from "react"
import type { GameState } from "@/lib/game-state"

export function useGame(gameId: string | null, playerId: string | null) {
  const [game, setGame] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch game state
  const fetchGame = useCallback(async () => {
    if (!gameId) return

    try {
      const response = await fetch(`/api/game/${gameId}`)
      if (!response.ok) throw new Error("Failed to fetch game")

      const data = await response.json()
      setGame(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }, [gameId])

  // Make a move
  const makeMove = useCallback(
    async (position: number) => {
      if (!gameId || !playerId) return

      setLoading(true)
      try {
        const response = await fetch(`/api/game/${gameId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, position }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to make move")
        }

        const data = await response.json()
        setGame(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    },
    [gameId, playerId],
  )

  // Handle timeout
  const handleTimeout = useCallback(async () => {
    if (!gameId || !playerId) return

    try {
      const response = await fetch(`/api/game/${gameId}/timeout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      })

      if (!response.ok) throw new Error("Failed to handle timeout")

      const data = await response.json()
      setGame(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }, [gameId, playerId])

  // Continue or end game
  const handleContinue = useCallback(
    async (decision: "continue" | "end") => {
      if (!gameId || !playerId) return

      try {
        const response = await fetch(`/api/game/${gameId}/continue`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, decision }),
        })

        if (!response.ok) throw new Error("Failed to continue")

        const data = await response.json()

        if (data.ended) {
          setGame(null)
          return true // Game ended
        } else {
          setGame(data)
          return false // Game continues
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        return false
      }
    },
    [gameId, playerId],
  )

  // Poll for game updates
  useEffect(() => {
    if (!gameId || !game || game.status === "finished") return

    const interval = setInterval(fetchGame, 1000)
    return () => clearInterval(interval)
  }, [gameId, game, fetchGame])

  return {
    game,
    loading,
    error,
    makeMove,
    handleTimeout,
    handleContinue,
    refetch: fetchGame,
  }
}

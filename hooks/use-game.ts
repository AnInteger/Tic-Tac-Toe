"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { makeMove as makeMoveAction, handleTimeout as handleTimeoutAction, continueGame } from "@/app/actions/game"
import type { Game } from "@/lib/types"

export function useGame(gameId: string, playerId: string) {
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGame = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single()

      if (error) {
        console.error("[v0] Error fetching game:", error)
        setError(error.message)
      } else {
        setGame(data as Game)
      }
    }

    fetchGame()
  }, [gameId])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "games",
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          console.log("[v0] Game updated:", payload)
          setGame(payload.new as Game)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId])

  const makeMove = useCallback(
    async (position: number) => {
      setLoading(true)
      try {
        const result = await makeMoveAction(gameId, playerId, position)
        if (!result.success) {
          throw new Error(result.error)
        }
      } catch (err) {
        console.error("[v0] Move error:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    },
    [gameId, playerId]
  )

  const handleTimeout = useCallback(async () => {
    try {
      await handleTimeoutAction(gameId, playerId)
    } catch (err) {
      console.error("[v0] Timeout error:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }, [gameId, playerId])

  const handleContinue = useCallback(
    async (decision: "continue" | "end") => {
      try {
        const result = await continueGame(gameId, playerId, decision)
        return result.ended || false
      } catch (err) {
        console.error("[v0] Continue error:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
        return false
      }
    },
    [gameId, playerId]
  )

  return {
    game,
    loading,
    error,
    makeMove,
    handleTimeout,
    handleContinue,
  }
}

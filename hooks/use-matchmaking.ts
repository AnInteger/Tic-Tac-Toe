"use client"

import { useState, useCallback, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { joinMatchmaking, leaveMatchmaking } from "@/app/actions/matchmaking"
import type { Game } from "@/lib/types"

interface MatchResult {
  matched: boolean
  gameId?: string
  yourSymbol?: "X" | "O"
}

export function useMatchmaking(playerId: string | null) {
  const [isSearching, setIsSearching] = useState(false)
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startMatchmaking = useCallback(async () => {
    if (!playerId) {
      setError("No player ID")
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const result = await joinMatchmaking(playerId)

      if (!result.success) {
        throw new Error(result.error || "Matchmaking failed")
      }

      if (result.matched && result.gameId) {
        const yourSymbol = await getPlayerSymbol(playerId, result.gameId)
        setMatchResult({
          matched: true,
          gameId: result.gameId,
          yourSymbol,
        })
        setIsSearching(false)
      }
    } catch (err) {
      console.error("[v0] Matchmaking error:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setIsSearching(false)
    }
  }, [playerId])

  useEffect(() => {
    if (!isSearching || !playerId || matchResult) return

    const supabase = createClient()

    // Subscribe to new games where this player is involved
    const channel = supabase
      .channel(`matchmaking-${playerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "games",
          filter: `player_x_id=eq.${playerId},player_o_id=eq.${playerId}`,
        },
        async (payload) => {
          console.log("[v0] Match found!", payload)
          const game = payload.new as Game
          const yourSymbol = game.player_x_id === playerId ? "X" : "O"
          
          setMatchResult({
            matched: true,
            gameId: game.id,
            yourSymbol,
          })
          setIsSearching(false)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isSearching, playerId, matchResult])

  const cancelMatchmaking = useCallback(async () => {
    if (playerId) {
      await leaveMatchmaking(playerId)
    }
    setIsSearching(false)
    setMatchResult(null)
  }, [playerId])

  return {
    isSearching,
    matchResult,
    error,
    startMatchmaking,
    cancelMatchmaking,
  }
}

async function getPlayerSymbol(playerId: string, gameId: string): Promise<"X" | "O"> {
  const supabase = createClient()
  const { data } = await supabase
    .from("games")
    .select("player_x_id, player_o_id")
    .eq("id", gameId)
    .single()

  return data?.player_x_id === playerId ? "X" : "O"
}

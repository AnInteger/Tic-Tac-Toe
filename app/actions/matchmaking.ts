"use server"

import { createClient } from "@/lib/supabase/server"
import type { Game } from "@/lib/types"

export async function joinMatchmaking(playerId: string) {
  const supabase = await createClient()

  // Check if player already in queue
  const { data: existing } = await supabase
    .from("matchmaking_queue")
    .select("*")
    .eq("player_id", playerId)
    .single()

  if (existing) {
    return { success: true, message: "Already in queue" }
  }

  // Check if there's someone waiting
  const { data: waiting } = await supabase
    .from("matchmaking_queue")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .single()

  // If someone is waiting, create a game
  if (waiting && waiting.player_id !== playerId) {
    // Remove from queue
    await supabase
      .from("matchmaking_queue")
      .delete()
      .eq("id", waiting.id)

    // Create game: first player (from queue) is X, second player (current) is O
    const { data: game, error: gameError } = await supabase
      .from("games")
      .insert({
        player_x_id: waiting.player_id,
        player_o_id: playerId,
        current_turn: "X",
        board: ["", "", "", "", "", "", "", "", ""],
        status: "playing",
      })
      .select()
      .single()

    if (gameError) {
      console.error("[v0] Error creating game:", gameError)
      return { success: false, error: gameError.message }
    }

    return { success: true, matched: true, gameId: game.id }
  }

  // No one waiting, add to queue
  const { error } = await supabase
    .from("matchmaking_queue")
    .insert({ player_id: playerId })

  if (error) {
    console.error("[v0] Error joining queue:", error)
    return { success: false, error: error.message }
  }

  return { success: true, matched: false, message: "Added to queue" }
}

export async function leaveMatchmaking(playerId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("matchmaking_queue")
    .delete()
    .eq("player_id", playerId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function checkForMatch(playerId: string) {
  const supabase = await createClient()

  // Check if player has a game
  const { data: games } = await supabase
    .from("games")
    .select("*")
    .or(`player_x_id.eq.${playerId},player_o_id.eq.${playerId}`)
    .order("created_at", { ascending: false })
    .limit(1)

  if (games && games.length > 0) {
    const game = games[0] as Game
    return {
      matched: true,
      gameId: game.id,
      yourSymbol: game.player_x_id === playerId ? "X" : "O",
    }
  }

  return { matched: false }
}

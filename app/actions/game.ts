"use server"

import { createClient } from "@/lib/supabase/server"
import type { Board, PlayerSymbol } from "@/lib/types"

function checkWinner(board: Board): PlayerSymbol | "draw" | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as PlayerSymbol
    }
  }

  if (board.every((cell) => cell !== "")) {
    return "draw"
  }

  return null
}

export async function makeMove(gameId: string, playerId: string, position: number) {
  const supabase = await createClient()

  // Get current game state
  const { data: game, error: fetchError } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single()

  if (fetchError || !game) {
    return { success: false, error: "Game not found" }
  }

  // Verify it's player's turn
  const playerSymbol = game.player_x_id === playerId ? "X" : "O"
  if (game.current_turn !== playerSymbol) {
    return { success: false, error: "Not your turn" }
  }

  // Verify position is empty
  const board = game.board as Board
  if (board[position] !== "") {
    return { success: false, error: "Position already taken" }
  }

  // Make the move
  const newBoard = [...board]
  newBoard[position] = playerSymbol
  const winner = checkWinner(newBoard)
  const nextTurn = playerSymbol === "X" ? "O" : "X"

  if (winner) {
    // Game finished
    let newXScore = game.player_x_score
    let newOScore = game.player_o_score

    if (winner === "X") newXScore++
    else if (winner === "O") newOScore++

    const { error: updateError } = await supabase
      .from("games")
      .update({
        board: newBoard,
        winner,
        status: "finished",
        player_x_score: newXScore,
        player_o_score: newOScore,
        updated_at: new Date().toISOString(),
      })
      .eq("id", gameId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }
  } else {
    // Continue playing
    const { error: updateError } = await supabase
      .from("games")
      .update({
        board: newBoard,
        current_turn: nextTurn,
        turn_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", gameId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }
  }

  return { success: true }
}

export async function handleTimeout(gameId: string, playerId: string) {
  const supabase = await createClient()

  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single()

  if (!game) return { success: false }

  const playerSymbol = game.player_x_id === playerId ? "X" : "O"
  const opponentSymbol = playerSymbol === "X" ? "O" : "X"

  // Opponent wins
  let newXScore = game.player_x_score
  let newOScore = game.player_o_score

  if (opponentSymbol === "X") newXScore++
  else newOScore++

  await supabase
    .from("games")
    .update({
      winner: opponentSymbol,
      status: "finished",
      player_x_score: newXScore,
      player_o_score: newOScore,
      updated_at: new Date().toISOString(),
    })
    .eq("id", gameId)

  return { success: true }
}

export async function continueGame(gameId: string, playerId: string, action: "continue" | "end") {
  const supabase = await createClient()

  if (action === "end") {
    // Just mark as done, don't need to delete
    return { success: true, ended: true }
  }

  // Reset board for next round
  const { error } = await supabase
    .from("games")
    .update({
      board: ["", "", "", "", "", "", "", "", ""],
      current_turn: "X",
      winner: null,
      status: "playing",
      turn_started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", gameId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, ended: false }
}

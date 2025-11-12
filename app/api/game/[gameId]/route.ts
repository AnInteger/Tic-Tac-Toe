import { type NextRequest, NextResponse } from "next/server"
import { gameStorage } from "@/lib/game-storage"
import { checkWinner } from "@/lib/game-state"

export async function GET(request: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params
  const game = gameStorage.getGame(gameId)

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 })
  }

  return NextResponse.json(game)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params
    const { playerId, position } = await request.json()

    const game = gameStorage.getGame(gameId)

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Verify it's the player's turn
    const playerSymbol = game.players.X.id === playerId ? "X" : "O"

    if (game.currentPlayer !== playerSymbol) {
      return NextResponse.json({ error: "Not your turn" }, { status: 400 })
    }

    // Verify position is valid
    if (position < 0 || position > 8 || game.board[position] !== null) {
      return NextResponse.json({ error: "Invalid move" }, { status: 400 })
    }

    // Make the move
    game.board[position] = playerSymbol
    game.currentPlayer = playerSymbol === "X" ? "O" : "X"
    game.lastMoveTime = Date.now()
    game.timeLeft = 5

    // Check for winner
    const winner = checkWinner(game.board)
    if (winner) {
      game.status = "finished"
      game.winner = winner

      // Update scores
      if (winner !== "draw") {
        game.players[winner].score += 1
      }
    }

    gameStorage.setGame(gameId, game)

    return NextResponse.json(game)
  } catch (error) {
    console.error("[v0] Game move error:", error)
    return NextResponse.json({ error: "Move failed" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { gameStorage } from "@/lib/game-storage"

export async function POST(request: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params
    const { playerId } = await request.json()

    const game = gameStorage.getGame(gameId)

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Verify timeout is valid
    const timeSinceLastMove = Date.now() - game.lastMoveTime

    if (timeSinceLastMove >= 5000) {
      // Current player loses due to timeout
      game.status = "finished"
      game.winner = game.currentPlayer === "X" ? "O" : "X"
      game.players[game.winner].score += 1

      gameStorage.setGame(gameId, game)
    }

    return NextResponse.json(game)
  } catch (error) {
    return NextResponse.json({ error: "Timeout handling failed" }, { status: 500 })
  }
}

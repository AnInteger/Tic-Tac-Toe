import { type NextRequest, NextResponse } from "next/server"
import { gameStorage } from "@/lib/game-storage"

export async function POST(request: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params
    const { playerId, decision } = await request.json()

    const game = gameStorage.getGame(gameId)

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    if (decision === "continue") {
      // Reset board for new round
      game.board = Array(9).fill(null)
      game.currentPlayer = "X"
      game.status = "playing"
      game.winner = null
      game.timeLeft = 5
      game.lastMoveTime = Date.now()

      gameStorage.setGame(gameId, game)

      return NextResponse.json(game)
    } else {
      // End game session
      gameStorage.deleteGame(gameId)

      return NextResponse.json({ ended: true })
    }
  } catch (error) {
    return NextResponse.json({ error: "Continue failed" }, { status: 500 })
  }
}

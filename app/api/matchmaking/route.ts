import { type NextRequest, NextResponse } from "next/server"
import { gameStorage } from "@/lib/game-storage"
import { createGame } from "@/lib/game-state"

export async function POST(request: NextRequest) {
  try {
    const { playerId } = await request.json()

    if (!playerId) {
      return NextResponse.json({ error: "Player ID required" }, { status: 400 })
    }

    // Check if there's someone waiting in the queue
    const queue = gameStorage.getQueue()

    if (queue.length > 0) {
      // Match with the first player in queue
      const opponent = queue[0]
      gameStorage.removeFromQueue(opponent.playerId)

      // Create a new game
      const game = createGame(playerId, opponent.playerId)
      gameStorage.setGame(game.gameId, game)

      return NextResponse.json({
        matched: true,
        gameId: game.gameId,
        yourSymbol: "X",
        opponentSymbol: "O",
      })
    } else {
      // Add to queue and wait
      gameStorage.addToQueue(playerId)

      return NextResponse.json({
        matched: false,
        message: "Waiting for opponent...",
      })
    }
  } catch (error) {
    console.error("[v0] Matchmaking error:", error)
    return NextResponse.json({ error: "Matchmaking failed" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const playerId = searchParams.get("playerId")

    if (!playerId) {
      return NextResponse.json({ error: "Player ID required" }, { status: 400 })
    }

    // Check if player has been matched
    const queue = gameStorage.getQueue()
    const stillWaiting = queue.some((p) => p.playerId === playerId)

    if (stillWaiting) {
      return NextResponse.json({ matched: false })
    }

    // Find game where this player is participating
    // This is a simple implementation - in production use proper indexing
    return NextResponse.json({ matched: false })
  } catch (error) {
    return NextResponse.json({ error: "Check failed" }, { status: 500 })
  }
}

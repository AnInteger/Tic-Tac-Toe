"use client"

import { useState, useEffect } from "react"
import { MatchmakingScreen } from "@/components/matchmaking-screen"
import { GameScreen } from "@/components/game-screen"
import type { PlayerSymbol } from "@/lib/types"

type AppState = "matchmaking" | "game"

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>("matchmaking")
  const [playerId, setPlayerId] = useState<string>("")
  const [gameId, setGameId] = useState<string | null>(null)
  const [playerSymbol, setPlayerSymbol] = useState<PlayerSymbol>("X")

  // Generate player ID on mount
  useEffect(() => {
    const id = `player-${Math.random().toString(36).substring(2, 11)}`
    setPlayerId(id)
  }, [])

  const handleMatchFound = (foundGameId: string, symbol: PlayerSymbol) => {
    setGameId(foundGameId)
    setPlayerSymbol(symbol)
    setAppState("game")
  }

  const handleGameEnd = () => {
    setGameId(null)
    setAppState("matchmaking")
  }

  if (!playerId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#9bbc0f]">
        <div className="bg-[#8bac0f] border-4 border-[#0f380f] rounded p-8">
          <p className="text-[#0f380f] pixel-text animate-pulse">INITIALIZING...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {appState === "matchmaking" && <MatchmakingScreen playerId={playerId} onMatchFound={handleMatchFound} />}

      {appState === "game" && gameId && (
        <GameScreen gameId={gameId} playerId={playerId} playerSymbol={playerSymbol} onGameEnd={handleGameEnd} />
      )}
    </>
  )
}

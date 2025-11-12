"use client"

import { useMatchmaking } from "@/hooks/use-matchmaking"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

interface MatchmakingScreenProps {
  playerId: string
  onMatchFound: (gameId: string, symbol: "X" | "O") => void
}

export function MatchmakingScreen({ playerId, onMatchFound }: MatchmakingScreenProps) {
  const { isSearching, matchResult, error, startMatchmaking, cancelMatchmaking } = useMatchmaking(playerId)

  // Notify parent when match is found
  useEffect(() => {
    if (matchResult?.matched && matchResult.gameId && matchResult.yourSymbol) {
      onMatchFound(matchResult.gameId, matchResult.yourSymbol)
    }
  }, [matchResult, onMatchFound])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#9bbc0f] p-4">
      <div className="w-full max-w-md space-y-8">
        {/* GameBoy-style screen */}
        <div className="bg-[#0f380f] border-8 border-[#306230] rounded-lg p-8 shadow-2xl">
          <div className="bg-[#8bac0f] border-4 border-[#0f380f] rounded p-6 font-mono">
            <h1 className="text-3xl font-bold text-[#0f380f] mb-6 text-center pixel-text">TIC-TAC-TOE</h1>

            {!isSearching && !matchResult && (
              <div className="space-y-4">
                <p className="text-[#0f380f] text-center mb-6 text-sm">Press START to find an opponent</p>
                <Button
                  onClick={startMatchmaking}
                  className="w-full bg-[#0f380f] hover:bg-[#306230] text-[#8bac0f] font-bold py-4 text-lg border-4 border-[#0f380f] pixel-text"
                >
                  START
                </Button>
              </div>
            )}

            {isSearching && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="inline-block animate-pulse">
                    <p className="text-[#0f380f] text-lg mb-4 pixel-text">SEARCHING...</p>
                  </div>
                  <div className="flex justify-center space-x-2 mb-6">
                    <div
                      className="w-3 h-3 bg-[#0f380f] rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-3 h-3 bg-[#0f380f] rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-3 h-3 bg-[#0f380f] rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
                <Button
                  onClick={cancelMatchmaking}
                  variant="outline"
                  className="w-full bg-[#306230] hover:bg-[#0f380f] text-[#8bac0f] font-bold py-3 border-4 border-[#0f380f] pixel-text"
                >
                  CANCEL
                </Button>
              </div>
            )}

            {error && (
              <div className="text-center">
                <p className="text-red-900 mb-4 pixel-text">ERROR: {error}</p>
                <Button
                  onClick={startMatchmaking}
                  className="w-full bg-[#0f380f] hover:bg-[#306230] text-[#8bac0f] font-bold py-3 border-4 border-[#0f380f] pixel-text"
                >
                  RETRY
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* GameBoy-style info text */}
        <div className="text-center text-[#0f380f] text-sm font-mono space-y-2">
          <p className="pixel-text">PLAYER ID: {playerId.slice(0, 8)}</p>
          <p className="text-xs opacity-70">Make your move within 5 seconds or lose!</p>
        </div>
      </div>
    </div>
  )
}

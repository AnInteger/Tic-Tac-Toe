"use client"

import type { PlayerSymbol } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface GameOverDialogProps {
  winner: PlayerSymbol | "draw" | null
  playerSymbol: PlayerSymbol
  playerScore: number
  opponentScore: number
  onContinue: () => void
  onQuit: () => void
  needsPunishment: boolean
}

export function GameOverDialog({
  winner,
  playerSymbol,
  playerScore,
  opponentScore,
  onContinue,
  onQuit,
  needsPunishment,
}: GameOverDialogProps) {
  const playerWon = winner === playerSymbol
  const isDraw = winner === "draw"
  const scoreDiff = Math.abs(playerScore - opponentScore)

  return (
    <div className="fixed inset-0 bg-[#0f380f]/90 flex items-center justify-center p-4 z-50">
      <div className="bg-[#8bac0f] border-8 border-[#0f380f] rounded-lg p-8 max-w-md w-full shadow-2xl">
        <div className="text-center space-y-6">
          {/* Result */}
          <div>
            <h2
              className={cn(
                "text-4xl font-bold pixel-text mb-2",
                playerWon ? "text-[#0f380f]" : isDraw ? "text-[#306230]" : "text-red-900"
              )}
            >
              {isDraw ? "DRAW!" : playerWon ? "YOU WIN!" : "YOU LOSE!"}
            </h2>
            {winner && winner !== "draw" && <p className="text-[#0f380f] pixel-text text-sm">Winner: {winner}</p>}
          </div>

          {/* Score */}
          <div className="bg-[#0f380f] border-4 border-[#306230] rounded p-4">
            <p className="text-[#8bac0f] text-sm mb-2 pixel-text">CURRENT SCORE</p>
            <p className="text-[#9bbc0f] text-3xl font-bold pixel-text">
              {playerScore} - {opponentScore}
            </p>
          </div>

          {/* Punishment Warning */}
          {needsPunishment && !playerWon && (
            <div className="bg-red-900 border-4 border-red-950 rounded p-4 animate-pulse">
              <p className="text-[#9bbc0f] text-sm pixel-text">⚠ SCORE DIFF: {scoreDiff} ⚠</p>
              <p className="text-[#8bac0f] text-xs mt-2">Continuing requires watching an ad!</p>
            </div>
          )}

          {/* Actions - Only loser decides */}
          {!playerWon && !isDraw && (
            <div className="space-y-3">
              <p className="text-[#0f380f] text-xs pixel-text mb-4">
                {needsPunishment ? "WATCH AD TO CONTINUE?" : "PLAY AGAIN?"}
              </p>
              <Button
                onClick={onContinue}
                className="w-full bg-[#0f380f] hover:bg-[#306230] text-[#8bac0f] font-bold py-4 text-lg border-4 border-[#0f380f] pixel-text"
              >
                {needsPunishment ? "WATCH AD & CONTINUE" : "CONTINUE"}
              </Button>
              <Button
                onClick={onQuit}
                variant="outline"
                className="w-full bg-[#306230] hover:bg-[#0f380f] text-[#8bac0f] font-bold py-3 border-4 border-[#0f380f] pixel-text"
              >
                QUIT
              </Button>
            </div>
          )}

          {/* Winner/Draw waits for opponent decision */}
          {(playerWon || isDraw) && (
            <div className="space-y-4">
              <div className="animate-pulse">
                <p className="text-[#0f380f] text-sm pixel-text">WAITING FOR OPPONENT...</p>
              </div>
              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-[#0f380f] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-3 h-3 bg-[#0f380f] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-3 h-3 bg-[#0f380f] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

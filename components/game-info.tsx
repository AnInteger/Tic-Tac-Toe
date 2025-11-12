"use client"

import type { Player } from "@/lib/game-state"

interface GameInfoProps {
  playerSymbol: Player
  opponentSymbol: Player
  currentPlayer: Player
  playerScore: number
  opponentScore: number
  timeLeft: number
}

export function GameInfo({
  playerSymbol,
  opponentSymbol,
  currentPlayer,
  playerScore,
  opponentScore,
  timeLeft,
}: GameInfoProps) {
  const isYourTurn = currentPlayer === playerSymbol

  return (
    <div className="space-y-4 mb-6">
      {/* Score Display */}
      <div className="flex justify-between items-center bg-[#0f380f] border-4 border-[#306230] rounded p-4">
        <div className="text-center">
          <p className="text-[#8bac0f] text-xs mb-1 pixel-text">YOU ({playerSymbol})</p>
          <p className="text-[#9bbc0f] text-3xl font-bold pixel-text">{playerScore}</p>
        </div>
        <div className="text-[#8bac0f] text-2xl pixel-text">-</div>
        <div className="text-center">
          <p className="text-[#8bac0f] text-xs mb-1 pixel-text">OPP ({opponentSymbol})</p>
          <p className="text-[#9bbc0f] text-3xl font-bold pixel-text">{opponentScore}</p>
        </div>
      </div>

      {/* Turn Indicator */}
      <div className="bg-[#8bac0f] border-4 border-[#0f380f] rounded p-3 text-center">
        <p className={cn("pixel-text text-lg", isYourTurn ? "text-[#0f380f] animate-pulse" : "text-[#306230]")}>
          {isYourTurn ? "▶ YOUR TURN ◀" : "OPPONENT'S TURN"}
        </p>
      </div>

      {/* Timer */}
      {isYourTurn && (
        <div className="bg-[#0f380f] border-4 border-[#306230] rounded p-4">
          <div className="flex items-center justify-between">
            <p className="text-[#8bac0f] text-sm pixel-text">TIME LEFT:</p>
            <p
              className={cn(
                "text-3xl font-bold pixel-text",
                timeLeft <= 2 ? "text-red-600 animate-pulse" : "text-[#9bbc0f]",
              )}
            >
              {timeLeft}s
            </p>
          </div>
          <div className="mt-2 h-3 bg-[#306230] rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-1000", timeLeft <= 2 ? "bg-red-600" : "bg-[#8bac0f]")}
              style={{ width: `${(timeLeft / 5) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

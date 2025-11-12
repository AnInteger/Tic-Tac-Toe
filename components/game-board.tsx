"use client"

import type { Board, Player } from "@/lib/game-state"
import { cn } from "@/lib/utils"

interface GameBoardProps {
  board: Board
  onCellClick: (index: number) => void
  disabled: boolean
  currentPlayer: Player
}

export function GameBoard({ board, onCellClick, disabled, currentPlayer }: GameBoardProps) {
  return (
    <div className="grid grid-cols-3 gap-2 p-4 bg-[#8bac0f] border-4 border-[#0f380f] rounded">
      {board.map((cell, index) => (
        <button
          key={index}
          onClick={() => !disabled && !cell && onCellClick(index)}
          disabled={disabled || cell !== null}
          className={cn(
            "aspect-square bg-[#9bbc0f] border-4 border-[#0f380f] rounded flex items-center justify-center text-5xl font-bold transition-all retro-button",
            "hover:bg-[#8bac0f] active:bg-[#306230]",
            cell === null && !disabled && "cursor-pointer shadow-lg",
            cell !== null && "cursor-not-allowed",
            disabled && "opacity-50",
          )}
        >
          {cell && <span className={cn("pixel-text", cell === "X" ? "text-[#0f380f]" : "text-[#306230]")}>{cell}</span>}
        </button>
      ))}
    </div>
  )
}

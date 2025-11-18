"use client"

import { useState, useEffect, useCallback } from "react"
import { useGame } from "@/hooks/use-game"
import type { PlayerSymbol } from "@/lib/types"
import { GameBoard } from "./game-board"
import { GameInfo } from "./game-info"
import { GameOverDialog } from "./game-over-dialog"
import { PunishmentScreen } from "./punishment-screen"

interface GameScreenProps {
  gameId: string
  playerId: string
  playerSymbol: PlayerSymbol
  onGameEnd: () => void
}

export function GameScreen({ gameId, playerId, playerSymbol, onGameEnd }: GameScreenProps) {
  const { game, loading, makeMove, handleTimeout, handleContinue } = useGame(gameId, playerId)
  const [timeLeft, setTimeLeft] = useState(5)
  const [showGameOver, setShowGameOver] = useState(false)
  const [showPunishment, setShowPunishment] = useState(false)

  const opponentSymbol: PlayerSymbol = playerSymbol === "X" ? "O" : "X"

  useEffect(() => {
    if (!game || game.status !== "playing") return

    const isMyTurn = game.current_turn === playerSymbol
    if (!isMyTurn) {
      setTimeLeft(5)
      return
    }

    const interval = setInterval(() => {
      const turnStarted = new Date(game.turn_started_at).getTime()
      const elapsed = Math.floor((Date.now() - turnStarted) / 1000)
      const remaining = Math.max(0, 5 - elapsed)

      setTimeLeft(remaining)

      if (remaining === 0) {
        handleTimeout()
      }
    }, 100)

    return () => clearInterval(interval)
  }, [game, playerSymbol, handleTimeout])

  useEffect(() => {
    if (game?.status === "finished" && !showGameOver) {
      setShowGameOver(true)
    }
  }, [game?.status, showGameOver])

  const handleCellClick = useCallback(
    (position: number) => {
      if (game?.current_turn === playerSymbol && !loading) {
        makeMove(position)
      }
    },
    [game, playerSymbol, loading, makeMove]
  )

  const handleContinueGame = useCallback(async () => {
    const scoreDiff = game ? Math.abs(game.player_x_score - game.player_o_score) : 0

    if (scoreDiff >= 5) {
      setShowGameOver(false)
      setShowPunishment(true)
    } else {
      const ended = await handleContinue("continue")
      if (!ended) {
        setShowGameOver(false)
      }
    }
  }, [game, handleContinue])

  const handlePunishmentComplete = useCallback(async () => {
    setShowPunishment(false)
    const ended = await handleContinue("continue")
    if (ended) {
      onGameEnd()
    }
  }, [handleContinue, onGameEnd])

  const handleQuitGame = useCallback(async () => {
    await handleContinue("end")
    onGameEnd()
  }, [handleContinue, onGameEnd])

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#9bbc0f]">
        <div className="bg-[#8bac0f] border-4 border-[#0f380f] rounded p-8">
          <p className="text-[#0f380f] pixel-text animate-pulse">LOADING...</p>
        </div>
      </div>
    )
  }

  const playerScore = playerSymbol === "X" ? game.player_x_score : game.player_o_score
  const opponentScore = playerSymbol === "X" ? game.player_o_score : game.player_x_score
  const scoreDiff = Math.abs(playerScore - opponentScore)
  const needsPunishment = scoreDiff >= 5
  const playerLost = game.winner && game.winner !== "draw" && game.winner !== playerSymbol

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#9bbc0f] p-4">
        <div className="w-full max-w-md">
          {/* GameBoy Screen Container */}
          <div className="bg-[#0f380f] border-8 border-[#306230] rounded-lg p-6 shadow-2xl">
            <div className="gameboy-screen bg-[#8bac0f] border-4 border-[#0f380f] rounded p-4">
              {/* Header */}
              <div className="text-center mb-4">
                <h1 className="text-2xl font-bold text-[#0f380f] pixel-text">TIC-TAC-TOE</h1>
              </div>

              {/* Game Info */}
              <GameInfo
                playerSymbol={playerSymbol}
                opponentSymbol={opponentSymbol}
                currentPlayer={game.current_turn}
                playerScore={playerScore}
                opponentScore={opponentScore}
                timeLeft={timeLeft}
              />

              {/* Game Board */}
              <GameBoard
                board={game.board}
                onCellClick={handleCellClick}
                disabled={game.current_turn !== playerSymbol || loading}
                currentPlayer={game.current_turn}
              />

              {/* Game Status */}
              <div className="mt-4 text-center">
                <p className="text-[#0f380f] text-xs pixel-text opacity-70">GAME ID: {gameId.slice(0, 12)}...</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-4 text-center text-[#0f380f] text-xs font-mono opacity-70">
            <p>Click a cell to make your move</p>
            <p>You have 5 seconds per turn</p>
          </div>
        </div>

        {/* Game Over Dialog */}
        {showGameOver && game.winner && playerLost && (
          <GameOverDialog
            winner={game.winner}
            playerSymbol={playerSymbol}
            playerScore={playerScore}
            opponentScore={opponentScore}
            onContinue={handleContinueGame}
            onQuit={handleQuitGame}
            needsPunishment={needsPunishment}
          />
        )}

        {/* Winner/Draw waiting screen */}
        {showGameOver && game.winner && !playerLost && (
          <GameOverDialog
            winner={game.winner}
            playerSymbol={playerSymbol}
            playerScore={playerScore}
            opponentScore={opponentScore}
            onContinue={handleContinueGame}
            onQuit={handleQuitGame}
            needsPunishment={false}
          />
        )}
      </div>

      {showPunishment && <PunishmentScreen onComplete={handlePunishmentComplete} duration={10} />}
    </>
  )
}

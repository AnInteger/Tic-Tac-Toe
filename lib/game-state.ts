export type Player = "X" | "O"
export type Cell = Player | null
export type Board = Cell[]
export type GameStatus = "waiting" | "playing" | "finished" | "timeout"

export interface GameState {
  gameId: string
  board: Board
  currentPlayer: Player
  players: {
    X: { id: string; score: number }
    O: { id: string; score: number }
  }
  status: GameStatus
  winner: Player | "draw" | null
  timeLeft: number
  lastMoveTime: number
}

export interface MatchmakingQueue {
  playerId: string
  joinedAt: number
}

// Check for winner
export function checkWinner(board: Board): Player | "draw" | null {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ]

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as Player
    }
  }

  if (board.every((cell) => cell !== null)) {
    return "draw"
  }

  return null
}

// Create new game
export function createGame(playerXId: string, playerOId: string): GameState {
  return {
    gameId: `${playerXId}-${playerOId}-${Date.now()}`,
    board: Array(9).fill(null),
    currentPlayer: "X",
    players: {
      X: { id: playerXId, score: 0 },
      O: { id: playerOId, score: 0 },
    },
    status: "playing",
    winner: null,
    timeLeft: 5,
    lastMoveTime: Date.now(),
  }
}

// Simple in-memory storage for games and matchmaking queue
// In production, you'd use a database like Redis or Supabase

const games = new Map<string, any>()
const matchmakingQueue: any[] = []

export const gameStorage = {
  // Game operations
  getGame(gameId: string) {
    return games.get(gameId)
  },

  setGame(gameId: string, game: any) {
    games.set(gameId, game)
  },

  deleteGame(gameId: string) {
    games.delete(gameId)
  },

  // Matchmaking operations
  addToQueue(playerId: string) {
    matchmakingQueue.push({ playerId, joinedAt: Date.now() })
  },

  getQueue() {
    return matchmakingQueue
  },

  removeFromQueue(playerId: string) {
    const index = matchmakingQueue.findIndex((p) => p.playerId === playerId)
    if (index > -1) {
      matchmakingQueue.splice(index, 1)
    }
  },

  clearQueue() {
    matchmakingQueue.length = 0
  },
}

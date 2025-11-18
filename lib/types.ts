export type GameStatus = 'playing' | 'finished' | 'waiting_continue' | 'punishment';
export type PlayerSymbol = 'X' | 'O';
export type CellValue = '' | 'X' | 'O';
export type Board = CellValue[];

export interface Game {
  id: string;
  player_x_id: string;
  player_o_id: string;
  current_turn: PlayerSymbol;
  board: Board;
  winner: PlayerSymbol | 'draw' | null;
  player_x_score: number;
  player_o_score: number;
  status: GameStatus;
  turn_started_at: string;
  created_at: string;
  updated_at: string;
}

export interface MatchmakingQueueItem {
  id: string;
  player_id: string;
  created_at: string;
}

export type PlayerSymbol = 'X' | 'O';

export type GameMode = 'classic' | 'disappearing';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Player {
  id: number;
  name: string;
  symbol: PlayerSymbol;
  wins: number;
  isBot: boolean;
  difficulty: Difficulty;
}

export interface Move {
  playerSymbol: PlayerSymbol;
  cellIndex: number;
}

export interface GameState {
  gameMode: GameMode;
  board: (PlayerSymbol | null)[];
  currentPlayerIndex: number; // 0 or 1
  winner: PlayerSymbol | 'draw' | null;
  winningLine: number[] | null;
  moves: Move[]; // Keep track of moves for disappearing logic
  lastStarterIndex: number; // To track round robin
}

export interface AppState {
  players: Player[];
  gameState: GameState;
}

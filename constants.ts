import { Player, GameState } from './types';

export const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const INITIAL_PLAYERS: Player[] = [
  { id: 0, name: 'Player 1', symbol: 'X', wins: 0, isBot: false, difficulty: 'Medium' },
  { id: 1, name: 'Player 2', symbol: 'O', wins: 0, isBot: false, difficulty: 'Medium' },
];

export const INITIAL_GAME_STATE: GameState = {
  gameMode: 'classic',
  board: Array(9).fill(null),
  currentPlayerIndex: 0, // Will be randomized on first load
  winner: null,
  winningLine: null,
  moves: [],
  lastStarterIndex: 0, 
};

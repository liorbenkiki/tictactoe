import { WINNING_COMBINATIONS } from '../constants';
import { PlayerSymbol, Move } from '../types';

export const checkWinner = (board: (PlayerSymbol | null)[]) => {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combination };
    }
  }

  if (!board.includes(null)) {
    return { winner: 'draw' as const, line: null };
  }

  return null;
};

// Calculate the board state based on the moves history
export const deriveBoardFromMoves = (moves: Move[]): (PlayerSymbol | null)[] => {
  const board = Array(9).fill(null);
  moves.forEach(move => {
    board[move.cellIndex] = move.playerSymbol;
  });
  return board;
};

// Helper to determine which move will disappear next for a player
export const getNextDisappearingMoveIndex = (moves: Move[], playerSymbol: PlayerSymbol): number | null => {
  const playerMoves = moves.filter(m => m.playerSymbol === playerSymbol);
  // If player has 3 moves, the first one they made is the next to go (index 0 of their moves)
  if (playerMoves.length >= 3) {
    return playerMoves[0].cellIndex;
  }
  return null;
};

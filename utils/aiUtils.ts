import { GameMode, Move, PlayerSymbol, Difficulty } from '../types';
import { WINNING_COMBINATIONS } from '../constants';

// Helper to check winner locally without importing full gameUtils to avoid circles if possible,
// but for consistency we re-implement a lightweight checker or import.
// Let's implement a pure logic checker here for speed.
const getWinner = (board: (PlayerSymbol | null)[]) => {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

// Simulate a move and return new state
const simulateMove = (
  board: (PlayerSymbol | null)[],
  moves: Move[],
  playerSymbol: PlayerSymbol,
  cellIndex: number,
  gameMode: GameMode
) => {
  let newMoves = [...moves];
  let newBoard = [...board];

  if (gameMode === 'disappearing') {
    const playerMoves = newMoves.filter(m => m.playerSymbol === playerSymbol);
    if (playerMoves.length >= 3) {
      const moveToRemove = playerMoves[0];
      newMoves = newMoves.filter(m => m.cellIndex !== moveToRemove.cellIndex);
      newBoard[moveToRemove.cellIndex] = null;
    }
  }

  newMoves.push({ playerSymbol, cellIndex });
  newBoard[cellIndex] = playerSymbol;

  return { board: newBoard, moves: newMoves };
};

// Minimax Algorithm
const minimax = (
  board: (PlayerSymbol | null)[],
  moves: Move[],
  depth: number,
  isMaximizing: boolean,
  aiSymbol: PlayerSymbol,
  opponentSymbol: PlayerSymbol,
  gameMode: GameMode,
  maxDepth: number
): number => {
  const winner = getWinner(board);
  if (winner === aiSymbol) return 10 - depth;
  if (winner === opponentSymbol) return depth - 10;
  if (depth >= maxDepth) return 0; // Depth limit for Infinity mode or performance
  
  // Draw check only valid for Classic
  if (gameMode === 'classic' && !board.includes(null)) return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        const { board: nextBoard, moves: nextMoves } = simulateMove(board, moves, aiSymbol, i, gameMode);
        const evalScore = minimax(nextBoard, nextMoves, depth + 1, false, aiSymbol, opponentSymbol, gameMode, maxDepth);
        maxEval = Math.max(maxEval, evalScore);
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        const { board: nextBoard, moves: nextMoves } = simulateMove(board, moves, opponentSymbol, i, gameMode);
        const evalScore = minimax(nextBoard, nextMoves, depth + 1, true, aiSymbol, opponentSymbol, gameMode, maxDepth);
        minEval = Math.min(minEval, evalScore);
      }
    }
    return minEval;
  }
};

export const getBestMove = (
  board: (PlayerSymbol | null)[],
  moves: Move[],
  playerSymbol: PlayerSymbol,
  difficulty: Difficulty,
  gameMode: GameMode
): number => {
  const emptyIndices = board.map((val, idx) => val === null ? idx : null).filter((val): val is number => val !== null);
  
  if (emptyIndices.length === 0) return -1;

  // Easy: Random move
  if (difficulty === 'Easy') {
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  // Opponent symbol
  const opponentSymbol = playerSymbol === 'X' ? 'O' : 'X';

  // Medium: Block immediate threats or win immediately, else random
  if (difficulty === 'Medium') {
    // 1. Check for winning move
    for (let i of emptyIndices) {
        const { board: nextBoard } = simulateMove(board, moves, playerSymbol, i, gameMode);
        if (getWinner(nextBoard) === playerSymbol) return i;
    }
    // 2. Check for blocking opponent win
    for (let i of emptyIndices) {
        const { board: nextBoard } = simulateMove(board, moves, opponentSymbol, i, gameMode);
        if (getWinner(nextBoard) === opponentSymbol) return i;
    }
    // 3. Random
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  // Hard: Minimax
  // Optimize: First move is always center or corner if empty to save computation
  if (emptyIndices.length >= 8 && board[4] === null) return 4;

  let bestScore = -Infinity;
  let bestMove = emptyIndices[0];
  
  // Depth limit: Classic can go deep, Infinity needs limit to avoid cycles/too much recursion
  const maxDepth = gameMode === 'classic' ? 9 : 4;

  for (let i of emptyIndices) {
    const { board: nextBoard, moves: nextMoves } = simulateMove(board, moves, playerSymbol, i, gameMode);
    const score = minimax(nextBoard, nextMoves, 0, false, playerSymbol, opponentSymbol, gameMode, maxDepth);
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }

  return bestMove;
};

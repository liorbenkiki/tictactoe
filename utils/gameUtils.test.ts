import { describe, it, expect } from 'vitest';
import { checkWinner, deriveBoardFromMoves, getNextDisappearingMoveIndex } from './gameUtils';
import { WINNING_COMBINATIONS } from '../constants';
import type { Move } from '../types';

describe('checkWinner', () => {
  it('returns { winner: "X", line } for each of the 8 winning lines', () => {
    for (const line of WINNING_COMBINATIONS) {
      const board: ('X' | 'O' | null)[] = Array(9).fill(null);
      board[line[0]] = 'X';
      board[line[1]] = 'X';
      board[line[2]] = 'X';
      const result = checkWinner(board);
      expect(result).toEqual({ winner: 'X', line });
    }
  });

  it('returns { winner: "O", line } for O on each winning line', () => {
    for (const line of WINNING_COMBINATIONS) {
      const board: ('X' | 'O' | null)[] = Array(9).fill(null);
      board[line[0]] = 'O';
      board[line[1]] = 'O';
      board[line[2]] = 'O';
      const result = checkWinner(board);
      expect(result).toEqual({ winner: 'O', line });
    }
  });

  it('returns { winner: "draw", line: null } when board is full and no winner', () => {
    const board: ('X' | 'O' | null)[] = [
      'X', 'O', 'X',
      'X', 'O', 'O',
      'O', 'X', 'X',
    ];
    expect(checkWinner(board)).toEqual({ winner: 'draw', line: null });
  });

  it('returns null when no winner and board has empty cells', () => {
    expect(checkWinner(Array(9).fill(null))).toBeNull();
    const partial: ('X' | 'O' | null)[] = ['X', 'O', null, null, null, null, null, null, null];
    expect(checkWinner(partial)).toBeNull();
  });
});

describe('deriveBoardFromMoves', () => {
  it('returns board of 9 nulls for empty moves', () => {
    expect(deriveBoardFromMoves([])).toEqual(Array(9).fill(null));
  });

  it('places symbols at correct indices for a few moves in order', () => {
    const moves: Move[] = [
      { playerSymbol: 'X', cellIndex: 0 },
      { playerSymbol: 'O', cellIndex: 4 },
      { playerSymbol: 'X', cellIndex: 8 },
    ];
    const board = deriveBoardFromMoves(moves);
    expect(board[0]).toBe('X');
    expect(board[4]).toBe('O');
    expect(board[8]).toBe('X');
    expect(board[1]).toBeNull();
    expect(board.filter(Boolean).length).toBe(3);
  });

  it('later move overwrites if same cell played again (invalid but defined)', () => {
    const moves: Move[] = [
      { playerSymbol: 'X', cellIndex: 0 },
      { playerSymbol: 'O', cellIndex: 0 },
    ];
    const board = deriveBoardFromMoves(moves);
    expect(board[0]).toBe('O');
  });
});

describe('getNextDisappearingMoveIndex', () => {
  it('returns null when player has fewer than 3 moves', () => {
    const moves: Move[] = [
      { playerSymbol: 'X', cellIndex: 0 },
      { playerSymbol: 'X', cellIndex: 1 },
    ];
    expect(getNextDisappearingMoveIndex(moves, 'X')).toBeNull();
    expect(getNextDisappearingMoveIndex([], 'O')).toBeNull();
  });

  it('returns cell index of first (oldest) move when player has exactly 3 moves', () => {
    const moves: Move[] = [
      { playerSymbol: 'X', cellIndex: 2 },
      { playerSymbol: 'O', cellIndex: 0 },
      { playerSymbol: 'X', cellIndex: 4 },
      { playerSymbol: 'O', cellIndex: 1 },
      { playerSymbol: 'X', cellIndex: 6 },
    ];
    expect(getNextDisappearingMoveIndex(moves, 'X')).toBe(2);
  });

  it('only counts that player\'s moves; other player moves do not affect result', () => {
    const moves: Move[] = [
      { playerSymbol: 'O', cellIndex: 0 },
      { playerSymbol: 'O', cellIndex: 1 },
      { playerSymbol: 'O', cellIndex: 2 },
    ];
    expect(getNextDisappearingMoveIndex(moves, 'O')).toBe(0);
    expect(getNextDisappearingMoveIndex(moves, 'X')).toBeNull();
  });
});

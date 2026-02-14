import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getBestMove } from './aiUtils';
import type { Move } from '../types';

describe('getBestMove', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns -1 when board is full', () => {
    const board: ('X' | 'O' | null)[] = [
      'X', 'O', 'X',
      'X', 'O', 'O',
      'O', 'X', 'X',
    ];
    expect(getBestMove(board, [], 'X', 'Hard', 'classic')).toBe(-1);
    expect(getBestMove(board, [], 'O', 'Medium', 'classic')).toBe(-1);
  });

  describe('Easy', () => {
    it('returns the only empty cell when one empty', () => {
      const board: ('X' | 'O' | null)[] = [
        'X', 'O', 'X',
        'X', 'O', 'O',
        'O', 'X', null,
      ];
      expect(getBestMove(board, [], 'X', 'Easy', 'classic')).toBe(8);
    });

    it('returns one of the empty indices when multiple empty', () => {
      const board: ('X' | 'O' | null)[] = [
        null, null, null,
        null, 'X', null,
        null, null, null,
      ];
      const emptyIndices = [0, 1, 2, 3, 5, 6, 7, 8];
      for (let i = 0; i < 20; i++) {
        const move = getBestMove(board, [], 'O', 'Easy', 'classic');
        expect(emptyIndices).toContain(move);
      }
    });
  });

  describe('Medium', () => {
    it('returns winning cell when AI can win in one move', () => {
      // X can win at index 2
      const board: ('X' | 'O' | null)[] = [
        'X', 'X', null,
        'O', 'O', null,
        null, null, null,
      ];
      expect(getBestMove(board, [], 'X', 'Medium', 'classic')).toBe(2);
    });

    it('returns blocking cell when opponent can win in one move', () => {
      // O can win at 8; X must block
      const board: ('X' | 'O' | null)[] = [
        'O', 'O', null,
        'X', null, null,
        null, null, null,
      ];
      expect(getBestMove(board, [], 'X', 'Medium', 'classic')).toBe(2);
    });

    it('returns one of empty indices when no win/block (random)', () => {
      const board: ('X' | 'O' | null)[] = [
        'X', null, 'O',
        null, null, null,
        null, null, null,
      ];
      const move = getBestMove(board, [], 'X', 'Medium', 'classic');
      expect([1, 3, 4, 5, 6, 7, 8]).toContain(move);
    });
  });

  describe('Hard (classic)', () => {
    it('returns 4 (center) for empty board', () => {
      const board = Array(9).fill(null) as ('X' | 'O' | null)[];
      expect(getBestMove(board, [], 'X', 'Hard', 'classic')).toBe(4);
    });

    it('returns winning move when available', () => {
      const board: ('X' | 'O' | null)[] = [
        'X', 'X', null,
        'O', 'O', null,
        null, null, null,
      ];
      expect(getBestMove(board, [], 'X', 'Hard', 'classic')).toBe(2);
    });

    it('returns blocking move when opponent can win', () => {
      const board: ('X' | 'O' | null)[] = [
        'O', 'O', null,
        'X', null, null,
        null, null, null,
      ];
      expect(getBestMove(board, [], 'X', 'Hard', 'classic')).toBe(2);
    });

    it('returns a valid move for draw scenario without crashing', () => {
      const board: ('X' | 'O' | null)[] = [
        'X', 'O', 'X',
        'X', 'O', 'O',
        'O', 'X', null,
      ];
      const move = getBestMove(board, [], 'X', 'Hard', 'classic');
      expect(move).toBe(8);
    });
  });

  describe('Disappearing mode', () => {
    it('returns a valid index in 0..8 for non-full board', () => {
      const board: ('X' | 'O' | null)[] = [
        'X', null, 'O',
        null, null, null,
        null, null, null,
      ];
      const moves: Move[] = [
        { playerSymbol: 'X', cellIndex: 0 },
        { playerSymbol: 'O', cellIndex: 2 },
      ];
      const move = getBestMove(board, moves, 'X', 'Hard', 'disappearing');
      expect(move).toBeGreaterThanOrEqual(0);
      expect(move).toBeLessThanOrEqual(8);
      expect(board[move]).toBeNull();
    });
  });
});

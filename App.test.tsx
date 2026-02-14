import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import type { AppState } from './types';
import { INITIAL_PLAYERS, INITIAL_GAME_STATE } from './constants';
import { getBestMove } from './utils/aiUtils';

vi.mock('./utils/aiUtils', () => ({
  getBestMove: vi.fn(),
}));

const STORAGE_KEY = 'tacticinfinity_data_v2';

describe('App', () => {
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    localStorageMock = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => localStorageMock[key] ?? null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      localStorageMock[key] = value;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
      delete localStorageMock[key];
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('on first load with no saved data, app loads and shows game (no crash)', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    expect(screen.getByText(/classic|infinity/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /empty cell/i }).length).toBeGreaterThan(0);
  });

  it('on load with saved data, state reflects it', async () => {
    const savedState: AppState = {
      players: [
        { ...INITIAL_PLAYERS[0], name: 'Alice', wins: 1 },
        { ...INITIAL_PLAYERS[1], name: 'Bob', wins: 0 },
      ],
      gameState: {
        ...INITIAL_GAME_STATE,
        board: ['X', 'O', null, null, null, null, null, null, null] as ('X' | 'O' | null)[],
        moves: [
          { playerSymbol: 'X', cellIndex: 0 },
          { playerSymbol: 'O', cellIndex: 1 },
        ],
        currentPlayerIndex: 0,
        lastStarterIndex: 0,
      },
    };
    localStorageMock[STORAGE_KEY] = JSON.stringify(savedState);

    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cell filled with x/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cell filled with o/i })).toBeInTheDocument();
  });

  it('game flow: X wins, winner message and Play Again appear; Play Again clears board', async () => {
    const initialState: AppState = {
      players: [...INITIAL_PLAYERS],
      gameState: {
        ...INITIAL_GAME_STATE,
        board: Array(9).fill(null) as ('X' | 'O' | null)[],
        moves: [],
        currentPlayerIndex: 0,
        lastStarterIndex: 0,
      },
    };
    localStorageMock[STORAGE_KEY] = JSON.stringify(initialState);

    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    const emptyCells = screen.getAllByRole('button', { name: /empty cell/i });
    const grid = emptyCells[0].closest('.grid');
    expect(grid).toBeInTheDocument();
    const cells = grid!.querySelectorAll<HTMLButtonElement>('button');
    expect(cells).toHaveLength(9);

    await userEvent.click(cells[0]);
    await userEvent.click(cells[3]);
    await userEvent.click(cells[1]);
    await userEvent.click(cells[4]);
    await userEvent.click(cells[2]);

    await waitFor(() => {
      expect(screen.getByText(/wins!/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /play again/i }));

    await waitFor(() => {
      const emptyCells = screen.getAllByRole('button', { name: /empty cell/i });
      expect(emptyCells.length).toBe(9);
    });
  });

  it('when O is bot, after X plays the bot plays a move', async () => {
    vi.mocked(getBestMove).mockReturnValue(4);

    const savedState: AppState = {
      players: [
        { ...INITIAL_PLAYERS[0], isBot: false },
        { ...INITIAL_PLAYERS[1], isBot: true, difficulty: 'Easy' },
      ],
      gameState: {
        ...INITIAL_GAME_STATE,
        board: Array(9).fill(null) as ('X' | 'O' | null)[],
        moves: [],
        currentPlayerIndex: 0,
        lastStarterIndex: 0,
      },
    };
    localStorageMock[STORAGE_KEY] = JSON.stringify(savedState);

    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    const emptyCells = screen.getAllByRole('button', { name: /empty cell/i });
    const grid = emptyCells[0].closest('.grid');
    expect(grid).toBeInTheDocument();
    const cells = grid!.querySelectorAll<HTMLButtonElement>('button');
    await userEvent.click(cells[0]);

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /cell filled with o/i })).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});

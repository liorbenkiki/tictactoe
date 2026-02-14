import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Board } from './Board';

const emptyBoard = Array(9).fill(null) as ('X' | 'O' | null)[];

describe('Board', () => {
  it('renders 9 cells', () => {
    const onCellClick = vi.fn();
    render(
      <Board
        board={emptyBoard}
        onCellClick={onCellClick}
        winningLine={null}
        isGameOver={false}
        disappearingIndex={null}
        isInteractable={true}
      />
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(9);
  });

  it('passes correct value from board to each cell', () => {
    const board: ('X' | 'O' | null)[] = [
      'X', null, 'O',
      null, 'X', null,
      null, null, 'O',
    ];
    render(
      <Board
        board={board}
        onCellClick={() => {}}
        winningLine={null}
        isGameOver={false}
        disappearingIndex={null}
        isInteractable={true}
      />
    );
    expect(screen.getAllByRole('button', { name: /cell filled with x/i })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /empty cell/i })).toHaveLength(5);
    expect(screen.getAllByRole('button', { name: /cell filled with o/i })).toHaveLength(2);
  });

  it('calls onCellClick with correct index when a cell is clicked', async () => {
    const onCellClick = vi.fn();
    render(
      <Board
        board={emptyBoard}
        onCellClick={onCellClick}
        winningLine={null}
        isGameOver={false}
        disappearingIndex={null}
        isInteractable={true}
      />
    );
    const cells = screen.getAllByRole('button', { name: /empty cell/i });
    await userEvent.click(cells[0]);
    expect(onCellClick).toHaveBeenCalledWith(0);
    await userEvent.click(cells[4]);
    expect(onCellClick).toHaveBeenCalledWith(4);
    await userEvent.click(cells[8]);
    expect(onCellClick).toHaveBeenCalledWith(8);
  });

  it('disables cells when isGameOver is true', () => {
    render(
      <Board
        board={emptyBoard}
        onCellClick={() => {}}
        winningLine={null}
        isGameOver={true}
        disappearingIndex={null}
        isInteractable={true}
      />
    );
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => expect(btn).toBeDisabled());
  });

  it('disables cells when isInteractable is false', () => {
    render(
      <Board
        board={emptyBoard}
        onCellClick={() => {}}
        winningLine={null}
        isGameOver={false}
        disappearingIndex={null}
        isInteractable={false}
      />
    );
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => expect(btn).toBeDisabled());
  });

  it('marks winning line cells with winning state', () => {
    const board: ('X' | 'O' | null)[] = [
      'X', 'X', 'X',
      'O', 'O', null,
      null, null, null,
    ];
    render(
      <Board
        board={board}
        onCellClick={() => {}}
        winningLine={[0, 1, 2]}
        isGameOver={true}
        disappearingIndex={null}
        isInteractable={false}
      />
    );
    const buttons = screen.getAllByRole('button');
    const winningClasses = buttons.filter(b => b.className.includes('ring-green-500'));
    expect(winningClasses).toHaveLength(3);
  });

  it('marks disappearingIndex cell with disappearing state', () => {
    const board: ('X' | 'O' | null)[] = [
      'X', 'O', null,
      null, null, null,
      null, null, null,
    ];
    render(
      <Board
        board={board}
        onCellClick={() => {}}
        winningLine={null}
        isGameOver={false}
        disappearingIndex={0}
        isInteractable={true}
      />
    );
    const buttons = screen.getAllByRole('button');
    const withRedRing = buttons.filter(b => b.className.includes('ring-red-500'));
    expect(withRedRing.length).toBeGreaterThanOrEqual(1);
  });
});

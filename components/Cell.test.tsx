import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Cell } from './Cell';

describe('Cell', () => {
  it('renders empty cell with "Empty cell" aria-label', () => {
    render(
      <Cell
        index={0}
        value={null}
        onClick={() => {}}
        isWinning={false}
        disabled={false}
      />
    );
    const button = screen.getByRole('button', { name: /empty cell/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toHaveTextContent('X');
    expect(button).not.toHaveTextContent('O');
  });

  it('renders X with "Cell filled with X" aria-label', () => {
    render(
      <Cell
        index={0}
        value="X"
        onClick={() => {}}
        isWinning={false}
        disabled={false}
      />
    );
    expect(screen.getByRole('button', { name: /cell filled with x/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('X');
  });

  it('renders O with "Cell filled with O" aria-label', () => {
    render(
      <Cell
        index={0}
        value="O"
        onClick={() => {}}
        isWinning={false}
        disabled={false}
      />
    );
    expect(screen.getByRole('button', { name: /cell filled with o/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('O');
  });

  it('calls onClick when cell is not disabled', async () => {
    const onClick = vi.fn();
    render(
      <Cell
        index={3}
        value={null}
        onClick={onClick}
        isWinning={false}
        disabled={false}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /empty cell/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled (filled)', () => {
    const onClick = vi.fn();
    render(
      <Cell
        index={0}
        value="X"
        onClick={onClick}
        isWinning={false}
        disabled={true}
      />
    );
    const button = screen.getByRole('button', { name: /cell filled with x/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when disabled (game over)', () => {
    const onClick = vi.fn();
    render(
      <Cell
        index={0}
        value={null}
        onClick={onClick}
        isWinning={false}
        disabled={true}
      />
    );
    const button = screen.getByRole('button', { name: /empty cell/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies winning styling when isWinning is true', () => {
    render(
      <Cell
        index={0}
        value="X"
        onClick={() => {}}
        isWinning={true}
        disabled={false}
      />
    );
    const button = screen.getByRole('button');
    expect(button.className).toContain('ring-green-500');
  });

  it('shows disappearing indicator when isAboutToDisappear is true', () => {
    render(
      <Cell
        index={0}
        value="X"
        onClick={() => {}}
        isWinning={false}
        disabled={false}
        isAboutToDisappear={true}
      />
    );
    const button = screen.getByRole('button');
    expect(button.className).toContain('ring-red-500');
    // The disappearing indicator is a span with animate-ping
    const container = button.querySelector('.animate-ping');
    expect(container).toBeInTheDocument();
  });
});

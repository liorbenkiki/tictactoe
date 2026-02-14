import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerCard } from './PlayerCard';
import type { Player } from '../types';

const defaultPlayer: Player = {
  id: 0,
  name: 'Player 1',
  symbol: 'X',
  wins: 2,
  isBot: false,
  difficulty: 'Medium',
};

describe('PlayerCard', () => {
  it('renders player name, symbol, and wins', () => {
    const onUpdate = vi.fn();
    render(
      <PlayerCard
        player={defaultPlayer}
        isActive={false}
        onUpdatePlayer={onUpdate}
      />
    );
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.getByText(/wins:/i)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows Human when not bot', () => {
    render(
      <PlayerCard
        player={{ ...defaultPlayer, isBot: false }}
        isActive={false}
        onUpdatePlayer={() => {}}
      />
    );
    expect(screen.getByText(/human/i)).toBeInTheDocument();
  });

  it('shows Bot and difficulty when isBot is true', () => {
    render(
      <PlayerCard
        player={{ ...defaultPlayer, isBot: true, difficulty: 'Hard' }}
        isActive={false}
        onUpdatePlayer={() => {}}
      />
    );
    expect(screen.getByText('Hard')).toBeInTheDocument();
    expect(screen.getByText('Player 1')).toBeInTheDocument();
  });

  it('entering edit mode, changing name and saving calls onUpdatePlayer with new name', async () => {
    const onUpdate = vi.fn();
    render(
      <PlayerCard
        player={defaultPlayer}
        isActive={false}
        onUpdatePlayer={onUpdate}
      />
    );
    await userEvent.click(screen.getByText('Player 1').closest('button')!);
    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'New Name');
    await userEvent.click(screen.getByRole('button', { name: /done/i }));
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New Name', isBot: false, difficulty: 'Medium' })
    );
  });

  it('Escape in edit mode cancels without calling onUpdatePlayer with changes', async () => {
    const onUpdate = vi.fn();
    render(
      <PlayerCard
        player={defaultPlayer}
        isActive={false}
        onUpdatePlayer={onUpdate}
      />
    );
    await userEvent.click(screen.getByText('Player 1').closest('button')!);
    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'Changed');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByDisplayValue('Changed')).not.toBeInTheDocument();
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('toggling to Bot and selecting difficulty then save calls onUpdatePlayer with isBot and difficulty', async () => {
    const onUpdate = vi.fn();
    render(
      <PlayerCard
        player={defaultPlayer}
        isActive={false}
        onUpdatePlayer={onUpdate}
      />
    );
    await userEvent.click(screen.getByText('Player 1').closest('button')!);
    await userEvent.click(screen.getByRole('button', { name: /bot/i }));
    await userEvent.click(screen.getByRole('button', { name: /^hard$/i }));
    await userEvent.click(screen.getByRole('button', { name: /done/i }));
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ isBot: true, difficulty: 'Hard' })
    );
  });
});

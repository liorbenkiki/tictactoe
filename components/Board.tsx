import React from 'react';
import { Cell } from './Cell';
import { PlayerSymbol } from '../types';

interface BoardProps {
  board: (PlayerSymbol | null)[];
  onCellClick: (index: number) => void;
  winningLine: number[] | null;
  isGameOver: boolean;
  disappearingIndex: number | null;
  isInteractable: boolean;
}

export const Board: React.FC<BoardProps> = ({ 
  board, 
  onCellClick, 
  winningLine, 
  isGameOver,
  disappearingIndex,
  isInteractable
}) => {
  return (
    <div className={`grid grid-cols-3 gap-3 w-full max-w-sm sm:max-w-md mx-auto p-3 bg-slate-900 rounded-2xl transition-opacity duration-300 ${!isInteractable ? 'opacity-80 pointer-events-none' : ''}`}>
      {board.map((cellValue, index) => (
        <Cell
          key={index}
          index={index}
          value={cellValue}
          onClick={() => onCellClick(index)}
          isWinning={winningLine?.includes(index) ?? false}
          disabled={isGameOver || cellValue !== null || !isInteractable}
          isAboutToDisappear={index === disappearingIndex}
        />
      ))}
    </div>
  );
};

import React from 'react';
import { PlayerSymbol } from '../types';

interface CellProps {
  index: number;
  value: PlayerSymbol | null;
  onClick: () => void;
  isWinning: boolean;
  disabled: boolean;
  isAboutToDisappear?: boolean;
  nextMovePreview?: boolean;
}

export const Cell: React.FC<CellProps> = ({ 
  value, 
  onClick, 
  isWinning, 
  disabled, 
  isAboutToDisappear 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative h-24 sm:h-32 w-full rounded-xl text-5xl sm:text-6xl font-black flex items-center justify-center
        transition-all duration-300 transform active:scale-95
        ${!value && !disabled ? 'bg-slate-800 hover:bg-slate-700 cursor-pointer shadow-sm hover:shadow-md' : ''}
        ${value ? 'bg-slate-800 shadow-inner' : 'bg-slate-800'}
        ${isWinning ? 'bg-green-500/20 ring-4 ring-green-500 z-10' : ''}
        ${isAboutToDisappear ? 'ring-4 ring-red-500/50 bg-red-500/10 animate-pulse' : ''}
        ${disabled && !value ? 'cursor-default opacity-50' : ''}
      `}
      aria-label={value ? `Cell filled with ${value}` : "Empty cell"}
    >
      <span className={`
        transform transition-all duration-300
        ${value === 'X' ? 'text-cyan-400' : 'text-rose-400'}
        ${value ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
        ${isAboutToDisappear ? 'opacity-50 blur-[1px]' : ''}
      `}>
        {value}
      </span>
      
      {isAboutToDisappear && (
        <span className="absolute top-1 right-1 sm:top-2 sm:right-2 flex h-3 w-3">
           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
           <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
    </button>
  );
};

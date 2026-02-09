import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { Player } from '../types';

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  onUpdateName: (name: string) => void;
  isWinner?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, isActive, onUpdateName, isWinner }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(player.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (tempName.trim()) {
      onUpdateName(tempName.trim());
    } else {
      setTempName(player.name); // Revert if empty
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempName(player.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  return (
    <div 
      className={`
        relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300
        ${isActive ? 'bg-indigo-500/20 ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-slate-800/50 border border-slate-700'}
        ${isWinner ? 'bg-yellow-500/20 ring-2 ring-yellow-500 shadow-lg shadow-yellow-500/20' : ''}
      `}
    >
      {/* Turn Indicator Dot */}
      {isActive && !isWinner && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
        </span>
      )}
      
      {/* Symbol */}
      <div className={`text-4xl font-black mb-2 ${player.symbol === 'X' ? 'text-cyan-400' : 'text-rose-400'}`}>
        {player.symbol}
      </div>

      {/* Name Edit Area */}
      <div className="w-full flex items-center justify-center min-h-[32px]">
        {isEditing ? (
          <div className="flex items-center gap-1 w-full max-w-[140px]">
            <input
              ref={inputRef}
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="w-full bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-sm text-center focus:outline-none text-white"
              maxLength={12}
            />
          </div>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="group flex items-center gap-2 hover:bg-slate-700/50 px-2 py-1 rounded transition-colors"
          >
            <span className="font-bold text-lg truncate max-w-[100px] sm:max-w-[150px]">{player.name}</span>
            <Edit2 size={12} className="opacity-0 group-hover:opacity-50 text-slate-400 transition-opacity" />
          </button>
        )}
      </div>

      {/* Score */}
      <div className="mt-2 text-xs font-medium uppercase tracking-wider text-slate-400">
        Wins: <span className="text-white font-bold text-base ml-1">{player.wins}</span>
      </div>
    </div>
  );
};

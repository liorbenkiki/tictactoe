import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Bot, User, Check, X, Cpu } from 'lucide-react';
import { Player, Difficulty } from '../types';

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  onUpdatePlayer: (updates: Partial<Player>) => void;
  isWinner?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, isActive, onUpdatePlayer, isWinner }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(player.name);
  const [tempIsBot, setTempIsBot] = useState(player.isBot);
  const [tempDifficulty, setTempDifficulty] = useState<Difficulty>(player.difficulty);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Click outside to save
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node) && isEditing) {
        handleSave();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, tempName, tempIsBot, tempDifficulty]);

  const handleSave = () => {
    onUpdatePlayer({
        name: tempName.trim() || player.name,
        isBot: tempIsBot,
        difficulty: tempDifficulty
    });
    setIsEditing(false);
  };

  const toggleEdit = () => {
      setTempName(player.name);
      setTempIsBot(player.isBot);
      setTempDifficulty(player.difficulty);
      setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
        setIsEditing(false);
        setTempName(player.name);
    }
  };

  const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];

  return (
    <div 
      ref={cardRef}
      className={`
        relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 z-10
        ${isActive ? 'bg-indigo-500/20 ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-slate-800/50 border border-slate-700'}
        ${isWinner ? 'bg-yellow-500/20 ring-2 ring-yellow-500 shadow-lg shadow-yellow-500/20' : ''}
        ${isEditing ? 'scale-105 shadow-2xl bg-slate-800 ring-2 ring-slate-600' : ''}
      `}
    >
      {/* Turn Indicator Dot */}
      {isActive && !isWinner && !isEditing && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
        </span>
      )}
      
      {/* Symbol */}
      <div className={`text-4xl font-black mb-2 flex items-center gap-3 ${player.symbol === 'X' ? 'text-cyan-400' : 'text-rose-400'}`}>
        {player.symbol}
      </div>

      {isEditing ? (
          <div className="flex flex-col gap-3 w-full animate-in fade-in zoom-in duration-200">
             {/* Name Input */}
             <input
              ref={inputRef}
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-indigo-500 text-white"
              maxLength={12}
            />

            {/* Type Toggle */}
            <div className="flex bg-slate-900 rounded p-1">
                <button 
                    onClick={() => setTempIsBot(false)}
                    className={`flex-1 text-xs py-1 rounded flex items-center justify-center gap-1 ${!tempIsBot ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    <User size={12} /> Human
                </button>
                <button 
                    onClick={() => setTempIsBot(true)}
                    className={`flex-1 text-xs py-1 rounded flex items-center justify-center gap-1 ${tempIsBot ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    <Bot size={12} /> Bot
                </button>
            </div>

            {/* Difficulty Selector (Only if Bot) */}
            {tempIsBot && (
                <div className="grid grid-cols-3 gap-1">
                    {difficulties.map(d => (
                        <button
                            key={d}
                            onClick={() => setTempDifficulty(d)}
                            className={`text-[10px] py-1 rounded border ${tempDifficulty === d ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'border-slate-700 text-slate-500 hover:border-slate-600'}`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            )}

            <button onClick={handleSave} className="bg-indigo-600 text-white text-xs py-1.5 rounded font-bold mt-1">
                Done
            </button>
          </div>
      ) : (
          <button 
            onClick={toggleEdit}
            className="group flex flex-col items-center gap-1 hover:bg-slate-700/50 p-2 rounded transition-colors w-full"
          >
            <div className="flex items-center gap-2">
                <span className="font-bold text-lg truncate max-w-[100px] sm:max-w-[150px]">{player.name}</span>
                <Edit2 size={12} className="opacity-0 group-hover:opacity-50 text-slate-400 transition-opacity" />
            </div>
            
            {/* Player Type Badge */}
            <div className="flex items-center gap-1.5">
                {player.isBot ? (
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20">
                        <Bot size={10} /> {player.difficulty}
                    </span>
                ) : (
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 px-1.5 py-0.5 rounded">
                        <User size={10} /> Human
                    </span>
                )}
            </div>
          </button>
      )}

      {/* Score */}
      {!isEditing && (
        <div className="mt-2 text-xs font-medium uppercase tracking-wider text-slate-400">
            Wins: <span className="text-white font-bold text-base ml-1">{player.wins}</span>
        </div>
      )}
    </div>
  );
};
